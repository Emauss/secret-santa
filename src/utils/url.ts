// Characters that often stick to the end of a pasted link but aren't part of it
const TRAILING_PUNCTUATION = /[).,;:!?'"\]]+$/;
const FULL_URL = /https?:\/\/[^\s<>"']+/i;
// Bare domain like "allegro.pl/oferta/123" or "www.mediaexpert.pl"
const BARE_DOMAIN = /\b(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/[^\s<>"']*)?/i;

const toSafeUrl = (candidate: string): string | null => {
  try {
    const url = new URL(candidate.replace(TRAILING_PUNCTUATION, ''));
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null;
  } catch {
    return null;
  }
};

/**
 * Pulls a usable http(s) link out of whatever was pasted, e.g. a share text like
 * "Wykrywacz z wyświetlaczem - Media Expert https://share.google/abc".
 * Returns null when no link can be found.
 */
export const extractLink = (raw: string | null | undefined): { url: string; textBefore: string } | null => {
  const text = (raw ?? '').trim();
  if (!text) {
    return null;
  }

  const full = text.match(FULL_URL);
  if (full) {
    const url = toSafeUrl(full[0]);
    return url ? { url, textBefore: text.slice(0, full.index).trim() } : null;
  }

  const bare = text.match(BARE_DOMAIN);
  if (bare) {
    const url = toSafeUrl(`https://${bare[0]}`);
    return url ? { url, textBefore: text.slice(0, bare.index).trim() } : null;
  }

  return null;
};

export const normalizeLink = (raw: string | null | undefined): string | null => extractLink(raw)?.url ?? null;
