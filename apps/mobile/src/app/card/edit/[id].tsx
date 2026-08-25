import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Screen, T, radius, spacing, useTheme } from '@cardly/ui';
import { DuplicateCardError, formatCardNumber, normalizeCardholderNameLive, normalizeExpiryYear } from '@cardly/vault';
import type { Card } from '@cardly/vault';

import { useVault } from '@/vault-context';

export default function EditCardScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { getCard, updateCard, validateInput } = useVault();

  const [card, setCard] = useState<Card | null>(null);
  const [nickname, setNickname] = useState('');
  const [issuer, setIssuer] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cvv, setCvv] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    getCard(id).then((c) => {
      if (!c) return;
      setCard(c);
      setNickname(c.nickname);
      setIssuer(c.issuer ?? '');
      setCardNumber(c.cardNumber);
      setCardholderName(c.cardholderName ?? '');
      setExpiryMonth(c.expiryMonth ? String(c.expiryMonth) : '');
      setExpiryYear(c.expiryYear ? String(c.expiryYear) : '');
      setCvv(c.cvv ?? '');
      setNotes(c.notes ?? '');
    });
  }, [id, getCard]);

  const inputStyle = [
    styles.input,
    { backgroundColor: theme.backgroundElevated, color: theme.text, borderColor: theme.divider },
  ];

  const submit = async () => {
    if (!card) return;
    const result = validateInput({
      nickname,
      issuer: issuer || undefined,
      cardNumber,
      cardholderName: cardholderName || undefined,
      expiryMonth: expiryMonth ? Number(expiryMonth) : undefined,
      expiryYear: expiryYear ? Number(expiryYear) : undefined,
      cvv: cvv || undefined,
      notes: notes || undefined,
    });
    if (!result.valid) {
      setError(result.errors[0].message);
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await updateCard(card.id, {
        nickname,
        issuer: issuer || undefined,
        cardNumber,
        cardholderName: cardholderName || undefined,
        expiryMonth: expiryMonth ? Number(expiryMonth) : undefined,
        expiryYear: expiryYear ? Number(expiryYear) : undefined,
        cvv: cvv || undefined,
        notes: notes || undefined,
      });
      router.back();
    } catch (e) {
      if (e instanceof DuplicateCardError) {
        setError('Another card already uses this number.');
      } else {
        setError('Could not save the card.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (!card) return <Screen />;

  return (
    <Screen padded>
      <ScrollView contentContainerStyle={[styles.container, { paddingTop: insets.top + spacing.lg }]}>
        <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
          <T variant="body" color="secondary">
            Cancel
          </T>
        </Pressable>

        <T variant="hero" style={styles.title}>
          Edit Card
        </T>

        <View style={styles.form}>
          <Field label="Nickname">
            <TextInput
              value={nickname}
              onChangeText={setNickname}
              placeholder="e.g. Travel Card"
              placeholderTextColor={theme.textTertiary}
              style={inputStyle}
              autoCapitalize="words"
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
          <Field label="CVV">
            <TextInput
              value={cvv}
              onChangeText={(t) => setCvv(t.replace(/\D/g, '').slice(0, 4))}
              placeholder="•••"
              placeholderTextColor={theme.textTertiary}
              style={inputStyle}
              keyboardType="number-pad"
              maxLength={4}
              secureTextEntry
            />
          </Field>
          <Field label="Notes">
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Optional"
              placeholderTextColor={theme.textTertiary}
              style={inputStyle}
              multiline
            />
          </Field>
        </View>

        {error && (
          <T variant="caption" style={{ color: theme.danger }}>
            {error}
          </T>
        )}

        <Button label={saving ? 'Saving…' : 'Save Changes'} onPress={submit} disabled={saving} style={styles.saveButton} />
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
