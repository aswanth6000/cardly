import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Screen, T, radius, spacing, useTheme } from '@cardly/ui';
import { DuplicateCardError, formatCardNumber, getNetwork, normalizeCardholderNameLive, normalizeExpiryYear } from '@cardly/vault';

import { useVault } from '@/vault-context';
import { notifyHaptic } from '@/lib/haptics';

export default function ReviewCardScreen() {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    cardNumber?: string;
    expiryMonth?: string;
    expiryYear?: string;
    cardholderName?: string;
  }>();
  const { addCard, validateInput } = useVault();

  const [cardNumber, setCardNumber] = useState(params.cardNumber ? formatCardNumber(params.cardNumber) : '');
  const [expiryMonth, setExpiryMonth] = useState(params.expiryMonth ?? '');
  const [expiryYear, setExpiryYear] = useState(params.expiryYear ?? '');
  const [cardholderName, setCardholderName] = useState(params.cardholderName ? normalizeCardholderNameLive(params.cardholderName) : '');
  const [issuer, setIssuer] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const inputStyle = [
    styles.input,
    { backgroundColor: theme.backgroundElevated, color: theme.text, borderColor: theme.divider },
  ];

  const submit = async () => {
    const network = cardNumber ? getNetwork(cardNumber) : undefined;
    const result = validateInput({
      nickname: issuer || cardholderName || 'Card',
      issuer: issuer || undefined,
      network,
      cardNumber,
      cardholderName: cardholderName || undefined,
      expiryMonth: expiryMonth ? Number(expiryMonth) : undefined,
      expiryYear: expiryYear ? Number(expiryYear) : undefined,
    });
    if (!result.valid) {
      setError(result.errors[0].message);
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await addCard({
        nickname: issuer || cardholderName || 'Card',
        issuer: issuer || undefined,
        network,
        cardNumber,
        cardholderName: cardholderName || undefined,
        expiryMonth: expiryMonth ? Number(expiryMonth) : undefined,
        expiryYear: expiryYear ? Number(expiryYear) : undefined,
      });
      notifyHaptic('success');
      if (router.canGoBack()) {
        router.dismissAll();
      } else {
        router.replace('/');
      }
    } catch (e) {
      if (e instanceof DuplicateCardError) {
        setError('You already have a card with this number.');
      } else {
        setError('Could not save the card.');
      }
    } finally {
      setSaving(false);
    }
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
          Review Card
        </T>
        <T variant="secondary" color="secondary">
          Check every field. Cardly never saves scan results without your
          review.
        </T>

        <View style={styles.form}>
          <Field label="Card number">
            <TextInput
              value={cardNumber}
              onChangeText={(t) => setCardNumber(formatCardNumber(t))}
              placeholder="4528 1234 5678 4821"
              placeholderTextColor={theme.textTertiary}
              style={inputStyle}
              keyboardType="number-pad"
              maxLength={23}
            />
          </Field>
          <Field label="Issuer">
            <TextInput
              value={issuer}
              onChangeText={setIssuer}
              placeholder="e.g. HDFC"
              placeholderTextColor={theme.textTertiary}
              style={inputStyle}
              autoCapitalize="words"
            />
          </Field>
          <Field label="Cardholder name">
            <TextInput
              value={cardholderName}
              onChangeText={(t) => setCardholderName(normalizeCardholderNameLive(t))}
              placeholder="ASWANTH A"
              placeholderTextColor={theme.textTertiary}
              style={inputStyle}
              autoCapitalize="characters"
            />
          </Field>
          <View style={styles.row}>
            <Field label="Expiry month" style={styles.rowItem}>
              <TextInput
                value={expiryMonth}
                onChangeText={(t) => setExpiryMonth(t.replace(/\D/g, '').slice(0, 2))}
                placeholder="08"
                placeholderTextColor={theme.textTertiary}
                style={inputStyle}
                keyboardType="number-pad"
                maxLength={2}
              />
            </Field>
            <Field label="Expiry year" style={styles.rowItem}>
              <TextInput
                value={expiryYear}
                onChangeText={(t) => setExpiryYear(normalizeExpiryYear(t))}
                placeholder="2029"
                placeholderTextColor={theme.textTertiary}
                style={inputStyle}
                keyboardType="number-pad"
                maxLength={4}
              />
            </Field>
          </View>
        </View>

        {error && (
          <T variant="caption" style={{ color: theme.danger }}>
            {error}
          </T>
        )}

        <Button label={saving ? 'Saving…' : 'Add Card'} onPress={submit} disabled={saving} style={styles.saveButton} />
      </ScrollView>
    </Screen>
  );
}

function Field({ label, children, style }: { label: string; children: React.ReactNode; style?: View['props']['style'] }) {
  return (
    <View style={[styles.field, style]}>
      <T variant="caption" color="secondary">
        {label}
      </T>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.lg, paddingBottom: spacing.xxl },
  backButton: { alignSelf: 'flex-start', paddingVertical: spacing.sm },
  title: { marginTop: spacing.md },
  form: { gap: spacing.md },
  field: { gap: spacing.xs },
  row: { flexDirection: 'row', gap: spacing.md },
  rowItem: { flex: 1 },
  input: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: 16,
  },
  saveButton: { marginTop: spacing.md },
});
