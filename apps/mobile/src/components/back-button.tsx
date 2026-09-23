import React from 'react';
import { StyleSheet } from 'react-native';

import { Button, IconArrowLeft, useTheme } from '@cardly/ui';

/**
 * Consistent back navigation button used across all screens.
 * Renders an icon-based ghost button with a ← arrow.
 */
export function BackButton({
  onPress,
  label = 'Back',
}: {
  onPress: () => void;
  label?: string;
}) {
  const theme = useTheme();

  return (
    <Button
      label={label}
      variant="ghost"
      size="sm"
      icon={<IconArrowLeft size={18} color={theme.text} />}
      onPress={onPress}
      style={styles.back}
    />
  );
}

const styles = StyleSheet.create({
  back: {
    alignSelf: 'flex-start',
    minHeight: 40,
    paddingHorizontal: 0,
  },
});
