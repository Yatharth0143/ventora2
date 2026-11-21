import asyncio
import os
from dotenv import load_dotenv
from neo4j import AsyncGraphDatabase

load_dotenv(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".env")))

NEO4J_URI = "neo4j+ssc://a05bfdf5.databases.neo4j.io"
NEO4J_USERNAME = os.getenv("NEO4J_USERNAME", "a05bfdf5")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD")

async def seed_neo4j():
    print(f"🕸️ Connecting to Neo4j Aura at {NEO4J_URI}...")
    driver = AsyncGraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USERNAME, NEO4J_PASSWORD))
    
    async with driver.session() as session:
        print("🧹 Cleaning Neo4j graph...")
        await session.run("MATCH (n) DETACH DELETE n")

        print("👤 Creating Founders...")
        await session.run("""
            CREATE (f1:Founder {id: 'priya_founder_id', name: 'Priya Sharma', sector: 'Fintech & Payments', stage: 'Seed'})
            CREATE (f2:Founder {id: 'arjun_founder_id', name: 'Arjun Patel', sector: 'Healthtech & AI', stage: 'Pre-Seed'})
        """)

        print("🏢 Creating Competitor Companies with Tracxn source URLs...")
        await session.run("""
            CREATE (c1:Company {name: 'BharatInvoice', sector: 'Fintech & Payments', source_url: 'https://tracxn.com/d/companies/bharatinvoice'})
            CREATE (c2:Company {name: 'KreditPay', sector: 'Fintech & Payments', source_url: 'https://tracxn.com/d/companies/kreditpay'})
            CREATE (c3:Company {name: 'CurePulse', sector: 'Healthtech & AI', source_url: 'https://tracxn.com/d/companies/curepulse'})
            CREATE (c4:Company {name: 'QuickLend', sector: 'Fintech & Payments', source_url: 'https://tracxn.com/d/companies/quicklend'})
        """)

        print("⚡ Creating COMPETES_WITH relationship (Priya vs BharatInvoice)...")
        await session.run("""
            MATCH (f:Founder {id: 'priya_founder_id'}), (c:Company {name: 'BharatInvoice'})
            CREATE (f)-[:COMPETES_WITH]->(c)
        """)

        print("💼 Creating Investors & Portfolios (Planted Conflict: Vikram Mehta -> BharatInvoice)...")
        await session.run("""
            CREATE (i1:Investor {id: 'vikram_investor_id', name: 'Vikram Mehta', sector: 'Fintech & Payments', stage: 'Seed'})
            CREATE (i2:Investor {id: 'deepika_investor_id', name: 'Deepika Rao', sector: 'Fintech & Payments', stage: 'Seed'})
            CREATE (i3:Investor {id: 'sanjay_investor_id', name: 'Sanjay Kapoor', sector: 'SaaS & DevTools', stage: 'Seed'})
            CREATE (i4:Investor {id: 'ritu_investor_id', name: 'Ritu Verma', sector: 'Healthtech', stage: 'Seed'})
            CREATE (i5:Investor {id: 'aditya_investor_id', name: 'Aditya Singhal', sector: 'Logistics', stage: 'Seed'})
            // Note: Harshvardhan Joshi is intentionally omitted to serve as the 'data_gap' honest-response test case
        """)

        # Planted conflict
        await session.run("""
            MATCH (i:Investor {id: 'vikram_investor_id'}), (c:Company {name: 'BharatInvoice'})
            CREATE (i)-[:INVESTED_IN {round: 'Seed', date: '2025-06-15'}]->(c)
        """)

        # Non-conflict investment
        await session.run("""
            MATCH (i:Investor {id: 'deepika_investor_id'}), (c:Company {name: 'CurePulse'})
            CREATE (i)-[:INVESTED_IN {round: 'Pre-Seed', date: '2025-09-10'}]->(c)
        """)

        print("🤝 Creating Skills and Co-Founders for graph discovery...")
        await session.run("""
            CREATE (s1:Skill {name: 'Payments'})
            CREATE (s2:Skill {name: 'UPI'})
            CREATE (s3:Skill {name: 'Product Strategy'})
            CREATE (s4:Skill {name: 'Distributed Systems'})

            CREATE (cf1:Founder {id: 'co_1', name: 'Rohan Deshmukh', sector: 'Fintech / B2B', stage: 'Seed'})
            CREATE (cf2:Founder {id: 'co_2', name: 'Meera Iyer', sector: 'Fintech / AI', stage: 'Pre-seed'})
            CREATE (cf3:Founder {id: 'co_3', name: 'Kabir Sen', sector: 'Fintech', stage: 'Seed'})
        """)

        await session.run("""
            MATCH (f:Founder {id: 'priya_founder_id'}), (s1:Skill {name: 'Payments'}), (s2:Skill {name: 'UPI'}), (s3:Skill {name: 'Product Strategy'})
            CREATE (f)-[:HAS_SKILL]->(s1)
            CREATE (f)-[:HAS_SKILL]->(s2)
            CREATE (f)-[:HAS_SKILL]->(s3)
        """)

        await session.run("""
            MATCH (cf:Founder {id: 'co_1'}), (s1:Skill {name: 'Payments'}), (s2:Skill {name: 'UPI'}), (s4:Skill {name: 'Distributed Systems'})
            CREATE (cf)-[:HAS_SKILL]->(s1)
            CREATE (cf)-[:HAS_SKILL]->(s2)
            CREATE (cf)-[:HAS_SKILL]->(s4)
        """)

        # Verify node counts
        res = await session.run("MATCH (n) RETURN count(n) as total")
        record = await res.single()
        print(f"🎉 NEO4J SEEDING COMPLETE! Total graph nodes: {record['total']}")

    await driver.close()

if __name__ == "__main__":
    asyncio.run(seed_neo4j())

