import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  Button,
  Divider,
  FeedbackBanner,
  PageHeader,
  Screen,
  SectionHeader,
  T,
  TextField,
  borderWidth,
  radius,
  spacing,
  useTheme,
} from '@cardly/ui';
import {
  DuplicateCardError,
  formatCardNumber,
  getNetwork,
  normalizeCardholderNameLive,
  normalizeExpiryYear,
  validateCardInput,
} from '@cardly/vault';

import { BackButton } from '@/components/back-button';
import { CardVisual } from '@/components/card-visual';
import { FadeIn } from '@/components/fade-in';
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

export default function AddCardDirectScreen() {
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
  const last4 = cardNumber.replace(/\D/g, '').slice(-4);

  const errorFor = (field: string): string | undefined =>
    touched[field] ? validation.errors.find((e) => e.field === field)?.message : undefined;

  const markTouched = (field: string) => setTouched((t) => ({ ...t, [field]: true }));

  const submit = async () => {
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
    <Screen padded>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}>
        <ScrollView
          contentContainerStyle={[
            styles.container,
            { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.xxl },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}>
          <BackButton onPress={() => router.back()} label="Cancel" />

          <FadeIn>
            <PageHeader
              eyebrow="New card"
              title="Add Card"
              description="Details are encrypted and stored only on this device."
            />
          </FadeIn>

          {/* Live card preview */}
          <FadeIn delay={60}>
            <CardVisual
              nickname={nickname || 'Your Card'}
              issuer={issuer || undefined}
              network={network !== 'unknown' ? network : undefined}
              last4={last4.length === 4 ? last4 : undefined}
              cardholderName={cardholderName || undefined}
              expiry={
                expiryMonth && expiryYear
                  ? `${expiryMonth.padStart(2, '0')}/${expiryYear.slice(-2)}`
                  : undefined
              }
              compact
            />
          </FadeIn>

          <View style={styles.form}>
            <SectionHeader label="Card information" />

            <TextField
              label="Nickname"
              error={errorFor('nickname')}
              value={nickname}
              onChangeText={setNickname}
              onBlur={() => markTouched('nickname')}
              placeholder="e.g. Travel Sapphire, Everyday Debit"
              autoFocus
            />

            <TextField
              label="Bank / Issuer"
              hint="Optional"
              value={issuer}
              onChangeText={setIssuer}
              placeholder="e.g. Chase, HDFC, Barclays, Amex"
              autoCapitalize="words"
            />

            <Divider style={styles.divider} />
            <SectionHeader label="Card numbers" />

            <TextField
              label="Card number"
              error={errorFor('cardNumber')}
              value={cardNumber}
              onChangeText={(text) => {
                setCardNumber(formatCardNumber(text));
                setServerError(null);
              }}
              onBlur={() => markTouched('cardNumber')}
              keyboardType="number-pad"
              placeholder="•••• •••• •••• ••••"
              maxLength={23}
              rightAccessory={
                networkLabel ? (
                  <View
                    style={[
                      styles.networkBadge,
                      { backgroundColor: theme.yellow, borderColor: theme.outline },
                    ]}>
                    <T variant="caption" color="text">
                      {networkLabel}
                    </T>
                  </View>
                ) : null
              }
            />

            <TextField
              label="Name on card"
              hint="Optional"
              value={cardholderName}
              onChangeText={(text) => setCardholderName(normalizeCardholderNameLive(text))}
              placeholder="e.g. ALEX MORGAN"
              autoCapitalize="characters"
              autoCorrect={false}
            />

            <View style={styles.row}>
              <View style={styles.rowItem}>
                <TextField
                  label="Expires"
                  hint="MM"
                  error={errorFor('expiry')}
                  value={expiryMonth}
                  onChangeText={(m) => {
                    const clean = m.replace(/\D/g, '').slice(0, 2);
                    setExpiryMonth(clean);
                  }}
                  onBlur={() => markTouched('expiry')}
                  keyboardType="number-pad"
                  placeholder="MM"
                  maxLength={2}
                />
              </View>
              <View style={styles.rowItem}>
                <TextField
                  label="Year"
                  hint="YY"
                  value={expiryYear}
                  onChangeText={(y) => setExpiryYear(normalizeExpiryYear(y))}
                  onBlur={() => markTouched('expiry')}
                  keyboardType="number-pad"
                  placeholder="YY"
                  maxLength={4}
                />
              </View>
              <View style={styles.rowItem}>
                <TextField
                  label="CVV"
                  hint="Optional"
                  error={errorFor('cvv')}
                  value={cvv}
                  onChangeText={(c) => setCvv(c.replace(/\D/g, '').slice(0, 4))}
                  onBlur={() => markTouched('cvv')}
                  keyboardType="number-pad"
                  placeholder="•••"
                  maxLength={4}
                  secureTextEntry
                />
              </View>
            </View>

            <Divider style={styles.divider} />
            <SectionHeader label="Additional details" />

            <TextField
              label="Notes"
              hint="Optional"
              value={notes}
              onChangeText={setNotes}
              placeholder="e.g. 5% cashback on flights, PIN: 1234"
              multiline
              numberOfLines={3}
            />
          </View>

          {serverError ? (
            <FeedbackBanner tone="error">
              {serverError}
            </FeedbackBanner>
          ) : null}

          <Button
            label={saving ? 'Saving…' : 'Save Card'}
            onPress={submit}
            disabled={saving}
            loading={saving}
            style={styles.saveButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { paddingHorizontal: spacing.md, gap: spacing.lg },
  form: { gap: spacing.md },
  row: { flexDirection: 'row', gap: spacing.md },
  rowItem: { flex: 1 },
  divider: { marginVertical: spacing.xs },
  networkBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    borderWidth: borderWidth.standard,
  },
  saveButton: { marginTop: spacing.sm },
});
