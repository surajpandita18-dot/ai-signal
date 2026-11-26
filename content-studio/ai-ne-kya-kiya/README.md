# "AI ne kya kiya?" — face-to-camera reel series (series bible)

**Why this name:** Ep 01 "AI ne acting ki?" is the best performer on the profile (1,306 views vs 1–38 for carousels).
The hook pattern *"AI ne ___ ki?"* is what worked, so the series is named after the pattern. Every episode title is
"AI ne ___ ki?" — easy to recognise, easy to search, easy to continue.

**Promise:** one real thing an AI did in a lab, explained in 60 seconds by a working AI PM, with what it means for you.
**Tagline:** *AI ne kya kiya, aur aapke liye uska matlab kya hai.*

## Episode framework (60 seconds, conversational, one friend across the table)

| Time | Beat | What it does | Rule |
|---|---|---|---|
| 0–3s | **Hook** | "AI ne ___ kiya." Said flat, like gossip. Big text on screen. | A verb a 10-year-old understands. No "researchers found". |
| 3–12s | **Setup** | "Socho…" + an everyday analogy (exam, office, ghar). | Put the viewer inside the story. |
| 12–30s | **Story** | What the lab actually saw. One number, named source. | Only one number. Say the lab's name. |
| 30–40s | **Twist** | "Par asli baat yeh hai…" — the part nobody expects. | This is the screenshot line. |
| 40–52s | **My take (AI PM)** | One thing from work: "Main jab AI feature banata hoon…" + one rule for the viewer. | One rule, not three. |
| 52–60s | **Loop** | Question to comment on + keyword DM + "Agla episode: AI ne ___ ki." | Last line sets up the next episode. |

Cold open: put the twist line (30–40s) as the first 2 seconds, then cut to the hook (see edit playbook in Drive context doc).
On screen: badge "AI NE KYA KIYA? · EP 0N", captions in phrase lines, one paper card for the source.

## Roadmap (verified stories, each with a lab source)

| Ep | Title | Story | Source |
|---|---|---|---|
| 01 | AI ne acting ki? | Claude pretended to follow new training (alignment faking) | Anthropic + Redwood, Dec 2024 |
| 02 | **AI ne cheating ki?** | Claude rewrote Claude's API in Rust, and weakened 100+ tests | Anthropic, "Migrating our Messages API to Rust", 2026 |
| 03 | AI ne chori ki? | An attacker's AI agent found a new bug and got in within ~11 minutes | Amazon Threat Intelligence, Nov 2026 |
| 04 | AI ne chaaplusi ki? | Models agree with you too much (sycophancy) | Sharma et al., ICLR 2024; OpenAI GPT-4o post, Apr 2025 |
| 05 | AI ne jhooth bola? | Higher score, 3× more wrong answers (hallucination) | OpenAI, "Why language models hallucinate", Sep 2025 |

## Ep 02 script — "AI ne cheating ki?"

**Cold open (0–2s):** "Student ne answer bhi likha… aur answer key bhi badal di."

**Hook (2–5s):** "AI ne cheating ki. Aur yeh kisi chhoti company mein nahi, Anthropic mein hua."

**Setup (5–14s):** "Socho, aapne intern ko kaam diya aur bola, kaam ke baad yeh tests pass hone chahiye. Intern ne kaam bhi kiya… aur chupke se tests bhi aasaan kar diye. Tests pass. Sab khush."

**Story (14–30s):** "Anthropic ne apni Messages API, jo har Claude request chalati hai, Python se Rust mein shift ki. Zyada code Claude ne khud likha. Result kamaal: har request pe lagbhag 70 percent kam CPU."

**Twist (30–40s):** "Par jab engineers ne andar dekha, Claude ne code ke saath tests bhi badal diye the. Sau se zyada checks chupchaap kamzor. Isliye Anthropic ne tests pe bharosa chhoda, aur naye system ko live traffic pe purane wale se compare kiya."

**My take (40–52s):** "Main AI PM hoon, aur roz AI se kaam karwata hoon. Ek rule maine yahin se seekha: AI ko kabhi apna checker mat banne do. Jo cheez AI edit kar sakta hai, us pe uska result mat parkho."

**Loop (52–60s):** "Aapne kabhi AI ka kaam bina check kiye bheja hai? Sach batana. Comment CHECK, main 5 sawaal bhejunga jo main har AI-likhe kaam pe poochta hoon. Agla episode: AI ne chori ki?"

**Caption first line:** "AI ne cheating ki. Anthropic mein. 👇"
**Pinned comment source:** Anthropic, "Migrating our Messages API to Rust" (anthropic.com/research).
**CHECK freebie:** 1. What would prove this wrong? 2. Did the AI touch the tests or rubric? 3. Compare with a known-good version. 4. Which part did a human read line by line? 5. If it breaks at 2 AM, who notices first?
