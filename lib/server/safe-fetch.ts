// A server-only fetch for user-supplied URLs (the recipe importer). Fetching
// an arbitrary address a person pastes in is a classic SSRF vector — this
// refuses anything that isn't a public http(s) host, checks that at every
// redirect hop too (not just the first one), and bounds both time and
// response size so one slow or huge page can't tie up the function.

import dns from 'node:dns/promises';
import net from 'node:net';

const TOTAL_TIMEOUT_MS = 8000;
const MAX_REDIRECTS = 4;
const MAX_BYTES = 2_000_000;

function ipToLong(ip: string): number {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
}

const PRIVATE_IPV4_RANGES: [string, number][] = [
  ['0.0.0.0', 8],
  ['10.0.0.0', 8],
  ['100.64.0.0', 10],
  ['127.0.0.0', 8],
  ['169.254.0.0', 16],
  ['172.16.0.0', 12],
  ['192.0.0.0', 24],
  ['192.0.2.0', 24],
  ['192.168.0.0', 16],
  ['198.18.0.0', 15],
  ['198.51.100.0', 24],
  ['203.0.113.0', 24],
  ['224.0.0.0', 4],
  ['240.0.0.0', 4],
];

function isPrivateIPv4(ip: string): boolean {
  const ipLong = ipToLong(ip);
  return PRIVATE_IPV4_RANGES.some(([base, bits]) => {
    const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0;
    return (ipLong & mask) === (ipToLong(base) & mask);
  });
}

function isPrivateIPv6(ip: string): boolean {
  const lower = ip.toLowerCase();
  return (
    lower === '::1' ||
    lower === '::' ||
    lower.startsWith('fc') ||
    lower.startsWith('fd') ||
    lower.startsWith('fe80') ||
    lower.startsWith('::ffff:127.') ||
    lower.startsWith('::ffff:10.') ||
    lower.startsWith('::ffff:192.168.')
  );
}

function isPrivateIp(ip: string): boolean {
  if (net.isIPv4(ip)) return isPrivateIPv4(ip);
  if (net.isIPv6(ip)) return isPrivateIPv6(ip);
  return true; // Unrecognized shape — refuse rather than guess.
}

async function resolvesToPrivateAddress(hostname: string): Promise<boolean> {
  if (hostname.toLowerCase() === 'localhost') return true;
  if (net.isIP(hostname)) return isPrivateIp(hostname);
  try {
    const records = await dns.lookup(hostname, { all: true });
    return records.length === 0 || records.some((r) => isPrivateIp(r.address));
  } catch {
    return true; // Can't resolve it — nothing safe to fetch.
  }
}

export type FetchFailureReason = 'invalid-url' | 'blocked' | 'fetch-failed';

export type SafeFetchResult =
  | { ok: true; text: string; finalUrl: string }
  | { ok: false; reason: FetchFailureReason };

export async function safeFetchText(rawUrl: string): Promise<SafeFetchResult> {
  let current: URL;
  try {
    current = new URL(rawUrl);
  } catch {
    return { ok: false, reason: 'invalid-url' };
  }

  const deadline = Date.now() + TOTAL_TIMEOUT_MS;

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    if (current.protocol !== 'http:' && current.protocol !== 'https:') {
      return { ok: false, reason: 'invalid-url' };
    }
    if (await resolvesToPrivateAddress(current.hostname)) {
      return { ok: false, reason: 'blocked' };
    }

    const remaining = deadline - Date.now();
    if (remaining <= 0) return { ok: false, reason: 'fetch-failed' };

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), remaining);
    let res: Response;
    try {
      res = await fetch(current.toString(), {
        redirect: 'manual',
        signal: controller.signal,
        headers: {
          'User-Agent': 'SpecialSpoonBot/1.0 (+https://specialspoon.app; recipe import)',
          Accept: 'text/html,application/xhtml+xml',
        },
      });
    } catch {
      clearTimeout(timer);
      return { ok: false, reason: 'fetch-failed' };
    }
    clearTimeout(timer);

    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get('location');
      if (!location) return { ok: false, reason: 'fetch-failed' };
      try {
        current = new URL(location, current);
      } catch {
        return { ok: false, reason: 'fetch-failed' };
      }
      continue;
    }

    if (!res.ok) return { ok: false, reason: 'fetch-failed' };

    const contentType = res.headers.get('content-type') ?? '';
    if (!contentType.includes('html')) {
      return { ok: false, reason: 'fetch-failed' };
    }

    const reader = res.body?.getReader();
    if (!reader) return { ok: false, reason: 'fetch-failed' };
    const chunks: Uint8Array[] = [];
    let received = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      received += value.byteLength;
      if (received > MAX_BYTES) {
        await reader.cancel();
        break;
      }
      chunks.push(value);
    }
    const text = Buffer.concat(chunks.map((c) => Buffer.from(c))).toString('utf-8');
    return { ok: true, text, finalUrl: current.toString() };
  }

  return { ok: false, reason: 'fetch-failed' };
}
