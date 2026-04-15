import Link from "next/link";
import realNews from "@/lib/realNews.json";

type RealArticle = {
  id: string;
  source: string;
  title: string;
  link: string;
  date: string;
  summary: string;
  category?: string;
};

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

function splitSummary(summary: string) {
  const clean = summary.replace(/\s+/g, " ").trim();

  if (
    !clean ||
    clean.toLowerCase() === "no summary available" ||
    clean.toLowerCase() === "no summary available."
  ) {
    return [];
  }

  const sentences = clean.split(/(?<=[.!?])\s+/);
  const paragraphs: string[] = [];
  let current = "";

  for (const sentence of sentences) {
    if ((current + " " + sentence).trim().length > 260) {
      if (current.trim()) paragraphs.push(current.trim());
      current = sentence;
    } else {
      current = `${current} ${sentence}`.trim();
    }
  }

  if (current.trim()) paragraphs.push(current.trim());

  return paragraphs;
}

function getFallbackArticleNote(article: RealArticle) {
  return `This signal was pulled from ${article.source}. A full summary was not available in the feed, but the headline suggests a development worth tracking under ${article.category || "AI News"}. Use the original source link below to read the complete piece.`;
}

function normalizeId(value: string) {
  return decodeURIComponent(value).trim().toLowerCase();
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const normalizedRouteId = normalizeId(id);

  const article = (realNews as RealArticle[]).find(
    (item) => normalizeId(item.id) === normalizedRouteId
  );

  if (!article) {
    return (
      <main className="min-h-screen">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <Link
            href="/"
            className="inline-flex items-center rounded-full border border-[#D5CEC5] bg-[#F7F4F0] px-4 py-2 text-sm text-stone-600 transition-colors duration-150 hover:border-[#C8C0B5] hover:text-stone-900"
          >
            ← Back to home
          </Link>

          <div className="mt-10 rounded-2xl border border-[#E0D9CF] bg-white p-10 text-center">
            <h1 className="text-2xl font-semibold text-stone-900">
              Article not found
            </h1>
            <p className="mt-3 text-sm text-stone-500">
              This signal may have been removed, refreshed, or the route id may no longer match the latest feed.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const paragraphs = splitSummary(article.summary);
  const whyItMatters = getWhyItMatters(article.title);

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <Link
          href="/"
          className="inline-flex items-center rounded-full border border-[#D5CEC5] bg-[#F7F4F0] px-4 py-2 text-sm text-stone-600 transition-colors duration-150 hover:border-[#C8C0B5] hover:text-stone-900"
        >
          ← Back to home
        </Link>

        <article className="mt-8 overflow-hidden rounded-2xl border border-[#E0D9CF] bg-white shadow-sm">
          {/* Warm header zone — matches hero surface */}
          <div className="bg-gradient-to-br from-[#EDE8E0] via-[#F5F1EC] to-white border-b border-[#E8E1D8] p-8 md:p-10">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium uppercase tracking-[0.15em] text-indigo-600">
                {article.category || "AI News"}
              </span>
              <span className="text-xs uppercase tracking-[0.15em] text-stone-400">
                {article.source}
              </span>
              <span className="text-xs text-stone-400">{article.date}</span>
            </div>

            <h1 className="max-w-3xl text-3xl font-semibold leading-tight text-stone-900 md:text-5xl">
              {article.title}
            </h1>

            <p className="mt-6 max-w-3xl text-sm italic leading-7 text-stone-500 md:text-base">
              Why it matters: {whyItMatters}
            </p>
          </div>

          <div className="p-8 md:p-10">
            <div className="mb-8 rounded-2xl border border-[#E8E1D8] bg-[#F7F4F0] p-5">
              <p className="text-[0.65rem] font-medium uppercase tracking-[0.3em] text-stone-400">
                Signal Summary
              </p>
              <p className="mt-3 text-sm leading-7 text-stone-600">
                {paragraphs.length > 0
                  ? article.summary
                  : "A detailed summary was not available in the source feed for this article."}
              </p>
            </div>

            <div className="space-y-6">
              {paragraphs.length > 0 ? (
                paragraphs.map((paragraph, index) => (
                  <p
                    key={index}
                    className="text-base leading-8 text-stone-700 md:text-lg"
                  >
                    {paragraph}
                  </p>
                ))
              ) : (
                <div className="rounded-2xl border border-[#E8E1D8] bg-[#F7F4F0] p-5">
                  <p className="text-base leading-8 text-stone-600 md:text-lg">
                    {getFallbackArticleNote(article)}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <a
                href={article.link}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center rounded-full border border-indigo-600 bg-indigo-600 px-5 py-3 text-sm text-white transition-colors duration-150 hover:bg-indigo-700"
              >
                Open original source →
              </a>

              <Link
                href="/saved"
                className="inline-flex items-center rounded-full border border-[#D5CEC5] bg-[#F7F4F0] px-5 py-3 text-sm text-stone-600 transition-colors duration-150 hover:border-[#C8C0B5] hover:text-stone-900"
              >
                Go to saved articles
              </Link>
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}
