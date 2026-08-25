import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Screen, T, spacing } from '@cardly/ui';
import type { ScannedCard } from '@cardly/vault';

import { scanCardImage } from '@/lib/ocr';

export default function ScanCardScreen() {
  const router = useRouter();
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
      // OCR runs on-device: the captured image is processed locally and never
      // leaves the device. The review screen always lets the user correct
      // every field — OCR is a convenience, never the source of truth.
      const source = photo?.base64 ? `data:image/jpeg;base64,${photo.base64}` : photo?.uri ?? '';
      const scanned = source ? await scanCardImage(source) : {};
      router.push({ pathname: '/add/review', params: encodeScanned(scanned) });
    } catch {
      setError('Could not capture the card. Try again.');
      setCapturing(false);
    }
  };

  if (!permission) {
    return (
      <Screen padded>
        <View style={[styles.center, { paddingTop: insets.top + spacing.lg }]}>
          <T variant="title">Camera</T>
        </View>
      </Screen>
    );
  }

  if (!permission.granted) {
    return (
      <Screen padded>
        <View style={[styles.center, { paddingTop: insets.top + spacing.lg }]}>
          <T variant="title" style={styles.centerText}>
            Camera access needed
          </T>
          <T variant="secondary" color="secondary" style={styles.centerText}>
            Cardly uses the camera only to read your card. The image never
            leaves the device.
          </T>
          <Button label="Grant Camera Access" onPress={requestPermission} />
          <Button label="Enter Manually Instead" variant="secondary" onPress={() => router.replace('/add/manual')} />
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
        <View style={[styles.overlay, { paddingTop: insets.top + spacing.md }]}>
          <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.backButton} hitSlop={12}>
            <T variant="body" style={{ color: '#fff' }}>
              Cancel
            </T>
          </Pressable>
          <T variant="bodyLarge" style={{ color: '#fff', textAlign: 'center' }}>
            Align your card in the frame
          </T>
        </View>
        {error && (
          <View style={styles.errorBanner}>
            <T variant="caption" style={{ color: '#fff' }}>
              {error}
            </T>
          </View>
        )}
        <View style={[styles.captureRow, { paddingBottom: insets.bottom + spacing.lg }]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Capture card"
            onPress={onCapture}
            style={({ pressed }) => [styles.shutter, pressed && styles.shutterPressed]}>
            <View style={styles.shutterInner} />
          </Pressable>
        </View>
      </View>
    </Screen>
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
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, gap: spacing.lg, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.lg },
  centerText: { textAlign: 'center' },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  backButton: { alignSelf: 'flex-start', paddingVertical: spacing.sm },
  errorBanner: {
    position: 'absolute',
    top: 120,
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 12,
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
  shutter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterPressed: { opacity: 0.7 },
  shutterInner: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#fff' },
});
