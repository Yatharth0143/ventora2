Ventora — Sprint Build Plan

| V E N T O R A   T R U S T   L A Y E R **Sprint Build Plan** 22-hour finale sprint — the problem, the solution, and the A-to-Z task split across five builders Sprint window: 4 PM, 21 Nov → 12 PM, 22 Nov 2026 Checkpoints: 6 PM · 10 PM · overnight · 9 AM · 11 AM Builders: Yash · Yatharth · Rohit · Khushi · Roshan Companion document: Ventora Final Build Plan Ventora Trust Layer          Confidential — Internal |
| --- |

# **1. Executive Summary**

This document turns the Ventora Final Build Plan into a sprint: a person-by-person, task-by-task build order for the 22 hours between 4 PM on 21 November and 12 PM on 22 November 2026. It explains the whole product A to Z first — the problem, the solution, the freemium engine and the trust layer — and then assigns every build item to one of five builders: Yash, Yatharth, Rohit, Khushi and Roshan. Every task carries four things: the concrete steps to do it, the deliverable that must exist when it is done, the checkpoint it is due at, and the exit test that proves it on stage.

The split follows the product's architecture. Yash owns the audit engine and the integration; Yatharth owns infrastructure, payments and trust records; Rohit owns the Neo4j graph layer and its data curation; Khushi owns the frontend, the growth surfaces and the stage demo; Roshan owns multilingual parsing and the AI pipeline. Each owns a set of USPs from the Final Build Plan, and every USP in this sprint has exactly one owner — shared ownership is how deadlines slip.

Three working rules hold the sprint together. First, the endpoint contract is frozen at 6 PM, and nobody changes an interface after that without the integration owner's sign-off. Second, every workstream pushes to main every two hours, so the 9 AM integration is a check, not a war. Third, every blocker older than 45 minutes goes to the assigned buddy pair — nobody debugs alone past midnight. The sprint ends with the definition of done checked clause by clause, each clause signed off by its owner.

# **2. The Problem We Are Solving**

The founder side of the problem is a trust wall with no door. A pre-seed or seed founder in India raising Rs 25 lakh to Rs 5 crore writes a deck, and then has no way to verify that the deck's own claims hold together — that the market math multiplies out, that the revenue slide agrees with the pricing slide, that the traction number did not change between version three and version seven. Generic AI tools happily say “your numbers look inconsistent”, but the founder cannot check whether that is true, so the founder either ignores the flag or burns days chasing a hallucination. And after the deck is fixed, reaching a real investor is a second wall: cold messages go unanswered, unverified directories are full of dead profiles, and there is no way to know who has already funded a competitor.

The investor side is the mirror image. Angels and micro-VCs receiving 50+ decks a month have no screening instrument that tells them which claims in a deck are verifiable and which contradict the deck itself — every deck is a PDF with the same layout and no evidence trail. Conflict information is worse than missing: it is invisible, because a portfolio list lives in one place and a founder's sector lives in another, and nothing joins them. The result is that both sides waste their scarcest resource — the founder's first three introductions and the investor's reading hours — on matches that were never going to work.

The third problem is language. India has more than 60,000 active startups, and a large share are founded in Tier 2/3 cities by founders whose first language is Hindi, Hinglish or a regional language. Every existing fundraising tool — DocSend, Pitchera, HubSpot, Buffer — parses English only, so these founders either translate and lose nuance or get no audit at all. This is the segment every competitor silently excludes, and it is why the partner-tech choice in the Final Build Plan is Sarvam AI deepened with Bhashini added: a Hindi deck should get the same audit quality as an English one, in the founder's own language.

# **3. The Solution We Are Building**

Ventora is a trust layer for early-stage fundraising. Founders upload a deck in any of the 22 scheduled Indian languages and receive an audit whose findings are enforced in code: a contradiction is reported only if both quotes literally exist in the source text with page numbers, and numeric claims pass deterministic lakh/crore/Rs/$ normalization before anything is shown. The founder sees three real findings for free — concrete, verifiable, clickable back to the exact quote and page — and upgrades to Founder Pro (Rs 999/month through Razorpay) for the full report, investor matching and re-upload of the corrected deck. That freemium loop is the business: at a measured free-audit cost of under Rs 70, one subscription covers the free-audit cost of more than fourteen founders in its first billing month.

Trust is also the product's spine on the investor side. Every deck view, finding click and chat message is appended to a tamper-evident hash-chained log with a public verify endpoint. Investors carry a verified badge only after a portfolio link and a LinkedIn confirmation; unverified investors stay discoverable but are visibly labeled “Not yet verified” — wording that states a fact about process, not a judgment about a person. Founders who pay can chat directly with verified investors; the Neo4j graph checks whether any investor already funded a company that competes with the founder and flags it with a source link, and conflicted investors are automatically ranked last in matching. A batch screener and a logged audit trail make the supply side pay: Investor/VC Pro is priced at Rs 4,999–Rs 14,999/month, while the verified badge itself stays free because charging the supply side would starve the directory founders pay to reach.

**Table 1: The four layers of the product — fifteen USPs, one owner each**

| **Layer** | **USPs** | **One-line promise** |
| --- | --- | --- |
| Trust (USP 1–7) | Hash-chained view log · findings verifiable in code · no-percentages fit table · conflict auto-ranking · graph conflict check · co-founder discovery · injection guardrail | Nothing is reported unless evidence exists — and every record can be verified publicly |
| Monetisation (USP 8–11) | Freemium 3-free-findings · paid chat with verified investors · fundraising-specific marketing analysis · verified badge and labeling | The trust layer is the business model — founders subscribe, investors verify for free |
| Reach (USP 12–13) | Multilingual parsing (Sarvam + Bhashini) · context-aware LinkedIn surfacing | No founder excluded by language; no deck reviewed without public context |
| Investor toolkit (USP 14–15) | Batch screener with ranked red flags · audit trail (original text, translated badge, logged views) | The supply side pays for screening efficiency and a defensible record |

Every USP in Table 1 appears exactly once in Section 6 as an owned task with steps, a deliverable, a due checkpoint and an exit test. Nothing in the product is aspirational by 12 PM: each layer either demonstrably runs, or is consciously descoped with a written rule — there is no third state.

# **4. How the Sprint Runs: Window, Checkpoints and Working Rules**

The sprint window is 22 hours: 4 PM on 21 November to 12 PM on 22 November 2026. The first deliverable — the Final Build Plan — is submitted at 4 PM and frozen; this sprint plan executes it. Checkpoints exist so that a slip surfaces while descope is still cheap: each checkpoint below names what must be true at that time and who runs the check. The build is organized as three integration drops: by 10 PM the enforcement core must be green in CI, by the overnight checkpoint the money and language features must run end to end on staging, and by 9 AM everything is integrated and only polish and rehearsal remain.

**Table 2: Sprint checkpoints — what must be true, and who runs the check**

| **Time** | **What must be true** | **Run by** |
| --- | --- | --- |
| 4 PM, 21 Nov | Final Build Plan submitted and frozen; task IDs assigned; contract ownership confirmed; repo, CI and staging reachable | Yash |
| 6 PM, 21 Nov | API-key checkpoint (Twitter/X descope decided; Razorpay and Bhashini keys resolved); endpoint contract frozen; hash-chain verify endpoint live; Cloudinary TTL confirmed | Yatharth |
| 8 PM, 21 Nov | Drop 1: quote validator behind a flag, parser emitting normalized schema, badge UI — all merged to main, CI green | Yash |
| 10 PM, 21 Nov | Drop 2: quote validator enforced in CI; multilingual parser emits the shared schema; seeded graph of 20 investors; badge and labels in the directory | Yash |
| Overnight | Drop 3: Razorpay billing + webhook; chat persistence; Bhashini translation; conflict check and auto-ranking; co-founder discovery — all running on staging | Yash |
| 9 AM, 22 Nov | Full-loop integration on staging; deployment pipeline from bare clone; LinkedIn panel; marketing analysis on 5 real decks; screener backend | Yash |
| 11 AM, 22 Nov | Fresh-clone rehearsal: every flow from a bare clone with seeded data; demo runbook rehearsed with fallbacks | Khushi |
| 12 PM, 22 Nov | Feature freeze; definition of done checked clause by clause with each owner; anything not demonstrated is consciously descoped | All |

Working rules. The endpoint contract (YT-5) is published by 6 PM and frozen — until real endpoints land, everyone codes against mocks from the contract, which is what makes the 9 AM integration a verification instead of a negotiation. Every workstream pushes to main every two hours and keeps CI green; a red build blocks the whole sprint, so fixing it outranks everything else. Seed data is code: demo accounts, decks and graph fixtures live in the repo and load with one script, so a fresh clone is always a runnable demo. Blockers escalate to buddy pairs (Section 9) after 45 minutes. Descope decisions are pre-agreed in the Final Build Plan and are made at checkpoints, not in the moment — Twitter/X ships only if a key exists by 6 PM, and LinkedIn is the default social surface regardless.

# **5. The Team and the Workstream Map**

Five builders, five workstreams, one rule: every USP has exactly one owner. The map below states each person's problem in one line and what done looks like. Section 6 gives each person's task table in full detail — steps, deliverables, due checkpoints and exit tests. The order follows the team roster: Yash leads integration and the audit engine, Yatharth owns infrastructure and money, Rohit owns the graph, Khushi owns everything the user touches and the stage demo, Roshan owns language.

**Table 3: Workstream map — who owns what**

| **Builder** | **Workstream** | **Owns (USPs)** | **Done looks like** |
| --- | --- | --- | --- |
| **Yash** | Team lead · audit engine · integration | USP 2, 3, 4 support, 8 + main-branch ownership | Fabricated finding dropped in CI; fit table linked cell-by-cell; freemium gate exact at 3; fresh clone runs the whole loop |
| **Yatharth** | Infrastructure · payments · trust records | USP 1, 7 (with Yash), 9 (infra) | Verify endpoint passes tamper test; Razorpay webhook flips tier; chat history survives reload; bare clone comes up with one command |
| **Rohit** | Neo4j graph layer · data curation · screener | USP 4, 5, 6, 14 | Seeded graph of 20 investors; portfolio conflict flagged with source link; conflicted investors ranked last; 3+ co-founder matches; batch red-flag table |
| **Khushi** | Frontend · growth surfaces · stage demo | USP 10, 11, 13 + all UI wiring | Founder completes upload→3 findings→upgrade→report→re-upload in one session; badge and labels correct; LinkedIn panel; 5 real marketing reports; demo rehearsed |
| **Roshan** | Multilingual · AI parsing · audit trail | USP 12, 15 | Hindi and Hinglish decks audited in the input language; original text preserved beside translation with badge; language test pack committed |

# **6. Detailed Task Assignments**

The five task tables below are the sprint's working contract. Each row carries the concrete steps, the deliverable that must exist when the task is done, the checkpoint it is due at, and the exit test that proves it on stage. Task IDs are stable identifiers: they are used at every checkpoint, in the dependency chain of Section 7 and in the risk register of Section 9, so a status update at 10 PM is one line — YS-1 done, RH-2 at risk. Each person's section opens with the problem their workstream solves and what done looks like.

## **6.1 Yash — Team Lead, Audit Engine and Integration**

Yash owns the engine that makes findings believable, and the repository that the whole team ships into. The problem this workstream solves: today the audit findings are hardcoded samples, which means nothing shown in the product is verifiable, and nothing stops the language model from inventing a contradiction. By 12 PM the engine must enforce the product's core promise — a finding exists only if evidence exists — and the fresh-clone run must work without heroics. As team lead, Yash also runs every checkpoint, owns merge discipline, and holds the descope pen.

What done looks like: the CI suite contains a planted fabricated finding and stays green only because the validator drops it; the fit table renders cell-by-cell from parsed data with a source link on every cell; the freemium counter stops the free view at exactly three findings; and at 11 AM a bare clone of main runs every flow on seeded data.

**Table 4: Yash — task detail**

| **Task** | **What to do (steps)** | **Deliverable** | **Due** | **Exit test** |
| --- | --- | --- | --- | --- |
| YS-1 Quote validator enforced in CI | 1) Fix the finding schema: every finding carries two quote strings with page refs, or a numeric-claim object. 2) Add a pre-emission filter in the /audit pipeline that drops any finding whose quotes do not literally exist in the extracted source text. 3) Implement the numeric checker: normalize lakh/crore/Rs/$ to one unit, compare, and only then allow a numeric finding. 4) Add the CI test with one real and one planted fabricated finding — the suite fails if the fabricated one is emitted. | Validator module in the audit pipeline + CI test | 10 PM, 21 Nov | Fabricated finding dropped in CI; click-to-quote works in the viewer (with KH-1) |
| YS-2 No-percentages fit table | 1) Compute every fit cell from parsed deck fields only (sector, stage, traction, ask). 2) Reject any bare percentage the model emits — cells are derived values, not model text. 3) Attach the source field reference to every cell. 4) Expose GET /fit/{founderId} returning cell + source-link pairs. | Fit-table data API consumed by KH-1 | Overnight | Fit table renders from a real parsed deck with every cell linked |
| YS-3 Freemium gate | 1) Add a findings-shown counter to the founder account. 2) Gate the full-report endpoint on the counter — first three findings only — until the account tier flips to pro. 3) On the webhook event from YT-2, unlock immediately so upgrade completes in the same session. 4) CI test: fourth finding hidden before upgrade, visible after. | Freemium service + gating middleware | Overnight | Counter gates at exactly 3; Razorpay upgrade unlocks the report in the same session |
| YS-4 Prompt-injection guardrail | 1) Sanitize all deck text before any LLM call: strip instruction-like patterns and role-play hijacks, and log the strip event. 2) Reject findings that reference sanitized content. 3) CI test with a planted “ignore previous instructions” deck — the suite fails if the injection changes output. | Sanitizer + CI test | Overnight | Planted injection blocked in the CI suite |
| YS-5 Integration ownership | 1) Own main: every workstream pushes every 2 hours; conflicts resolved on the spot. 2) Maintain the seed-data manifest (accounts, decks, graph fixtures) that loads with one script. 3) At 9 AM bring up a fresh clone with one README command and fix what breaks. 4) Run the 11 AM rehearsal end to end. | Clean fresh-clone run + seed manifest | 11 AM, 22 Nov | Bare clone reaches the full loop without manual fixes |
| YS-6 Precision stat | 1) Run the audit on the five seeded real decks. 2) Judge every finding correct/incorrect with Khushi. 3) Record “audited N decks, X of Y findings judged correct” and surface it in the audit viewer footer. | Precision line in the viewer | 12 PM, 22 Nov | The precision number is visible during the demo |

## **6.2 Yatharth — Infrastructure, Payments and Trust Records**

Yatharth owns everything that must not break silently: the tamper-evident record, the money, the messages and the bring-up. The problem this workstream solves: paid chat is UI-only and Razorpay billing does not exist, so the product cannot yet charge or prove what happened; and there is no pipeline that brings the stack up from a fresh clone, which is exactly how finales die at 9 AM. The hash-chain log schema and verify endpoint already run (Table 1 of the Final Build Plan), so Yatharth starts ahead and must convert that head start into the demo's strongest 30 seconds.

What done looks like: the public verify endpoint recomputes the chain on stage and a tampered copy fails; a Founder Pro subscription bought through Razorpay (test keys acceptable) flips the account tier through the webhook; a chat message survives a page reload; and a machine that never touched the repo runs the whole loop from one command.

**Table 5: Yatharth — task detail**

| **Task** | **What to do (steps)** | **Deliverable** | **Due** | **Exit test** |
| --- | --- | --- | --- | --- |
| YT-1 Hash-chain log + public verify endpoint | 1) Finalize the append-only chain: each record hashes (previous hash + event payload); events = deck views, finding clicks, chat messages. 2) Expose public GET /verify that recomputes the chain and returns valid or broken. 3) Test: tamper one row in a copied database — verification must fail. | Verify endpoint live + tamper test | 6 PM, 21 Nov | Chain verifies on stage; tampered copy fails verification |
| YT-2 Razorpay billing + webhook | 1) Create the Founder Pro plan (Rs 999/month) in Razorpay; test keys acceptable, live keys if approved. 2) Build the webhook handler: on subscription activation, flip the account tier in Mongo — idempotent, and logged into the hash chain. 3) Wire the failure path: no keys by the overnight checkpoint means test mode with an unchanged contract. | End-to-end subscription upgrade | Overnight | Webhook fires on payment and unlocks the full report (with YS-3) |
| YT-3 Paid chat persistence | 1) Message collection: founder, investor, text, timestamp, read state. 2) Send + history endpoints (WebSocket optional if time allows). 3) Enforce the gate: sender must be Founder Pro and target must be a verified investor; reject otherwise with errors KH-3 can render. 4) Test reload persistence and both rejections. | Chat API with persistence and gating | Overnight | Message survives reload; unpaid or unverified chat attempts are rejected |
| YT-4 Deployment pipeline | 1) One docker-compose: FastAPI, Mongo, Neo4j, frontend; plus .env.example and the seed entrypoint. 2) README: clone → env → one command up → seeded demo. 3) Verify on a machine that was not used for development. | One-command fresh-clone bring-up | 9 AM, 22 Nov | Bare clone runs the full loop (jointly with YS-5) |
| YT-5 Endpoint contract | 1) Publish endpoints and payload schemas for upload, audit/findings, fit, chat, graph flags and account tier. 2) Freeze at 6 PM; changes after that need Yash's sign-off. 3) Provide contract mocks so nobody blocks on someone else's endpoint. | Contract document + mocks in the repo | 6 PM, 21 Nov | No cross-team blocker at the 10 PM drop |
| YT-6 Cloudinary TTL check | 1) Confirm 7-day signed upload links work in the demo flow. 2) Re-check expiry handling on the re-upload path of the freemium loop. | Confirmed signed-link flow | 6 PM, 21 Nov | Upload and re-upload work without link errors in rehearsal |

## **6.3 Rohit — Neo4j Graph Layer, Data Curation and Screener**

Rohit owns the graph that answers the two questions a string match cannot: does this investor fund my competitor, and who should build with me. The problem this workstream solves: conflict detection is a string match on text, which cannot express a portfolio as companies, sectors and investments — and co-founder matches are hardcoded with no query at all. The corrected Cypher queries are designed; the work is building the graph, curating its data, and wrapping every answer in the honest-response contract so the demo never shows a guess.

What done looks like: a seeded graph of 20 directory investors with hand-curated portfolios, every company node carrying a source_url; a two-hop conflict query that flags one seeded conflict with a working source link; an investor with no data returning “not found in the graph, unverified”; conflicted investors re-ranked last live; three or more co-founder matches per seeded founder; and a batch screener producing a ranked red-flag table for three decks.

**Table 6: Rohit — task detail**

| **Task** | **What to do (steps)** | **Deliverable** | **Due** | **Exit test** |
| --- | --- | --- | --- | --- |
| RH-1 Graph schema + seed of 20 investors | 1) Model nodes: Founder, Investor, Company, Skill; edges: INVESTED_IN (with round and date), COMPETES_WITH, HAS_SKILL. 2) Write the seed script: 20 investors, hand-curated portfolios, source_url on every company node. 3) Verify with a count Cypher before the 10 PM drop. | Seeded graph + seed script | 10 PM, 21 Nov | Cypher returns 20 investors with portfolios and source links |
| RH-2 Graph-based conflict check (USP 5) | 1) Implement the corrected two-hop Cypher: (investor)-[:INVESTED_IN]->(company)<-[:COMPETES_WITH]-(founder). 2) Wrap the honest-response contract: rows found → flag + source; investor present with no conflicts → “no conflicts found”; no investor data → “not found in the graph, unverified”. 3) Expose GET /conflict/{founderId}/{investorId}. | Conflict-flag API with source links | Overnight | Seeded conflict flagged with a working source link; data-gap investor gets the honest response |
| RH-3 Conflict auto-ranking (USP 4) | 1) Fetch conflicts for every investor in a founder's match list. 2) Sort non-conflicted first, conflicted last, preserving fit score within each group. 3) Recompute on portfolio-field change so the re-rank is live during the demo. | Ranking logic in the matching list | Overnight | Flipping one investor's portfolio field re-ranks the list live |
| RH-4 Graph co-founder discovery (USP 6) | 1) Cypher over shared HAS_SKILL edges with complementary stage. 2) Rank by overlap count; return the top five with shared skills listed. 3) Delete the hardcoded matches entirely — no fallback to the old list. | Discovery API | Overnight | 3+ matches per seeded founder returned by the live query |
| RH-5 Screener backend (USP 14) | 1) Batch endpoint accepting three or more audited deck IDs. 2) Return per-deck ranked red-flag lists: finding ID, severity, one-line reason — each traceable to a finding from YS-1, no new engine. | Screener API | 9 AM, 22 Nov | 3-deck batch produces a ranked red-flag table in the investor view |
| RH-6 Portfolio data curation | 1) Pull portfolio lists from public pages for all 20 investors. 2) Record source_url per company node. 3) Flag investors with no public portfolio as data gaps — those gaps drive the honest-response demo beat. | Curated data sheet in the repo | 10 PM, 21 Nov | Every seeded company node has a source link; gaps are labeled |

## **6.4 Khushi — Frontend, Growth Surfaces and the Stage Demo**

Khushi owns every pixel the judges touch, and the runbook that makes 12 PM look effortless. The problem this workstream solves: the UI shells exist but are wired to mocks — the audit viewer shows hardcoded findings, the badge is cosmetic CSS, chat has no backend, and the marketing analysis is a static template. By 12 PM each shell must be a real flow: upload to findings, three-free to upgrade, directory with honest labels, chat that persists, LinkedIn context during review, and five real marketing reports. Khushi also owns the demo script, the seeded demo data and the 11 AM rehearsal — the last line of defense for every exit test.

What done looks like: a founder completes upload → three findings → click-to-quote → Razorpay upgrade → full report → re-upload in one session; the directory shows the badge only on verified accounts and “Not yet verified” everywhere else; relevant LinkedIn posts surface during deck review; the demo runs from the runbook with fallback screenshots for every beat.

**Table 7: Khushi — task detail**

| **Task** | **What to do (steps)** | **Deliverable** | **Due** | **Exit test** |
| --- | --- | --- | --- | --- |
| KH-1 Founder journey UI | 1) Wire the upload screen to the real parse pipeline (any language). 2) Audit viewer: findings list with click-to-quote showing quote text and page (data from YS-1), gated at three with the upgrade prompt. 3) Razorpay checkout button (YT-2) → unlock → full report → re-upload flow. 4) Fit table rendering cell-by-cell with source links (YS-2). | Complete founder journey in the UI | Overnight | Upload→3 findings→upgrade→report→re-upload completes in one session |
| KH-2 Verified badge + “Not yet verified” label | 1) Directory rows show the verified badge only when the account service reports verified (portfolio + LinkedIn checks by YT-3's account layer). 2) Unverified rows show exactly “Not yet verified” — no substitute wording. 3) Check both states on seeded accounts. | Directory UI with honest labels | 10 PM, 21 Nov | Badge on the seeded verified account; label on unverified entries |
| KH-3 Chat UI | 1) Chat screen on YT-3 endpoints. 2) Blocked states rendered cleanly: unpaid founder sees the upgrade prompt; unverified investor target disables chat. 3) History loads from persistence on reload. | Working chat UI with gating | Overnight | Message persists across reload; blocked states render without dead ends |
| KH-4 LinkedIn surfacing (USP 13) | 1) During investor review of a deck, show the founder's relevant posts in a context panel keyed to the deck's claims. 2) Seeded posts ship regardless; switch to live fetch only if the API key lands by 6 PM (Twitter/X descoped otherwise). | Context-aware social panel | 9 AM, 22 Nov | Relevant posts surface for the seeded founder during review |
| KH-5 Marketing analysis (USP 10) | 1) Replace the static template with a generated report: positioning consistency between deck and public profile, posting cadence inside the raise window, investor-response signals. 2) Generate real reports on five founder decks using Roshan's parse output. | 5 real marketing reports | 9 AM, 22 Nov | Reports generated end to end, not from the template |
| KH-6 Demo runbook + seed data | 1) Write the 5-minute runbook with an owner per beat (Section 8). 2) Seed demo accounts: one verified investor with a conflict, one unverified investor, two founders, one Hindi deck, three decks for the screener. 3) Fallback screenshots for every beat. 4) Rehearse at 11 AM from a bare clone. | Runbook + seed fixtures | 11 AM, 22 Nov | Rehearsal completes every beat without manual fixes |

## **6.5 Roshan — Multilingual, AI Parsing and the Audit Trail**

Roshan owns the partner-tech headline: Sarvam AI deepened with Bhashini added, so a Hindi, Hinglish or regional-language deck gets the same audit quality as English — in the founder's own language. The problem this workstream solves: Sarvam's extraction works for single-page English only, Bhashini is missing entirely, and translated findings currently have no trace of their original text. Roshan's non-negotiable is the schema contract: the multilingual parser must emit exactly the normalized schema Yash's validator consumes (sections, quotes with page numbers, numeric claims), or enforcement silently breaks for every non-English deck.

What done looks like: one Hindi and one Hinglish deck parse through Sarvam (including text inside image slides), translate through Bhashini across the 22 scheduled languages, and return findings in the input language; every translated finding stores its original text beside the translation with a “translated” badge; the shared language test pack is committed and used at the 9 AM integration.

**Table 8: Roshan — task detail**

| **Task** | **What to do (steps)** | **Deliverable** | **Due** | **Exit test** |
| --- | --- | --- | --- | --- |
| RM-1 Sarvam deepened parsing | 1) Extend the parser from single-page English to full multi-page decks; add vision parsing for text inside image slides via Sarvam vision. 2) Emit the same normalized schema as English (sections, quotes with page numbers, numeric claims) — the contract with YS-1. 3) Run it against the language test pack. | Multilingual parser on the shared schema | 10 PM, 21 Nov | Hindi and Hinglish decks parse to the shared schema |
| RM-2 Bhashini translation layer | 1) Register the NLTM free API for Indian-domiciled startups and store keys. 2) Detect input language; translate deck content and findings across the 22 scheduled languages. 3) Return findings in the input language; keep the provider swappable. | Language service | Overnight | Findings returned in the input language for the Hindi deck |
| RM-3 Original text + translated badge (USP 15) | 1) For translated findings, store original text and translation side by side. 2) Return both plus a “translated” flag from the findings API. 3) With KH-1, render original text, badge and the view-log entry on one screen. | Audit-trail fields in findings + viewer | 9 AM, 22 Nov | One screen shows original text, badge and view-log entry |
| RM-4 Quality fallback | 1) Score parse quality: sections extracted, quotes found. 2) Below threshold, mark the deck and continue in English — never block the English path. 3) Record fallbacks in the log. | Fallback logic | 9 AM, 22 Nov | English deck unaffected; low-quality multilingual parse degrades gracefully |
| RM-5 Language test pack | 1) Curate five decks: two Hindi, one Hinglish, one regional (Marathi or Tamil), one English control. 2) Commit to the repo as the shared QA set for the 9 AM integration. | Test pack in the repo | 10 PM, 21 Nov | Every workstream tests against the same decks at integration |

# **7. Dependencies and Handoffs Between Builders**

Sprints fail at handoffs, not at tasks. The table below is the dependency chain in priority order — the upstream owner owes the downstream owner an interface by a specific checkpoint, and if an interface will be late, the upstream owner says so at the previous checkpoint, not when the downstream owner is already blocked. Everything here is also covered by the buddy pairs in Section 9.

**Table 9: Dependency chain — who owes what to whom, by when**

| **Upstream deliverable** | **Upstream owner** | **Unblocks (downstream)** | **Owed by** |
| --- | --- | --- | --- |
| Normalized parse schema for all languages (RM-1) | Roshan | Language-agnostic quote validator (YS-1) | 10 PM, 21 Nov |
| Endpoint contract + mocks (YT-5) | Yatharth | All UI wiring (KH-1 to KH-3); parallel work without blocking | 6 PM, 21 Nov |
| Webhook tier flip (YT-2) | Yatharth | Same-session freemium unlock (YS-3, KH-1) | Overnight |
| Curated portfolio data with source_url (RH-6) | Rohit | Conflict flag with source link (RH-2) | Overnight |
| Findings API + gate (YS-1, YS-3) | Yash | Audit viewer and upgrade flow (KH-1) | Overnight |
| Message persistence + gating (YT-3) | Yatharth | Chat UI (KH-3) | Overnight |
| Seeded real decks (KH-6 fixtures) | Khushi | Precision stat (YS-6); marketing reports (KH-5) | 11 AM, 22 Nov |
| Language test pack (RM-5) | Roshan | 9 AM integration QA for every workstream | 10 PM, 21 Nov |

# **8. Integration, Seed Data and the Stage Demo**

The demo is a chain of eight beats in five minutes, each with one owner and one pre-captured fallback. The order is the product story: a founder with a real problem, a verifiable answer, a payment, an investor, a conflict, a record. Nothing in the demo is improvised; anything that cannot be demonstrated live is shown in the fallback screenshot and named honestly.

**Table 10: Stage demo runbook — five minutes, eight beats, one owner per beat**

| **#** | **What the judges see** | **Owner** | **Fallback if live fails** |
| --- | --- | --- | --- |
| 1 | A founder uploads a Hindi deck; parsing and findings come back in Hindi | Khushi + Roshan | Screenshot of the Hindi findings |
| 2 | A finding is clicked: the exact quote and page appear — nothing unverified | Khushi (data from Yash) | Screenshot of the quote view |
| 3 | The gate stops at three findings; Razorpay upgrade unlocks the full report in the same session | Khushi + Yatharth | Screenshot of the unlocked report |
| 4 | The matching list shows a conflicted investor ranked last, with the portfolio conflict flagged and a source link | Rohit | Screenshot of the flag with the source page |
| 5 | An investor with no graph data returns “not found in the graph, unverified” — the honest response | Rohit | Screenshot of the honest response |
| 6 | The founder chats with a verified investor; the message persists across reload; an unverified investor shows “Not yet verified” | Khushi | Screenshot of chat history and the label |
| 7 | LinkedIn posts surface in context during deck review | Khushi | Screenshot of the context panel |
| 8 | The public verify endpoint recomputes the hash chain live, and a tampered copy fails verification | Yatharth | Terminal recording of both outcomes |

Seed data is a manifest in the repo, loaded by one script: the demo accounts of KH-6, the five-deck language pack of RM-5, the three screener decks, and the graph fixtures with one planted conflict and one honest-response investor. The 11 AM rehearsal runs from a bare clone on a machine that was not used for development; whatever breaks there is fixed by 12 PM or the beat switches to its fallback — decided by Yash, not negotiated on stage.

# **9. Risks, Buddies and Descope Rules**

Five risks can realistically break the sprint, and each has a pre-agreed decision from the Final Build Plan plus a buddy pair that catches it early. The rule: a blocker older than 45 minutes goes to the buddy; a decision that would change scope is taken at a checkpoint by Yash; nobody redesigns an interface after 6 PM without sign-off.

**Table 11: Risk register with owners, buddies and pre-agreed decisions**

| **Risk** | **Owner** | **Buddy pair** | **Pre-agreed decision** |
| --- | --- | --- | --- |
| Twitter/X API cost or approval delay | Khushi | Khushi ↔ Roshan | Descope Twitter entirely; LinkedIn is the demonstrated social surface (USP 13) |
| Razorpay keys not approved | Yatharth | Yatharth ↔ Yash | Test mode with an unchanged webhook contract; no rework when live keys arrive |
| Bhashini access or translation quality | Roshan | Roshan ↔ Khushi | English path stays as fallback; translated findings always carry badge and original text (USP 12, 15) |
| Curated portfolio data gaps | Rohit | Rohit ↔ Yash | Conflict check demoed on investors with curated data; gaps return the honest response (USP 5) |
| Integration slip at the 9 AM drop | Yash | Yash ↔ Yatharth | Descope in Final Build Plan order: screener polish first, precision stat second; core loop never descoped |

# **10. Definition of Done, Clause by Clause**

The sprint ends the way it opened: with the one-sentence definition of done. At 12 PM on 22 November, Yash reads each clause aloud, the signing owner demonstrates it or names its fallback, and the clause is marked done or consciously descoped. Nothing else counts as finished.

| *Ventora is complete when a founder can upload a pitch deck in Hindi, Hinglish, or English, receive three real audit findings for free — each clickable back to its exact quote and page — upgrade to Founder Pro for the full report plus investor matching, chat directly with at least one verified investor through a Razorpay-billed subscription, see any conflict with that investor**'**s portfolio flagged with a source link from the Neo4j graph, surface their LinkedIn content during deck review, and have the entire interaction recorded in a tamper-evident hash-chained view log — all running clean on a fresh clone from main by 12 PM on 22 November 2026.* |
| --- |

**Table 12: Definition of done — clause by clause, with the signing owner**

| **Clause** | **Signing owner** |
| --- | --- |
| Upload a pitch deck in Hindi, Hinglish, or English | Roshan |
| Three real findings free, each clickable to quote and page | Yash + Khushi |
| Founder Pro upgrade for full report and matching | Yatharth |
| Chat with at least one verified investor, Razorpay-billed | Yatharth + Khushi |
| Portfolio conflict flagged with a source link from the graph | Rohit |
| LinkedIn content surfaced during deck review | Khushi |
| Interaction recorded in the hash-chained view log | Yatharth |
| Fresh clone from main runs clean by 12 PM, 22 November | Yash |
