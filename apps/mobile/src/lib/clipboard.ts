/**
 * Clipboard helper.
 *
 * Copying a sensitive card value clears it from the clipboard after a short
 * window so it does not linger on the device clipboard. The copied value is
 * never logged and never shown in any UI feedback (the UI says "copied" —
 * never the content).
 */
import * as Clipboard from 'expo-clipboard';

export const SENSITIVE_CLIPBOARD_TTL_MS = 60_000;

export async function copySensitive(value: string): Promise<void> {
  await Clipboard.setStringAsync(value);
  setTimeout(() => {
    // Only clear if the clipboard still holds what we copied.
    Clipboard.getStringAsync().then((current) => {
      if (current === value) {
        Clipboard.setStringAsync('').catch(() => {});
      }
    });
  }, SENSITIVE_CLIPBOARD_TTL_MS);
}

export async function copyPlain(value: string): Promise<void> {
  await Clipboard.setStringAsync(value);
}
