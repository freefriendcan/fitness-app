import React from 'react';
import {
  TextInput,
  StyleSheet,
  Text,
  View,
  TextInputProps,
} from 'react-native';
import { Layout, Spacing, Typography } from '@/constants';
import { useTheme } from '@/hooks/useTheme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  style,
  ...textInputProps
}) => {
  const { colors } = useTheme();
  const hasError = !!error;

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: colors.text.primary }]}>{label}</Text>
      )}

      <TextInput
        style={[
          styles.input,
          {
            borderColor: hasError ? colors.danger[500] : colors.border.light,
            color: colors.text.primary,
            backgroundColor: colors.background.card,
          },
          textInputProps.editable === false && styles.inputDisabled,
          style,
        ]}
        placeholderTextColor={colors.neutral[400]}
        {...(textInputProps as Omit<TextInputProps, 'style'>)}
      />

      {error && (
        <Text style={[styles.errorText, { color: colors.danger[500] }]}>{error}</Text>
      )}

      {helperText && !error && (
        <Text style={[styles.helperText, { color: colors.text.secondary }]}>{helperText}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  label: {
    fontWeight: '600' as const,
    fontSize: Typography.fontSize.sm,
    marginBottom: Spacing.xs,
  },
  input: {
    height: Layout.inputHeight,
    borderWidth: 1,
    borderRadius: Layout.borderRadius.md,
    paddingHorizontal: Spacing.md,
    fontSize: Typography.fontSize.base,
  },
  inputDisabled: {
    opacity: 0.5,
  },
  errorText: {
    fontWeight: '400' as const,
    fontSize: Typography.fontSize.xs,
    marginTop: Spacing.xs,
  },
  helperText: {
    fontWeight: '400' as const,
    fontSize: Typography.fontSize.xs,
    marginTop: Spacing.xs,
  },
});
