/**
 * LineChart Component
 * Simple SVG line chart for displaying trends over time
 */

import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Polyline, Line, Circle, G, Text as SvgText } from 'react-native-svg';
import { Colors, Spacing, Typography } from '@/constants';

export interface DataPoint {
  x: number;
  y: number;
  label?: string;
  value: number;
  date?: Date;
}

interface LineChartProps {
  data: DataPoint[];
  width?: number;
  height?: number;
  color?: string;
  showDots?: boolean;
  showGrid?: boolean;
  showLabels?: boolean;
  lineThickness?: number;
  animated?: boolean;
  formatYLabel?: (value: number) => string;
  formatXLabel?: (label: string, date?: Date) => string;
  onPointPress?: (point: DataPoint) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const LineChart: React.FC<LineChartProps> = ({
  data,
  width = SCREEN_WIDTH - Spacing.lg * 2,
  height = 200,
  color = Colors.primary[500],
  showDots = true,
  showGrid = true,
  showLabels = false,
  lineThickness = 2,
  animated = true,
  formatYLabel = (value) => value.toString(),
  formatXLabel = (label) => label,
  onPointPress,
}) => {
  if (data.length === 0) {
    return (
      <View style={[styles.container, { width, height }]}>
        <Text style={styles.noDataText}>No data available</Text>
      </View>
    );
  }

  const padding = {
    top: Spacing.sm,
    bottom: Spacing.md + (showLabels ? Spacing.md : 0),
    left: Spacing.sm,
    right: Spacing.sm,
  };

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Calculate min and max values
  const values = data.map((d) => d.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = maxValue - minValue || 1;

  // Add some padding to the range
  const paddedMin = minValue - range * 0.1;
  const paddedMax = maxValue + range * 0.1;
  const paddedRange = paddedMax - paddedMin;

  // Normalize data points
  const points: DataPoint[] = data.map((d, index) => ({
    ...d,
    x: padding.left + (index / (data.length - 1 || 1)) * chartWidth,
    y: padding.top + chartHeight - ((d.value - paddedMin) / paddedRange) * chartHeight,
  }));

  // Create polyline points string
  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(' ');

  // Create grid lines
  const gridLines = [];
  const gridCount = 5;
  for (let i = 0; i <= gridCount; i++) {
    const y = padding.top + (i / gridCount) * chartHeight;
    const value = paddedMax - (i / gridCount) * paddedRange;
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
        {showLabels && (
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

  // Create data points
  const dotElements = points.map((p, index) => (
    <Circle
      key={index}
      cx={p.x}
      cy={p.y}
      r={4}
      fill={color}
      onPress={() => onPointPress?.(data[index])}
    />
  ));

  return (
    <View style={[styles.container, { width, height }]}>
      <Svg width={width} height={height}>
        {showGrid && gridLines}
        <Polyline
          points={polylinePoints}
          fill="none"
          stroke={color}
          strokeWidth={lineThickness}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {showDots && dotElements}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
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
