// agents/formatter.ts
// Single responsibility: convert PersonalizedBrief into emailHtml + webPayload.
// No Claude API call — pure TypeScript template rendering.

import type { PersonalizedBrief, BriefContent } from "./personalizer";
import type {
  WrittenCriticalStory,
  WrittenMonitorStory,
  WrittenToolStory,
} from "./writer";

// ── Output types ──────────────────────────────────────────────────────────────

export interface WebBriefPayload {
  date: string;
  slug: string;
  criticalStories: WrittenCriticalStory[];
  monitorStories: WrittenMonitorStory[];
  toolOfDay?: WrittenToolStory;
  ctaPrompt: string;
  metaDescription: string;
  ogTitle: string;
}

export interface FormatterOutput {
  emailHtml: string;
  webPayload: WebBriefPayload;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function esc(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function upgradeUrl(): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://aisignal.io";
  return `${base}/upgrade`;
}

function isBlurred(actionText: string): boolean {
  return actionText.includes("🔒");
}

function renderActionTemplate(story: WrittenCriticalStory): string {
  const { action } = story.actionTemplate;
  if (isBlurred(action)) {
    return `
      <div style="background:#1A0F2E;border:1px dashed #7C3AED;border-radius:6px;padding:12px 16px;margin:12px 0 16px;">
        <p style="margin:0 0 4px;font-size:13px;color:#A78BFA;">🔒 Action template available for Pro subscribers</p>
        <p style="margin:0 0 8px;font-size:13px;color:#6B7280;">Upgrade to see: who owns this, what to do, and by when.</p>
        <a href="${esc(upgradeUrl())}" style="display:inline-block;background:#7C3AED;color:#F5F0E8;text-decoration:none;padding:8px 18px;border-radius:6px;font-size:13px;font-weight:600;">Upgrade to Pro →</a>
      </div>`;
  }
  return `
    <div style="background:#0D1A0D;border:1px solid #166534;border-radius:6px;padding:12px 16px;margin:12px 0 16px;">
      <p style="margin:0 0 4px;font-size:11px;color:#86EFAC;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Action Required</p>
      <p style="margin:0 0 4px;font-size:13px;color:#D1FAE5;"><strong>Owner:</strong> ${esc(story.actionTemplate.owner)}</p>
      <p style="margin:0 0 4px;font-size:13px;color:#D1FAE5;"><strong>Action:</strong> ${esc(story.actionTemplate.action)}</p>
      <p style="margin:0;font-size:13px;color:#D1FAE5;"><strong>By:</strong> ${esc(story.actionTemplate.by)}</p>
    </div>`;
}

function renderCriticalStory(story: WrittenCriticalStory): string {
  return `
  <div style="background:#110D1A;border:1px solid #2D1F42;border-radius:8px;padding:20px;margin-bottom:16px;">
    <h3 style="margin:0 0 10px;font-size:17px;font-family:Georgia,'Times New Roman',serif;color:#F5F0E8;font-weight:600;line-height:1.35;">${esc(story.headline)}</h3>
    ${story.summary ? `<p style="margin:0 0 12px;font-size:14px;color:#D1D5DB;line-height:1.65;">${esc(story.summary)}</p>` : ""}
    ${renderActionTemplate(story)}
    <div style="font-size:0;">
      <a href="${esc(story.url)}" style="display:inline-block;font-size:13px;color:#A78BFA;text-decoration:none;font-weight:500;margin-right:12px;">${esc(story.ctaLabel)}</a>
      <span style="display:inline-block;font-size:12px;color:#4B5563;">${esc(story.source)}</span>
    </div>
  </div>`;
}

function renderMonitorStory(story: WrittenMonitorStory): string {
  return `
  <div style="background:#0D0F1A;border:1px solid #1E2A42;border-radius:8px;padding:16px 20px;margin-bottom:12px;">
    <h4 style="margin:0 0 8px;font-size:15px;color:#F5F0E8;font-weight:500;line-height:1.35;">${esc(story.headline)}</h4>
    <p style="margin:0 0 10px;font-size:13px;color:#9CA3AF;line-height:1.55;">${esc(story.summary)}</p>
    <div style="font-size:0;">
      <a href="${esc(story.url)}" style="display:inline-block;font-size:13px;color:#60A5FA;text-decoration:none;margin-right:12px;">${esc(story.ctaLabel)}</a>
      <span style="display:inline-block;font-size:12px;color:#4B5563;">${esc(story.source)}</span>
    </div>
  </div>`;
}

function renderToolStory(story: WrittenToolStory): string {
  return `
  <div style="background:#1A1407;border:1px solid #92400E;border-radius:8px;padding:20px;">
    <h3 style="margin:0 0 10px;font-size:17px;color:#F5F0E8;font-weight:600;">${esc(story.headline)}</h3>
    <p style="margin:0 0 12px;font-size:14px;color:#D1D5DB;line-height:1.65;">${esc(story.summary)}</p>
    <div style="font-size:0;">
      <a href="${esc(story.url)}" style="display:inline-block;font-size:13px;color:#FCD34D;text-decoration:none;margin-right:12px;">${esc(story.ctaLabel)}</a>
      <span style="display:inline-block;font-size:12px;color:#4B5563;">${esc(story.source)}</span>
    </div>
  </div>`;
}

// ── Email HTML renderer ───────────────────────────────────────────────────────

function renderEmailHtml(brief: BriefContent, date: string): string {
  const { criticalStories, monitorStories, toolOfDay, ctaPrompt } = brief;

  const criticalHtml = criticalStories.map(renderCriticalStory).join("");
  const monitorHtml = monitorStories.map(renderMonitorStory).join("");
  const toolHtml = toolOfDay ? renderToolStory(toolOfDay) : "";

  return `<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="dark light">
  <meta name="supported-color-schemes" content="dark light">
  <title>AI Signal — ${esc(date)}</title>
  <style>
    /* Reset */
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }

    /* Base dark */
    body { margin: 0; padding: 0; background-color: #0A0812; color: #F5F0E8;
           font-family: 'Helvetica Neue', Arial, sans-serif; }
    .email-outer { background-color: #0A0812; }
    .email-inner { background-color: #0A0812; max-width: 600px; }

    /* Light-mode fallback (Gmail, Apple Mail, Outlook.com) */
    @media (prefers-color-scheme: light) {
      body, .email-outer { background-color: #FFFFFF !important; color: #111827 !important; }
      .email-inner { background-color: #FFFFFF !important; }
      .card-critical { background-color: #F9FAFB !important; border-color: #E5E7EB !important; }
      .card-monitor { background-color: #F9FAFB !important; border-color: #E5E7EB !important; }
      .header-text { color: #111827 !important; }
      .subtext { color: #6B7280 !important; }
      .story-headline { color: #111827 !important; }
      .story-body { color: #374151 !important; }
      .cta-block { background-color: #F3F4F6 !important; }
      .footer-block { border-color: #E5E7EB !important; }
      .footer-text { color: #6B7280 !important; }
    }

    /* Force dark on Gmail via data-ogsc (Outlook.com dark mode) */
    [data-ogsc] body, [data-ogsc] .email-outer { background-color: #0A0812 !important; }
    [data-ogsc] .email-inner { background-color: #0A0812 !important; }

    /* Mobile — 375px mental model */
    @media (max-width: 600px) {
      .email-outer { padding: 0 8px !important; }
      .email-inner { width: 100% !important; }
      .story-headline { font-size: 16px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#0A0812;" bgcolor="#0A0812">

<!--[if mso]>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<tr><td align="center" bgcolor="#0A0812">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0">
<tr><td>
<![endif]-->

  <div class="email-outer" style="padding:0 16px;background-color:#0A0812;">
  <div class="email-inner" style="max-width:600px;margin:0 auto;background-color:#0A0812;padding:0 0 40px;">

    <!-- Header -->
    <div style="text-align:center;padding:32px 0 24px;border-bottom:1px solid #1F1235;">
      <div class="header-text" style="font-size:26px;font-weight:700;color:#F5F0E8;letter-spacing:-0.5px;font-family:Georgia,'Times New Roman',serif;">AI Signal</div>
      <div class="subtext" style="margin-top:6px;font-size:13px;color:#6B7280;">${esc(date)}&nbsp;·&nbsp;For CTOs building AI-first products</div>
    </div>

    <!-- CRITICAL section -->
    <div style="margin-top:32px;">
      <div style="margin-bottom:16px;">
        <span style="display:inline-block;background:#EF4444;color:#ffffff;font-size:11px;font-weight:700;padding:3px 9px;border-radius:4px;letter-spacing:1px;vertical-align:middle;">🔴 CRITICAL</span>
        <span class="subtext" style="display:inline-block;font-size:13px;color:#6B7280;vertical-align:middle;margin-left:8px;">${criticalStories.length} ${criticalStories.length === 1 ? "story" : "stories"} requiring immediate attention</span>
      </div>
      ${criticalHtml || '<p style="color:#6B7280;font-size:14px;">No critical stories today.</p>'}
    </div>

    <!-- MONITOR section -->
    <div style="margin-top:32px;">
      <div style="margin-bottom:14px;">
        <span style="display:inline-block;background:#3B82F6;color:#ffffff;font-size:11px;font-weight:700;padding:3px 9px;border-radius:4px;letter-spacing:1px;vertical-align:middle;">🔵 MONITOR</span>
        <span class="subtext" style="display:inline-block;font-size:13px;color:#6B7280;vertical-align:middle;margin-left:8px;">${monitorStories.length} signal${monitorStories.length === 1 ? "" : "s"} to track</span>
      </div>
      ${monitorHtml || '<p style="color:#6B7280;font-size:14px;">No monitor signals today.</p>'}
    </div>

    <!-- Tool of Day -->
    ${toolHtml ? `
    <div style="margin-top:32px;">
      <div style="margin-bottom:12px;">
        <span style="display:inline-block;background:#F59E0B;color:#111827;font-size:11px;font-weight:700;padding:3px 9px;border-radius:4px;letter-spacing:1px;">⚡ TOOL OF THE DAY</span>
      </div>
      ${toolHtml}
    </div>` : ""}

    <!-- CTA Prompt -->
    <div class="cta-block" style="margin-top:32px;background:#100B1F;border-left:3px solid #7C3AED;padding:16px 20px;border-radius:0 8px 8px 0;">
      <div style="font-size:11px;color:#7C3AED;text-transform:uppercase;letter-spacing:1px;font-weight:600;margin-bottom:8px;">CTO Prompt of the Day</div>
      <div class="story-body" style="font-size:15px;color:#F5F0E8;line-height:1.6;">&ldquo;${esc(ctaPrompt)}&rdquo;</div>
    </div>

    <!-- Upgrade CTA -->
    <div style="margin-top:32px;text-align:center;background:#100B1F;border:1px solid #2D1F42;border-radius:12px;padding:28px 24px;">
      <div class="story-headline" style="font-size:17px;color:#F5F0E8;font-weight:600;margin-bottom:8px;">Unlock the full brief</div>
      <div class="subtext" style="font-size:14px;color:#9CA3AF;margin-bottom:20px;">Pro subscribers get full action templates, all Monitor signals, and Slack delivery.</div>
      <a href="${esc(upgradeUrl())}"
         style="display:inline-block;background:#7C3AED;color:#F5F0E8;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:15px;font-weight:600;mso-padding-alt:12px 28px;">
        <!--[if mso]><i style="letter-spacing:28px;mso-font-width:-100%;mso-text-raise:25pt"> </i><![endif]-->
        Upgrade to Pro&nbsp;&rarr;
        <!--[if mso]><i style="letter-spacing:28px;mso-font-width:-100%"> </i><![endif]-->
      </a>
    </div>

    <!-- Footer -->
    <div class="footer-block" style="margin-top:32px;text-align:center;padding-top:24px;border-top:1px solid #1F1235;">
      <div class="footer-text" style="font-size:13px;color:#4B5563;margin-bottom:6px;">AI Signal &middot; Bengaluru / Global</div>
      <div style="font-size:13px;">
        <a href="https://aisignal.io" style="color:#7C3AED;text-decoration:none;">aisignal.io</a>
        <span style="color:#374151;margin:0 8px;">&middot;</span>
        <a href="{{unsubscribe_url}}" style="color:#4B5563;text-decoration:none;">Unsubscribe</a>
      </div>
    </div>

  </div>
  </div>

<!--[if mso]>
</td></tr></table>
</td></tr></table>
<![endif]-->

</body>
</html>`;
}

// ── Web payload renderer ──────────────────────────────────────────────────────

function renderWebPayload(brief: BriefContent, date: string): WebBriefPayload {
  const topHeadline =
    brief.criticalStories[0]?.headline ?? "AI intelligence for CTOs";
  const slug = date.match(/\d{4}-\d{2}-\d{2}/)?.[0] ?? date;

  return {
    date,
    slug,
    criticalStories: brief.criticalStories,
    monitorStories: brief.monitorStories,
    toolOfDay: brief.toolOfDay,
    ctaPrompt: brief.ctaPrompt,
    metaDescription: `${topHeadline.slice(0, 120)} — AI Signal daily brief for CTOs.`.slice(
      0,
      160
    ),
    ogTitle: `AI Signal — ${date}: ${topHeadline.slice(0, 60)}`,
  };
}

// ── Public API ────────────────────────────────────────────────────────────────

export function runFormatter(personalizedBrief: PersonalizedBrief): FormatterOutput {
  const { freeBrief, proBrief, metadata } = personalizedBrief;

  // Email is sent to free_and_paid — render free version with blurred action templates
  const emailHtml = renderEmailHtml(freeBrief, metadata.date);

  // Web payload uses pro content (web archive page shows full brief to authed pro users)
  const webPayload = renderWebPayload(proBrief, metadata.date);

  return { emailHtml, webPayload };
}
