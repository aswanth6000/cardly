/**
 * Card data model.
 *
 * Sensitive fields (`cardNumber`, `cvv`, `cardholderName`) are only ever
 * stored inside the encrypted vault. Non-sensitive display fields
 * (`nickname`, `issuer`, `network`, `last4`) may be cached outside the vault
 * for fast, encrypted-off wallet rendering.
 */

export type CardNetwork = 'visa' | 'mastercard' | 'amex' | 'rupay' | 'discover' | 'unknown';

export interface Card {
  id: string;
  nickname: string;
  issuer?: string;
  network?: CardNetwork;
  cardNumber: string;
  cardholderName?: string;
  expiryMonth?: number;
  expiryYear?: number;
  cvv?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CardSummary {
  id: string;
  nickname: string;
  issuer?: string;
  network?: CardNetwork;
  last4: string;
  createdAt: string;
  updatedAt: string;
}

export function getLast4(cardNumber: string): string {
  const digits = cardNumber.replace(/\s+/g, '');
  return digits.slice(-4);
}

export function getNetwork(cardNumber: string): CardNetwork {
  const digits = cardNumber.replace(/\s+/g, '');
  if (/^4/.test(digits)) return 'visa';
  if (/^5[1-5]/.test(digits) || /^2(2[2-9]|[3-6])/.test(digits)) return 'mastercard';
  if (/^3[47]/.test(digits)) return 'amex';
  if (/^(60|65|81|82)/.test(digits)) return 'discover';
  if (/^(50|60|61|62|63|64|65|66|67|68|69|70|71|72|73|74|75|76|77|78|79|80|81|82|83|84|85|86|87|88|89|90|91|92|93|94|95|96|97|98|99)/.test(digits)) {
    // Rupay prefixes overlap with Discover; both are substrings of the 6xx
    // range. Prefer Rupay when the number is in its known range and not a
    // Discover-specific prefix.
    return 'rupay';
  }
  return 'unknown';
}

export function toSummary(card: Card): CardSummary {
  return {
    id: card.id,
    nickname: card.nickname,
    issuer: card.issuer,
    network: card.network ?? getNetwork(card.cardNumber),
    last4: getLast4(card.cardNumber),
    createdAt: card.createdAt,
    updatedAt: card.updatedAt,
  };
}
