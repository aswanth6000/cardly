import { describe, expect, it } from 'vitest';

import { getLast4, getNetwork } from '../src/card';
import {
  formatCardNumber,
  isExpiryInPast,
  isValidCardNumber,
  isValidCvv,
  isValidExpiry,
  luhnCheck,
  normalizeCardholderNameLive,
  normalizeCardNumber,
  validateCardInput,
} from '../src/validation';

describe('card validation', () => {
  it('normalizes card numbers', () => {
    expect(normalizeCardNumber('4528 1234 5678 4821')).toBe('4528123456784821');
    expect(normalizeCardNumber('4528-1234-5678-4821')).toBe('4528123456784821');
  });

  it('formats card numbers in groups of four', () => {
    expect(formatCardNumber('4528123456784821')).toBe('4528 1234 5678 4821');
    expect(formatCardNumber('378282246310005')).toBe('3782 822463 10005'); // Amex 15-digit
  });

  it('extracts last four', () => {
    expect(getLast4('4528 1234 5678 4821')).toBe('4821');
  });

  it('detects networks', () => {
    expect(getNetwork('4528123456784821')).toBe('visa');
    expect(getNetwork('5555555555554444')).toBe('mastercard');
    expect(getNetwork('378282246310005')).toBe('amex');
    expect(getNetwork('6011111111111117')).toBe('discover');
  });

  it('validates Luhn', () => {
    expect(luhnCheck('4528123456784821')).toBe(true);
    expect(luhnCheck('4528123456784822')).toBe(false);
    expect(isValidCardNumber('4528123456784821')).toBe(true);
    expect(isValidCardNumber('4528123456784822')).toBe(false);
    expect(isValidCardNumber('1234')).toBe(false);
  });

  it('validates expiry', () => {
    expect(isValidExpiry(8, 2029)).toBe(true);
    expect(isValidExpiry(13, 2029)).toBe(false);
    expect(isValidExpiry(0, 2029)).toBe(false);
    expect(isValidExpiry(undefined, undefined)).toBe(false);
  });

  it('rejects expiry dates in the past', () => {
    const now = new Date();
    const pastYear = now.getFullYear() - 1;
    expect(isExpiryInPast(12, pastYear)).toBe(true);
    // Current month is never "in the past" only if it is >= now.
    expect(isExpiryInPast(12, now.getFullYear())).toBe(false);
    // A month before the current month in the current year is in the past.
    if (now.getMonth() > 0) {
      expect(isExpiryInPast(1, now.getFullYear())).toBe(true);
    }
    expect(isExpiryInPast(undefined, undefined)).toBe(true);
  });

  it('keeps spaces while typing a cardholder name (trims only on save)', () => {
    expect(normalizeCardholderNameLive('aswanth ')).toBe('ASWANTH ');
    expect(normalizeCardholderNameLive('aswanth  a')).toBe('ASWANTH A');
    // Whitespace runs collapse to a single space; the save path trims ends.
    expect(normalizeCardholderNameLive('  john   doe  ')).toBe(' JOHN DOE ');
  });

  it('validates CVV', () => {
    expect(isValidCvv('123')).toBe(true);
    expect(isValidCvv('1234', 'amex')).toBe(true);
    expect(isValidCvv('12')).toBe(false);
    expect(isValidCvv('1234')).toBe(false);
    expect(isValidCvv('123', 'amex')).toBe(false);
  });

  it('validates a full card input', () => {
    const good = validateCardInput({
      nickname: 'Travel',
      cardNumber: '4528123456784821',
      expiryMonth: 8,
      expiryYear: 2029,
    });
    expect(good.valid).toBe(true);

    const bad = validateCardInput({
      nickname: '',
      cardNumber: '1234',
      expiryMonth: 13,
      expiryYear: 1999,
    });
    expect(bad.valid).toBe(false);
    expect(bad.errors.map((e) => e.field).sort()).toEqual(['cardNumber', 'expiry', 'nickname']);
  });
});
