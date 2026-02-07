import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Layout, Spacing, Typography } from '@/constants';
import { useTheme } from '@/hooks/useTheme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  textStyle,
  fullWidth = false,
  icon,
}) => {
  const { colors } = useTheme();

  const getBackgroundColor = (): string => {
    if (disabled) return colors.neutral[300];
    if (variant === 'primary') return colors.primary[500];
    if (variant === 'secondary') return colors.secondary[500];
    if (variant === 'outline' || variant === 'ghost') return 'transparent';
    return colors.primary[500];
  };

  const getTextColor = (): string => {
    if (disabled) return colors.neutral[500];
    if (variant === 'primary' || variant === 'secondary') return colors.white;
    return colors.primary[500];
  };

  const getBorderColor = (): string => {
    if (variant === 'outline') {
      return disabled ? colors.neutral[300] : colors.primary[500];
    }
    return 'transparent';
  };

  const getHeight = (): number => {
    if (size === 'sm') return 36;
    if (size === 'lg') return 56;
    return Layout.buttonHeight;
  };

  const getPaddingHorizontal = (): number => {
    if (size === 'sm') return Spacing.md;
    if (size === 'lg') return Spacing.xl2;
    return Spacing.lg;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          height: getHeight(),
          paddingHorizontal: getPaddingHorizontal(),
        },
        fullWidth && styles.fullWidth,
        style,
      ]}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text
            style={[
              styles.text,
              {
                color: getTextColor(),
                fontSize: size === 'sm' ? Typography.fontSize.sm : Typography.fontSize.base,
              },
              textStyle,
            ]}
          >
            {children}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    fontWeight: Typography.fontWeight.semibold,
    textAlign: 'center',
  },
});
