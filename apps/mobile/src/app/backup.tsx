import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import { Directory, File, Paths } from 'expo-file-system';
import Constants from 'expo-constants';

import { Button, Screen, T, radius, spacing, useTheme } from '@cardly/ui';

import { useVault } from '@/vault-context';
import {
  clearDriveToken,
  getDriveConfig,
  persistDriveToken,
  readDriveToken,
  refreshDriveToken,
  uploadBackupToDrive,
  useGoogleDriveAuth,
} from '@/lib/drive';
import type { DriveToken } from '@/lib/drive';

export default function BackupScreen() {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { summary, hasRecoveryKey, setRecoveryPassword, exportBackup, importBackup } = useVault();

  const [recoveryPassword, setRecoveryPasswordState] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Google Drive
  const driveConfig = getDriveConfig(Constants.expoConfig?.extra as Record<string, unknown> | undefined);
  const driveAuth = useGoogleDriveAuth(driveConfig.clientId);
  const [driveToken, setDriveToken] = useState<DriveToken | null>(null);
  const [driveBusy, setDriveBusy] = useState(false);

  const inputStyle = [
    styles.input,
    { backgroundColor: theme.backgroundElevated, color: theme.text, borderColor: theme.divider },
  ];

  const clearFeedback = () => {
    setMessage(null);
    setError(null);
  };

  const saveRecoveryPassword = async () => {
    clearFeedback();
    if (recoveryPassword.length < 8) {
      setError('Use at least 8 characters.');
      return;
    }
    if (recoveryPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setBusy(true);
    try {
      await setRecoveryPassword(recoveryPassword);
      setMessage('Recovery password saved. You can now create a backup.');
      setConfirmPassword('');
    } catch {
      setError('Could not save the recovery password.');
    } finally {
      setBusy(false);
    }
  };

  const onExport = async () => {
    clearFeedback();
    if (!recoveryPassword) {
      setError('Enter your recovery password first.');
      return;
    }
    setBusy(true);
    try {
      const { json, fileName } = await exportBackup(recoveryPassword);
      const dir = new Directory(Paths.document, 'Cardly');
      dir.create({ idempotent: true, intermediates: true });
      const file = new File(dir, fileName);
      file.create({ overwrite: true });
      file.write(json);
      setMessage(`Backup saved to ${fileName}`);
    } catch {
      setError('Could not create the backup. Check your recovery password.');
    } finally {
      setBusy(false);
    }
  };

  const onImport = async () => {
    clearFeedback();
    const result = await DocumentPicker.getDocumentAsync({
      type: '*/*',
      copyToCacheDirectory: true,
      multiple: false,
    });
    if (result.canceled || !result.assets?.length) return;
    const asset = result.assets[0];
    try {
      const file = new File(asset.uri);
      const text = await file.text();
      if (!recoveryPassword) {
        setError('Enter the recovery password for this backup.');
        return;
      }
      setBusy(true);
      await importBackup(text, recoveryPassword);
      setMessage('Vault restored from backup.');
      router.back();
    } catch {
      setError('Could not restore this backup. Wrong password or corrupted file.');
    } finally {
      setBusy(false);
    }
  };

  const cardCount = summary?.length ?? 0;

  // Load any stored Drive token on mount.
  useEffect(() => {
    readDriveToken().then(setDriveToken).catch(() => {});
  }, []);

  // Handle the OAuth response: exchange code → token, then persist.
  useEffect(() => {
    if (!driveAuth.response) return;
    if (driveAuth.response.type === 'success') {
      const auth = driveAuth.response.authentication;
      if (auth?.accessToken) {
        const token: DriveToken = {
          accessToken: auth.accessToken,
          refreshToken: auth.refreshToken ?? null,
          expiresAt: Date.now() + (auth.expiresIn ?? 3600) * 1000,
        };
        // Async persistence then state update — safe, not a render loop.
        persistDriveToken(token)
          .then(() => setDriveToken(token))
          .catch(() => setError('Could not save the Drive connection.'));
      }
    } else if (driveAuth.response.type === 'error') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError('Google sign-in did not complete.');
    }
  }, [driveAuth.response]);

  const getValidAccessToken = async (): Promise<string | null> => {
    let token = driveToken ?? (await readDriveToken());
    if (!token) return null;
    if (token.expiresAt > Date.now() + 60_000) return token.accessToken;
    if (token.refreshToken && driveConfig.clientId) {
      const refreshed = await refreshDriveToken(driveConfig.clientId, token.refreshToken);
      if (refreshed) {
        const next: DriveToken = {
          accessToken: refreshed.accessToken,
          refreshToken: token.refreshToken,
          expiresAt: Date.now() + refreshed.expiresIn * 1000,
        };
        await persistDriveToken(next);
        setDriveToken(next);
        return next.accessToken;
      }
    }
    return null;
  };

  const onDriveConnect = async () => {
    clearFeedback();
    if (!driveConfig.clientId) return;
    const result = await driveAuth.promptAsync();
    if (result.type === 'success' && result.authentication?.accessToken) {
      const token: DriveToken = {
        accessToken: result.authentication.accessToken,
        refreshToken: result.authentication.refreshToken ?? null,
        expiresAt: Date.now() + (result.authentication.expiresIn ?? 3600) * 1000,
      };
      await persistDriveToken(token);
      setDriveToken(token);
      setMessage('Connected to Google Drive.');
    }
  };

  const onDriveBackup = async () => {
    clearFeedback();
    if (!recoveryPassword) {
      setError('Enter your recovery password first.');
      return;
    }
    setDriveBusy(true);
    try {
      const accessToken = await getValidAccessToken();
      if (!accessToken) {
        setError('Connect Google Drive first.');
        return;
      }
      const { json, fileName } = await exportBackup(recoveryPassword);
      const result = await uploadBackupToDrive(accessToken, fileName, json);
      setMessage(`Backed up to Google Drive (${result.name}).`);
    } catch {
      setError('Could not back up to Google Drive.');
    } finally {
      setDriveBusy(false);
    }
  };

  const onDriveDisconnect = async () => {
    await clearDriveToken();
    setDriveToken(null);
    setMessage('Disconnected from Google Drive.');
  };

  return (
    <Screen padded>
      <ScrollView contentContainerStyle={[styles.container, { paddingTop: insets.top + spacing.lg }]}>
        <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
          <T variant="body" color="secondary">
            Back
          </T>
        </Pressable>

        <T variant="hero" style={styles.title}>
          Backup
        </T>
        <T variant="secondary" color="secondary">
          Your vault stays on this device. {cardCount} card{cardCount === 1 ? '' : 's'} stored locally.
        </T>

        <View style={[styles.section, { backgroundColor: theme.backgroundElevated, borderColor: theme.divider }]}>
          <T variant="bodyLarge">Recovery password</T>
          <T variant="secondary" color="secondary">
            {hasRecoveryKey
              ? 'Your vault is protected by a recovery password.'
              : 'Set a recovery password to enable encrypted backups. Cardly cannot recover it if you forget it.'}
          </T>
          <Field label="Recovery password">
            <TextInput
              value={recoveryPassword}
              onChangeText={setRecoveryPasswordState}
              placeholder="At least 8 characters"
              placeholderTextColor={theme.textTertiary}
              style={inputStyle}
              secureTextEntry
              autoCapitalize="none"
            />
          </Field>
          <Field label="Confirm password">
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Repeat the password"
              placeholderTextColor={theme.textTertiary}
              style={inputStyle}
              secureTextEntry
              autoCapitalize="none"
            />
          </Field>
          <Button label={hasRecoveryKey ? 'Update Recovery Password' : 'Save Recovery Password'} onPress={saveRecoveryPassword} disabled={busy} />
        </View>

        <View style={[styles.section, { backgroundColor: theme.backgroundElevated, borderColor: theme.divider }]}>
          <T variant="bodyLarge">Encrypted export</T>
          <T variant="secondary" color="secondary">
            Exports an encrypted file only you can open, using your recovery password.
          </T>
          <Button label="Export Backup" variant="secondary" onPress={onExport} disabled={busy} />
          <Button label="Import Backup" variant="secondary" onPress={onImport} disabled={busy} />
        </View>

        <View style={[styles.section, { backgroundColor: theme.backgroundElevated, borderColor: theme.divider }]}>
          <T variant="bodyLarge">Google Drive</T>
          <T variant="secondary" color="secondary">
            {driveConfig.clientId
              ? 'Your vault is encrypted before it leaves this device. Cardly cannot read your backup.'
              : 'Google Drive backup is not configured for this build. Set a Google OAuth client ID in app.json extra.googleDrive.clientId to enable it.'}
          </T>
          {driveToken ? (
            <>
              <T variant="caption" color="tertiary">
                Connected to Google Drive
              </T>
              <Button label="Back Up to Drive" onPress={onDriveBackup} disabled={driveBusy} />
              <Button label="Disconnect" variant="ghost" onPress={onDriveDisconnect} disabled={driveBusy} />
            </>
          ) : (
            driveConfig.clientId && (
              <Button label="Connect Google Drive" onPress={onDriveConnect} disabled={driveBusy} />
            )
          )}
        </View>

        {message && <T variant="caption" style={{ color: theme.textSecondary }}>{message}</T>}
        {error && <T variant="caption" style={{ color: theme.danger }}>{error}</T>}
      </ScrollView>
    </Screen>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <T variant="caption" color="secondary">
        {label}
      </T>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.lg, paddingBottom: spacing.xxl },
  backButton: { alignSelf: 'flex-start', paddingVertical: spacing.sm },
  title: { marginTop: spacing.md },
  section: { borderWidth: StyleSheet.hairlineWidth, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.md },
  field: { gap: spacing.xs },
  input: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: 16,
  },
});
