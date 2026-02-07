import React from 'react';
import { StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Layout, Spacing } from '@/constants';
import { useTheme } from '@/hooks/useTheme';

interface IconButtonProps {
  icon: React.ReactNode;
  onPress: () => void;
  size?: number;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  style?: ViewStyle;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onPress,
  size = 24, // Same as Layout.icon.md - hardcoded to avoid circular dependency
  variant = 'ghost',
  disabled = false,
  style,
}) => {
  const { colors } = useTheme();

  const getBackgroundColor = (): string => {
    if (disabled) return colors.neutral[200];
    if (variant === 'primary') return colors.primary[500];
    if (variant === 'secondary') return colors.secondary[500];
    return 'transparent';
  };

  const getIconColor = (): string => {
    if (disabled) return colors.neutral[400];
    if (variant === 'primary' || variant === 'secondary') return colors.white;
    return colors.primary[500];
  };

  const padding = size + Spacing.sm;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          width: padding * 2,
          height: padding * 2,
          borderRadius: padding,
        },
        style,
      ]}
      activeOpacity={0.7}
    >
      {icon}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
