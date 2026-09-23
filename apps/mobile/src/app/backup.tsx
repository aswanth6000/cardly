import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import { Directory, File, Paths } from 'expo-file-system';
import Constants from 'expo-constants';

import {
  Button,
  FeedbackBanner,
  IconCloud,
  IconDocument,
  IconKey,
  IconShield,
  ListRow,
  PageHeader,
  Screen,
  Section,
  SectionHeader,
  T,
  TextField,
  spacing,
  useTheme,
} from '@cardly/ui';

import { BackButton } from '@/components/back-button';
import { FadeIn } from '@/components/fade-in';
import { useVault } from '@/vault-context';
import {
  clearDriveToken,
  downloadBackupFile,
  getDriveConfig,
  getValidAccessToken as getValidAccessTokenFromLib,
  listBackupFiles,
  persistDriveToken,
  readDriveToken,
  uploadBackupToDrive,
  useGoogleDriveAuth,
} from '@/lib/drive';
import type { DriveToken } from '@/lib/drive';

export default function BackupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { summary, hasRecoveryKey, setRecoveryPassword, exportBackup, importBackup } = useVault();

  const [recoveryPassword, setRecoveryPasswordState] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const driveConfig = getDriveConfig(Constants.expoConfig?.extra as Record<string, unknown> | undefined);
  const driveAuth = useGoogleDriveAuth(driveConfig.clientId);
  const [driveToken, setDriveToken] = useState<DriveToken | null>(null);
  const [driveBusy, setDriveBusy] = useState(false);
  const [driveFiles, setDriveFiles] = useState<{ id: string; name: string }[] | null>(null);

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

  useEffect(() => {
    readDriveToken().then(setDriveToken).catch(() => {});
  }, []);

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
        persistDriveToken(token)
          .then(() => setDriveToken(token))
          .catch(() => setError('Could not save the Drive connection.'));
      }
    } else if (driveAuth.response.type === 'error') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError('Google sign-in did not complete.');
    }
  }, [driveAuth.response]);

  const getValidAccessToken = () => getValidAccessTokenFromLib(driveConfig.clientId);

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
    setDriveFiles(null);
    setMessage('Disconnected from Google Drive.');
  };

  const onDriveRestoreList = async () => {
    clearFeedback();
    setDriveBusy(true);
    try {
      const accessToken = await getValidAccessToken();
      if (!accessToken) {
        setError('Connect Google Drive first.');
        return;
      }
      const files = await listBackupFiles(accessToken);
      setDriveFiles(files);
      if (files.length === 0) {
        setMessage('No Cardly backups found in Drive.');
      }
    } catch {
      setError('Could not list backups in Google Drive.');
    } finally {
      setDriveBusy(false);
    }
  };

  const onDriveRestore = async (fileId: string, name: string) => {
    clearFeedback();
    if (!recoveryPassword) {
      setError('Enter the recovery password for this backup.');
      return;
    }
    setDriveBusy(true);
    try {
      const accessToken = await getValidAccessToken();
      if (!accessToken) {
        setError('Connect Google Drive first.');
        return;
      }
      const text = await downloadBackupFile(accessToken, fileId);
      await importBackup(text, recoveryPassword);
      setDriveFiles(null);
      setMessage(`Vault restored from ${name}.`);
      router.back();
    } catch {
      setError('Could not restore this backup. Wrong password or corrupted file.');
    } finally {
      setDriveBusy(false);
    }
  };

  return (
    <Screen padded>
      <ScrollView
        contentContainerStyle={[styles.container, { paddingTop: insets.top + spacing.lg }]}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}>
        <BackButton onPress={() => router.back()} />

        <FadeIn>
          <PageHeader
            eyebrow="Recovery kit"
            title="Backup"
            icon={<IconShield size={28} color={theme.text} />}
            description={`Your vault stays on this device. ${cardCount} card${cardCount === 1 ? '' : 's'} stored locally.`}
          />
        </FadeIn>

        <FadeIn delay={70}>
          <Section>
            <SectionHeader icon={<IconKey size={18} color={theme.text} />} label="Recovery kit" />
            <T variant="bodyLarge">Recovery password</T>
            <T variant="body" color="secondary">
              {hasRecoveryKey
                ? 'Your vault is protected by a recovery password.'
                : 'Set a recovery password to enable encrypted backups. Cardly cannot recover it if you forget it.'}
            </T>
            <TextField
              label="Recovery password"
              value={recoveryPassword}
              onChangeText={setRecoveryPasswordState}
              placeholder="At least 8 characters"
              secureTextEntry
              autoCapitalize="none"
            />
            <TextField
              label="Confirm password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Repeat the password"
              secureTextEntry
              autoCapitalize="none"
            />
            <Button
              label={hasRecoveryKey ? 'Update Recovery Password' : 'Save Recovery Password'}
              onPress={saveRecoveryPassword}
              disabled={busy}
              loading={busy}
            />
          </Section>
        </FadeIn>

        <FadeIn delay={140}>
          <Section tone="subtle">
            <SectionHeader icon={<IconDocument size={18} color={theme.text} />} label="Portable vault" />
            <T variant="bodyLarge">Encrypted export</T>
            <T variant="body" color="secondary">
              Exports an encrypted file only you can open, using your recovery password.
            </T>
            <Button label="Export Backup" variant="secondary" onPress={onExport} disabled={busy} loading={busy} />
            <Button label="Import Backup" variant="secondary" onPress={onImport} disabled={busy} />
          </Section>
        </FadeIn>

        <FadeIn delay={210}>
          <Section>
            <SectionHeader icon={<IconCloud size={18} color={theme.text} />} label="Optional sync" />
            <T variant="bodyLarge">Google Drive</T>
            <T variant="body" color="secondary">
              {driveConfig.clientId
                ? 'Your vault is encrypted before it leaves this device. Cardly cannot read your backup.'
                : 'Google Drive backup is not configured for this build. Set a Google OAuth client ID in app.json extra.googleDrive.clientId to enable it.'}
            </T>
            {driveToken ? (
              <>
                <T variant="caption" color="tertiary">
                  Connected to Google Drive
                </T>
                <Button label="Back Up to Drive" onPress={onDriveBackup} disabled={driveBusy} loading={driveBusy} />
                <Button label="Restore from Drive" variant="secondary" onPress={onDriveRestoreList} disabled={driveBusy} />
                {driveFiles !== null && (
                  <View style={styles.fileList}>
                    {driveFiles.length === 0 ? (
                      <T variant="caption" color="tertiary">
                        No backups found.
                      </T>
                    ) : (
                      driveFiles.map((f) => (
                        <ListRow
                          key={f.id}
                          label={f.name}
                          detail="Encrypted Cardly backup"
                          action="Restore"
                          icon={<IconCloud size={16} color={theme.textSecondary} />}
                          onPress={() => onDriveRestore(f.id, f.name)}
                        />
                      ))
                    )}
                  </View>
                )}
                <Button label="Disconnect" variant="ghost" onPress={onDriveDisconnect} disabled={driveBusy} />
              </>
            ) : (
              driveConfig.clientId && (
                <Button label="Connect Google Drive" onPress={onDriveConnect} disabled={driveBusy} />
              )
            )}
          </Section>
        </FadeIn>

        {message ? (
          <FadeIn>
            <FeedbackBanner tone="success">
              {message}
            </FeedbackBanner>
          </FadeIn>
        ) : null}
        {error ? (
          <FadeIn>
            <FeedbackBanner tone="error">
              {error}
            </FeedbackBanner>
          </FadeIn>
        ) : null}
      </ScrollView>
    </Screen>
  );
}




const styles = StyleSheet.create({
  container: { gap: spacing.lg, paddingBottom: spacing.xxl },
  fileList: { gap: spacing.sm },
});
