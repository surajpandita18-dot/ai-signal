// lib/beehiiv.ts
// Beehiiv API client — draft creation, scheduling, subscriber metrics.
// Server-side only. Never import in browser/client components.

const BASE_URL = "https://api.beehiiv.com/v2";

interface BeehiivCredentials {
  apiKey: string;
  pubId: string;
}

function getCredentials(): BeehiivCredentials | null {
  const apiKey = process.env.BEEHIIV_API_KEY;
  const pubId = process.env.BEEHIIV_PUBLICATION_ID;
  if (!apiKey || !pubId) return null;
  return { apiKey, pubId };
}

async function beehiivFetch(
  path: string,
  options: RequestInit,
  creds: BeehiivCredentials
): Promise<Response> {
  return fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${creds.apiKey}`,
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });
}

// Creates a post draft. Returns the Beehiiv post ID, or null if not configured.
export async function createDraft(
  subject: string,
  emailHtml: string
): Promise<string | null> {
  const creds = getCredentials();
  if (!creds) return null;

  const res = await beehiivFetch(
    `/publications/${creds.pubId}/posts`,
    {
      method: "POST",
      body: JSON.stringify({
        subject,
        body: emailHtml,
        content_type: "html",
        audience: "free_and_paid",
        status: "draft",
      }),
    },
    creds
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Beehiiv createDraft ${res.status}: ${err}`);
  }

  const data = (await res.json()) as { data: { id: string } };
  return data.data.id;
}

// Schedules a draft post for delivery. No-op if Beehiiv not configured.
export async function scheduleSend(
  postId: string,
  sendAt: Date
): Promise<void> {
  const creds = getCredentials();
  if (!creds) return;

  const res = await beehiivFetch(
    `/publications/${creds.pubId}/posts/${postId}`,
    {
      method: "PATCH",
      body: JSON.stringify({
        status: "scheduled",
        scheduled_at: sendAt.toISOString(),
      }),
    },
    creds
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Beehiiv scheduleSend ${res.status}: ${err}`);
  }
}

// Returns the active subscriber count, or 0 if Beehiiv not configured.
export async function getSubscriberCount(): Promise<number> {
  const creds = getCredentials();
  if (!creds) return 0;

  const res = await beehiivFetch(
    `/publications/${creds.pubId}/subscriptions?limit=1&status=active`,
    { method: "GET" },
    creds
  );

  if (!res.ok) return 0;

  const data = (await res.json()) as { total_results?: number };
  return data.total_results ?? 0;
}
