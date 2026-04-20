export interface Source {
  id: string;
  name: string;
  url: string;
  category: "official" | "research" | "media" | "substack" | "community";
  priority: number;
  trustScore: number;
  active: boolean;
}

export const SOURCES: Source[] = [
  // 🔹 OFFICIAL (highest signal)
  {
    id: "openai",
    name: "OpenAI",
    url: "https://openai.com/news/rss.xml",
    category: "official",
    priority: 1,
    trustScore: 0.98,
    active: true,
  },
  {
    id: "anthropic",
    name: "Anthropic",
    url: "https://www.anthropic.com/news/rss.xml",
    category: "official",
    priority: 1,
    trustScore: 0.98,
    active: true,
  },
  {
    id: "google-deepmind",
    name: "Google DeepMind",
    url: "https://deepmind.google/blog/rss.xml",
    category: "official",
    priority: 1,
    trustScore: 0.97,
    active: true,
  },
  {
    id: "meta-ai",
    name: "Meta AI",
    url: "https://ai.meta.com/blog/rss/",
    category: "official",
    priority: 1,
    trustScore: 0.96,
    active: true,
  },
  {
    id: "nvidia",
    name: "NVIDIA AI",
    url: "https://blogs.nvidia.com/blog/category/ai/feed/",
    category: "official",
    priority: 1,
    trustScore: 0.95,
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

  // 🔹 MEDIA (filtered signal)
  {
    id: "venturebeat-ai",
    name: "VentureBeat AI",
    url: "https://venturebeat.com/ai/feed/",
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
  {
    id: "the-verge-ai",
    name: "The Verge AI",
    url: "https://www.theverge.com/ai-artificial-intelligence/rss/index.xml",
    category: "media",
    priority: 2,
    trustScore: 0.85,
    active: true,
  },

  // 🔹 BUILDER / INFRA SIGNALS
  {
    id: "replicate",
    name: "Replicate",
    url: "https://replicate.com/blog/rss.xml",
    category: "research",
    priority: 2,
    trustScore: 0.88,
    active: true,
  },
  {
    id: "langchain",
    name: "LangChain",
    url: "https://blog.langchain.dev/rss/",
    category: "research",
    priority: 2,
    trustScore: 0.87,
    active: true,
  },

  // 🔹 SUBSTACK (high signal thinkers)
  {
    id: "latentspace",
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

  // 🔹 COMMUNITY (controlled noise)
  {
    id: "hackernews-ai",
    name: "Hacker News (AI)",
    url: "https://hnrss.org/newest?q=AI",
    category: "community",
    priority: 3,
    trustScore: 0.75,
    active: true,
  },
];