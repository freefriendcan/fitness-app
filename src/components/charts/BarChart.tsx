/**
 * BarChart Component
 * Simple SVG bar chart for displaying frequency/distribution data
 */

import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import Svg, { Rect, Line, G, Text as SvgText } from 'react-native-svg';
import { Colors, Spacing, Typography } from '@/constants';

export interface BarData {
  label: string;
  value: number;
  date?: Date;
}

interface BarChartProps {
  data: BarData[];
  width?: number;
  height?: number;
  color?: string;
  showGrid?: boolean;
  showLabels?: boolean;
  barWidth?: number;
  barSpacing?: number;
  formatYLabel?: (value: number) => string;
  formatXLabel?: (label: string) => string;
  onPress?: (bar: BarData) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const BarChart: React.FC<BarChartProps> = ({
  data,
  width = SCREEN_WIDTH - Spacing.lg * 2,
  height = 200,
  color = Colors.primary[500],
  showGrid = true,
  showLabels = true,
  barWidth,
  barSpacing = 8,
  formatYLabel = (value) => value.toString(),
  formatXLabel = (label) => label,
  onPress,
}) => {
  const styles = useMemo(() => getStyles(), []);

  if (data.length === 0) {
    return (
      <View style={[styles.container, { width, height }]}>
        <Text style={styles.noDataText}>No data available</Text>
      </View>
    );
  }

  const padding = {
    top: Spacing.sm,
    bottom: Spacing.md + (showLabels ? Spacing.lg : 0),
    left: Spacing.md + (showLabels ? Spacing.lg : 0),
    right: Spacing.sm,
  };

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Calculate bar width
  const calculatedBarWidth = barWidth || (chartWidth - barSpacing * (data.length - 1)) / data.length;
  const totalBarWidth = calculatedBarWidth * data.length + barSpacing * (data.length - 1);

  // Center the bars if they're narrower than the chart
  const offsetX = Math.max(0, (chartWidth - totalBarWidth) / 2);

  // Calculate min and max values
  const values = data.map((d) => d.value);
  const maxValue = Math.max(...values, 1);
  const paddedMax = maxValue * 1.1;

  // Create grid lines
  const gridLines = [];
  const gridCount = 5;
  for (let i = 0; i <= gridCount; i++) {
    const y = padding.top + (i / gridCount) * chartHeight;
    const value = paddedMax - (i / gridCount) * paddedMax;

    gridLines.push(
      <G key={i}>
        <Line
          x1={padding.left}
          y1={y}
          x2={width - padding.right}
          y2={y}
          stroke={Colors.neutral[200]}
          strokeWidth={1}
          strokeDasharray="4 4"
        />
        {showLabels && i < gridCount && (
          <SvgText
            x={padding.left - 5}
            y={y + 4}
            fontSize={Typography.fontSize.xs}
            fill={Colors.text.secondary}
            textAnchor="end"
          >
            {formatYLabel(Math.round(value))}
          </SvgText>
        )}
      </G>
    );
  }

  // Create bars
  const barElements = data.map((d, index) => {
    const barHeight = (d.value / paddedMax) * chartHeight;
    const x = padding.left + offsetX + index * (calculatedBarWidth + barSpacing);
    const y = padding.top + chartHeight - barHeight;

    return (
      <G key={index}>
        <Rect
          x={x}
          y={y}
          width={calculatedBarWidth}
          height={barHeight}
          fill={color}
          rx={4}
          onPress={() => onPress?.(d)}
        />
        {showLabels && (
          <SvgText
            x={x + calculatedBarWidth / 2}
            y={padding.top + chartHeight + 16}
            fontSize={Typography.fontSize.xs}
            fill={Colors.text.secondary}
            textAnchor="middle"
          >
            {formatXLabel(d.label)}
          </SvgText>
        )}
      </G>
    );
  });

  return (
    <View style={[styles.container, { width, height }]}>
      <Svg width={width} height={height}>
        {showGrid && gridLines}
        {barElements}
      </Svg>
    </View>
  );
};

const getStyles = () =>
  StyleSheet.create({
    container: {
      backgroundColor: Colors.white,
      borderRadius: 8,
      paddingVertical: Spacing.sm,
    },
    noDataText: {
      fontSize: Typography.fontSize.sm,
      color: Colors.text.secondary,
      textAlign: 'center',
      marginTop: Spacing.lg,
    },
  });
