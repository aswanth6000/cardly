import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { Button, IconCamera, PageHeader, Screen, Section, T, borderWidth, spacing, useTheme } from '@cardly/ui';
import type { ScannedCard } from '@cardly/vault';

import { BackButton } from '@/components/back-button';
import { FadeIn } from '@/components/fade-in';
import { scanCardImage } from '@/lib/ocr';

export default function ScanCardScreen() {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [capturing, setCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onCapture = async () => {
    if (!cameraRef.current || capturing) return;
    setCapturing(true);
    setError(null);
    try {
      const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.7 });
      const source = photo?.base64 ? `data:image/jpeg;base64,${photo.base64}` : photo?.uri ?? '';
      const scanned = source ? await scanCardImage(source) : {};
      router.push({ pathname: '/add/review', params: encodeScanned(scanned) });
    } catch {
      setError('Could not capture the card. Try again.');
    } finally {
      setCapturing(false);
    }
  };

  if (!permission) {
    return (
      <Screen padded>
        <View style={[styles.center, { paddingTop: insets.top + spacing.lg }]}>
          <PageHeader eyebrow="Card scan" title="Camera" />
        </View>
      </Screen>
    );
  }

  if (!permission.granted) {
    return (
      <Screen padded>
        <View style={[styles.center, { paddingTop: insets.top + spacing.lg }]}>
          <FadeIn>
            <PageHeader
              eyebrow="Card scan"
              title="Camera access needed"
              icon={<IconCamera size={28} color={theme.text} />}
              description="Cardly uses the camera only to read your card. The image never leaves the device."
            />
          </FadeIn>
          <FadeIn delay={70}>
            <Section tone="accent">
              <T variant="label">Heads up</T>
              <T variant="body">You can always add card details manually instead.</T>
            </Section>
          </FadeIn>
          <FadeIn delay={140}>
            <Button label="Grant Camera Access" onPress={requestPermission} />
          </FadeIn>
          <FadeIn delay={210}>
            <Button label="Enter Manually Instead" variant="secondary" onPress={() => router.replace('/add')} />
          </FadeIn>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.container}>
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing="back"
          autofocus="on"
          onMountError={() => setError('Could not start the camera.')}
        />
        {/* Animated corner markers */}
        <FrameGuide color={theme.yellow} />
        <View style={[styles.overlay, { paddingTop: insets.top + spacing.md }]}>
          <BackButton onPress={() => router.back()} label="Cancel" />
          <T variant="label" style={styles.hint}>
            Align your card in the frame
          </T>
        </View>
        {error ? (
          <View style={[styles.errorBanner, { backgroundColor: theme.dangerSurface, borderColor: theme.outline }]}>
            <T variant="caption" style={{ color: theme.dangerText }}>
              {error}
            </T>
          </View>
        ) : null}
        <View style={[styles.captureRow, { paddingBottom: insets.bottom + spacing.lg }]}>
          <ShutterButton
            onPress={onCapture}
            capturing={capturing}
            theme={theme}
          />
        </View>
      </View>
    </Screen>
  );
}

/** Animated corner markers instead of a full border frame. */
function FrameGuide({ color }: { color: string }) {
  const pulseOpacity = useSharedValue(0.7);

  useEffect(() => {
    pulseOpacity.value = withRepeat(
      withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [pulseOpacity]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  const cornerStyle = { borderColor: color, borderWidth: 3 };
  const cornerSize = 28;

  return (
    <Animated.View style={[styles.frameWrap, animStyle]} pointerEvents="none">
      {/* Top-left */}
      <View style={[styles.corner, styles.cornerTL, cornerStyle, { width: cornerSize, height: cornerSize }]} />
      {/* Top-right */}
      <View style={[styles.corner, styles.cornerTR, cornerStyle, { width: cornerSize, height: cornerSize }]} />
      {/* Bottom-left */}
      <View style={[styles.corner, styles.cornerBL, cornerStyle, { width: cornerSize, height: cornerSize }]} />
      {/* Bottom-right */}
      <View style={[styles.corner, styles.cornerBR, cornerStyle, { width: cornerSize, height: cornerSize }]} />
    </Animated.View>
  );
}

/** Polished circular shutter button with ring animation. */
function ShutterButton({
  onPress,
  capturing,
  theme,
}: {
  onPress: () => void;
  capturing: boolean;
  theme: { yellow: string; outline: string; hardShadow: string };
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Capture card"
      disabled={capturing}
      onPress={onPress}
      style={({ pressed }) => [styles.shutterOuter, (pressed || capturing) && styles.shutterPressed]}>
      <View style={[styles.shutterRing, { borderColor: theme.yellow }]}>
        <View style={[styles.shutterInner, { backgroundColor: theme.yellow, borderColor: theme.outline }]} />
      </View>
    </Pressable>
  );
}

function encodeScanned(scanned: ScannedCard): Record<string, string> {
  const params: Record<string, string> = {};
  if (scanned.cardNumber) params.cardNumber = scanned.cardNumber;
  if (scanned.expiryMonth) params.expiryMonth = String(scanned.expiryMonth);
  if (scanned.expiryYear) params.expiryYear = String(scanned.expiryYear);
  if (scanned.cardholderName) params.cardholderName = scanned.cardholderName;
  return params;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#17130F' },
  center: {
    flex: 1,
    gap: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  hint: {
    color: '#FFF6E7',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  frameWrap: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    top: '28%',
    aspectRatio: 1.586,
  },
  corner: {
    position: 'absolute',
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 8,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 8,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 8,
  },
  errorBanner: {
    position: 'absolute',
    top: 120,
    left: spacing.lg,
    right: spacing.lg,
    borderRadius: 4,
    borderWidth: borderWidth.standard,
    padding: spacing.md,
    alignItems: 'center',
  },
  captureRow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  shutterOuter: {
    width: 76,
    height: 76,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: borderWidth.standard,
  },
  shutterPressed: {
    transform: [{ scale: 0.92 }],
    opacity: 0.8,
  },
});
