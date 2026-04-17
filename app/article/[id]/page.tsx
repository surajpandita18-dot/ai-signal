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
  )
    return "Signals capital conviction and rising competitive intensity in this AI segment.";
  if (
    text.includes("launch") ||
    text.includes("release") ||
    text.includes("rolls out") ||
    text.includes("introduces")
  )
    return "Shows product velocity — teams are racing to translate AI capability into user-facing experiences.";
  if (
    text.includes("model") ||
    text.includes("research") ||
    text.includes("embedding") ||
    text.includes("benchmark") ||
    text.includes("safety")
  )
    return "Highlights movement in core model capability, evaluation, or reliability.";
  if (
    text.includes("open source") ||
    text.includes("developer") ||
    text.includes("tool") ||
    text.includes("code") ||
    text.includes("sdk")
  )
    return "Points to momentum in the AI tooling stack that shapes how products get built and shipped.";
  if (
    text.includes("enterprise") ||
    text.includes("workplace") ||
    text.includes("business")
  )
    return "Reflects growing enterprise adoption and clearer paths from experimentation to operational value.";
  return "Represents a meaningful shift in the AI landscape that operators and builders should track.";
}

function splitSummary(summary: string) {
  const clean = summary.replace(/\s+/g, " ").trim();
  if (
    !clean ||
    clean.toLowerCase() === "no summary available" ||
    clean.toLowerCase() === "no summary available."
  )
    return [];
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
  return `This signal was pulled from ${article.source}. A full summary was not available in the feed, but the headline suggests a development worth tracking under ${
    article.category || "AI News"
  }. Use the original source link below to read the complete piece.`;
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
      <main style={{ minHeight: "100vh" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "48px 28px" }}>
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "7px",
              color: "#6b7a99",
              fontSize: "11px",
              fontWeight: 500,
              padding: "7px 13px",
              textDecoration: "none",
              marginBottom: "32px",
            }}
          >
            ← Back to home
          </Link>
          <div
            style={{
              background: "#0d0e17",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "13px",
              padding: "60px 40px",
              textAlign: "center",
            }}
          >
            <h1 style={{ fontSize: "18px", fontWeight: 600, color: "#f0f2ff" }}>
              Article not found
            </h1>
            <p style={{ fontSize: "12px", color: "#374151", marginTop: "8px" }}>
              This signal may have been removed, refreshed, or the route id may no longer
              match the latest feed.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const paragraphs = splitSummary(article.summary);
  const whyItMatters = getWhyItMatters(article.title);

  return (
    <main style={{ minHeight: "100vh" }}>
      {/* Navbar */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "rgba(8,9,15,0.94)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          height: "60px",
          padding: "0 28px",
          display: "flex",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <Link
          href="/"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "7px",
            color: "#6b7a99",
            fontSize: "11px",
            fontWeight: 500,
            padding: "7px 13px",
            textDecoration: "none",
          }}
        >
          ← Back
        </Link>
        <span
          style={{
            fontSize: "9px",
            letterSpacing: ".2em",
            color: "#374151",
            fontWeight: 600,
            textTransform: "uppercase",
          }}
        >
          {article.source}
        </span>
      </nav>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "32px 28px" }}>
        <article>
          {/* Article header */}
          <div
            style={{
              background:
                "linear-gradient(145deg,#0f0720 0%,#1a0b3d 40%,#111330 100%)",
              border: "1px solid rgba(139,92,246,0.15)",
              borderRadius: "16px",
              padding: "36px 40px",
              marginBottom: "20px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Orb */}
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                top: "-80px",
                right: "-60px",
                width: "300px",
                height: "300px",
                borderRadius: "50%",
                background:
                  "radial-gradient(circle,rgba(139,92,246,0.12) 0%,transparent 65%)",
                pointerEvents: "none",
              }}
            />

            <div style={{ position: "relative" }}>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "16px",
                }}
              >
                <span
                  style={{
                    background: "rgba(139,92,246,0.15)",
                    border: "1px solid rgba(139,92,246,0.25)",
                    borderRadius: "20px",
                    color: "#c4b5fd",
                    fontSize: "9px",
                    fontWeight: 600,
                    padding: "3px 10px",
                    textTransform: "uppercase",
                    letterSpacing: ".1em",
                  }}
                >
                  {article.category || "AI News"}
                </span>
                <span
                  style={{
                    fontSize: "9px",
                    color: "#374151",
                    letterSpacing: ".1em",
                    textTransform: "uppercase",
                    fontWeight: 600,
                  }}
                >
                  {article.source}
                </span>
                <span style={{ fontSize: "9px", color: "#2d3748" }}>{article.date}</span>
              </div>

              <h1
                style={{
                  fontSize: "24px",
                  fontWeight: 800,
                  color: "#fff",
                  lineHeight: 1.2,
                  letterSpacing: "-.02em",
                  maxWidth: "680px",
                  marginBottom: "16px",
                }}
              >
                {article.title}
              </h1>

              <p
                style={{
                  fontSize: "12px",
                  color: "rgba(255,255,255,0.45)",
                  fontStyle: "italic",
                  lineHeight: 1.65,
                  borderLeft: "2px solid rgba(255,255,255,0.2)",
                  paddingLeft: "12px",
                  maxWidth: "560px",
                }}
              >
                Why it matters: {whyItMatters}
              </p>
            </div>
          </div>

          {/* Article body */}
          <div
            style={{
              background: "#0d0e17",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "13px",
              padding: "32px 36px",
            }}
          >
            {/* Signal Summary block */}
            <div
              style={{
                background: "#13152a",
                border: "1px solid rgba(255,255,255,0.07)",
                borderLeft: "3px solid #7c3aed",
                borderRadius: "8px",
                padding: "16px 18px",
                marginBottom: "28px",
              }}
            >
              <p
                style={{
                  fontSize: "8px",
                  letterSpacing: ".2em",
                  color: "#a78bfa",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  marginBottom: "8px",
                }}
              >
                Signal Summary
              </p>
              <p style={{ fontSize: "13px", color: "#8892b0", lineHeight: 1.75 }}>
                {paragraphs.length > 0
                  ? article.summary
                  : "A detailed summary was not available in the source feed for this article."}
              </p>
            </div>

            {/* Paragraphs */}
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              {paragraphs.length > 0 ? (
                paragraphs.map((paragraph, index) => (
                  <p
                    key={index}
                    style={{ fontSize: "14px", color: "#8892b0", lineHeight: 1.8 }}
                  >
                    {paragraph}
                  </p>
                ))
              ) : (
                <div
                  style={{
                    background: "#13152a",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: "8px",
                    padding: "16px 18px",
                  }}
                >
                  <p style={{ fontSize: "14px", color: "#8892b0", lineHeight: 1.8 }}>
                    {getFallbackArticleNote(article)}
                  </p>
                </div>
              )}
            </div>

            {/* CTA */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: "12px",
                marginTop: "36px",
                paddingTop: "24px",
                borderTop: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <a
                href={article.link}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "inline-block",
                  background: "#7c3aed",
                  color: "#fff",
                  borderRadius: "22px",
                  fontSize: "12px",
                  fontWeight: 700,
                  padding: "10px 22px",
                  textDecoration: "none",
                }}
              >
                Open original source →
              </a>
              <Link
                href="/saved"
                style={{
                  display: "inline-block",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: "22px",
                  color: "#6b7a99",
                  fontSize: "12px",
                  fontWeight: 500,
                  padding: "10px 22px",
                  textDecoration: "none",
                }}
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
