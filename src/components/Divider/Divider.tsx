import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Spacing } from '@/constants';
import { useTheme } from '@/hooks/useTheme';

interface DividerProps {
  style?: ViewStyle;
  color?: string;
  thickness?: number;
  spacing?: keyof typeof Spacing;
}

export const Divider: React.FC<DividerProps> = ({
  style,
  color,
  thickness = 1,
  spacing = 'lg',
}) => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.divider,
        {
          backgroundColor: color || colors.border.light,
          height: thickness,
          marginVertical: Spacing[spacing],
        },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  divider: {
    width: '100%',
  },
});
