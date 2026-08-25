/**
 * Google Drive backup provider.
 *
 * Cardly never sees the backup contents: the file uploaded to Drive is the
 * encrypted backup JSON produced by `@cardly/backup`. Google Drive is an
 * optional backup location controlled entirely by the user.
 *
 * OAuth uses `expo-auth-session`'s Google provider with the *minimum* scope
 * needed to write one file: `https://www.googleapis.com/auth/drive.file`.
 *
 * The Google OAuth client ID is NOT baked into the app. It is configured via
 * `app.json` `extra.googleDrive.clientId` (or `EXPO_PUBLIC_GOOGLE_DRIVE_CLIENT_ID`
 * at build time). Without it, the Drive feature is disabled and the UI says
 * so — no fake "connected" state.
 */
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

import { createKeyValueStore } from '@cardly/storage';
import type { KeyValueStore } from '@cardly/storage';

const DRIVE_FILE_SCOPE = 'https://www.googleapis.com/auth/drive.file';
const TOKEN_KEY = 'cardly.drive-token';

WebBrowser.maybeCompleteAuthSession();

export interface DriveConfig {
  clientId: string | null;
}

export function getDriveConfig(extra?: Record<string, unknown>): DriveConfig {
  const fromEnv = process.env.EXPO_PUBLIC_GOOGLE_DRIVE_CLIENT_ID;
  const fromExtra = (extra?.googleDrive as Record<string, unknown> | undefined)?.clientId;
  const clientId = typeof fromEnv === 'string' && fromEnv ? fromEnv : typeof fromExtra === 'string' ? fromExtra : null;
  return { clientId };
}

export function useGoogleDriveAuth(clientId: string | null) {
  const discovery = AuthSession.useAutoDiscovery('https://accounts.google.com');
  const redirectUri = AuthSession.makeRedirectUri();

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: clientId ?? undefined,
      scopes: [DRIVE_FILE_SCOPE],
      redirectUri,
      usePKCE: true,
      extraParams: { access_type: 'offline', prompt: 'consent' },
    },
    discovery,
  );

  return { request, response, promptAsync, redirectUri, discovery };
}

export interface DriveToken {
  accessToken: string;
  refreshToken?: string | null;
  expiresAt: number;
}

export async function persistDriveToken(token: DriveToken, store: KeyValueStore = createKeyValueStore()): Promise<void> {
  await store.setItem(TOKEN_KEY, JSON.stringify(token));
}

export async function readDriveToken(store: KeyValueStore = createKeyValueStore()): Promise<DriveToken | null> {
  const raw = await store.getItem(TOKEN_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as DriveToken;
  } catch {
    return null;
  }
}

export async function clearDriveToken(store: KeyValueStore = createKeyValueStore()): Promise<void> {
  await store.deleteItem(TOKEN_KEY);
}

/**
 * Upload the encrypted backup text to Drive as a `.cardly` file using the
 * Drive API v3 `files.create` with a media upload.
 */
export async function uploadBackupToDrive(
  accessToken: string,
  fileName: string,
  content: string,
): Promise<{ id: string; name: string }> {
  const boundary = 'cardly-boundary-' + Date.now();
  const body = [
    `--${boundary}`,
    'Content-Type: application/json; charset=UTF-8',
    '',
    JSON.stringify({ name: fileName, mimeType: 'application/octet-stream' }),
    `--${boundary}`,
    'Content-Type: application/octet-stream',
    '',
    content,
    `--${boundary}--`,
  ].join('\r\n');

  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body,
  });

  if (!res.ok) {
    throw new Error(`Drive upload failed (${res.status})`);
  }
  const json = (await res.json()) as { id?: string; name?: string };
  return { id: json.id ?? '', name: json.name ?? fileName };
}

/**
 * Refresh an expired access token using the stored refresh token.
 * Returns null if the token is still fresh or cannot be refreshed.
 */
export async function refreshDriveToken(
  clientId: string,
  refreshToken: string,
): Promise<{ accessToken: string; expiresIn: number } | null> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }).toString(),
  });
  if (!res.ok) return null;
  const json = (await res.json()) as { access_token?: string; expires_in?: number };
  if (!json.access_token) return null;
  return { accessToken: json.access_token, expiresIn: json.expires_in ?? 3600 };
}

/** Human-friendly note about the platform (used for the connected label). */
export function drivePlatformLabel(): string {
  return Platform.OS === 'ios' ? 'iOS' : Platform.OS === 'android' ? 'Android' : 'Web';
}

export { DRIVE_FILE_SCOPE };
