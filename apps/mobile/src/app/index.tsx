import { useRouter } from 'expo-router';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Screen, T, spacing, useTheme } from '@cardly/ui';

import { CardVisual } from '@/components/card-visual';
import { useVault } from '@/vault-context';

export default function WalletScreen() {
  const router = useRouter();
  const { summary } = useVault();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Screen>
      <FlatList
        data={summary ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, { paddingTop: insets.top + spacing.lg }]}
        ListHeaderComponent={
          <View style={styles.headerRow}>
            <T variant="hero" style={styles.title}>
              Wallet
            </T>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Settings"
              onPress={() => router.push('/settings')}
              hitSlop={12}
              style={({ pressed }) => [styles.settingsButton, pressed && styles.fabPressed]}>
              <T variant="bodyLarge" color="secondary">
                ⚙
              </T>
            </Pressable>
          </View>
        }
        renderItem={({ item }) => (
          <CardVisual
            nickname={item.nickname}
            issuer={item.issuer}
            network={item.network}
            last4={item.last4}
            onPress={() => router.push(`/card/${item.id}`)}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={[styles.emptyCard, { backgroundColor: theme.backgroundCard }]}>
              <T variant="bodyLarge" color="tertiary">
                Your wallet is empty
              </T>
              <T variant="body" color="tertiary" style={styles.emptyHint}>
                Add a card to get started.
              </T>
            </View>
          </View>
        }
      />
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
  list: { paddingHorizontal: spacing.md, paddingBottom: 120 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg },
  title: {},
  settingsButton: { padding: spacing.sm },
  separator: { height: spacing.md },
  empty: { alignItems: 'center', paddingTop: spacing.xxl, gap: spacing.sm },
  emptyCard: { borderRadius: 20, padding: spacing.xl, alignItems: 'center', gap: spacing.sm, width: '100%' },
  emptyHint: { textAlign: 'center' },
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
