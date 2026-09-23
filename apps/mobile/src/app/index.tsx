import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as LocalAuthentication from 'expo-local-authentication';

import {
  Button,
  Chip,
  IconClose,
  IconGear,
  IconLock,
  IconPlus,
  IconSearch,
  IconShield,
  PageHeader,
  Screen,
  Section,
  T,
  borderWidth,
  displayFont,
  hardShadow,
  radius,
  spacing,
  useTheme,
} from '@cardly/ui';

import { CardVisual } from '@/components/card-visual';
import { CardlyLogo } from '@/components/cardly-logo';
import { FadeIn } from '@/components/fade-in';
import { PressScale } from '@/components/press-scale';
import { useVault } from '@/vault-context';

const CARD_GAP = 18;

export default function WalletScreen() {
  const router = useRouter();
  const { summary, locked, vault, unlock, ready } = useVault();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');

  const count = summary?.length ?? 0;
  const cards = summary ?? [];
  const showLock = ready && locked && vault !== null;

  // Filter cards by nickname, issuer/bank name, card network, cardholder name, last 4 digits
  const filteredCards = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return cards;
    return cards.filter((card) => {
      const matchNickname = card.nickname?.toLowerCase().includes(q);
      const matchIssuer = card.issuer?.toLowerCase().includes(q);
      const matchNetwork = card.network?.toLowerCase().includes(q);
      const matchHolder = card.cardholderName?.toLowerCase().includes(q);
      const matchLast4 = card.last4?.includes(q);
      return matchNickname || matchIssuer || matchNetwork || matchHolder || matchLast4;
    });
  }, [cards, searchQuery]);

  const onUnlockPress = async () => {
    const supported = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    if (!supported || !enrolled) {
      await unlock();
      return;
    }
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Unlock Cardly',
      cancelLabel: 'Cancel',
    });
    if (result.success) await unlock();
  };

  // Loading screen while vault hydrates
  if (!ready) {
    return (
      <Screen>
        <View style={styles.loadingWrap}>
          <FadeIn>
            <CardlyLogo variant="full" width={150} />
          </FadeIn>
        </View>
      </Screen>
    );
  }

  // Locked wallet screen
  if (showLock) {
    return (
      <Screen>
        <View
          style={[
            styles.lock,
            { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.lg },
          ]}>
          <FadeIn>
            <View style={styles.lockLogoWrap}>
              <CardlyLogo variant="full" width={160} />
            </View>
          </FadeIn>

          <FadeIn delay={80}>
            <View style={styles.lockContent}>
              <View style={styles.lockIconRow}>
                <IconLock size={18} color={theme.textSecondary} />
                <T variant="label" color="secondary">
                  Vault protected
                </T>
              </View>
              <T variant="title" style={styles.lockTitle}>
                Wallet locked
              </T>
              <T variant="body" color="secondary" style={styles.lockHint}>
                Authenticate to see your cards. Encrypted and stored only on this device.
              </T>
            </View>
          </FadeIn>

          <FadeIn delay={160}>
            <Button
              label="Unlock Wallet"
              onPress={onUnlockPress}
              icon={<IconShield size={18} color={theme.purpleText} />}
              style={styles.actionBtn}
            />
          </FadeIn>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={[styles.header, { paddingTop: insets.top + spacing.lg }]}>
        <PageHeader
          eyebrow="Private card vault"
          title="Wallet"
          icon={<CardlyLogo variant="mark" size={32} />}
          action={
            <PressScale
              accessibilityLabel="Open settings"
              onPress={() => router.push('/settings')}
              style={styles.settingsScene}>
              <View
                pointerEvents="none"
                style={[styles.settingsShadow, { backgroundColor: theme.hardShadow }]}
              />
              <View
                style={[
                  styles.settingsButton,
                  { backgroundColor: theme.surface, borderColor: theme.outline },
                ]}>
                <IconGear size={22} color={theme.text} />
              </View>
            </PressScale>
          }
        />

        {count > 0 ? (
          <View style={styles.searchRow}>
            {/* Search Bar */}
            <View style={styles.searchScene}>
              <View
                pointerEvents="none"
                style={[styles.searchShadow, { backgroundColor: theme.hardShadow }]}
              />
              <View
                style={[
                  styles.searchContainer,
                  { backgroundColor: theme.surface, borderColor: theme.outline },
                ]}>
                <IconSearch size={18} color={theme.textSecondary} />
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search cards, banks, networks..."
                  placeholderTextColor={theme.textTertiary}
                  style={[styles.searchInput, { color: theme.text }]}
                  clearButtonMode="never"
                  autoCapitalize="none"
                  autoCorrect={false}
                  accessibilityLabel="Search cards"
                />
                {searchQuery.length > 0 ? (
                  <Pressable
                    onPress={() => setSearchQuery('')}
                    hitSlop={10}
                    style={styles.clearBtn}
                    accessibilityLabel="Clear search text">
                    <IconClose size={15} color={theme.textSecondary} />
                  </Pressable>
                ) : null}
              </View>
            </View>

            {/* Filter Count Chip */}
            <FadeIn delay={100} from="left">
              <Chip tone="accent">
                {searchQuery.trim().length > 0
                  ? `${filteredCards.length} of ${count}`
                  : `${count} card${count === 1 ? '' : 's'}`}
              </Chip>
            </FadeIn>
          </View>
        ) : null}
      </View>

      {count === 0 ? (
        <View style={styles.emptyWrap}>
          <FadeIn>
            <View style={styles.emptyLogoWrap}>
              <CardlyLogo variant="full" width={160} />
            </View>
          </FadeIn>
          <FadeIn delay={80}>
            <View style={styles.emptyContent}>
              <View style={styles.emptyIconRow}>
                <IconShield size={18} color={theme.textSecondary} />
                <T variant="label" color="secondary">
                  Local-first security
                </T>
              </View>
              <T variant="title" style={styles.emptyTitle}>
                Your wallet starts here
              </T>
              <T variant="body" color="secondary" style={styles.emptyHint}>
                Add your cards — they remain encrypted on this device with biometric protection.
              </T>
            </View>
          </FadeIn>
          <FadeIn delay={160}>
            <Button
              label="Add a card"
              onPress={() => router.push('/add')}
              icon={<IconPlus size={18} color={theme.purpleText} />}
              style={styles.actionBtn}
            />
          </FadeIn>
        </View>
      ) : filteredCards.length === 0 ? (
        <View style={styles.emptySearchWrap}>
          <FadeIn>
            <Section tone="subtle" style={styles.emptySearchCard}>
              <View style={styles.emptySearchIconRow}>
                <IconSearch size={22} color={theme.textSecondary} />
                <T variant="title">No cards found</T>
              </View>
              <T variant="body" color="secondary">
                No cards match &quot;{searchQuery}&quot;. Try searching for a bank name, card label,
                or last 4 digits.
              </T>
              <Button
                label="Clear search"
                variant="secondary"
                size="sm"
                onPress={() => setSearchQuery('')}
                style={styles.clearSearchBtn}
              />
            </Section>
          </FadeIn>
        </View>
      ) : (
        <FlatList
          data={filteredCards}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item, index }) => (
            <FadeIn delay={index * 60}>
              <CardVisual
                nickname={item.nickname}
                issuer={item.issuer}
                network={item.network}
                last4={item.last4}
                cardId={item.id}
                cardholderName={item.cardholderName}
                onPress={() => router.push(`/card/${item.id}`)}
              />
            </FadeIn>
          )}
          ItemSeparatorComponent={() => <View style={{ height: CARD_GAP }} />}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          keyboardDismissMode="on-drag"
        />
      )}

      {count > 0 ? (
        <FadeIn delay={300} from="right">
          <PressScale
            accessibilityLabel="Add card"
            onPress={() => router.push('/add')}
            style={[styles.fabScene, { bottom: insets.bottom + spacing.lg }]}>
            <View
              pointerEvents="none"
              style={[styles.fabShadow, { backgroundColor: theme.hardShadow }]}
            />
            <View
              style={[styles.fab, { backgroundColor: theme.yellow, borderColor: theme.outline }]}>
              <IconPlus size={24} color={theme.yellowText} />
            </View>
          </PressScale>
        </FadeIn>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    width: '100%',
    gap: spacing.sm,
  },
  settingsScene: {
    paddingRight: hardShadow.x,
    paddingBottom: hardShadow.y,
  },
  settingsShadow: {
    position: 'absolute',
    top: hardShadow.y,
    left: hardShadow.x,
    right: 0,
    bottom: 0,
    borderRadius: radius.md,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    borderWidth: borderWidth.standard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  searchScene: {
    flex: 1,
    paddingRight: hardShadow.compact,
    paddingBottom: hardShadow.compact,
  },
  searchShadow: {
    position: 'absolute',
    top: hardShadow.compact,
    left: hardShadow.compact,
    right: 0,
    bottom: 0,
    borderRadius: radius.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderWidth: borderWidth.standard,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm + 2,
    gap: spacing.xs + 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: displayFont,
    paddingVertical: 0,
    height: '100%',
  },
  clearBtn: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    paddingHorizontal: spacing.md,
    paddingBottom: 120,
    paddingTop: spacing.xs,
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  emptyWrap: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: spacing.xxl,
    backgroundColor: '#FFFFFF',
  },
  emptyLogoWrap: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  emptyContent: {
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xl,
    maxWidth: 320,
  },
  emptyIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  emptyTitle: {
    textAlign: 'center',
  },
  emptyHint: {
    textAlign: 'center',
    lineHeight: 22,
  },
  actionBtn: {
    minWidth: 200,
  },
  emptySearchWrap: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
  },
  emptySearchCard: {
    gap: spacing.sm,
  },
  emptySearchIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  clearSearchBtn: {
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
  },
  fabScene: {
    position: 'absolute',
    right: spacing.lg,
    width: 60,
    height: 60,
    paddingRight: hardShadow.x,
    paddingBottom: hardShadow.y,
  },
  fabShadow: {
    position: 'absolute',
    top: hardShadow.y,
    left: hardShadow.x,
    right: 0,
    bottom: 0,
    borderRadius: radius.md,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    borderWidth: borderWidth.heavy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lock: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  lockLogoWrap: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  lockContent: {
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xl,
    maxWidth: 320,
  },
  lockIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  lockTitle: {
    textAlign: 'center',
  },
  lockHint: {
    textAlign: 'center',
    lineHeight: 22,
  },
});
