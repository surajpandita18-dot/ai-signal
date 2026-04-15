"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { articles as mockArticles } from "@/lib/mockData";
import realNews from "@/lib/realNews.json";

type RealArticle = {
  id: string;
  source: string;
  title: string;
  link: string;
  date: string;
  summary: string;
  category?: string;
  image?: string;
};

function truncateText(text: string, maxLength: number) {
  if (!text) return "No summary available.";
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= maxLength) return clean;
  return clean.slice(0, maxLength).trim() + "…";
}

function getWhyItMatters(title: string) {
  const text = title.toLowerCase();

  if (
    text.includes("funding") ||
    text.includes("raise") ||
    text.includes("million") ||
    text.includes("billion") ||
    text.includes("secures")
  ) {
    return "Signals capital conviction and rising competitive intensity in this AI segment.";
  }

  if (
    text.includes("launch") ||
    text.includes("release") ||
    text.includes("rolls out") ||
    text.includes("introduces")
  ) {
    return "Shows product velocity — teams are racing to translate AI capability into user-facing experiences.";
  }

  if (
    text.includes("model") ||
    text.includes("research") ||
    text.includes("embedding") ||
    text.includes("benchmark") ||
    text.includes("safety")
  ) {
    return "Highlights movement in core model capability, evaluation, or reliability.";
  }

  if (
    text.includes("open source") ||
    text.includes("developer") ||
    text.includes("tool") ||
    text.includes("code") ||
    text.includes("sdk")
  ) {
    return "Points to momentum in the AI tooling stack that shapes how products get built and shipped.";
  }

  if (
    text.includes("enterprise") ||
    text.includes("workplace") ||
    text.includes("business")
  ) {
    return "Reflects growing enterprise adoption and clearer paths from experimentation to operational value.";
  }

  return "Represents a meaningful shift in the AI landscape that operators and builders should track.";
}

function getPersonalizedScore(
  article: RealArticle,
  bookmarks: string[],
  readArticles: string[]
) {
  let score = 0;

  if (bookmarks.includes(article.id)) score += 5;
  if (!readArticles.includes(article.id)) score += 2;

  const title = article.title.toLowerCase();

  if (title.includes("model")) score += 1;
  if (title.includes("open source")) score += 1;
  if (title.includes("enterprise")) score += 1;

  return score;
}

function generateDailyBrief(articles: RealArticle[]) {
  if (articles.length === 0) {
    return "No major signals available right now. Try refreshing to pull the latest AI developments.";
  }

  const titles = articles.map((article) => article.title.toLowerCase());

  const hasFunding = titles.some(
    (title) =>
      title.includes("funding") ||
      title.includes("raise") ||
      title.includes("million") ||
      title.includes("billion") ||
      title.includes("secures")
  );

  const hasLaunches = titles.some(
    (title) =>
      title.includes("launch") ||
      title.includes("release") ||
      title.includes("introduces") ||
      title.includes("rolls out")
  );

  const hasResearch = titles.some(
    (title) =>
      title.includes("model") ||
      title.includes("research") ||
      title.includes("embedding") ||
      title.includes("benchmark") ||
      title.includes("safety")
  );

  const hasEnterprise = titles.some(
    (title) =>
      title.includes("enterprise") ||
      title.includes("workplace") ||
      title.includes("business")
  );

  const hasOpenSource = titles.some(
    (title) =>
      title.includes("open source") ||
      title.includes("developer") ||
      title.includes("tool") ||
      title.includes("code") ||
      title.includes("sdk")
  );

  const themes: string[] = [];

  if (hasLaunches) themes.push("rapid product shipping");
  if (hasResearch) themes.push("continued model and research progress");
  if (hasEnterprise) themes.push("stronger enterprise adoption");
  if (hasOpenSource) themes.push("momentum in the tooling and open ecosystem");
  if (hasFunding) themes.push("fresh capital flowing into AI infrastructure and applications");

  if (themes.length === 0) {
    return "Today's signal set suggests steady movement across the AI landscape, with incremental developments that matter for builders, operators, and product teams.";
  }

  const themeText =
    themes.length === 1
      ? themes[0]
      : themes.length === 2
      ? `${themes[0]} and ${themes[1]}`
      : `${themes.slice(0, -1).join(", ")}, and ${themes[themes.length - 1]}`;

  return `Today's AI brief points to ${themeText}. The strongest signal is not any single headline, but the combined pace of ecosystem movement — where capability advances, productization, and commercialization are increasingly happening in parallel.`;
}

export default function Home() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [readArticles, setReadArticles] = useState<string[]>([]);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const categories = [
    "All",
    "Hugging Face",
    "VentureBeat AI",
    "MIT Technology Review AI",
  ];

  useEffect(() => {
    const saved = localStorage.getItem("bookmarks_real");
    const read = localStorage.getItem("read_articles");

    try {
      if (saved) setBookmarks(JSON.parse(saved));
      if (read) setReadArticles(JSON.parse(read));
    } catch {
      setBookmarks([]);
      setReadArticles([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("bookmarks_real", JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    localStorage.setItem("read_articles", JSON.stringify(readArticles));
  }, [readArticles]);

  const toggleBookmark = (id: string) => {
    setBookmarks((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const markAsRead = (id: string) => {
    if (!readArticles.includes(id)) {
      setReadArticles((prev) => [...prev, id]);
    }
  };

  const featuredArticle = mockArticles[0];
  const query = search.trim().toLowerCase();

  const filteredArticles = useMemo(() => {
    return (realNews as RealArticle[])
      .filter((article) => {
        const matchesSearch =
          query === "" ||
          article.title.toLowerCase().includes(query) ||
          article.summary.toLowerCase().includes(query) ||
          article.source.toLowerCase().includes(query) ||
          (article.category || "").toLowerCase().includes(query);

        const matchesCategory =
          selectedCategory === "All" || article.source === selectedCategory;

        const matchesReadFilter =
          !showUnreadOnly || !readArticles.includes(article.id);

        return matchesSearch && matchesCategory && matchesReadFilter;
      })
      .sort(
        (a, b) =>
          getPersonalizedScore(b, bookmarks, readArticles) -
          getPersonalizedScore(a, bookmarks, readArticles)
      );
  }, [query, selectedCategory, showUnreadOnly, readArticles, bookmarks]);

  const topSignals = useMemo(() => {
    return filteredArticles.slice(0, 5);
  }, [filteredArticles]);

  const dailyBrief = useMemo(() => {
    return generateDailyBrief(topSignals);
  }, [topSignals]);

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-7xl px-6 py-8">

        {/* Header */}
        <header className="mb-10">
          <div className="mb-6 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[0.65rem] font-medium uppercase tracking-[0.3em] text-stone-400">
                AI News Digest
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-900 md:text-4xl">
                AI Signal
              </h1>
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <Link
                href="/saved"
                className="inline-flex items-center justify-center rounded-full border border-[#D5CEC5] bg-[#F7F4F0] px-4 py-2.5 text-sm text-stone-600 transition-colors duration-150 hover:border-[#C8C0B5] hover:text-stone-900"
              >
                Saved
                <span className="ml-2 rounded-full bg-indigo-50 px-2 py-0.5 text-xs text-indigo-600">
                  {bookmarks.length}
                </span>
              </Link>

              <input
                type="text"
                placeholder="Search AI news..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-2xl border border-[#D5CEC5] bg-[#F7F4F0] px-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 outline-none focus:border-indigo-300 md:w-80"
              />

              <button
                onClick={() => window.location.reload()}
                className="rounded-full border border-[#D5CEC5] bg-[#F7F4F0] px-4 py-2.5 text-sm text-stone-600 transition-colors duration-150 hover:border-[#C8C0B5] hover:text-stone-900"
              >
                Refresh
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setSelectedCategory(item)}
                className={`rounded-full border px-4 py-1.5 text-sm transition-colors duration-150 ${
                  selectedCategory === item
                    ? "border-indigo-600 bg-indigo-600 text-white"
                    : "border-[#D5CEC5] bg-white text-stone-600 hover:border-[#C8C0B5] hover:text-stone-800"
                }`}
              >
                {item}
              </button>
            ))}

            <button
              onClick={() => setShowUnreadOnly((prev) => !prev)}
              className={`rounded-full border px-4 py-1.5 text-sm transition-colors duration-150 ${
                showUnreadOnly
                  ? "border-indigo-600 bg-indigo-600 text-white"
                  : "border-[#D5CEC5] bg-white text-stone-600 hover:border-[#C8C0B5] hover:text-stone-800"
              }`}
            >
              {showUnreadOnly ? "Showing Unread" : "Unread Only"}
            </button>
          </div>
        </header>

        {/* Hero — warm featured treatment */}
        <Link
          href={topSignals.length > 0 ? `/article/${topSignals[0].id}` : "/"}
          className="group mb-10 block overflow-hidden rounded-2xl border border-[#C8C0B5] bg-gradient-to-br from-[#EDE8E0] via-[#F5F1EC] to-white shadow-[0_6px_32px_rgba(0,0,0,0.09)] transition-shadow duration-150 hover:shadow-[0_8px_36px_rgba(0,0,0,0.11)]"
        >
          <div className="p-10 md:p-14">
            <p className="mb-4 inline-block rounded-full border border-indigo-200 bg-white px-3 py-1 text-xs font-medium text-indigo-600">
              Featured Story
            </p>

            <h2 className="max-w-4xl text-4xl font-semibold leading-[1.12] tracking-tight text-stone-900 md:text-5xl">
              {featuredArticle.title}
            </h2>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-stone-600 md:text-base">
              {featuredArticle.summary}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-4">
              <p className="max-w-xl text-sm italic text-stone-500">
                Why it matters: {featuredArticle.whyItMatters}
              </p>

              <span className="inline-flex items-center rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 group-hover:bg-indigo-700">
                Read full story →
              </span>
            </div>
          </div>
        </Link>

        {/* Daily Brief — memo block */}
        <section className="mb-10 rounded-2xl border border-[#E0D9CF] border-l-[3px] border-l-indigo-300 bg-[#F2EDE5] p-6">
          <div className="mb-4">
            <p className="mb-2 text-[0.65rem] font-medium uppercase tracking-[0.3em] text-stone-400">
              Daily AI Brief
            </p>
            <h3 className="text-xl font-semibold text-stone-900">
              What matters today
            </h3>
          </div>

          <p className="max-w-4xl text-sm leading-7 text-stone-600 md:text-base">
            {dailyBrief}
          </p>
        </section>

        {/* Top Signals — unified ranked board */}
        <section className="mb-10">
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-stone-900">Top Signals Today</h3>
            <p className="text-sm text-stone-400">
              Most relevant developments across AI right now
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#E0D9CF] bg-[#F7F4F0]">
            {topSignals.map((article, index) => (
              <div
                key={article.id}
                className={`group flex items-start justify-between gap-4 p-4 transition-colors duration-150 hover:bg-white ${
                  index > 0 ? "border-t border-[#E8E2DB]" : ""
                }`}
              >
                <div className="flex gap-4">
                  <span className="text-lg font-semibold tabular-nums text-indigo-400">
                    {index + 1}
                  </span>

                  <div>
                    <p className="mb-1 text-xs uppercase tracking-[0.15em] text-stone-400">
                      {article.source}
                    </p>
                    <h4 className="text-sm font-medium leading-6 text-stone-900 transition-colors duration-150 group-hover:text-indigo-700">
                      {article.title}
                    </h4>
                  </div>
                </div>

                <Link
                  href={`/article/${article.id}`}
                  onClick={() => markAsRead(article.id)}
                  className="shrink-0 text-xs text-stone-400 transition-colors duration-150 hover:text-stone-900"
                >
                  Read →
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Section header */}
        <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h3 className="text-2xl font-semibold tracking-tight text-stone-900">
              Latest Signals
            </h3>
            <p className="mt-1 text-sm text-stone-400">
              Real AI news pulled from live feeds
            </p>
          </div>

          <p className="text-sm text-stone-400">
            {filteredArticles.length} article
            {filteredArticles.length !== 1 ? "s" : ""} shown
          </p>
        </div>

        {/* Article cards */}
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredArticles.length > 0 ? (
            filteredArticles.map((article) => (
              <article
                key={article.id}
                className={`group rounded-2xl border p-5 transition-[box-shadow,border-color] duration-150 ${
                  readArticles.includes(article.id)
                    ? "border-[#E0D9CF] bg-[#F7F4F0] opacity-60"
                    : "border-[#E0D9CF] bg-white shadow-sm hover:border-[#C8C0B5] hover:shadow-[0_8px_28px_rgba(0,0,0,0.09)]"
                }`}
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium uppercase tracking-[0.15em] text-indigo-600">
                      {article.category || "AI News"}
                    </span>
                    <span className="text-xs text-stone-400">{article.date}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleBookmark(article.id)}
                    className={`cursor-pointer rounded-full border px-2 py-1 text-sm leading-none transition-colors duration-150 ${
                      bookmarks.includes(article.id)
                        ? "border-amber-300 bg-amber-50 text-amber-600"
                        : "border-[#E0D9CF] bg-[#F7F4F0] text-stone-300 hover:border-amber-200 hover:text-amber-400"
                    }`}
                    aria-label={
                      bookmarks.includes(article.id)
                        ? "Remove bookmark"
                        : "Add bookmark"
                    }
                  >
                    {bookmarks.includes(article.id) ? "★" : "☆"}
                  </button>
                </div>

                <p className="mb-1.5 text-xs uppercase tracking-[0.15em] text-stone-400">
                  {article.source}
                </p>

                <h4 className="mb-3 text-[0.9375rem] font-semibold leading-[1.5] text-stone-900 transition-colors duration-150 group-hover:text-indigo-700">
                  {article.title}
                </h4>

                <p className="mb-4 text-sm leading-6 text-stone-500">
                  {truncateText(article.summary, 220)}
                </p>

                <div className="flex items-start justify-between gap-3 border-t border-[#EDE8E2] pt-3">
                  <p className="text-xs leading-5 text-stone-400">
                    {getWhyItMatters(article.title)}
                  </p>

                  <Link
                    href={`/article/${article.id}`}
                    onClick={() => markAsRead(article.id)}
                    className="shrink-0 text-xs font-medium text-stone-400 transition-colors duration-150 hover:text-indigo-700"
                  >
                    Read →
                  </Link>
                </div>
              </article>
            ))
          ) : (
            <div className="col-span-full rounded-2xl border border-[#E0D9CF] bg-white p-10 text-center">
              <p className="text-lg font-medium text-stone-900">No results found</p>
              <p className="mt-2 text-sm text-stone-500">
                Try another keyword, company name, topic, or source.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
