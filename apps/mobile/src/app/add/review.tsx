import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, FeedbackBanner, PageHeader, Screen, T, TextField, spacing } from '@cardly/ui';
import { DuplicateCardError, formatCardNumber, getNetwork, normalizeCardholderNameLive, normalizeExpiryYear } from '@cardly/vault';

import { BackButton } from '@/components/back-button';
import { CardVisual } from '@/components/card-visual';
import { FadeIn } from '@/components/fade-in';
import { useVault } from '@/vault-context';
import { notifyHaptic } from '@/lib/haptics';

export default function ReviewCardScreen() {
  const router = useRouter();
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
  const [cardholderName, setCardholderName] = useState(
    params.cardholderName ? normalizeCardholderNameLive(params.cardholderName) : '',
  );
  const [issuer, setIssuer] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const network = cardNumber ? getNetwork(cardNumber) : undefined;
  const last4 = cardNumber.replace(/\D/g, '').slice(-4);

  const submit = async () => {
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
          <BackButton onPress={() => router.back()} />

          <FadeIn>
            <PageHeader
              eyebrow="Review details"
              title="Review Card"
              description="Check every field before adding it to your encrypted wallet."
            />
          </FadeIn>

          {/* Live card preview */}
          <FadeIn delay={60}>
            <CardVisual
              nickname={issuer || cardholderName || 'Your Card'}
              issuer={issuer || undefined}
              network={network}
              last4={last4.length === 4 ? last4 : undefined}
              cardholderName={cardholderName || undefined}
              expiry={expiryMonth && expiryYear ? `${expiryMonth.padStart(2, '0')}/${expiryYear.slice(-2)}` : undefined}
              compact
            />
          </FadeIn>

          <View style={styles.form}>
            <T variant="label">Card information</T>
            <TextField
              label="Card number"
              value={cardNumber}
              onChangeText={(t) => setCardNumber(formatCardNumber(t))}
              placeholder="4528 1234 5678 4821"
              keyboardType="number-pad"
              maxLength={23}
            />
            <TextField
              label="Issuer"
              value={issuer}
              onChangeText={setIssuer}
              placeholder="e.g. HDFC"
              autoCapitalize="words"
            />
            <TextField
              label="Cardholder name"
              value={cardholderName}
              onChangeText={(t) => setCardholderName(normalizeCardholderNameLive(t))}
              placeholder="ASWANTH A"
              autoCapitalize="characters"
            />
            <View style={styles.row}>
              <TextField
                label="Expiry month"
                style={styles.rowItem}
                value={expiryMonth}
                onChangeText={(t) => setExpiryMonth(t.replace(/\D/g, '').slice(0, 2))}
                placeholder="08"
                keyboardType="number-pad"
                maxLength={2}
              />
              <TextField
                label="Expiry year"
                style={styles.rowItem}
                value={expiryYear}
                onChangeText={(t) => setExpiryYear(normalizeExpiryYear(t))}
                placeholder="2029"
                keyboardType="number-pad"
                maxLength={4}
              />
            </View>
          </View>

          {error ? (
            <FeedbackBanner tone="error">
              {error}
            </FeedbackBanner>
          ) : null}

          <Button label={saving ? 'Saving…' : 'Add Card'} onPress={submit} disabled={saving} loading={saving} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { gap: spacing.lg, paddingBottom: spacing.xxl },
  form: { gap: spacing.md },
  row: { flexDirection: 'row', gap: spacing.md },
  rowItem: { flex: 1 },
});
