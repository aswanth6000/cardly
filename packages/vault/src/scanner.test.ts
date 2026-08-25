import { describe, expect, it } from 'vitest';

import { extractCardInfo, findCardNumber, findExpiry, findCardholderName } from '../src/scanner';

describe('card text extraction', () => {
  it('extracts a card number from formatted OCR text', () => {
    const text = 'VISA\n4528 1234 5678 4821\n08/29\nASWANTH A';
    expect(findCardNumber(text)).toBe('4528123456784821');
    expect(findExpiry(text)).toEqual({ month: 8, year: 2029 });
    expect(findCardholderName(text)).toBe('ASWANTH A');
  });

  it('extracts a full card info object', () => {
    const info = extractCardInfo('MASTERCARD 5555 5555 5555 4444 VALID THRU 11/30 JANE Q PUBLIC');
    expect(info.cardNumber).toBe('5555555555554444');
    expect(info.expiryMonth).toBe(11);
    expect(info.expiryYear).toBe(2030);
    expect(info.cardholderName).toBe('JANE Q PUBLIC');
  });

  it('handles expiry with 4-digit year and separators', () => {
    expect(findExpiry('EXP 08/2029')).toEqual({ month: 8, year: 2029 });
    expect(findExpiry('08-29')).toEqual({ month: 8, year: 2029 });
    expect(findExpiry('08 29')).toEqual({ month: 8, year: 2029 });
  });

  it('does not hallucinate an invalid card number', () => {
    expect(findCardNumber('this is not a card 1234')).toBeUndefined();
    expect(findCardNumber('4528 1234 5678 4822')).toBeUndefined(); // bad Luhn
  });

  it('ignores long digit runs that are not cards', () => {
    // A phone number is 10 digits — not long enough.
    expect(findCardNumber('call 5551234567 now')).toBeUndefined();
  });

  it('returns undefined fields when nothing is found', () => {
    const info = extractCardInfo('nothing here');
    expect(info.cardNumber).toBeUndefined();
    expect(info.expiryMonth).toBeUndefined();
    expect(info.cardholderName).toBeUndefined();
  });
});
