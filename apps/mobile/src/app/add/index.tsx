import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Screen, T, radius, spacing, useTheme } from '@cardly/ui';

export default function AddCardScreen() {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Screen padded>
      <View style={[styles.container, { paddingTop: insets.top + spacing.lg }]}>
        <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
          <T variant="body" color="secondary">
            Cancel
          </T>
        </Pressable>

        <T variant="hero" style={styles.title}>
          Add Card
        </T>

        <View style={styles.actions}>
          <Button
            label="Scan Card"
            onPress={() => router.push('/add/scan')}
            style={styles.actionButton}
          />
          <View style={styles.orRow}>
            <View style={[styles.orLine, { backgroundColor: theme.divider }]} />
            <T variant="caption" color="tertiary">
              or
            </T>
            <View style={[styles.orLine, { backgroundColor: theme.divider }]} />
          </View>
          <Button
            label="Enter Manually"
            variant="secondary"
            onPress={() => router.push('/add/manual')}
            style={styles.actionButton}
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: spacing.lg },
  backButton: { alignSelf: 'flex-start', paddingVertical: spacing.sm },
  title: { marginTop: spacing.md },
  actions: { gap: spacing.lg, marginTop: spacing.xxl },
  actionButton: { borderRadius: radius.md },
  orRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  orLine: { flex: 1, height: StyleSheet.hairlineWidth },
});
