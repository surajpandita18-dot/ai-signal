# AI Signal

AI Signal is a modern AI news aggregation and summarization interface designed to surface high-quality signals from the noise in the fast-moving AI ecosystem.

---

## 🚀 Live Demo
(Add your Vercel link here after deployment)

---

## ✨ Features

- Dynamic featured story (changes with category)
- Real-time search across articles
- Category-based filtering (Models, Funding, Research, etc.)
- Bookmark / Save articles (persistent via local storage)
- Clean multi-page navigation (Home, Saved, Article detail)
- Premium UI with dark theme, glow effects, and micro-interactions
- Structured article view with “Why it matters” layer

---

## 🧠 Product Thinking

AI Signal is built as a signal layer for AI operators, builders, and product teams.

Instead of flooding users with raw news, it focuses on:
- Clarity over volume
- Relevance over noise
- Actionable insight over headlines

Each article is structured to answer:
- What happened?
- Why it matters?
- How it impacts real-world AI products

---

## 🛠 Tech Stack

- Next.js (App Router)
- React + TypeScript
- Tailwind CSS
- Local Storage (state persistence)

---

## 📂 Project Structure

app/
  page.tsx              # Homepage (feed + filters + hero)
  saved/page.tsx        # Saved articles view
  article/[id]/page.tsx # Article detail page

lib/
  mockData.ts           # Data layer (API-ready structure)

---

## ⚡ Key Highlights

- Built from scratch without component libraries
- Focus on UX hierarchy and readability
- Fully responsive layout
- Scalable architecture (easy API integration later)
- Product-first design (not just UI cloning)

---

## 🔮 Future Improvements

- Live AI news ingestion (API / scraping)
- AI-generated summaries (LLM pipeline)
- Personalization layer (user interests)
- Daily email digest
- Trending signal detection
- Bookmark sync (backend)

---

## 👨‍💻 Author

Suraj Pandita

---

## 📌 Note

This project is part of a broader vision to build tools that help users navigate and act on rapid AI advancements effectively.
