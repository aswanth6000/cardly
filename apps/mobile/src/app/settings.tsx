import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  Button,
  Chip,
  IconDocument,
  IconGear,
  IconShield,
  IconTrash,
  ListRow,
  PageHeader,
  Screen,
  Section,
  SectionHeader,
  T,
  spacing,
  useTheme,
} from '@cardly/ui';

import { BackButton } from '@/components/back-button';
import { CardlyLogo } from '@/components/cardly-logo';
import { FadeIn } from '@/components/fade-in';
import { useVault } from '@/vault-context';

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
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
      <ScrollView
        contentContainerStyle={[styles.container, { paddingTop: insets.top + spacing.lg }]}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}>
        <BackButton onPress={() => router.back()} />

        <FadeIn>
          <PageHeader
            eyebrow="Control room"
            title="Settings"
            icon={<IconGear size={28} color={theme.text} />}
          />
        </FadeIn>

        <FadeIn delay={70}>
          <ListRow
            label="Backup & recovery"
            detail={`${summary?.length ?? 0} card${summary?.length === 1 ? '' : 's'} stored locally`}
            action="Manage"
            icon={<IconShield size={20} color={theme.text} />}
            onPress={() => router.push('/backup')}
          />
        </FadeIn>

        <FadeIn delay={140}>
          <Section tone="subtle">
            <SectionHeader icon={<IconTrash size={18} color={theme.danger} />} label="Danger zone" />
            <T variant="bodyLarge">Delete this vault</T>
            <T variant="body" color="secondary">
              Delete the vault and all card data from this device.
            </T>
            <Button
              label={confirmDelete ? 'Confirm delete' : 'Delete Vault'}
              variant={confirmDelete ? 'danger' : 'ghost'}
              onPress={onDelete}
            />
          </Section>
        </FadeIn>

        <FadeIn delay={210}>
          <ListRow
            label="Privacy policy"
            detail="How Cardly handles your data"
            action="Read"
            icon={<IconDocument size={20} color={theme.text} />}
            onPress={() => router.push('/privacy')}
          />
        </FadeIn>

        <FadeIn delay={280}>
          <View style={styles.brandFooter}>
            <CardlyLogo variant="full" width={110} />
            <Chip tone="muted" style={styles.versionChip}>
              v0.2.0
            </Chip>
          </View>
        </FadeIn>

        <T variant="caption" color="tertiary" style={styles.footer}>
          Open source · local-first · no account
        </T>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.lg, paddingBottom: spacing.xxl },
  footer: { textAlign: 'center' },
  versionChip: { alignSelf: 'center' },
  brandFooter: {
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
});
