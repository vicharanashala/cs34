/**
 * seedFaqs.ts
 * Reads the cached FAQ HTML, parses each Q&A, then seeds them into the
 * running backend via HTTP API calls (avoids Atlas IP-whitelist issues).
 *
 * Usage:  npx ts-node src/scripts/seedFaqs.ts
 * Requires: backend running on http://localhost:5000
 */

import fs from 'fs';

const API_BASE = 'http://localhost:5000/api';
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'admin123';

const FAQ_HTML_PATH =
  'C:\\Users\\Lenovo\\.gemini\\antigravity\\brain\\1c988e4a-4d6b-4db7-8800-cace977e40ef\\.system_generated\\steps\\302\\content.md';

// ---------------------------------------------------------------------------
// HTML → plain-text helpers
// ---------------------------------------------------------------------------

function htmlToText(html: string): string {
  let t = html;
  t = t.replace(/<ul>([\s\S]*?)<\/ul>/g, (_, i) => i);
  t = t.replace(/<ol>([\s\S]*?)<\/ol>/g, (_, i) => i);
  t = t.replace(/<li>([\s\S]*?)<\/li>/g, '- $1\n');
  t = t.replace(/<blockquote>([\s\S]*?)<\/blockquote>/g, '> $1\n');
  t = t.replace(/<p>([\s\S]*?)<\/p>/g, '$1\n\n');
  t = t.replace(/<hr\s*\/?>/g, '\n---\n');
  t = t.replace(/<br\s*\/?>/g, '\n');
  t = t.replace(/<strong>([\s\S]*?)<\/strong>/g, '**$1**');
  t = t.replace(/<b>([\s\S]*?)<\/b>/g, '**$1**');
  t = t.replace(/<a\s[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g, '[$2]($1)');
  t = t.replace(/<code>([\s\S]*?)<\/code>/g, '`$1`');
  t = t.replace(/<[^>]+>/g, '');
  t = t.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
       .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ');
  return t.replace(/\n{3,}/g, '\n\n').trim();
}

function tagForSection(secId: number): string {
  switch (secId) {
    case 1: case 7:  return 'Onboarding & VINS';
    case 2:          return 'Timelines & Clashes';
    case 3:          return 'NOC Compliance';
    case 4:          return 'Dashboard & Offers';
    case 5:          return 'Team & Code Engineering';
    case 6:          return 'Communication Tech';
    case 8: case 11: return 'Certification & Credits';
    case 9:          return 'Rosetta Journaling';
    case 10: case 13: return 'ViBe LMS Tech';
    case 12:         return 'Yaksha AI Engine';
    case 14:         return 'Team & Code Engineering';
    default:         return 'Onboarding & VINS';
  }
}

// ---------------------------------------------------------------------------
// Parse FAQ items from cached HTML
// ---------------------------------------------------------------------------

interface FaqItem {
  title: string;
  description: string;
  tag: string;
  answer: string;
}

function parseFaqs(html: string): FaqItem[] {
  const items: FaqItem[] = [];
  const re = /<details\s+class="faq-q"\s+id="q-(\d+)-(\d+)">([\s\S]*?)<\/details>/g;
  let m: RegExpExecArray | null;

  while ((m = re.exec(html)) !== null) {
    const secId = parseInt(m[1], 10);
    const inner = m[3];

    const sumMatch = inner.match(/<summary>([\s\S]*?)<\/summary>/);
    if (!sumMatch) continue;

    let title = sumMatch[1]
      .replace(/<a[\s\S]*?>[\s\S]*?<\/a>/g, '')
      .replace(/^\d+(\.\d+)?\s+/, '')
      .trim();

    title = title
      .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ');

    const bodyHtml = inner.replace(/<summary>[\s\S]*?<\/summary>/, '').trim();
    const answer = htmlToText(bodyHtml);

    if (!title || !answer) continue;

    items.push({
      title,
      description: `FAQ: ${title}`,
      tag: tagForSection(secId),
      answer,
    });
  }
  return items;
}

// ---------------------------------------------------------------------------
// HTTP helper
// ---------------------------------------------------------------------------

async function api(
  method: string,
  path: string,
  body?: unknown,
  token?: string,
): Promise<{ ok: boolean; status: number; data: unknown }> {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  // 1. Load HTML
  if (!fs.existsSync(FAQ_HTML_PATH)) {
    console.error('❌ Cached HTML file not found at:', FAQ_HTML_PATH);
    process.exit(1);
  }
  const html = fs.readFileSync(FAQ_HTML_PATH, 'utf8');
  const faqs = parseFaqs(html);
  console.log(`📄 Parsed ${faqs.length} FAQ items`);

  // 2. Login as admin
  console.log('🔑 Logging in as admin…');
  const loginRes = await api('POST', '/auth/login', { email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
  if (!loginRes.ok) {
    console.error('❌ Login failed:', loginRes.data);
    process.exit(1);
  }
  const token = (loginRes.data as { data?: { token?: string } }).data?.token;
  if (!token) {
    console.error('❌ No token in login response');
    process.exit(1);
  }
  console.log('✅ Logged in');

  // 3. Seed each FAQ
  let created = 0;
  let skipped = 0;

  for (let i = 0; i < faqs.length; i++) {
    const faq = faqs[i];
    process.stdout.write(`  [${i + 1}/${faqs.length}] ${faq.title.slice(0, 60)}…`);

    // Create question
    const qRes = await api('POST', '/questions', {
      title: faq.title,
      description: faq.description,
      tags: [faq.tag],
    }, token);

    if (!qRes.ok) {
      console.log(` ❌ Q failed (${qRes.status})`);
      skipped++;
      continue;
    }

    const questionId = (qRes.data as { data?: { _id?: string } }).data?._id;
    if (!questionId) { console.log(' ❌ No question ID'); skipped++; continue; }

    // Create answer
    const aRes = await api('POST', '/answers', { questionId, content: faq.answer }, token);
    if (!aRes.ok) {
      console.log(` ❌ A failed (${aRes.status})`);
      skipped++;
      continue;
    }

    const answerId = (aRes.data as { data?: { _id?: string } }).data?._id;
    if (!answerId) { console.log(' ❌ No answer ID'); skipped++; continue; }

    // Approve answer (awards SP, sends notification)
    await api('PATCH', `/admin/answers/${answerId}/approve`, {}, token);

    // Mark as best answer
    await api('PATCH', `/admin/answers/${answerId}/best`, {}, token);

    console.log(' ✅');
    created++;
  }

  console.log(`\n🎉 Done! Created: ${created}  Skipped: ${skipped}`);
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Unexpected error:', err.message ?? err);
  process.exit(1);
});
