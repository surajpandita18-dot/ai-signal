import fs from "fs";
import path from "path";
import Parser from "rss-parser";

const parser = new Parser();

const feeds = [
  { name: "Hugging Face", url: "https://huggingface.co/blog/feed.xml" },
  { name: "VentureBeat AI", url: "https://venturebeat.com/category/ai/feed/" },
  {
    name: "MIT Technology Review AI",
    url: "https://www.technologyreview.com/topic/artificial-intelligence/feed/",
  },
];

async function fetchFeeds() {
  const allArticles = [];

  for (const feed of feeds) {
    try {
      console.log(`Fetching: ${feed.name}`);

      const parsed = await parser.parseURL(feed.url);

      const items = parsed.items.slice(0, 5).map((item, index) => ({
        id: `${feed.name}-${index + 1}`,
        source: feed.name,
        title: item.title || "Untitled",
        link: item.link || "",
        date: item.pubDate || item.isoDate || "No date",
        summary:
          item.contentSnippet ||
          item.content ||
          item.summary ||
          "No summary available",
        category: "AI News",
        image: "",
      }));

      allArticles.push(...items);
    } catch (error) {
      console.error(`Failed to fetch ${feed.name}:`, error.message);
    }
  }

  const outputPath = path.join(process.cwd(), "lib", "realNews.json");
  fs.writeFileSync(outputPath, JSON.stringify(allArticles, null, 2));

  console.log(`Saved ${allArticles.length} articles to lib/realNews.json`);
}

fetchFeeds();