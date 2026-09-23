import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePreventScreenCapture } from 'expo-screen-capture';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import {
  Button,
  FeedbackBanner,
  IconCheck,
  IconCopy,
  IconEye,
  PageHeader,
  Screen,
  Section,
  T,
  animation,
  borderWidth,
  spacing,
  useTheme,
} from '@cardly/ui';
import { formatExpiry } from '@cardly/vault';
import type { Card } from '@cardly/vault';

import { copyPlain, copySensitive } from '@/lib/clipboard';
import { notifyHaptic } from '@/lib/haptics';
import { useAppLock } from '@/hooks/use-app-lock';
import { useVault } from '@/vault-context';
import { CardVisual } from '@/components/card-visual';
import { BackButton } from '@/components/back-button';
import { FadeIn } from '@/components/fade-in';

export default function CardDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { getCard, deleteCard } = useVault();

  usePreventScreenCapture('card-details');

  const [card, setCard] = useState<Card | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Reveal animation
  const revealOpacity = useSharedValue(0);
  useEffect(() => {
    revealOpacity.value = withTiming(revealed ? 1 : 0, { duration: animation.normal.duration });
  }, [revealed, revealOpacity]);

  const revealStyle = useAnimatedStyle(() => ({
    opacity: 0.4 + revealOpacity.value * 0.6,
  }));

  useEffect(() => {
    if (!id) return;
    getCard(id).then(setCard);
  }, [id, getCard]);

  const { authenticate } = useAppLock({
    enabled: true,
    autoPrompt: false,
    onUnlock: () => setRevealed(true),
    onLock: () => setRevealed(false),
  });

  const ensureRevealed = async (): Promise<boolean> => {
    if (revealed) return true;
    const ok = await authenticate();
    if (ok) {
      setRevealed(true);
      notifyHaptic('medium');
    }
    return ok;
  };

  const copyField = async (key: string, value: string, sensitive = true) => {
    if (sensitive) {
      const ok = await ensureRevealed();
      if (!ok) return;
      await copySensitive(value);
    } else {
      await copyPlain(value);
    }
    setCopied(key);
    notifyHaptic('success');
    setTimeout(() => setCopied(null), 1500);
  };

  const reveal = async () => {
    await ensureRevealed();
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

  const last4 = card.cardNumber.slice(-4);
  const maskedNumber = `\u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 ${last4}`;
  const numberDisplay = revealed ? card.cardNumber : maskedNumber;
  const cvvDisplay = revealed && card.cvv ? card.cvv : '\u2022\u2022\u2022';
  const nameDisplay = revealed ? (card.cardholderName ?? '\u2014') : card.cardholderName ? '\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022' : '\u2014';

  return (
    <Screen padded>
      <ScrollView
        contentContainerStyle={[styles.container, { paddingTop: insets.top + spacing.lg }]}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}>
        <BackButton onPress={() => router.back()} />

        <FadeIn>
          <PageHeader
            eyebrow="Protected card"
            title={card.nickname}
            description={card.issuer ? `${card.issuer} • details stay on this device` : 'Details stay on this device'}
          />
        </FadeIn>

        <FadeIn delay={60}>
          <CardVisual
            nickname={card.nickname}
            issuer={card.issuer}
            network={card.network}
            last4={last4}
            cardId={card.id}
            cardholderName={revealed ? card.cardholderName : undefined}
            expiry={formatExpiry(card.expiryMonth, card.expiryYear)}
          />
        </FadeIn>

        <FadeIn delay={120}>
          <Section style={styles.fields} contentStyle={styles.fieldsContent}>
            <Animated.View style={revealStyle}>
              <DetailRow
                label="Card Number"
                value={numberDisplay}
                action={copied === 'number' ? 'Copied' : 'Copy'}
                copied={copied === 'number'}
                onPress={() => copyField('number', card.cardNumber)}
              />
              <DetailRow
                label="Expiry"
                value={formatExpiry(card.expiryMonth, card.expiryYear)}
                action={copied === 'expiry' ? 'Copied' : 'Copy'}
                copied={copied === 'expiry'}
                onPress={() => copyField('expiry', formatExpiry(card.expiryMonth, card.expiryYear), false)}
              />
              <DetailRow
                label="Cardholder"
                value={nameDisplay}
                action={copied === 'name' ? 'Copied' : card.cardholderName ? 'Copy' : undefined}
                copied={copied === 'name'}
                onPress={card.cardholderName ? () => copyField('name', card.cardholderName ?? '') : undefined}
              />
              <DetailRow
                label="CVV"
                value={cvvDisplay}
                action={revealed ? (copied === 'cvv' ? 'Copied' : 'Copy') : 'Show'}
                copied={copied === 'cvv'}
                onPress={
                  revealed && card.cvv
                    ? () => copyField('cvv', card.cvv ?? '')
                    : reveal
                }
                last={!card.notes}
              />
              {card.notes ? (
                <DetailRow
                  label="Notes"
                  value={card.notes}
                  action={copied === 'notes' ? 'Copied' : 'Copy'}
                  copied={copied === 'notes'}
                  onPress={() => copyField('notes', card.notes ?? '', false)}
                  last
                />
              ) : null}
            </Animated.View>
          </Section>
        </FadeIn>

        {!revealed ? (
          <FadeIn>
            <FeedbackBanner tone="info" style={styles.hint}>
              Authenticate to reveal sensitive details
            </FeedbackBanner>
          </FadeIn>
        ) : null}

        {copied ? (
          <FadeIn>
            <FeedbackBanner tone="success" style={styles.copiedToast}>
              Copied to clipboard. Cardly clears sensitive values automatically.
            </FeedbackBanner>
          </FadeIn>
        ) : null}

        <Button
          label="Edit Card"
          variant="secondary"
          onPress={() => router.push(`/card/edit/${card.id}`)}
          style={styles.editButton}
        />
        <Button
          label={confirmDelete ? 'Confirm delete' : 'Delete Card'}
          variant="danger"
          onPress={onDelete}
        />
      </ScrollView>
    </Screen>
  );
}

function DetailRow({
  label,
  value,
  onPress,
  action,
  copied,
  last,
}: {
  label: string;
  value: string;
  onPress?: () => void;
  action?: string;
  copied?: boolean;
  last?: boolean;
}) {
  const theme = useTheme();
  return (
    <View style={[styles.row, !last && { borderBottomColor: theme.outline, borderBottomWidth: borderWidth.standard }]}>
      <View style={styles.rowText}>
        <T variant="label" color="secondary">
          {label}
        </T>
        <T variant="body" numberOfLines={2}>
          {value}
        </T>
      </View>
      {onPress && action ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${action} ${label}`}
          onPress={onPress}
          hitSlop={12}
          style={({ pressed }) => [
            styles.copyButton,
            { backgroundColor: theme.yellow, borderColor: theme.outline },
            pressed && styles.copyButtonPressed,
          ]}>
          {copied ? (
            <IconCheck size={14} color={theme.yellowText} />
          ) : action === 'Show' ? (
            <IconEye size={14} color={theme.yellowText} />
          ) : (
            <IconCopy size={14} color={theme.yellowText} />
          )}
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.md, paddingBottom: spacing.xxl },
  fields: { marginTop: spacing.sm },
  fieldsContent: { paddingVertical: spacing.sm, gap: 0 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  rowText: { flex: 1, gap: spacing.xs },
  copyButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: borderWidth.standard,
    borderRadius: 4,
  },
  copyButtonPressed: { transform: [{ translateX: 2 }, { translateY: 2 }] },
  hint: { marginTop: spacing.xs },
  copiedToast: { marginTop: spacing.xs },
  editButton: { marginTop: spacing.lg },
});
