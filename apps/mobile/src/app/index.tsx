import { useRouter } from 'expo-router';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Screen, T, radius, spacing, useTheme } from '@cardly/ui';

import { CardVisual } from '@/components/card-visual';
import { FadeIn } from '@/components/fade-in';
import { useVault } from '@/vault-context';

const STACK_OVERLAP = 10;

export default function WalletScreen() {
  const router = useRouter();
  const { summary } = useVault();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const count = summary?.length ?? 0;
  const cards = summary ?? [];

  return (
    <Screen>
      {/* Header sits outside the FlatList so it is always full-width. */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.lg }]}>
        <View style={styles.headerTopRow}>
          <T variant="hero" style={styles.title}>
            Wallet
          </T>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Settings"
            onPress={() => router.push('/settings')}
            hitSlop={12}
            style={({ pressed }) => [styles.settingsButton, pressed && styles.pressed]}>
            <T variant="body" color="secondary">
              Settings
            </T>
          </Pressable>
        </View>
        {count > 0 ? (
          <T variant="caption" color="tertiary" style={styles.eyebrow}>
            {count} card{count === 1 ? '' : 's'}
          </T>
        ) : null}
      </View>

      {count === 0 ? (
        <View style={styles.emptyWrap}>
          <View style={[styles.emptyCard, { backgroundColor: theme.backgroundCard }]}>
            <T variant="bodyLarge" style={{ color: theme.textSecondary }}>
              Your wallet is empty
            </T>
            <T variant="body" color="tertiary" style={styles.emptyHint}>
              Add your first card — it stays on this device, encrypted.
            </T>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/add')}
              style={({ pressed }) => [styles.emptyCta, { backgroundColor: theme.accent }, pressed && styles.pressed]}>
              <T variant="bodyLarge" style={{ color: theme.accentText }}>
                Add a card
              </T>
            </Pressable>
          </View>
        </View>
      ) : (
        <FlatList
          data={cards}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item, index }) => (
            <FadeIn delay={index * 60}>
              <View style={[styles.itemWrap, index > 0 && styles.stackedItem]}>
                <CardVisual
                  nickname={item.nickname}
                  issuer={item.issuer}
                  network={item.network}
                  last4={item.last4}
                  onPress={() => router.push(`/card/${item.id}`)}
                />
              </View>
            </FadeIn>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Add card"
        onPress={() => router.push('/add')}
        style={({ pressed }) => [
          styles.fab,
          { backgroundColor: theme.accent },
          pressed && styles.fabPressed,
          { bottom: insets.bottom + spacing.lg },
        ]}>
        <T variant="bodyLarge" style={{ color: theme.accentText }}>
          +
        </T>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.md, paddingBottom: spacing.lg, width: '100%' },
  headerTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' },
  title: {},
  settingsButton: { paddingVertical: spacing.sm, paddingLeft: spacing.md },
  eyebrow: { marginTop: spacing.xs },
  pressed: { opacity: 0.7 },
  list: { paddingHorizontal: spacing.md, paddingBottom: 120 },
  itemWrap: { borderRadius: radius.lg },
  // Cards stack like a physical wallet: each subsequent card overlaps the
  // previous by a few pixels.
  stackedItem: { marginTop: -STACK_OVERLAP },
  separator: { height: STACK_OVERLAP },
  emptyWrap: { paddingHorizontal: spacing.md },
  emptyCard: {
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
    width: '100%',
  },
  emptyHint: { textAlign: 'center', lineHeight: 20, paddingHorizontal: spacing.sm },
  emptyCta: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.pill,
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  fabPressed: { opacity: 0.85 },
});
