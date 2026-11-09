/**
 * Gmail Service Client for Google Workspace integration
 * Handles listing messages, reading threads, sending research summaries/reports,
 * and saving drafts directly via Gmail REST API.
 */

export interface GmailProfile {
  emailAddress: string;
  messagesTotal: number;
  threadsTotal: number;
  historyId: string;
}

export interface GmailMessageSummary {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  to: string;
  date: string;
  snippet: string;
  labels: string[];
}

export interface SendEmailPayload {
  to: string;
  subject: string;
  body: string;
  cc?: string;
  bcc?: string;
  isHtml?: boolean;
}

/**
 * Base64 URL safe encoder according to RFC 4648 §5
 */
function base64UrlEncode(str: string): string {
  // Convert UTF-8 string to base64
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Fetch the authenticated user's Gmail profile
 */
export async function getGmailProfile(accessToken: string): Promise<GmailProfile> {
  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Failed to fetch Gmail profile: ${res.status} - ${errorBody}`);
  }

  return res.json();
}

/**
 * List recent messages from user's Gmail
 */
export async function listGmailMessages(
  accessToken: string,
  maxResults: number = 10,
  query?: string
): Promise<GmailMessageSummary[]> {
  const url = new URL('https://gmail.googleapis.com/gmail/v1/users/me/messages');
  url.searchParams.set('maxResults', String(maxResults));
  if (query) {
    url.searchParams.set('q', query);
  }

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Failed to list Gmail messages: ${res.status} - ${errorBody}`);
  }

  const listData = await res.json();
  if (!listData.messages || listData.messages.length === 0) {
    return [];
  }

  // Fetch headers for each message concurrently
  const messagePromises = listData.messages.slice(0, maxResults).map(async (msg: { id: string; threadId: string }) => {
    try {
      const detailRes = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=To&metadataHeaders=Date`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/json',
          },
        }
      );

      if (!detailRes.ok) return null;
      const detail = await detailRes.json();

      const headers = detail.payload?.headers || [];
      const getHeader = (name: string) => headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value || '';

      return {
        id: detail.id,
        threadId: detail.threadId,
        subject: getHeader('Subject') || '(No Subject)',
        from: getHeader('From'),
        to: getHeader('To'),
        date: getHeader('Date'),
        snippet: detail.snippet || '',
        labels: detail.labelIds || [],
      } as GmailMessageSummary;
    } catch {
      return null;
    }
  });

  const resolved = await Promise.all(messagePromises);
  return resolved.filter((m): m is GmailMessageSummary => m !== null);
}

/**
 * Construct raw MIME email format
 */
function buildMimeMessage(payload: SendEmailPayload): string {
  const lines: string[] = [];
  lines.push(`To: ${payload.to}`);
  if (payload.cc) lines.push(`Cc: ${payload.cc}`);
  if (payload.bcc) lines.push(`Bcc: ${payload.bcc}`);
  lines.push(`Subject: =?utf-8?B?${btoa(unescape(encodeURIComponent(payload.subject)))}?=`);
  lines.push('MIME-Version: 1.0');
  lines.push(payload.isHtml ? 'Content-Type: text/html; charset=UTF-8' : 'Content-Type: text/plain; charset=UTF-8');
  lines.push('');
  lines.push(payload.body);

  return lines.join('\r\n');
}

/**
 * Send an email directly using Gmail API
 */
export async function sendGmailMessage(
  accessToken: string,
  payload: SendEmailPayload
): Promise<{ id: string; threadId: string; labelIds: string[] }> {
  const rawMime = buildMimeMessage(payload);
  const rawBase64Url = base64UrlEncode(rawMime);

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw: rawBase64Url }),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Gmail API failed to send email: ${res.status} - ${errorBody}`);
  }

  return res.json();
}

/**
 * Save an email as a draft in Gmail
 */
export async function createGmailDraft(
  accessToken: string,
  payload: SendEmailPayload
): Promise<{ id: string; message: { id: string; threadId: string } }> {
  const rawMime = buildMimeMessage(payload);
  const rawBase64Url = base64UrlEncode(rawMime);

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/drafts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: {
        raw: rawBase64Url,
      },
    }),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Gmail API failed to create draft: ${res.status} - ${errorBody}`);
  }

  return res.json();
}
