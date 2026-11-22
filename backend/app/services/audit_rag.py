import re
import math
from typing import List, Dict, Any, Optional
from datetime import datetime
from app.services import sarvam_service


def extract_chunks_from_deck(deck: dict) -> List[Dict[str, Any]]:
    """Extract slide chunks with metadata from parsed deck document."""
    sections = deck.get("sections", [])
    chunks = []

    if sections and isinstance(sections, list):
        for idx, s in enumerate(sections):
            content = (s.get("content") or "").strip()
            title = (s.get("title") or f"Slide {idx + 1}").strip()
            page = s.get("page_number", idx + 1)
            if content:
                chunks.append({
                    "chunk_id": f"chunk_{idx + 1}",
                    "page_number": page,
                    "title": title,
                    "content": content,
                })

    if not chunks:
        raw_text = deck.get("raw_text", "")
        # Split by slide or double newline
        blocks = re.split(r'\n(?=(?:Slide|Page|\d+\.|\n\n))', raw_text)
        for idx, block in enumerate(blocks):
            b_clean = block.strip()
            if len(b_clean) > 20:
                chunks.append({
                    "chunk_id": f"chunk_{idx + 1}",
                    "page_number": idx + 1,
                    "title": f"Section {idx + 1}",
                    "content": b_clean,
                })

    return chunks


def tokenize(text: str) -> List[str]:
    """Tokenize and normalize text."""
    words = re.findall(r'[a-zA-Z0-9]+', text.lower())
    # filter tiny stop words
    stopwords = {"the", "a", "an", "and", "or", "in", "on", "at", "to", "for", "is", "of", "with", "by", "as"}
    return [w for w in words if len(w) > 1 and w not in stopwords]


def retrieve_relevant_chunks(chunks: List[Dict[str, Any]], query: str, top_k: int = 3) -> List[Dict[str, Any]]:
    """BM25/TF-IDF style relevance scoring to retrieve top-k chunks."""
    if not chunks:
        return []

    q_tokens = tokenize(query)
    if not q_tokens:
        return chunks[:top_k]

    # Precompute doc frequencies
    N = len(chunks)
    df = {}
    for chunk in chunks:
        tokens_in_doc = set(tokenize(chunk["content"] + " " + chunk["title"]))
        for t in q_tokens:
            if t in tokens_in_doc:
                df[t] = df.get(t, 0) + 1

    scored = []
    for chunk in chunks:
        doc_tokens = tokenize(chunk["content"] + " " + chunk["title"])
        doc_len = len(doc_tokens) or 1
        tf = {}
        for t in doc_tokens:
            tf[t] = tf.get(t, 0) + 1

        score = 0.0
        for t in q_tokens:
            if t in tf:
                # IDF
                doc_freq = df.get(t, 0)
                idf = math.log(1.0 + (N - doc_freq + 0.5) / (doc_freq + 0.5))
                # TF score with length normalization
                tf_score = (tf[t] * 2.2) / (tf[t] + 1.2 * (0.25 + 0.75 * (doc_len / 50.0)))
                score += idf * tf_score

        # Domain keyword boost
        content_lower = chunk["content"].lower()
        if any(term in content_lower for term in ["revenue", "burn", "tam", "arr", "mrr", "valuation", "seed", "crore", "lakh"]):
            score += 0.5

        scored.append((score, chunk))

    # Sort descending by score
    scored.sort(key=lambda x: x[0], reverse=True)
    return [item[1] for item in scored[:top_k]]


async def query_deck_with_rag(deck: dict, query: str) -> dict:
    """Run RAG retrieval and Sarvam AI synthesis for a specific audit query."""
    chunks = extract_chunks_from_deck(deck)
    retrieved_chunks = retrieve_relevant_chunks(chunks, query, top_k=3)

    if not retrieved_chunks:
        return {
            "query": query,
            "answer": "No readable sections or slide text found in this pitch deck to verify this claim.",
            "verdict": "SUSPICIOUS",
            "is_garbage_claim": True,
            "confidence": "Low",
            "citations": [],
            "chunks_used": []
        }

    # Build context string
    context_blocks = []
    for c in retrieved_chunks:
        context_blocks.append(f"[Slide {c['page_number']} - {c['title']}]:\n\"{c['content']}\"")
    context_str = "\n\n".join(context_blocks)

    system_prompt = (
        "You are Ventora's AI Audit Analyst. You audit startup pitch decks for venture investors. "
        "Analyze the provided retrieved slide excerpts and answer the audit inquiry strictly based on the text. "
        "Assess whether there are red flags, contradictions, or unsubstantiated numbers. "
        "Respond in valid JSON with: {\"answer\": \"detailed audit explanation\", "
        "\"verdict\": \"VERIFIED\" | \"SUSPICIOUS\" | \"RED_FLAG\", "
        "\"is_garbage_claim\": true | false, "
        "\"confidence\": \"High\" | \"Medium\" | \"Low\", "
        "\"quotes\": [\"exact snippet 1\", \"exact snippet 2\"]}"
    )

    user_prompt = f"""Retrieved Pitch Deck Evidence:
{context_str}

Audit Question / Dimension:
"{query}"

Respond strictly in valid JSON without markdown wrapping."""

    try:
        content = await sarvam_service.call_sarvam_chat(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            max_tokens=1500,
            model="sarvam-105b-conversations",
            temperature=0.1,
            timeout=20.0
        )

        clean_json = re.sub(r'```(?:json)?|```', '', content).strip()
        json_match = re.search(r'\{[\s\S]*\}', clean_json)
        if json_match:
            clean_json = json_match.group(0)

        result = json.loads(clean_json)
        answer = result.get("answer", "")
        verdict = result.get("verdict", "SUSPICIOUS").upper()
        if verdict not in ["VERIFIED", "SUSPICIOUS", "RED_FLAG"]:
            verdict = "RED_FLAG" if result.get("is_garbage_claim") else "SUSPICIOUS"

        citations = []
        for q in result.get("quotes", []):
            if isinstance(q, str) and q.strip():
                # find which chunk it matches
                matching_page = retrieved_chunks[0]["page_number"]
                for c in retrieved_chunks:
                    if q.lower() in c["content"].lower():
                        matching_page = c["page_number"]
                        break
                citations.append({"text": q.strip(), "page_number": matching_page})

        return {
            "query": query,
            "answer": answer or "Audit analysis completed.",
            "verdict": verdict,
            "is_garbage_claim": result.get("is_garbage_claim", verdict == "RED_FLAG"),
            "confidence": result.get("confidence", "High"),
            "citations": citations if citations else [{"text": retrieved_chunks[0]["content"][:140], "page_number": retrieved_chunks[0]["page_number"]}],
            "chunks_used": [{"page_number": c["page_number"], "title": c["title"]} for c in retrieved_chunks]
        }

    except Exception as e:
        # Graceful deterministic fallback
        snippet = retrieved_chunks[0]["content"][:200]
        page = retrieved_chunks[0]["page_number"]
        has_red_flag_terms = any(w in snippet.lower() for w in ["unlimited", "100%", "zero competition", "50b", "guaranteed"])
        verdict = "RED_FLAG" if has_red_flag_terms else "SUSPICIOUS"
        return {
            "query": query,
            "answer": f"Audit inspection of Slide {page}: Evidence retrieved for '{query}'. Claims require direct substantiation.",
            "verdict": verdict,
            "is_garbage_claim": has_red_flag_terms,
            "confidence": "Medium",
            "citations": [{"text": snippet, "page_number": page}],
            "chunks_used": [{"page_number": c["page_number"], "title": c["title"]} for c in retrieved_chunks]
        }


async def run_comprehensive_rag_audit(deck: dict) -> dict:
    """Run full 4-pillar RAG audit over pitch deck and compute final verdict."""
    deck_id = str(deck.get("_id") or deck.get("id"))
    pillars = [
        {"dimension": "Market Size & TAM Validation", "query": "Total Addressable Market TAM, SAM, SOM claims and target segment derivation"},
        {"dimension": "Financial Sanity & Unit Economics", "query": "Revenue, burn rate, valuation ask, CAC, LTV and runway metrics"},
        {"dimension": "Moat & Defensibility", "query": "Competitive advantages, IP patents, defensibility, and network effects"},
        {"dimension": "Traction & Evidence Substantiation", "query": "Customer validation, pilots, user growth, retention, and paying clients"}
    ]

    reports = []
    red_flag_count = 0

    for p in pillars:
        rep = await query_deck_with_rag(deck, p["query"])
        rep["dimension"] = p["dimension"]
        if rep["verdict"] == "RED_FLAG" or rep["is_garbage_claim"]:
            red_flag_count += 1
        reports.append(rep)

    is_garbage_idea = red_flag_count >= 1
    overall_verdict = "GARBAGE_IDEA" if is_garbage_idea else "INVESTABLE"

    verdict_summary = {
        "deck_id": deck_id,
        "title": deck.get("title", "Pitch Deck"),
        "overall_verdict": overall_verdict,
        "is_garbage_idea": is_garbage_idea,
        "red_flag_count": red_flag_count,
        "pillars_checked": len(pillars),
        "verdict_reason": (
            f"Flagged as Garbage Idea: {red_flag_count} critical red flags detected in RAG audit."
            if is_garbage_idea
            else "Passed initial RAG audit: no high-severity discrepancies found across evidence."
        ),
        "reports": reports,
        "audited_at": datetime.utcnow().isoformat()
    }

    return verdict_summary
