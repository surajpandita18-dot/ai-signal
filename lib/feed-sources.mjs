export const FEED_SOURCES = [
  // 🔹 OFFICIAL
  {
    id: "openai",
    name: "OpenAI",
    url: "https://openai.com/news/rss.xml",
    category: "official",
    priority: 1,
    trustScore: 0.98,
    active: true,
  },

  // 🔹 RESEARCH
  {
    id: "huggingface",
    name: "Hugging Face",
    url: "https://huggingface.co/blog/feed.xml",
    category: "research",
    priority: 1,
    trustScore: 0.95,
    active: true,
  },
  {
    id: "google-research",
    name: "Google Research",
    url: "https://research.google/blog/rss/",
    category: "research",
    priority: 1,
    trustScore: 0.94,
    active: true,
  },

  // 🔹 MEDIA
  {
    id: "venturebeat-ai",
    name: "VentureBeat AI",
    url: "https://venturebeat.com/category/ai/feed/",
    category: "media",
    priority: 2,
    trustScore: 0.84,
    active: true,
  },
  {
    id: "techcrunch-ai",
    name: "TechCrunch AI",
    url: "https://techcrunch.com/category/artificial-intelligence/feed/",
    category: "media",
    priority: 2,
    trustScore: 0.86,
    active: true,
  },
  {
    id: "mit-tech-review",
    name: "MIT Tech Review AI",
    url: "https://www.technologyreview.com/topic/artificial-intelligence/feed/",
    category: "media",
    priority: 2,
    trustScore: 0.9,
    active: true,
  },

  // 🔹 SUBSTACK (high signal)
  {
    id: "latent-space",
    name: "Latent Space",
    url: "https://www.latent.space/feed",
    category: "substack",
    priority: 2,
    trustScore: 0.9,
    active: true,
  },
  {
    id: "ben-evans",
    name: "Ben Evans",
    url: "https://www.ben-evans.com/benedictevans?format=rss",
    category: "substack",
    priority: 2,
    trustScore: 0.92,
    active: true,
  },

  // 🔹 COMMUNITY
  {
    id: "hackernews-ai",
    name: "Hacker News (AI)",
    url: "https://hnrss.org/newest?q=AI",
    category: "community",
    priority: 3,
    trustScore: 0.75,
    active: true,
  },

  // 🔹 HIGH VOLUME (IMPORTANT for 100+ articles)
  {
    id: "arxiv-ai",
    name: "arXiv AI",
    url: "http://export.arxiv.org/rss/cs.AI",
    category: "research",
    priority: 2,
    trustScore: 0.88,
    active: true,
  },
  {
    id: "arxiv-ml",
    name: "arXiv ML",
    url: "http://export.arxiv.org/rss/cs.LG",
    category: "research",
    priority: 2,
    trustScore: 0.88,
    active: true,
  },
  {
    id: "arxiv-nlp",
    name: "arXiv NLP",
    url: "http://export.arxiv.org/rss/cs.CL",
    category: "research",
    priority: 2,
    trustScore: 0.88,
    active: true,
  },
];