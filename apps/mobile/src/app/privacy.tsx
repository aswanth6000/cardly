import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  IconEyeOff,
  IconKey,
  IconLock,
  IconShield,
  PageHeader,
  Screen,
  Section,
  T,
  spacing,
  useTheme,
} from '@cardly/ui';

import { BackButton } from '@/components/back-button';
import { FadeIn } from '@/components/fade-in';

const ICONS = [IconShield, IconEyeOff, IconLock, IconKey];

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
  const theme = useTheme();

  return (
    <Screen padded>
      <ScrollView
        contentContainerStyle={[styles.container, { paddingTop: insets.top + spacing.lg }]}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}>
        <BackButton onPress={() => router.back()} />

        <FadeIn>
          <PageHeader
            eyebrow="No account. No tracking."
            title="Privacy"
            icon={<IconShield size={28} color={theme.text} />}
            description="The full policy is in PRIVACY.md in the source repository. In short:"
          />
        </FadeIn>

        <View style={styles.points}>
          {POINTS.map((p, index) => {
            const Icon = ICONS[index];
            return (
              <FadeIn key={p.title} delay={70 + index * 70}>
                <Section tone={index % 2 === 0 ? 'default' : 'subtle'}>
                  <View style={styles.pointHeader}>
                    <View style={[styles.pointIconWrap, { borderColor: theme.outline }]}>
                      <Icon size={16} color={theme.text} />
                    </View>
                    <T variant="label">{`0${index + 1}`}</T>
                  </View>
                  <T variant="bodyLarge">{p.title}</T>
                  <T variant="body" color="secondary">
                    {p.body}
                  </T>
                </Section>
              </FadeIn>
            );
          })}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.lg, paddingBottom: spacing.xxl },
  points: { gap: spacing.md },
  pointHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  pointIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
