import asyncio
import os
from datetime import datetime, timezone
from dotenv import load_dotenv

# Load env from root
env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".env"))
load_dotenv(env_path)
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))


from motor.motor_asyncio import AsyncIOMotorClient
from neo4j import AsyncGraphDatabase

MONGODB_URI = os.getenv("MONGODB_URI")
MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME", "ventora")
NEO4J_URI = os.getenv("NEO4J_URI")
NEO4J_USERNAME = os.getenv("NEO4J_USERNAME")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD")


async def seed():
    print("🌱 Connecting to MongoDB...")
    mongo_client = AsyncIOMotorClient(MONGODB_URI)
    db = mongo_client[MONGODB_DB_NAME]

    print("🌱 Connecting to Neo4j...")
    print("🧹 Cleaning previous seed data...")
    await db.users.delete_many({"email": {"$regex": "@example.com$"}})
    await db.decks.delete_many({"title": {"$regex": "^(Ventora|FinFlow|HealthPulse|AgriScale)"}})

    print("👤 Seeding Users in MongoDB...")
    users = [
        {
            "name": "Priya Sharma",
            "email": "priya@example.com",
            "role": "founder",
            "tier": "free",
            "verified": False,
            "sector": "Fintech & Payments",
            "stage": "Seed",
            "skills": ["Payments", "UPI", "Product Strategy", "Go-to-market"],
            "google_id": "demo_priya",
            "created_at": datetime.now(timezone.utc)
        },
        {
            "name": "Arjun Patel",
            "email": "arjun@example.com",
            "role": "founder",
            "tier": "pro",
            "verified": False,
            "sector": "Healthtech & AI",
            "stage": "Pre-Seed",
            "skills": ["Machine Learning", "Health Data", "FastAPI"],
            "google_id": "demo_arjun",
            "created_at": datetime.now(timezone.utc)
        },
        # Co-Founders for graph discovery and matching
        {
            "name": "Rohan Deshmukh",
            "email": "rohan@example.com",
            "role": "founder",
            "tier": "free",
            "verified": True,
            "sector": "Fintech / B2B",
            "stage": "Seed",
            "skills": ["Payments", "UPI", "Distributed Systems"],
            "google_id": "co_1",
            "created_at": datetime.now(timezone.utc)
        },
        {
            "name": "Meera Iyer",
            "email": "meera@example.com",
            "role": "founder",
            "tier": "free",
            "verified": True,
            "sector": "Fintech / AI",
            "stage": "Pre-seed",
            "skills": ["UPI", "Product Strategy"],
            "google_id": "co_2",
            "created_at": datetime.now(timezone.utc)
        },
        {
            "name": "Kabir Sen",
            "email": "kabir@example.com",
            "role": "founder",
            "tier": "free",
            "verified": True,
            "sector": "Fintech",
            "stage": "Seed",
            "skills": ["Payments", "UPI"],
            "google_id": "co_3",
            "created_at": datetime.now(timezone.utc)
        },
        # Verified Investor with planted conflict
        {
            "name": "Vikram Mehta",
            "email": "vikram@example.com",
            "role": "investor",
            "tier": "pro",
            "verified": True,
            "portfolio_url": "https://mehtaventures.in/portfolio",
            "linkedin_url": "https://linkedin.com/in/vikrammehta-vc",
            "sector": "Fintech & Payments",
            "stage": "Seed, Series A",
            "skills": ["Fintech", "Due Diligence", "Capital Allocation"],
            "google_id": "demo_vikram",
            "created_at": datetime.now(timezone.utc)
        },
        # Unverified Investor (shows "Not yet verified")
        {
            "name": "Ananya Reddy",
            "email": "ananya@example.com",
            "role": "investor",
            "tier": "free",
            "verified": False,
            "portfolio_url": "",
            "linkedin_url": "",
            "sector": "Consumer & D2C",
            "stage": "Pre-Seed",
            "skills": ["Brand", "D2C"],
            "google_id": "demo_ananya",
            "created_at": datetime.now(timezone.utc)
        },
        # 18 more realistic investors
        {
            "name": "Sanjay Kapoor",
            "email": "sanjay@example.com",
            "role": "investor",
            "tier": "pro",
            "verified": True,
            "portfolio_url": "https://kapoorcap.com",
            "linkedin_url": "https://linkedin.com/in/sanjaykapoor",
            "sector": "SaaS & DevTools",
            "stage": "Seed",
            "skills": ["Enterprise SaaS", "B2B Sales"],
            "google_id": "demo_sanjay",
            "created_at": datetime.now(timezone.utc)
        },
        {
            "name": "Ritu Verma",
            "email": "ritu@example.com",
            "role": "investor",
            "tier": "pro",
            "verified": True,
            "portfolio_url": "https://anicutcapital.com",
            "linkedin_url": "https://linkedin.com/in/rituverma",
            "sector": "Healthtech & Biotech",
            "stage": "Seed",
            "skills": ["Healthcare", "Clinical Trials"],
            "google_id": "demo_ritu",
            "created_at": datetime.now(timezone.utc)
        },
        {
            "name": "Aditya Singhal",
            "email": "aditya@example.com",
            "role": "investor",
            "tier": "pro",
            "verified": True,
            "portfolio_url": "https://blume.vc",
            "linkedin_url": "https://linkedin.com/in/adityasinghal",
            "sector": "Logistics & Supply Chain",
            "stage": "Pre-Seed, Seed",
            "skills": ["Mobility", "Warehousing"],
            "google_id": "demo_aditya",
            "created_at": datetime.now(timezone.utc)
        },
        {
            "name": "Naveen Tewari",
            "email": "naveen@example.com",
            "role": "investor",
            "tier": "pro",
            "verified": True,
            "portfolio_url": "https://inmobi.com",
            "linkedin_url": "https://linkedin.com/in/naveentewari",
            "sector": "AdTech & AI",
            "stage": "Seed, Series A",
            "skills": ["Adtech", "Scaling"],
            "google_id": "demo_naveen",
            "created_at": datetime.now(timezone.utc)
        },
        {
            "name": "Tanmay Bhatia",
            "email": "tanmay@example.com",
            "role": "investor",
            "tier": "free",
            "verified": False,
            "portfolio_url": "",
            "linkedin_url": "",
            "sector": "EdTech & Creator Economy",
            "stage": "Angel",
            "skills": ["Community", "Growth"],
            "google_id": "demo_tanmay",
            "created_at": datetime.now(timezone.utc)
        },
        {
            "name": "Deepika Rao",
            "email": "deepika@example.com",
            "role": "investor",
            "tier": "pro",
            "verified": True,
            "portfolio_url": "https://matrixpartners.in",
            "linkedin_url": "https://linkedin.com/in/deepikarao",
            "sector": "Fintech & Payments",
            "stage": "Seed, Series A",
            "skills": ["Lending", "Insurtech"],
            "google_id": "demo_deepika",
            "created_at": datetime.now(timezone.utc)
        },
        {
            "name": "Kunal Bahl",
            "email": "kunal@example.com",
            "role": "investor",
            "tier": "pro",
            "verified": True,
            "portfolio_url": "https://titan-capital.in",
            "linkedin_url": "https://linkedin.com/in/kunalbahl",
            "sector": "E-Commerce & Marketplaces",
            "stage": "Seed",
            "skills": ["Marketplaces", "Founding"],
            "google_id": "demo_kunal",
            "created_at": datetime.now(timezone.utc)
        },
        {
            "name": "Radhika Ghai",
            "email": "radhika@example.com",
            "role": "investor",
            "tier": "pro",
            "verified": True,
            "portfolio_url": "https://kindlestartup.com",
            "linkedin_url": "https://linkedin.com/in/radhikaghai",
            "sector": "Consumer & D2C",
            "stage": "Seed",
            "skills": ["D2C", "Branding"],
            "google_id": "demo_radhika",
            "created_at": datetime.now(timezone.utc)
        },
        # Honest response investor: intentionally no graph portfolio!
        {
            "name": "Harshvardhan Joshi",
            "email": "harsh@example.com",
            "role": "investor",
            "tier": "free",
            "verified": False,
            "portfolio_url": "",
            "linkedin_url": "",
            "sector": "Agritech",
            "stage": "Pre-Seed",
            "skills": ["Agriculture"],
            "google_id": "demo_harsh",
            "created_at": datetime.now(timezone.utc)
        }
    ]

    inserted_users = {}
    for u in users:
        res = await db.users.insert_one(u)
        inserted_users[u["email"]] = str(res.inserted_id)

    print(f"✅ Inserted {len(users)} users into MongoDB.")

    print("📄 Seeding Demo Pitch Decks in MongoDB...")
    demo_decks = [
        {
            "founder_id": inserted_users["priya@example.com"],
            "founder_name": "Priya Sharma",
            "title": "FinFlow — Neo-Banking for Bharat SMEs",
            "description": "WhatsApp-first invoice discounting and instant working capital for 60M unbanked SMEs across Tier 2/3 India. ₹1.2 Cr ARR with 35% MoM growth.",
            "file_url": "https://res.cloudinary.com/demo/image/upload/sample.pdf",
            "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
            "thumbnail_url": "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&auto=format&fit=crop&q=80",
            "language": "hi",
            "status": "audited",
            "tags": ["fintech", "upi", "b2b", "india", "seed"],
            "sectors": ["fintech"],
            "stage": "Seed",
            "views": 142,
            "likes": [inserted_users.get("vikram@example.com", "v1"), inserted_users.get("sanjay@example.com", "s1")],
            "bookmarks": [inserted_users.get("vikram@example.com", "v1")],
            "raw_text": """FinFlow: भारत के लघु उद्योगों के लिए डिजिटल वित्तीय समाधान।
समस्या: भारत में 6 करोड़ एमएसएमई (MSME) हैं जिन्हें औपचारिक बैंकिंग ऋण नहीं मिल पाता।
हमारा समाधान: व्हाट्सएप आधारित त्वरित इनवॉइस डिस्काउंटिंग और क्रेडिट असेसमेंट।
बाजार का आकार: भारत का एमएसएमई क्रेडिट गैप ₹25 लाख करोड़ ($300B) है।
वर्तमान स्थिति (Traction): 450 सक्रिय व्यापारी, ₹1.2 करोड़ वार्षिक रन-रेट (ARR)। पिछले तिमाही में 35% मासिक वृद्धि।
मांग (Ask): 18 महीने के रनवे के लिए ₹3 करोड़ ($360K) सीड फंडिंग।
प्रतिस्पर्धा: पारम्परिक बैंक और गैर-बैंकिंग वित्तीय कम्पनियां (NBFC) जटिल कागजी कार्रवाई मांगते हैं।""",
            "sections": [
                {"title": "परिचय व समस्या", "page_number": 1, "content": "FinFlow: भारत के लघु उद्योगों के लिए डिजिटल वित्तीय समाधान। 6 करोड़ एमएसएमई (MSME)।", "quotes": ["भारत में 6 करोड़ एमएसएमई (MSME) हैं जिन्हें औपचारिक बैंकिंग ऋण नहीं मिल पाता।"]},
                {"title": "समाधान", "page_number": 2, "content": "व्हाट्सएप आधारित त्वरित इनवॉइस डिस्काउंटिंग।", "quotes": ["व्हाट्सएप आधारित त्वरित इनवॉइस डिस्काउंटिंग और क्रेडिट असेसमेंट।"]},
                {"title": "बाजार", "page_number": 3, "content": "बाजार का आकार: भारत का एमएसएमई क्रेडिट गैप ₹25 लाख करोड़ ($300B) है।", "quotes": ["बाजार का आकार: भारत का एमएसएमई क्रेडिट गैप ₹25 लाख करोड़ ($300B) है।"]},
                {"title": "फाइनेंशियल्स", "page_number": 4, "content": "वर्तमान स्थिति: 450 सक्रिय व्यापारी, ₹1.2 करोड़ वार्षिक रन-रेट (ARR)। मांग: ₹3 करोड़ सीड फंडिंग।", "quotes": ["450 सक्रिय व्यापारी, ₹1.2 करोड़ वार्षिक रन-रेट (ARR)।", "मांग (Ask): 18 महीने के रनवे के लिए ₹3 करोड़ ($360K) सीड फंडिंग।"]}
            ],
            "created_at": datetime.now(timezone.utc)
        },
        {
            "founder_id": inserted_users["arjun@example.com"],
            "founder_name": "Arjun Patel",
            "title": "HealthPulse — AI Remote Diagnostics for Rural ICUs",
            "description": "Continuous acoustic & biometric ML vital telemetry bringing specialist-level ICU care to 70% of underserved rural hospitals across India.",
            "file_url": "https://res.cloudinary.com/demo/image/upload/sample.pdf",
            "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            "thumbnail_url": "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=80",
            "language": "en",
            "status": "audited",
            "tags": ["healthcare", "ai", "b2b", "india", "pre-seed"],
            "sectors": ["healthcare", "ai"],
            "stage": "Pre-Seed",
            "views": 218,
            "likes": [inserted_users.get("priya@example.com", "p1"), inserted_users.get("vikram@example.com", "v1")],
            "bookmarks": [inserted_users.get("priya@example.com", "p1")],
            "raw_text": """HealthPulse AI: Continuous Vital Telemetry for Tier-2 ICU Systems.
Problem: Critical care access is centralized in top 8 metro cities. 70% of rural ICUs lack dedicated intensivists.
Solution: Real-time ML acoustic and biometric analysis directly from low-cost pulse ox monitors.
Market: $4.5B Indian healthcare diagnostics TAM growing at 18% CAGR.
Traction: 12 hospital pilots deployed across Maharashtra and Gujarat. ₹45 Lakhs ARR contract pipeline.
Ask: Raising $500,000 for clinical device certification and team expansion.""",
            "sections": [
                {"title": "Problem", "page_number": 1, "content": "70% of rural ICUs lack dedicated intensivists.", "quotes": ["70% of rural ICUs lack dedicated intensivists."]},
                {"title": "Market", "page_number": 2, "content": "$4.5B Indian healthcare diagnostics TAM.", "quotes": ["$4.5B Indian healthcare diagnostics TAM growing at 18% CAGR."]},
                {"title": "Traction", "page_number": 3, "content": "12 hospital pilots deployed, ₹45 Lakhs ARR pipeline.", "quotes": ["12 hospital pilots deployed across Maharashtra and Gujarat.", "₹45 Lakhs ARR contract pipeline."]}
            ],
            "created_at": datetime.now(timezone.utc)
        },
        {
            "founder_id": inserted_users.get("rohan@example.com", inserted_users["priya@example.com"]),
            "founder_name": "Rohan Deshmukh",
            "title": "AgriScale — Drone-Assisted Precision Crop Yields",
            "description": "Hyperlocal hyperspectral drone imaging and AI pest prediction providing smallholder farmers in Punjab & Haryana guaranteed 22% yield improvement.",
            "file_url": "https://res.cloudinary.com/demo/image/upload/sample.pdf",
            "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
            "thumbnail_url": "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=600&auto=format&fit=crop&q=80",
            "language": "en",
            "status": "audited",
            "tags": ["agritech", "ai", "cleantech", "india", "seed"],
            "sectors": ["agritech", "cleantech"],
            "stage": "Seed",
            "views": 95,
            "likes": [inserted_users.get("priya@example.com", "p1")],
            "bookmarks": [],
            "raw_text": """AgriScale: Precision drone analytics for Indian smallholder farmers. 15,000 acres covered. Raising ₹2.5 Crore Seed.""",
            "sections": [
                {"title": "Overview", "page_number": 1, "content": "Drone imaging for agriculture. 15,000 acres monitored.", "quotes": ["Drone imaging for agriculture."]}
            ],
            "created_at": datetime.now(timezone.utc)
        }
    ]

    for d in demo_decks:
        d_res = await db.decks.insert_one(d)
        d_id = str(d_res.inserted_id)

        # Seed findings for FinFlow
        if d["title"].startswith("FinFlow"):
            findings = [
                {
                    "deck_id": d_id,
                    "type": "contradiction",
                    "severity": "high",
                    "title": "TAM vs Serviceable Market Derivation (बाजार का आकार)",
                    "description": "Total addressable credit gap of ₹25 lakh crore requires bottom-up unit metrics to substantiate Tier-2 merchant take-rate.",
                    "quotes": [
                        {"text": "बाजार का आकार: भारत का एमएसएमई क्रेडिट गैप ₹25 लाख करोड़ ($300B) है।", "page_number": 3, "section_title": "बाजार"}
                    ],
                    "is_translated": False,
                    "original_text": "बाजार का आकार: भारत का एमएसएमई क्रेडिट गैप ₹25 लाख करोड़ ($300B) है।",
                    "created_at": datetime.now(timezone.utc)
                },
                {
                    "deck_id": d_id,
                    "type": "numeric_inconsistency",
                    "severity": "medium",
                    "title": "ARR Pipeline vs Seed Ask Ratio",
                    "description": "The current ARR of ₹1.2 crore with 35% MoM growth justifies the ₹3 crore seed ask, but projected burn requires cash-flow visibility.",
                    "quotes": [
                        {"text": "450 सक्रिय व्यापारी, ₹1.2 करोड़ वार्षिक रन-रेट (ARR)।", "page_number": 4, "section_title": "फाइनेंशियल्स"}
                    ],
                    "is_translated": False,
                    "original_text": "450 सक्रिय व्यापारी, ₹1.2 करोड़ वार्षिक रन-रेट (ARR)।",
                    "created_at": datetime.now(timezone.utc)
                },
                {
                    "deck_id": d_id,
                    "type": "missing_evidence",
                    "severity": "medium",
                    "title": "Regulatory NBFC Partnership License",
                    "description": "Invoice discounting platforms require formal co-lending partnerships or RBI NBFC escrow structures.",
                    "quotes": [
                        {"text": "व्हाट्सएप आधारित त्वरित इनवॉइस डिस्काउंटिंग और क्रेडिट असेसमेंट।", "page_number": 2, "section_title": "समाधान"}
                    ],
                    "is_translated": False,
                    "original_text": "व्हाट्सएप आधारित त्वरित इनवॉइस डिस्काउंटिंग और क्रेडिट असेसमेंट।",
                    "created_at": datetime.now(timezone.utc)
                },
                # Locked finding #4 for free tier
                {
                    "deck_id": d_id,
                    "type": "strength",
                    "severity": "low",
                    "title": "Rapid Go-To-Market Frictionless Onboarding",
                    "description": "WhatsApp-first channel distribution drastically reduces CAC in Tier-2/3 industrial clusters.",
                    "quotes": [
                        {"text": "व्हाट्सएप आधारित त्वरित इनवॉइस डिस्काउंटिंग और क्रेडिट असेसमेंट।", "page_number": 2, "section_title": "समाधान"}
                    ],
                    "is_translated": False,
                    "original_text": "",
                    "created_at": datetime.now(timezone.utc)
                }
            ]
            await db.findings.insert_many(findings)

    print("✅ Seeded Decks & Findings in MongoDB.")

    print("🕸️ Seeding Neo4j Graph...")
    neo4j_driver = None
    neo4j_seeded = False
    try:
        neo4j_uri = NEO4J_URI
        if not neo4j_uri:
            raise ValueError("NEO4J_URI is not configured")
        if "neo4j+s://" in neo4j_uri:
            neo4j_uri = neo4j_uri.replace("neo4j+s://", "neo4j+ssc://")
        neo4j_driver = AsyncGraphDatabase.driver(
            neo4j_uri,
            auth=(NEO4J_USERNAME, NEO4J_PASSWORD)
        )
        async with neo4j_driver.session() as session:
            # Clear graph
            await session.run("MATCH (n) DETACH DELETE n")

            # 1. Create Founder nodes
            priya_id = inserted_users["priya@example.com"]
            arjun_id = inserted_users["arjun@example.com"]
            await session.run(
                """
                CREATE (f1:Founder {id: $p_id, name: 'Priya Sharma', sector: 'Fintech & Payments', stage: 'Seed'})
                CREATE (f2:Founder {id: $a_id, name: 'Arjun Patel', sector: 'Healthtech & AI', stage: 'Pre-Seed'})
                """,
                {"p_id": priya_id, "a_id": arjun_id}
            )

            # 2. Create Companies
            await session.run(
                """
                CREATE (c1:Company {name: 'BharatInvoice', sector: 'Fintech & Payments', source_url: 'https://tracxn.com/d/companies/bharatinvoice'})
                CREATE (c2:Company {name: 'KreditPay', sector: 'Fintech & Payments', source_url: 'https://tracxn.com/d/companies/kreditpay'})
                CREATE (c3:Company {name: 'CurePulse', sector: 'Healthtech & AI', source_url: 'https://tracxn.com/d/companies/curepulse'})
                CREATE (c4:Company {name: 'QuickLend', sector: 'Fintech & Payments', source_url: 'https://tracxn.com/d/companies/quicklend'})
                """
            )

            # 3. Create Competes With relationship
            # Priya's startup competes with BharatInvoice
            await session.run(
                """
                MATCH (f:Founder {id: $p_id}), (c:Company {name: 'BharatInvoice'})
                CREATE (f)-[:COMPETES_WITH]->(c)
                """,
                {"p_id": priya_id}
            )

            # 4. Create Investor nodes and Portfolios
            # Vikram Mehta has invested in BharatInvoice -> This creates the planted conflict!
            vikram_id = inserted_users["vikram@example.com"]
            deepika_id = inserted_users["deepika@example.com"]
            sanjay_id = inserted_users["sanjay@example.com"]

            await session.run(
                """
                CREATE (i1:Investor {id: $v_id, name: 'Vikram Mehta', sector: 'Fintech & Payments', stage: 'Seed'})
                CREATE (i2:Investor {id: $d_id, name: 'Deepika Rao', sector: 'Fintech & Payments', stage: 'Seed'})
                CREATE (i3:Investor {id: $s_id, name: 'Sanjay Kapoor', sector: 'SaaS & DevTools', stage: 'Seed'})
                """,
                {"v_id": vikram_id, "d_id": deepika_id, "s_id": sanjay_id}
            )

            # Vikram Mehta invested in BharatInvoice (Planted Conflict!)
            await session.run(
                """
                MATCH (i:Investor {id: $v_id}), (c:Company {name: 'BharatInvoice'})
                CREATE (i)-[:INVESTED_IN {round: 'Seed', date: '2025-06-15'}]->(c)
                """,
                {"v_id": vikram_id}
            )

            # Deepika Rao invested in CurePulse (No conflict with Priya)
            await session.run(
                """
                MATCH (i:Investor {id: $d_id}), (c:Company {name: 'CurePulse'})
                CREATE (i)-[:INVESTED_IN {round: 'Pre-Seed', date: '2025-09-10'}]->(c)
                """,
                {"d_id": deepika_id}
            )

            # 5. Seed Skills and Co-Founders
            await session.run(
                """
                CREATE (s1:Skill {name: 'Payments'})
                CREATE (s2:Skill {name: 'UPI'})
                CREATE (s3:Skill {name: 'Product Strategy'})
                CREATE (s4:Skill {name: 'Distributed Systems'})

                CREATE (cf1:Founder {id: 'co_1', name: 'Rohan Deshmukh', sector: 'Fintech / B2B', stage: 'Seed'})
                CREATE (cf2:Founder {id: 'co_2', name: 'Meera Iyer', sector: 'Fintech / AI', stage: 'Pre-seed'})
                CREATE (cf3:Founder {id: 'co_3', name: 'Kabir Sen', sector: 'Fintech', stage: 'Seed'})
                """
            )

            await session.run(
                """
                MATCH (f:Founder {id: $p_id}), (s1:Skill {name: 'Payments'}), (s2:Skill {name: 'UPI'}), (s3:Skill {name: 'Product Strategy'})
                CREATE (f)-[:HAS_SKILL]->(s1)
                CREATE (f)-[:HAS_SKILL]->(s2)
                CREATE (f)-[:HAS_SKILL]->(s3)
                """,
                {"p_id": priya_id}
            )

            await session.run(
                """
                MATCH (cf:Founder {id: 'co_1'}), (s1:Skill {name: 'Payments'}), (s2:Skill {name: 'UPI'}), (s4:Skill {name: 'Distributed Systems'})
                CREATE (cf)-[:HAS_SKILL]->(s1)
                CREATE (cf)-[:HAS_SKILL]->(s2)
                CREATE (cf)-[:HAS_SKILL]->(s4)
                """
            )

            await session.run(
                """
                MATCH (cf:Founder {id: 'co_2'}), (s2:Skill {name: 'UPI'}), (s3:Skill {name: 'Product Strategy'})
                CREATE (cf)-[:HAS_SKILL]->(s2)
                CREATE (cf)-[:HAS_SKILL]->(s3)
                """
            )

        print("✅ Seeded Neo4j graph with planted conflict and co-founders.")
        neo4j_seeded = True
    except Exception as e:
        print(f"⚠️ Neo4j seeding notice: {e}")
    finally:
        try:
            if neo4j_driver is not None:
                await neo4j_driver.close()
        finally:
            mongo_client.close()

    if neo4j_seeded:
        print("🎉 ALL SEEDING COMPLETED SUCCESSFULLY!")
    else:
        print("⚠️ MongoDB seeding completed, but Neo4j graph seeding did not.")


if __name__ == "__main__":
    asyncio.run(seed())

