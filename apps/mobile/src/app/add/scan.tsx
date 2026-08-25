import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Screen, T, spacing } from '@cardly/ui';

export default function ScanCardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <Screen padded>
      <View style={[styles.container, { paddingTop: insets.top + spacing.lg }]}>
        <T variant="body" color="secondary" onPress={() => router.back()} style={styles.back}>
          Back
        </T>
        <T variant="title">Scan Card</T>
        <T variant="secondary" color="secondary" style={styles.body}>
          Card scanning is coming in a future release. For now, enter your card
          details manually.
        </T>
        <Button label="Enter Manually" onPress={() => router.replace('/add/manual')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: spacing.lg },
  back: { paddingVertical: spacing.sm },
  body: { lineHeight: 22 },
});
