import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Screen, T, radius, spacing, useTheme } from '@cardly/ui';
import { formatCardNumber, normalizeCardholderName } from '@cardly/vault';

import { useVault } from '@/vault-context';

export default function ManualEntryScreen() {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { addCard, validateInput } = useVault();

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

  const inputStyle = (invalid: boolean) => [
    styles.input,
    { backgroundColor: theme.backgroundElevated, color: theme.text, borderColor: theme.divider },
    invalid && { borderColor: theme.danger },
  ];

  const submit = async () => {
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
      await addCard({
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
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen padded>
      <View style={[styles.container, { paddingTop: insets.top + spacing.lg }]}>
        <View style={styles.header}>
          <T variant="body" color="secondary" onPress={() => router.back()}>
            Cancel
          </T>
          <T variant="title">Enter Manually</T>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.form}>
          <Field label="Nickname">
            <TextInput
              value={nickname}
              onChangeText={setNickname}
              placeholder="e.g. Travel Card"
              placeholderTextColor={theme.textTertiary}
              style={inputStyle(false)}
              autoCapitalize="words"
            />
          </Field>
          <Field label="Issuer">
            <TextInput
              value={issuer}
              onChangeText={setIssuer}
              placeholder="e.g. HDFC"
              placeholderTextColor={theme.textTertiary}
              style={inputStyle(false)}
              autoCapitalize="words"
            />
          </Field>
          <Field label="Card number">
            <TextInput
              value={cardNumber}
              onChangeText={(t) => setCardNumber(formatCardNumber(t))}
              placeholder="4528 1234 5678 4821"
              placeholderTextColor={theme.textTertiary}
              style={inputStyle(false)}
              keyboardType="number-pad"
              maxLength={23}
            />
          </Field>
          <Field label="Cardholder name">
            <TextInput
              value={cardholderName}
              onChangeText={(t) => setCardholderName(normalizeCardholderName(t))}
              placeholder="ASWANTH A"
              placeholderTextColor={theme.textTertiary}
              style={inputStyle(false)}
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
                style={inputStyle(false)}
                keyboardType="number-pad"
                maxLength={2}
              />
            </Field>
            <Field label="Expiry year" style={styles.rowItem}>
              <TextInput
                value={expiryYear}
                onChangeText={(t) => setExpiryYear(t.replace(/\D/g, '').slice(0, 4))}
                placeholder="2029"
                placeholderTextColor={theme.textTertiary}
                style={inputStyle(false)}
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
              style={inputStyle(false)}
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
              style={inputStyle(false)}
              multiline
            />
          </Field>
        </View>

        {error && (
          <T variant="caption" style={{ color: theme.danger }}>
            {error}
          </T>
        )}

        <Button label={saving ? 'Saving…' : 'Save Card'} onPress={submit} disabled={saving} style={styles.saveButton} />
      </View>
    </Screen>
  );
}

function Field({
  label,
  children,
  style,
}: {
  label: string;
  children: React.ReactNode;
  style?: View['props']['style'];
}) {
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
  container: { flex: 1, gap: spacing.lg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerSpacer: { width: 60 },
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
