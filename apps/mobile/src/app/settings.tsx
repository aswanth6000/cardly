import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Screen, T, spacing, useTheme } from '@cardly/ui';

import { useVault } from '@/vault-context';

export default function SettingsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { deleteVault, summary } = useVault();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const onDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    await deleteVault();
    router.replace('/');
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
          Settings
        </T>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/backup')}
          style={[styles.section, { backgroundColor: theme.backgroundElevated, borderColor: theme.divider }]}>
          <T variant="bodyLarge">Backup</T>
          <T variant="secondary" color="secondary">
            Your vault stays on this device.
          </T>
          {summary && summary.length > 0 ? (
            <T variant="caption" color="tertiary">
              {summary.length} card{summary.length === 1 ? '' : 's'} stored locally
            </T>
          ) : null}
          <T variant="body" style={{ color: theme.accent, marginTop: spacing.sm }}>
            Manage backup →
          </T>
        </Pressable>

        <View style={[styles.section, { backgroundColor: theme.backgroundElevated, borderColor: theme.divider }]}>
          <T variant="bodyLarge">Danger zone</T>
          <T variant="secondary" color="secondary">
            Delete the vault and all card data from this device.
          </T>
          <Button
            label={confirmDelete ? 'Confirm delete' : 'Delete Vault'}
            variant={confirmDelete ? 'danger' : 'ghost'}
            onPress={onDelete}
            style={styles.button}
          />
        </View>

        <T variant="caption" color="tertiary" style={styles.footer}>
          Cardly v0.1.0 — open source · local-first · no account
        </T>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.lg, paddingBottom: spacing.xxl },
  backButton: { alignSelf: 'flex-start', paddingVertical: spacing.sm },
  title: { marginTop: spacing.md },
  section: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 16, padding: spacing.lg, gap: spacing.sm },
  button: { marginTop: spacing.sm },
  footer: { marginTop: spacing.lg, textAlign: 'center' },
});
