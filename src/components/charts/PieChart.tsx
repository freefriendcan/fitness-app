/**
 * PieChart Component
 * Simple SVG pie chart for displaying distribution data
 */

import React from 'react';
import { View, StyleSheet, Dimensions, ScrollView } from 'react-native';
import Svg, { Circle, Path, G, Text as SvgText, Line } from 'react-native-svg';
import { Colors, Spacing, Typography, Layout } from '@/constants';

export interface PieData {
  label: string;
  value: number;
  color: string;
}

interface PieChartProps {
  data: PieData[];
  size?: number;
  showLabels?: boolean;
  showLegend?: boolean;
  centerLabel?: string;
  centerValue?: string;
}

const COLORS = [
  Colors.primary[500],
  Colors.secondary[500],
  Colors.success[500],
  Colors.warning[500],
  Colors.danger[500],
  Colors.neutral[600],
  '#9C27B0',
  '#00BCD4',
];

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const PieChart: React.FC<PieChartProps> = ({
  data,
  size = Math.min(SCREEN_WIDTH - Spacing.lg * 2, 250),
  showLabels = false,
  showLegend = true,
  centerLabel,
  centerValue,
}) => {
  if (data.length === 0) {
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <Text style={styles.noDataText}>No data available</Text>
      </View>
    );
  }

  const radius = size / 2;
  const center = radius;
  const totalValue = data.reduce((sum, d) => sum + d.value, 0);

  // Assign colors to data
  const coloredData = data.map((d, i) => ({
    ...d,
    color: d.color || COLORS[i % COLORS.length],
  }));

  // Create pie slices
  let currentAngle = -90; // Start at top
  const slices = coloredData.map((d, i) => {
    const sliceAngle = (d.value / totalValue) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;

    // Calculate path
    const startAngleRad = (startAngle * Math.PI) / 180;
    const endAngleRad = (endAngle * Math.PI) / 180;

    const x1 = center + radius * Math.cos(startAngleRad);
    const y1 = center + radius * Math.sin(startAngleRad);
    const x2 = center + radius * Math.cos(endAngleRad);
    const y2 = center + radius * Math.sin(endAngleRad);

    const largeArcFlag = sliceAngle > 180 ? 1 : 0;

    const pathData = `
      M ${center} ${center}
      L ${x1} ${y1}
      A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}
      Z
    `;

    currentAngle = endAngle;

    // Calculate label position
    const midAngle = startAngle + sliceAngle / 2;
    const midAngleRad = (midAngle * Math.PI) / 180;
    const labelRadius = radius * 0.7;
    const labelX = center + labelRadius * Math.cos(midAngleRad);
    const labelY = center + labelRadius * Math.sin(midAngleRad);

    return {
      ...d,
      pathData,
      percentage: ((d.value / totalValue) * 100).toFixed(1),
      labelX,
      labelY,
    };
  });

  const svgContent = (
    <Svg width={size} height={size}>
      {slices.map((slice, i) => (
        <G key={i}>
          <Path d={slice.pathData} fill={slice.color} />
          {showLabels && slice.value / totalValue > 0.05 && (
            <SvgText
              x={slice.labelX}
              y={slice.labelY}
              fontSize={Typography.fontSize.xs}
              fill={Colors.white}
              textAnchor="middle"
              fontWeight="600"
            >
              {slice.percentage}%
            </SvgText>
          )}
        </G>
      ))}
      {centerLabel && (
        <G>
          <SvgText
            x={center}
            y={center - 10}
            fontSize={Typography.fontSize.sm}
            fill={Colors.text.secondary}
            textAnchor="middle"
          >
            {centerLabel}
          </SvgText>
          {centerValue && (
            <SvgText
              x={center}
              y={center + 15}
              fontSize={Typography.fontSize.lg}
              fill={Colors.text.primary}
              textAnchor="middle"
              fontWeight="bold"
            >
              {centerValue}
            </SvgText>
          )}
        </G>
      )}
    </Svg>
  );

  const legend = (
    <View style={styles.legendContainer}>
      {slices.map((slice, i) => (
        <View key={i} style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: slice.color }]} />
          <Text style={styles.legendLabel}>
            {slice.label} ({slice.percentage}%)
          </Text>
        </View>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      {svgContent}
      {showLegend && legend}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  noDataText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginTop: Spacing.lg,
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Spacing.md,
    marginBottom: Spacing.xs,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 2,
    marginRight: Spacing.xs,
  },
  legendLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
  },
});
