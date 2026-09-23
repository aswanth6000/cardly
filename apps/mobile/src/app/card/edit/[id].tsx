import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Divider, FeedbackBanner, PageHeader, Screen, SectionHeader, T, TextField, spacing } from '@cardly/ui';
import { DuplicateCardError, formatCardNumber, getNetwork, normalizeCardholderNameLive, normalizeExpiryYear } from '@cardly/vault';
import type { Card } from '@cardly/vault';

import { BackButton } from '@/components/back-button';
import { CardVisual } from '@/components/card-visual';
import { FadeIn } from '@/components/fade-in';
import { useVault } from '@/vault-context';

export default function EditCardScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
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

  const network = cardNumber ? getNetwork(cardNumber.replace(/\D/g, '')) : undefined;
  const last4 = cardNumber.replace(/\D/g, '').slice(-4);

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
              eyebrow="Protected details"
              title="Edit Card"
              description="Changes are encrypted before they are saved to this device."
            />
          </FadeIn>

          {/* Live card preview */}
          <FadeIn delay={60}>
            <CardVisual
              nickname={nickname || 'Your Card'}
              issuer={issuer || undefined}
              network={network}
              last4={last4.length === 4 ? last4 : undefined}
              cardholderName={cardholderName || undefined}
              cardId={card.id}
              expiry={expiryMonth && expiryYear ? `${expiryMonth.padStart(2, '0')}/${expiryYear.slice(-2)}` : undefined}
              compact
            />
          </FadeIn>

          <View style={styles.form}>
            <SectionHeader label="Card information" />
            <TextField
              label="Nickname"
              value={nickname}
              onChangeText={setNickname}
              placeholder="e.g. Travel Card"
              autoCapitalize="words"
            />
            <TextField
              label="Issuer"
              value={issuer}
              onChangeText={setIssuer}
              placeholder="e.g. HDFC"
              autoCapitalize="words"
            />
            <TextField
              label="Card number"
              value={cardNumber}
              onChangeText={(t) => setCardNumber(formatCardNumber(t))}
              placeholder="4528 1234 5678 4821"
              keyboardType="number-pad"
              maxLength={23}
            />
            <TextField
              label="Cardholder name"
              value={cardholderName}
              onChangeText={(t) => setCardholderName(normalizeCardholderNameLive(t))}
              placeholder="ASWANTH A"
              autoCapitalize="characters"
            />

            <Divider style={styles.divider} />

            <SectionHeader label="Expiry & Security" />

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
            <TextField
              label="CVV"
              value={cvv}
              onChangeText={(t) => setCvv(t.replace(/\D/g, '').slice(0, 4))}
              placeholder="•••"
              keyboardType="number-pad"
              maxLength={4}
              secureTextEntry
            />

            <Divider style={styles.divider} />

            <TextField label="Notes" value={notes} onChangeText={setNotes} placeholder="Optional" multiline />
          </View>

          {error ? (
            <FeedbackBanner tone="error">
              {error}
            </FeedbackBanner>
          ) : null}

          <Button label={saving ? 'Saving…' : 'Save Changes'} onPress={submit} disabled={saving} loading={saving} />
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
  divider: { marginVertical: spacing.xs },
});
