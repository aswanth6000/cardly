import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Screen, T, radius, spacing, useTheme } from '@cardly/ui';
import {
  DuplicateCardError,
  formatCardNumber,
  getNetwork,
  normalizeCardholderNameLive,
  normalizeExpiryYear,
  validateCardInput,
} from '@cardly/vault';

import { useVault } from '@/vault-context';
import { notifyHaptic } from '@/lib/haptics';

const NETWORK_LABELS: Record<string, string> = {
  visa: 'Visa',
  mastercard: 'Mastercard',
  amex: 'Amex',
  rupay: 'RuPay',
  discover: 'Discover',
  unknown: '',
};

export default function ManualEntryScreen() {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { addCard } = useVault();

  const [nickname, setNickname] = useState('');
  const [issuer, setIssuer] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cvv, setCvv] = useState('');
  const [notes, setNotes] = useState('');

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const input = useMemo(
    () => ({
      nickname,
      issuer: issuer || undefined,
      cardNumber,
      cardholderName: cardholderName || undefined,
      expiryMonth: expiryMonth ? Number(expiryMonth) : undefined,
      expiryYear: expiryYear ? Number(expiryYear) : undefined,
      cvv: cvv || undefined,
      notes: notes || undefined,
    }),
    [nickname, issuer, cardNumber, cardholderName, expiryMonth, expiryYear, cvv, notes],
  );

  const validation = useMemo(() => validateCardInput(input), [input]);
  const network = useMemo(() => {
    const digits = cardNumber.replace(/\D/g, '');
    return digits.length >= 6 ? getNetwork(digits) : 'unknown';
  }, [cardNumber]);
  const networkLabel = NETWORK_LABELS[network];

  const errorFor = (field: string): string | undefined =>
    touched[field] ? validation.errors.find((e) => e.field === field)?.message : undefined;

  const markTouched = (field: string) => setTouched((t) => ({ ...t, [field]: true }));

  const inputStyle = (field: string) => [
    styles.input,
    { backgroundColor: theme.backgroundElevated, color: theme.text, borderColor: errorFor(field) ? theme.danger : theme.divider },
  ];

  const submit = async () => {
    // Touch everything so all errors show.
    setTouched({ nickname: true, cardNumber: true, expiry: true, cardholderName: true, cvv: true });
    if (!validation.valid) {
      setServerError(null);
      return;
    }
    setServerError(null);
    setSaving(true);
    try {
      await addCard({
        nickname: nickname.trim(),
        issuer: issuer.trim() || undefined,
        cardNumber,
        cardholderName: cardholderName.trim() || undefined,
        expiryMonth: expiryMonth ? Number(expiryMonth) : undefined,
        expiryYear: expiryYear ? Number(expiryYear) : undefined,
        cvv: cvv || undefined,
        notes: notes.trim() || undefined,
      });
      notifyHaptic('success');
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/');
      }
    } catch (e) {
      if (e instanceof DuplicateCardError) {
        setServerError('You already have a card with this number.');
      } else {
        setServerError('Could not save the card. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={insets.top}>
        <ScrollView
          contentContainerStyle={[styles.container, { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.xxl }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Pressable accessibilityRole="button" onPress={() => router.back()} hitSlop={12} style={styles.headerButton}>
              <T variant="body" color="secondary">
                Cancel
              </T>
            </Pressable>
            <T variant="title">Enter Manually</T>
            <View style={styles.headerButton} />
          </View>

          <View style={styles.form}>
            <Field label="Nickname" error={errorFor('nickname')}>
              <TextInput
                value={nickname}
                onChangeText={setNickname}
                onBlur={() => markTouched('nickname')}
                placeholder="e.g. Travel Card"
                placeholderTextColor={theme.textTertiary}
                style={inputStyle('nickname')}
                autoCapitalize="words"
                returnKeyType="next"
              />
            </Field>

            <Field label="Issuer" error={errorFor('issuer')}>
              <TextInput
                value={issuer}
                onChangeText={setIssuer}
                placeholder="e.g. HDFC"
                placeholderTextColor={theme.textTertiary}
                style={inputStyle('issuer')}
                autoCapitalize="words"
                returnKeyType="next"
              />
            </Field>

            <Field label="Card number" error={errorFor('cardNumber')}>
              <View style={styles.cardNumberWrap}>
                <TextInput
                  value={cardNumber}
                  onChangeText={(t) => setCardNumber(formatCardNumber(t))}
                  onBlur={() => markTouched('cardNumber')}
                  placeholder="4528 1234 5678 4821"
                  placeholderTextColor={theme.textTertiary}
                  style={[inputStyle('cardNumber'), styles.cardNumberInput]}
                  keyboardType="number-pad"
                  maxLength={23}
                />
                {networkLabel ? (
                  <View style={[styles.networkBadge, { backgroundColor: theme.chipBackground }]}>
                    <T variant="caption" color="secondary">
                      {networkLabel}
                    </T>
                  </View>
                ) : null}
              </View>
            </Field>

            <Field label="Cardholder name" error={errorFor('cardholderName')}>
              <TextInput
                value={cardholderName}
                onChangeText={(t) => setCardholderName(normalizeCardholderNameLive(t))}
                onBlur={() => markTouched('cardholderName')}
                placeholder="ASWANTH A"
                placeholderTextColor={theme.textTertiary}
                style={inputStyle('cardholderName')}
                autoCapitalize="characters"
                autoCorrect={false}
                returnKeyType="next"
              />
            </Field>

            <View style={styles.row}>
              <Field label="Expiry month" error={errorFor('expiry')} style={styles.rowItem}>
                <TextInput
                  value={expiryMonth}
                  onChangeText={(t) => setExpiryMonth(t.replace(/\D/g, '').slice(0, 2))}
                  onBlur={() => markTouched('expiry')}
                  placeholder="MM"
                  placeholderTextColor={theme.textTertiary}
                  style={inputStyle('expiry')}
                  keyboardType="number-pad"
                  maxLength={2}
                />
              </Field>
              <Field label="Expiry year" error={errorFor('expiry')} style={styles.rowItem}>
                <TextInput
                  value={expiryYear}
                  onChangeText={(t) => setExpiryYear(normalizeExpiryYear(t))}
                  onBlur={() => markTouched('expiry')}
                  placeholder="YYYY"
                  placeholderTextColor={theme.textTertiary}
                  style={inputStyle('expiry')}
                  keyboardType="number-pad"
                  maxLength={4}
                />
              </Field>
            </View>
            {errorFor('expiry') ? (
              <T variant="caption" style={{ color: theme.danger, marginTop: -spacing.sm }}>
                {errorFor('expiry')}
              </T>
            ) : null}

            <Field label="CVV" error={errorFor('cvv')}>
              <TextInput
                value={cvv}
                onChangeText={(t) => setCvv(t.replace(/\D/g, '').slice(0, 4))}
                onBlur={() => markTouched('cvv')}
                placeholder="•••"
                placeholderTextColor={theme.textTertiary}
                style={inputStyle('cvv')}
                keyboardType="number-pad"
                maxLength={4}
                secureTextEntry
              />
            </Field>

            <Field label="Notes" error={errorFor('notes')}>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="Optional"
                placeholderTextColor={theme.textTertiary}
                style={[inputStyle('notes'), styles.notesInput]}
                multiline
              />
            </Field>
          </View>

          {serverError && (
            <T variant="caption" style={{ color: theme.danger, marginTop: spacing.md }}>
              {serverError}
            </T>
          )}

          <Button
            label={saving ? 'Saving…' : 'Save Card'}
            onPress={submit}
            disabled={saving}
            style={styles.saveButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

function Field({
  label,
  error,
  children,
  style,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  style?: View['props']['style'];
}) {
  const theme = useTheme();
  return (
    <View style={[styles.field, style]}>
      <View style={styles.fieldLabelRow}>
        <T variant="caption" color="secondary">
          {label}
        </T>
        {error ? (
          <T variant="caption" style={{ color: theme.danger, flexShrink: 1, textAlign: 'right' }}>
            {error}
          </T>
        ) : null}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { paddingHorizontal: spacing.md, gap: spacing.lg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerButton: { minWidth: 60 },
  form: { gap: spacing.md },
  field: { gap: spacing.xs },
  fieldLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm },
  row: { flexDirection: 'row', gap: spacing.md },
  rowItem: { flex: 1 },
  cardNumberWrap: { position: 'relative' },
  cardNumberInput: { paddingRight: 92 },
  networkBadge: {
    position: 'absolute',
    right: spacing.sm,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
  },
  input: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: 16,
  },
  notesInput: { minHeight: 64, textAlignVertical: 'top' },
  saveButton: { marginTop: spacing.md },
});
