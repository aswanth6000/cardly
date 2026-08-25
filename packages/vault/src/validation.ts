/**
 * Card input validation.
 *
 * All validation lives here (no platform dependencies) so the same rules
 * apply on every screen and in tests.
 */

export interface CardInput {
  nickname: string;
  issuer?: string;
  network?: string;
  cardNumber: string;
  cardholderName?: string;
  expiryMonth?: number;
  expiryYear?: number;
  cvv?: string;
  notes?: string;
}

export type FieldError = { field: string; message: string };

export interface ValidationResult {
  valid: boolean;
  errors: FieldError[];
}

export function normalizeCardNumber(raw: string): string {
  return raw.replace(/[^\d]/g, '');
}

export function normalizeCardholderName(raw: string): string {
  return raw.trim().replace(/\s+/g, ' ').toUpperCase();
}

/** Normalize for live input: uppercase but keep the trailing space the user
 *  is typing (unlike normalizeCardholderName which trims). */
export function normalizeCardholderNameLive(raw: string): string {
  return raw.replace(/\s+/g, ' ').toUpperCase();
}

export function formatCardNumber(raw: string): string {
  const digits = normalizeCardNumber(raw);
  if (digits.length === 15) {
    return digits.replace(/(\d{4})(\d{6})(\d{5})/, '$1 $2 $3');
  }
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
}

export function formatExpiry(month?: number, year?: number): string {
  if (!month && !year) return '';
  const m = month ? String(month).padStart(2, '0') : '??';
  const y = year ? String(year).padStart(2, '0') : '??';
  return `${m} / ${y}`;
}

export function isValidCardNumber(raw: string): boolean {
  const digits = normalizeCardNumber(raw);
  if (!/^\d{13,19}$/.test(digits)) return false;
  return luhnCheck(digits);
}

export function luhnCheck(digits: string): boolean {
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

export function isValidExpiry(month?: number, year?: number): boolean {
  if (!month || !year) return false;
  if (month < 1 || month > 12) return false;
  if (year < 2000 || year > 2100) return false;
  return true;
}

/** Expiry must be valid AND not already past (compared to the current
 *  month/year). */
export function isExpiryInPast(month?: number, year?: number): boolean {
  if (!isValidExpiry(month, year)) return true;
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  if ((year ?? 0) < currentYear) return true;
  if ((year ?? 0) === currentYear && (month ?? 0) < currentMonth) return true;
  return false;
}

/** Normalize an expiry year entry: accepts 2 or 4 digits. */
export function normalizeExpiryYear(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 4);
  return digits;
}

export function isValidCvv(cvv: string | undefined, network?: string): boolean {
  if (!cvv) return true;
  const digits = normalizeCardNumber(cvv);
  if (network === 'amex') return /^\d{4}$/.test(digits);
  return /^\d{3}$/.test(digits);
}

export function validateCardInput(input: CardInput): ValidationResult {
  const errors: FieldError[] = [];
  const cardNumber = normalizeCardNumber(input.cardNumber);

  if (!input.nickname.trim()) {
    errors.push({ field: 'nickname', message: 'Give your card a nickname.' });
  }
  if (!cardNumber) {
    errors.push({ field: 'cardNumber', message: 'Card number is required.' });
  } else if (!isValidCardNumber(cardNumber)) {
    errors.push({ field: 'cardNumber', message: 'That card number is not valid.' });
  }
  if (input.cardholderName && input.cardholderName.trim().length < 2) {
    errors.push({ field: 'cardholderName', message: 'Cardholder name looks too short.' });
  }
  if (isExpiryInPast(input.expiryMonth, input.expiryYear)) {
    errors.push({ field: 'expiry', message: 'The expiry date is invalid or in the past.' });
  }
  if (!isValidCvv(input.cvv, input.network)) {
    errors.push({ field: 'cvv', message: 'CVV must be 3 or 4 digits.' });
  }

  return { valid: errors.length === 0, errors };
}
