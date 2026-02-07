/**
 * StatCard Component
 * Displays a statistic with optional trend indicator
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, Typography, Layout } from '@/constants';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  variant?: 'default' | 'compact';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = 'default',
}) => {
  const isPositiveTrend = trend?.isPositive ?? true;

  return (
    <View style={[styles.container, variant === 'compact' && styles.compact]}>
      {icon && <Text style={styles.icon}>{icon}</Text>}
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.value}>{value}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        {trend && (
          <View style={styles.trendContainer}>
            <Text style={styles.trendIcon}>{isPositiveTrend ? '↑' : '↓'}</Text>
            <Text
              style={[
                styles.trendValue,
                isPositiveTrend ? styles.trendPositive : styles.trendNegative,
              ]}
            >
              {Math.abs(trend.value).toFixed(1)}%
            </Text>
            {trend.label && <Text style={styles.trendLabel}>{trend.label}</Text>}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: Layout.borderRadius.md,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border.light,
    ...Layout.shadow.sm,
  },
  compact: {
    padding: Spacing.md,
  },
  icon: {
    fontSize: 32,
    marginBottom: Spacing.sm,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    fontWeight: Typography.fontWeight.medium,
    marginBottom: Spacing.xs,
  },
  value: {
    fontSize: Typography.fontSize.xl2,
    color: Colors.text.primary,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.tertiary,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  trendIcon: {
    fontSize: Typography.fontSize.sm,
    marginRight: Spacing.xs,
  },
  trendValue: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    marginRight: Spacing.xs,
  },
  trendPositive: {
    color: Colors.success[600],
  },
  trendNegative: {
    color: Colors.danger[600],
  },
  trendLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
  },
});
