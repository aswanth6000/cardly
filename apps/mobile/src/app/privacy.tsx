import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Screen, T, spacing } from '@cardly/ui';

const POINTS: { title: string; body: string }[] = [
  {
    title: 'Local-first',
    body: 'Your card data stays on your device, inside an encrypted vault. Cardly operates no server and no account system.',
  },
  {
    title: 'No tracking',
    body: 'There is no advertising, no analytics, and no telemetry. Cardly cannot see what you store.',
  },
  {
    title: 'Encrypted backups',
    body: 'Backups are optional and encrypted on your device before they leave it. Google Drive (if connected) receives only the encrypted file, using the narrowest permission Google offers.',
  },
  {
    title: 'Recovery',
    body: 'Cardly does not know your recovery password. If you lose it and your device, the vault cannot be recovered — by design.',
  },
];

export default function PrivacyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <Screen padded>
      <ScrollView contentContainerStyle={[styles.container, { paddingTop: insets.top + spacing.lg }]}>
        <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
          <T variant="body" color="secondary">
            Back
          </T>
        </Pressable>

        <T variant="hero" style={styles.title}>
          Privacy
        </T>
        <T variant="secondary" color="secondary">
          The full policy is in PRIVACY.md in the source repository. In short:
        </T>

        <View style={styles.points}>
          {POINTS.map((p) => (
            <View key={p.title} style={styles.point}>
              <T variant="bodyLarge">{p.title}</T>
              <T variant="secondary" color="secondary">
                {p.body}
              </T>
            </View>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.lg, paddingBottom: spacing.xxl },
  backButton: { alignSelf: 'flex-start', paddingVertical: spacing.sm },
  title: { marginTop: spacing.md },
  points: { gap: spacing.lg },
  point: { gap: spacing.xs },
});
