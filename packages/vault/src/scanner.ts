/**
 * Card text extraction from OCR results.
 *
 * This is deliberately conservative: OCR is a convenience, not a source of
 * truth. We extract candidate fields with simple, auditable heuristics and
 * leave the final decision to the user in the review screen.
 */

export interface ScannedCard {
  cardNumber?: string;
  expiryMonth?: number;
  expiryYear?: number;
  cardholderName?: string;
}

const CARD_GROUP_RE = /(?:\d{4}[ ]?){3,4}\d{1,4}|\d{4}[ ]?\d{6}[ ]?\d{5}/;

/**
 * Find the most plausible card number by matching the **digit-grouping**
 * shape of a card (groups of 4, or Amex 4-6-5), then verifying Luhn.
 * This avoids accidentally gluing the card number to an adjacent expiry.
 */
export function findCardNumber(text: string): string | undefined {
  const matches = text.match(CARD_GROUP_RE) ?? [];
  let best: string | undefined;
  for (const raw of matches) {
    const digits = raw.replace(/\s/g, '');
    if (digits.length < 13 || digits.length > 19) continue;
    if (!luhn(digits)) continue;
    if (!best || digits.length > best.length) best = digits;
  }
  return best;
}

/** Find the first expiry like 08/29, 08-29, 08 29, or 0829. */
export function findExpiry(text: string): { month?: number; year?: number } {
  const patterns = [
    /\b(0[1-9]|1[0-2])\s*[/\-.]\s*(\d{2}|\d{4})\b/,
    /\b(0[1-9]|1[0-2])\s{1,3}(\d{2})\b/,
  ];
  for (const re of patterns) {
    const m = re.exec(text);
    if (m) {
      const month = Number(m[1]);
      let year = Number(m[2]);
      if (year < 100) year += 2000;
      return { month, year };
    }
  }
  return {};
}

/**
 * Find the most plausible cardholder name: an ALL-CAPS 2-4 word name.
 * Filters out common label words that OCR will pick up. Prefers the last
 * candidate (names usually come after numbers and expiries).
 */
export function findCardholderName(text: string): string | undefined {
  const NOISE = new Set(['VALID', 'THRU', 'FROM', 'EXPIRES', 'EXPIRY', 'MEMBER', 'CARD', 'BANK', 'VISA', 'MASTERCARD', 'AMEX', 'RUPAY', 'SINCE', 'GOOD']);
  const re = /\b([A-Z][A-Z'.-]*(?:\s+[A-Z][A-Z'.-]*){1,3})\b/g;
  const candidates: string[] = [];
  for (const m of text.matchAll(re)) {
    const name = m[1].trim();
    const words = name.split(/\s+/).filter((w) => !NOISE.has(w));
    if (words.length >= 2 && words.length <= 4) {
      candidates.push(words.join(' '));
    }
  }
  if (candidates.length === 0) return undefined;
  return candidates[candidates.length - 1];
}

export function extractCardInfo(text: string): ScannedCard {
  const { month, year } = findExpiry(text);
  return {
    cardNumber: findCardNumber(text),
    expiryMonth: month,
    expiryYear: year,
    cardholderName: findCardholderName(text),
  };
}

export function luhn(digits: string): boolean {
  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = digits.charCodeAt(i) - 48;
    if (double) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    double = !double;
  }
  return sum % 10 === 0;
}
