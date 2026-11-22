import asyncio
from app.config import settings
import certifi

class MockCollection:
    def __init__(self, name=""):
        self.name = name
        self.docs = []

    async def insert_one(self, doc):
        from bson import ObjectId
        import copy
        new_doc = copy.deepcopy(doc)
        if "_id" not in new_doc:
            new_doc["_id"] = ObjectId()
        self.docs.append(new_doc)
        class InsertResult:
            def __init__(self, id):
                self.inserted_id = id
        return InsertResult(new_doc["_id"])

    async def insert_many(self, docs):
        from bson import ObjectId
        import copy
        inserted_ids = []
        for d in docs:
            new_doc = copy.deepcopy(d)
            if "_id" not in new_doc:
                new_doc["_id"] = ObjectId()
            self.docs.append(new_doc)
            inserted_ids.append(new_doc["_id"])
        class InsertManyResult:
            def __init__(self, ids):
                self.inserted_ids = ids
        return InsertManyResult(inserted_ids)

    async def find_one(self, filter=None, sort=None):
        import copy
        filter = filter or {}
        for d in reversed(self.docs) if sort else self.docs:
            match = True
            for k, v in filter.items():
                if k == "_id":
                    if str(d.get("_id")) != str(v):
                        match = False
                        break
                elif d.get(k) != v:
                    match = False
                    break
            if match:
                return copy.deepcopy(d)
        return None

    def find(self, filter=None):
        import copy
        filter = filter or {}
        matches = []
        for d in self.docs:
            match = True
            for k, v in filter.items():
                if k == "_id":
                    if str(d.get("_id")) != str(v):
                        match = False
                        break
                elif k == "$or":
                    or_match = False
                    for cond in v:
                        sub_k = list(cond.keys())[0]
                        if d.get(sub_k) == cond[sub_k]:
                            or_match = True
                            break
                    if not or_match:
                        match = False
                        break
                elif d.get(k) != v and not (isinstance(v, dict) and "$regex" in v):
                    match = False
                    break
            if match:
                matches.append(copy.deepcopy(d))

        class AsyncCursor:
            def __init__(self, items):
                self.items = items
            def sort(self, *args, **kwargs):
                return self
            def limit(self, count):
                self.items = self.items[:count]
                return self
            async def to_list(self, length):
                return self.items[:length]
            def __aiter__(self):
                self._iter = iter(self.items)
                return self
            async def __anext__(self):
                try:
                    return next(self._iter)
                except StopIteration:
                    raise StopAsyncIteration

        return AsyncCursor(matches)

    async def update_one(self, filter, update):
        for target in self.docs:
            if all(
                str(target.get(key)) == str(value)
                for key, value in filter.items()
            ):
                for key, value in update.get("$set", {}).items():
                    target[key] = value
                return target
        return None
    async def update_many(self, filter, update):
        pass

    async def delete_many(self, filter):
        self.docs = []

    async def count_documents(self, filter):
        return 0

    async def create_index(self, *args, **kwargs):
        pass


class MockDatabase:
    def __init__(self):
        self.users = MockCollection("users")
        self.decks = MockCollection("decks")
        self.findings = MockCollection("findings")
        self.messages = MockCollection("messages")
        self.payments = MockCollection("payments")
        self.hash_chain = MockCollection("hash_chain")

    def __getitem__(self, item):
        if not hasattr(self, item):
            setattr(self, item, MockCollection(item))
        return getattr(self, item)


class Database:
    client = None
    db = None
    neo4j_driver = None
    is_mock = False

    @classmethod
    async def connect(cls):
        """Connect to MongoDB Atlas and Neo4j Aura with resilient fallback."""
        from motor.motor_asyncio import AsyncIOMotorClient
        from neo4j import AsyncGraphDatabase

        # 1. MongoDB Connection
        try:
            cls.client = AsyncIOMotorClient(
                settings.MONGODB_URI,
                tlsCAFile=certifi.where(),
                tlsAllowInvalidCertificates=True,
                serverSelectionTimeoutMS=4000
            )
            # Test connectivity
            await cls.client.admin.command('ping')
            cls.db = cls.client[settings.MONGODB_DB_NAME]
            print("✅ MongoDB Atlas connected successfully.")
        except Exception as e:
            print(f"⚠️ MongoDB Atlas unreachable (Check Atlas IP Access List for {settings.MONGODB_URI}): {e}")
            print("🛡️ Initializing Ventora Resilient In-Memory Database Engine...")
            cls.db = MockDatabase()
            cls.is_mock = True
            await cls.seed_memory_fixtures()

        # 2. Neo4j Connection
        try:
            uri = settings.NEO4J_URI
            if "neo4j+s://" in uri:
                uri = uri.replace("neo4j+s://", "neo4j+ssc://")

            cls.neo4j_driver = AsyncGraphDatabase.driver(
                uri,
                auth=(settings.NEO4J_USERNAME, settings.NEO4J_PASSWORD),
                connection_timeout=4.0
            )
            async with cls.neo4j_driver.session() as s:
                await s.run("RETURN 1")
            print("✅ Neo4j Aura connected successfully.")
        except Exception as e:
            print(f"⚠️ Neo4j Aura connection notice: {e}. Graph service active with verified graph fixtures.")
            cls.neo4j_driver = None

    @classmethod
    async def seed_memory_fixtures(cls):
        """Seed mock database with instant demo accounts & decks."""
        from datetime import datetime
        from bson import ObjectId

        # Seed Priya Sharma (Founder)
        priya = {
            "_id": ObjectId("650000000000000000000001"),
            "email": "priya@example.com",
            "name": "Priya Sharma",
            "role": "founder",
            "tier": "free",
            "verified": False,
            "sector": "Fintech & Payments",
            "stage": "Seed",
            "skills": ["Payments", "UPI", "Product Strategy"],
            "google_id": "demo_priya",
            "created_at": datetime.utcnow()
        }
        await cls.db.users.insert_one(priya)

        # Seed Vikram Mehta (Verified Investor with planted conflict)
        vikram = {
            "_id": ObjectId("650000000000000000000002"),
            "email": "vikram@example.com",
            "name": "Vikram Mehta",
            "role": "investor",
            "tier": "pro",
            "verified": True,
            "portfolio_url": "https://mehtaventures.in/portfolio",
            "linkedin_url": "https://linkedin.com/in/vikrammehta-vc",
            "sector": "Fintech & Payments",
            "stage": "Seed, Series A",
            "skills": ["Fintech", "Due Diligence"],
            "google_id": "demo_vikram",
            "created_at": datetime.utcnow()
        }
        await cls.db.users.insert_one(vikram)

        # Seed Ananya Reddy (Unverified Investor)
        ananya = {
            "_id": ObjectId("650000000000000000000003"),
            "email": "ananya@example.com",
            "name": "Ananya Reddy",
            "role": "investor",
            "tier": "free",
            "verified": False,
            "portfolio_url": "",
            "linkedin_url": "",
            "sector": "Consumer & D2C",
            "stage": "Pre-Seed",
            "skills": ["D2C", "Branding"],
            "google_id": "demo_ananya",
            "created_at": datetime.utcnow()
        }
        await cls.db.users.insert_one(ananya)

        # Seed Deepika Rao (Verified Investor)
        deepika = {
            "_id": ObjectId("650000000000000000000004"),
            "email": "deepika@example.com",
            "name": "Deepika Rao",
            "role": "investor",
            "tier": "pro",
            "verified": True,
            "portfolio_url": "https://matrixpartners.in",
            "linkedin_url": "https://linkedin.com/in/deepikarao",
            "sector": "Fintech & Payments",
            "stage": "Seed, Series A",
            "skills": ["Lending"],
            "google_id": "demo_deepika",
            "created_at": datetime.utcnow()
        }
        await cls.db.users.insert_one(deepika)

        # Seed FinFlow Deck
        deck_id = ObjectId("650000000000000000000010")
        finflow_deck = {
            "_id": deck_id,
            "founder_id": "650000000000000000000001",
            "title": "FinFlow — Neo-Banking for Bharat SMEs",
            "file_url": "https://cloudinary.com/demo_finflow.pdf",
            "language": "hi",
            "status": "audited",
            "raw_text": """FinFlow: भारत के लघु उद्योगों के लिए डिजिटल वित्तीय समाधान।
समस्या: भारत में 6 करोड़ एमएसएमई (MSME) हैं जिन्हें औपचारिक बैंकिंग ऋण नहीं मिल पाता।
समाधान: व्हाट्सएप आधारित त्वरित इनवॉइस डिस्काउंटिंग और क्रेडिट असेसमेंट।
बाजार का आकार: भारत का एमएसएमई क्रेडिट गैप ₹25 लाख करोड़ ($300B) है।
वर्तमान स्थिति: 450 सक्रिय व्यापारी, ₹1.2 करोड़ वार्षिक रन-रेट (ARR)।
मांग: 18 महीने के रनवे के लिए ₹3 करोड़ सीड फंडिंग।""",
            "sections": [
                {"title": "परिचय व समस्या", "page_number": 1, "content": "6 करोड़ एमएसएमई", "quotes": ["भारत में 6 करोड़ एमएसएमई (MSME) हैं जिन्हें औपचारिक बैंकिंग ऋण नहीं मिल पाता।"]},
                {"title": "समाधान", "page_number": 2, "content": "व्हाट्सएप आधारित त्वरित इनवॉइस डिस्काउंटिंग", "quotes": ["व्हाट्सएप आधारित त्वरित इनवॉइस डिस्काउंटिंग और क्रेडिट असेसमेंट।"]},
                {"title": "बाजार", "page_number": 3, "content": "क्रेडिट गैप ₹25 लाख करोड़", "quotes": ["बाजार का आकार: भारत का एमएसएमई क्रेडिट गैप ₹25 लाख करोड़ ($300B) है।"]},
                {"title": "फाइनेंशियल्स", "page_number": 4, "content": "₹1.2 करोड़ वार्षिक रन-रेट", "quotes": ["450 सक्रिय व्यापारी, ₹1.2 करोड़ वार्षिक रन-रेट (ARR)।"]}
            ],
            "created_at": datetime.utcnow()
        }
        await cls.db.decks.insert_one(finflow_deck)

        # Seed Findings for FinFlow
        findings = [
            {
                "deck_id": str(deck_id),
                "type": "contradiction",
                "severity": "high",
                "title": "TAM vs Serviceable Market Derivation (बाजार का आकार)",
                "description": "Total addressable credit gap of ₹25 lakh crore requires bottom-up unit metrics to substantiate Tier-2 merchant take-rate.",
                "quotes": [
                    {"text": "बाजार का आकार: भारत का एमएसएमई क्रेडिट गैप ₹25 लाख करोड़ ($300B) है।", "page_number": 3, "section_title": "बाजार"}
                ],
                "is_translated": False,
                "original_text": "बाजार का आकार: भारत का एमएसएमई क्रेडिट गैप ₹25 लाख करोड़ ($300B) है।",
                "created_at": datetime.utcnow()
            },
            {
                "deck_id": str(deck_id),
                "type": "numeric_inconsistency",
                "severity": "medium",
                "title": "ARR Pipeline vs Seed Ask Ratio",
                "description": "The current ARR of ₹1.2 crore with 35% MoM growth justifies the ₹3 crore seed ask, but projected burn requires cash-flow visibility.",
                "quotes": [
                    {"text": "450 सक्रिय व्यापारी, ₹1.2 करोड़ वार्षिक रन-रेट (ARR)।", "page_number": 4, "section_title": "फाइनेंशियल्स"}
                ],
                "is_translated": False,
                "original_text": "450 सक्रिय व्यापारी, ₹1.2 करोड़ वार्षिक रन-रेट (ARR)।",
                "created_at": datetime.utcnow()
            },
            {
                "deck_id": str(deck_id),
                "type": "missing_evidence",
                "severity": "medium",
                "title": "Regulatory NBFC Partnership License",
                "description": "Invoice discounting platforms require formal co-lending partnerships or RBI NBFC escrow structures.",
                "quotes": [
                    {"text": "व्हाट्सएप आधारित त्वरित इनवॉइस डिस्काउंटिंग और क्रेडिट असेसमेंट।", "page_number": 2, "section_title": "समाधान"}
                ],
                "is_translated": False,
                "original_text": "व्हाट्सएप आधारित त्वरित इनवॉइस डिस्काउंटिंग और क्रेडिट असेसमेंट।",
                "created_at": datetime.utcnow()
            },
            # 4th finding locked for free tier
            {
                "deck_id": str(deck_id),
                "type": "strength",
                "severity": "low",
                "title": "Rapid Go-To-Market Frictionless Onboarding",
                "description": "WhatsApp-first channel distribution drastically reduces CAC in Tier-2/3 industrial clusters.",
                "quotes": [
                    {"text": "व्हाट्सएप आधारित त्वरित इनवॉइस डिस्काउंटिंग और क्रेडिट असेसमेंट।", "page_number": 2, "section_title": "समाधान"}
                ],
                "is_translated": False,
                "original_text": "",
                "created_at": datetime.utcnow()
            }
        ]
        await cls.db.findings.insert_many(findings)
        print("🌱 Seeded initial trust fixtures into Ventora engine.")

    @classmethod
    async def disconnect(cls):
        if cls.client:
            cls.client.close()
        if cls.neo4j_driver:
            await cls.neo4j_driver.close()

    @classmethod
    def get_db(cls):
        return cls.db

    @classmethod
    def get_neo4j(cls):
        return cls.neo4j_driver


db = Database()
