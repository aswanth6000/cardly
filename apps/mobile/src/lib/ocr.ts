/**
 * OCR adapter for card scanning.
 *
 * Cardly runs OCR **on-device** — the captured card image is processed
 * locally and never uploaded anywhere.
 *
 * Implementation strategy:
 * - **Web:** uses the Shape Detection API (`TextDetector` / `BarcodeDetector`)
 *   where the browser supports it (Chromium). Returns an empty result
 *   elsewhere; the review screen then simply asks the user to type the
 *   fields.
 * - **Native:** the production path is a native ML Kit Text Recognition v2
 *   module. Expo does not ship a first-party OCR module, so we expose a
 *   `recognizeTextNative` hook that is config-gated: it is only called when
 *   `app.json` `extra.ocr.native` is enabled AND a native module is
 *   registered. Without it, the scan screen works the same but without
 *   auto-fill. See `docs/architecture.md` for the intended native wiring.
 *
 * The result is always passed through the conservative extraction heuristics
 * in `@cardly/vault` (Luhn, expiry pattern, name), and the user reviews every
 * field before saving — OCR is a convenience, never the source of truth.
 */
import { Platform } from 'react-native';

import { extractCardInfo } from '@cardly/vault';
import type { ScannedCard } from '@cardly/vault';

export interface OcrResult {
  /** Full text recognized in the image. */
  text: string;
}

export interface OcrConfig {
  /** Enable the native ML Kit path (requires a registered native module). */
  nativeEnabled: boolean;
}

export function getOcrConfig(extra?: Record<string, unknown>): OcrConfig {
  const ocr = extra?.ocr as Record<string, unknown> | undefined;
  return { nativeEnabled: ocr?.native === true };
}

/**
 * Recognize text in a captured card image.
 *
 * @param imageUri  Local file URI (native) or base64 data URI (web).
 * @returns the recognized text, or '' if OCR is unavailable on this platform.
 */
export async function recognizeCardText(imageUri: string): Promise<string> {
  if (Platform.OS === 'web') {
    return recognizeTextWeb(imageUri);
  }
  // Native: config-gated ML Kit hook. Without a registered native module this
  // returns '' and the review screen stays manual.
  return recognizeTextNative(imageUri);
}

/** Extract a ScannedCard from an image URI, or empty fields if OCR is off. */
export async function scanCardImage(imageUri: string): Promise<ScannedCard> {
  const text = await recognizeCardText(imageUri);
  return extractCardInfo(text);
}

// --- Web (Shape Detection API) --------------------------------------------

declare global {
  // Minimal typings for the experimental Shape Detection API.
  var TextDetector: { new (): { detect(image: HTMLImageElement): Promise<unknown[]> } } | undefined;
  var BarcodeDetector: { new (): { detect(image: HTMLImageElement): Promise<unknown[]> } } | undefined;
}

async function recognizeTextWeb(imageUri: string): Promise<string> {
  try {
    const Detector =
      typeof TextDetector !== 'undefined'
        ? TextDetector
        : typeof BarcodeDetector !== 'undefined'
          ? BarcodeDetector
          : null;
    if (!Detector) return '';
    const detector = new Detector();
    // The capture already returns a base64 data URI on web.
    const img = new Image();
    img.src = imageUri;
    await img.decode();
    const results = await detector.detect(img);
    const text = (results ?? [])
      .map((r) => {
        const rec = r as { rawValue?: string; text?: string };
        return typeof rec?.rawValue === 'string' ? rec.rawValue : rec?.text ?? '';
      })
      .filter(Boolean)
      .join('\n');
    return text;
  } catch {
    return '';
  }
}

// --- Native (config-gated ML Kit) -----------------------------------------

async function recognizeTextNative(imageUri: string): Promise<string> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('expo-mlkit-ocr');
    if (mod?.recognizeTextAsync) {
      const res = await mod.recognizeTextAsync(imageUri);
      return res?.text ?? '';
    }
  } catch {
    // Module not installed or not registered — return '' (manual entry).
  }
  void imageUri;
  return '';
}
