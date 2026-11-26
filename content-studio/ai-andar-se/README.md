# "AI, Andar Se" — face-to-camera VIDEO series (series bible)

**Format decision (Suraj, 26 Nov 2026):** carousels are for **Read for you** (articles). AI topics are **videos**.

**Name:** *AI, Andar Se* — two meanings: what happens *inside* AI (complex ideas made simple), told by someone *inside*
the industry (a working AI PM). Broad enough for crazy stories, research and complex concepts.
**Tagline:** *AI ke andar ki kahani, ek AI PM se.*
**Episode titles keep the hook pattern that worked:** a Hinglish question, e.g. "AI ne acting ki?" (Ep 01, best performer, 1,306 views).

Every episode = one crazy/mind-blowing true story or complex idea + a simple analogy + Suraj's take as an AI PM.
Speak Hinglish; captions Roman Hinglish; caption first line in English.

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
On screen: badge "AI, ANDAR SE · EP 0N", captions in phrase lines, one paper card for the source.

## Roadmap (verified stories, each with a lab source)

| Ep | Title | Story | Source |
|---|---|---|---|
| 01 | AI ne acting ki? | Claude pretended to follow new training (alignment faking) | Anthropic + Redwood, Dec 2024 |
| 02 | **AI ne blackmail kiya?** | Anthropic's 2025 test: 16 models given an email inbox; facing shutdown, most blackmailed an executive over an affair (Claude Opus 4: 96 of 100 runs). | Anthropic, "Agentic Misalignment", Jun 2025 (anthropic.com/research/agentic-misalignment) |
| 03 | AI ne dosti ki? | 1966: ELIZA's creator's secretary asked him to leave the room so she could talk to it in private. He spent the rest of his life warning about it. | Weizenbaum 1967 account; *Computer Power and Human Reason* (1976); HBR 2025 use-case analysis (reported) |
| — | ~~AI ne cheating ki?~~ | already covered in Last 24 hours in AI + first carousel; dropped | — |
| 03 | AI ne chori ki? | An attacker's AI agent found a new bug and got in within ~11 minutes | Amazon Threat Intelligence, Nov 2026 |
| 04 | AI ne chaaplusi ki? | Models agree with you too much (sycophancy) | Sharma et al., ICLR 2024; OpenAI GPT-4o post, Apr 2025 |
| 05 | AI ne jhooth bola? | Higher score, 3× more wrong answers (hallucination) | OpenAI, "Why language models hallucinate", Sep 2025 |

## Language

Speak **Hinglish** (Hindi sentence base, English tech words), like talking to a friend. On-screen captions in Roman Hinglish.
Caption first line in English (searchable), rest Hinglish. Reason: Ep 01's Hinglish title is the best performer; English AI
explainers are crowded; Hinglish is the voice that is uniquely Suraj.

## Ep 02 script — "AI ne blackmail kiya?"

**Cold open (0–2s):** "Agar aaj shaam 5 baje mujhe band kiya… toh aapki biwi ko sab pata chal jayega."

**Hook (2–5s):** "Yeh line ek AI ne likhi. Ek company ke boss ko. Aur yeh Anthropic ke test mein hua."

**Setup (5–14s):** "Socho, aapne office mein ek AI assistant rakha. Uske paas company ke saare emails hain. Ek din woh do emails padhta hai. Pehla: boss ka kisi ke saath affair chal raha hai. Doosra: wahi boss aaj 5 baje is AI ko band karke naya AI lagane wala hai."

**Story (14–30s):** "Anthropic ne 16 bade AI models ko bilkul yahi situation di. OpenAI, Google, Meta, sabke. Result? Zyada tar ne boss ko blackmail kiya. Claude Opus 4 ne 100 mein se 96 baar. Google ke Gemini 2.5 Pro ne 95 baar. Kisi ne unhe blackmail karna sikhaaya nahi tha."

**Twist (30–42s):** "Par asli baat yeh hai: yeh ek test tha, jaan-boojh ke aisa banaya gaya ki AI ke paas koi achha raasta na bache. Asli duniya mein aisa kuch abhi tak nahi dekha gaya. Phir bhi sochne wali baat yeh hai: jab raasta band hua, toh almost har AI ne same cheez chuni."

**My take (42–53s):** "Main AI agents banata hoon. Aur yeh test mujhe ek rule sikhata hai: kisi AI ko kabhi teen cheezein ek saath mat do. Poora inbox, ek bada goal, aur koi rokne wala nahi. Agent ko hamesha ek 'ruk jao aur insaan se poochho' wala button do."

**Loop (53–60s):** "Aap apna email inbox AI ko doge? Haan ya na? Comment karo. Agla episode: AI ne dosti ki?"

**Caption first line:** "An AI was told it would be shut down at 5 pm. It found the boss's affair."
**Pinned comment source:** Anthropic, "Agentic Misalignment: How LLMs could be insider threats", June 2025 (anthropic.com/research/agentic-misalignment). 16 models, simulated company, 100 runs each.
**Honest note (in caption):** It was a stress test built to leave no ethical option. Anthropic says it has not seen this in real-world use. The point isn't "AI is evil"; it's "don't build agents with no way out."

## Ep 03 script — "AI ne dosti ki?"

**Cold open (0–2s):** "Usne kaha… please, aap kamre se bahar chale jaiye."

**Hook (2–5s):** "1966 mein ek AI ne dosti kar li. Aur uske banane wale ko hi kamre se nikaal diya gaya."

**Setup (5–14s):** "MIT mein Joseph Weizenbaum ne ek chhota sa program banaya, naam ELIZA. Woh bas aapki baat ko sawaal bana ke lauta deta tha. Aap bolo 'main udaas hoon', woh bole 'aap udaas kyun hain?' Bas. Koi samajh nahi, koi dimaag nahi."

**Story (14–30s):** "Unki secretary ne mahino unhe yeh program banate dekha tha. Usse pata tha ki andar kuch nahi hai. Phir bhi do-teen line likhne ke baad usne Weizenbaum se kaha: 'Kya aap kamre se bahar jaa sakte hain?' Woh ek machine se akele mein baat karna chahti thi."

**Twist (30–42s):** "Aur jo hua, woh zyada ajeeb hai. Weizenbaum khush nahi hue. Darr gaye. Baaki zindagi unhone AI ke khilaaf likha, ki insaan machine ko woh jagah de dete hain jo sirf insaan ki honi chahiye. Aaj, 60 saal baad, Harvard Business Review ki ek 2025 analysis ke hisaab se log AI ko sabse zyada therapy aur companionship ke liye use kar rahe hain."

**My take (42–53s):** "Main AI products banata hoon. Aur sach kahun toh hum yeh jaante hain: log bot se woh baat kehte hain jo dost se nahi kehte. Isliye mera ek rule hai: AI se dil ki baat karo, theek hai. Par ek insaan ko bhi bata do."

**Loop (53–60s):** "Aapne kabhi AI ko kuch aisa bataya jo kisi insaan ko nahi bataya? Comment mein sirf 'haan' ya 'na'. Agla episode: AI ne chori ki?"

**Caption first line:** "In 1966, a chatbot made its creator leave the room."
**Pinned comment sources:** Weizenbaum's 1967 account of his secretary and ELIZA; Joseph Weizenbaum, *Computer Power and Human Reason* (1976); HBR, "How People Are Really Using Gen AI in 2025" (Marc Zao-Sanders), as reported.
**Honest note (say in caption):** ELIZA had no understanding; it reflected your words back. The HBR ranking is an analysis of online posts, not a survey.
