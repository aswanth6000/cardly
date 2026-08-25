import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Screen, T, radius, spacing, useTheme } from '@cardly/ui';
import { formatExpiry } from '@cardly/vault';
import type { Card } from '@cardly/vault';

import { copyPlain, copySensitive } from '@/lib/clipboard';
import { notifyHaptic } from '@/lib/haptics';
import { useAppLock } from '@/hooks/use-app-lock';
import { useVault } from '@/vault-context';

export default function CardDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { getCard, deleteCard } = useVault();

  const [card, setCard] = useState<Card | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!id) return;
    getCard(id).then(setCard);
  }, [id, getCard]);

  // Card fields are sensitive: reveal them only after device authentication.
  const { authenticate } = useAppLock({
    enabled: true,
    onUnlock: () => setRevealed(true),
    onLock: () => setRevealed(false),
  });

  const copyField = async (key: string, value: string, sensitive = true) => {
    if (sensitive) {
      await copySensitive(value);
    } else {
      await copyPlain(value);
    }
    setCopied(key);
    notifyHaptic('success');
    setTimeout(() => setCopied(null), 1500);
  };

  const reveal = async () => {
    const ok = await authenticate();
    if (ok) {
      setRevealed(true);
      notifyHaptic('medium');
    }
  };

  const onDelete = async () => {
    if (!card) return;
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    await deleteCard(card.id);
    router.back();
  };

  if (!card) return <Screen />;

  const maskedNumber = `\u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 ${card.cardNumber.slice(-4)}`;
  const numberDisplay = revealed ? card.cardNumber : maskedNumber;
  const cvvDisplay = revealed && card.cvv ? card.cvv : '\u2022\u2022\u2022';

  return (
    <Screen padded>
      <ScrollView contentContainerStyle={[styles.container, { paddingTop: insets.top + spacing.lg }]}>
        <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
          <T variant="body" color="secondary">
            Back
          </T>
        </Pressable>

        <T variant="title" style={styles.title}>
          {card.nickname}
        </T>
        <T variant="body" color="secondary">
          {maskedNumber}
        </T>

        <View style={styles.fields}>
          <DetailRow
            label="Card Number"
            value={numberDisplay}
            revealed={revealed}
            onPress={() => copyField('number', card.cardNumber)}
            copied={copied === 'number'}
          />
          <DetailRow
            label="Expiry"
            value={formatExpiry(card.expiryMonth, card.expiryYear)}
            onPress={() => copyField('expiry', formatExpiry(card.expiryMonth, card.expiryYear), false)}
            copied={copied === 'expiry'}
          />
          <DetailRow
            label="Cardholder"
            value={card.cardholderName ?? '\u2014'}
            onPress={() => card.cardholderName && copyField('name', card.cardholderName)}
            copied={copied === 'name'}
          />
          <DetailRow
            label="CVV"
            value={cvvDisplay}
            revealed={revealed}
            onPress={reveal}
            copied={copied === 'cvv'}
          />
          {card.notes ? (
            <DetailRow
              label="Notes"
              value={card.notes}
              onPress={() => copyField('notes', card.notes ?? '', false)}
              copied={copied === 'notes'}
            />
          ) : null}
        </View>

        {!revealed && (
          <T variant="caption" color="tertiary" style={styles.hint}>
            Authenticate to reveal sensitive details
          </T>
        )}

        {copied && (
          <View style={styles.copiedToast}>
            <T variant="caption" style={{ color: theme.accentText }}>
              Copied
            </T>
          </View>
        )}

        <Button
          label="Edit Card"
          variant="secondary"
          onPress={() => router.push(`/card/edit/${card.id}`)}
          style={styles.editButton}
        />
        <Button
          label={confirmDelete ? 'Confirm delete' : 'Delete Card'}
          variant={confirmDelete ? 'danger' : 'ghost'}
          onPress={onDelete}
          style={styles.deleteButton}
        />
      </ScrollView>
    </Screen>
  );
}

function DetailRow({
  label,
  value,
  onPress,
  copied,
  revealed,
}: {
  label: string;
  value: string;
  onPress?: () => void;
  copied?: boolean;
  revealed?: boolean;
}) {
  const theme = useTheme();
  return (
    <View style={[styles.row, { borderBottomColor: theme.divider }]}>
      <View style={styles.rowText}>
        <T variant="caption" color="secondary">
          {label}
        </T>
        <T variant="body" numberOfLines={1}>
          {value}
        </T>
      </View>
      {onPress ? (
        <Pressable accessibilityRole="button" onPress={onPress} hitSlop={12} style={styles.copyButton}>
          <T variant="caption" style={{ color: revealed === false && label === 'CVV' ? theme.textTertiary : theme.accent }}>
            {label === 'CVV' && !revealed ? 'Show' : copied ? 'Copied' : 'Copy'}
          </T>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.md, paddingBottom: spacing.xxl },
  backButton: { alignSelf: 'flex-start', paddingVertical: spacing.sm },
  title: { marginTop: spacing.md },
  fields: { marginTop: spacing.lg },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: spacing.md,
  },
  rowText: { flex: 1, gap: spacing.xs },
  copyButton: { paddingVertical: spacing.sm, paddingHorizontal: spacing.sm },
  hint: { marginTop: spacing.md },
  copiedToast: {
    position: 'absolute',
    bottom: 120,
    alignSelf: 'center',
    backgroundColor: '#171717',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  editButton: { marginTop: spacing.xxl },
  deleteButton: { marginTop: spacing.sm },
});
