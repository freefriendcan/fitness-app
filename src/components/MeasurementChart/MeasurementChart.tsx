import React from 'react';
import { View, StyleSheet, Text, Dimensions } from 'react-native';
import { Svg, Line, Polyline, Circle } from 'react-native-svg';
import { Colors, Spacing, Typography } from '@/constants';
import type { BodyMeasurement } from '@/types';

interface Props {
  measurements: BodyMeasurement[];
  field: keyof Omit<BodyMeasurement, 'id' | 'date' | 'notes'>;
  color?: string;
  unitSystem: 'metric' | 'imperial';
  days?: number; // Number of days to show
}

export const MeasurementChart: React.FC<Props> = ({
  measurements,
  field,
  color = Colors.primary[500],
  unitSystem,
  days = 30,
}) => {
  const screenWidth = Dimensions.get('window').width - Spacing.lg * 2;

  // Filter measurements by date range
  const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const filteredData = measurements
    .filter((m) => new Date(m.date) >= cutoffDate)
    .filter((m) => m[field] !== undefined)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-10); // Max 10 data points

  if (filteredData.length < 2) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          Not enough data to display chart
        </Text>
      </View>
    );
  }

  // Convert values based on unit system
  const convertValue = (value: number) => {
    if (field === 'weight' && unitSystem === 'imperial') {
      return value * 2.20462; // kg to lbs
    }
    if (
      field !== 'weight' &&
      field !== 'bodyFat' &&
      unitSystem === 'imperial'
    ) {
      return value * 0.3937; // cm to inches
    }
    return value;
  };

  const values = filteredData.map((m) =>
    convertValue(m[field] as number)
  );

  // Calculate min and max for scaling
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = maxValue - minValue || 1; // Avoid division by zero

  // Chart dimensions
  const chartHeight = 150;
  const chartWidth = screenWidth;
  const padding = { top: 20, bottom: 30, left: 50, right: 20 };

  // Calculate points
  const points = values.map((value, index) => {
    const x =
      padding.left +
      (index / (values.length - 1)) * (chartWidth - padding.left - padding.right);
    const y =
      padding.top +
      (1 - (value - minValue) / range) * (chartHeight - padding.top - padding.bottom);
    return { x, y, value };
  });

  // Generate polyline points string
  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(' ');

  // Format value for display
  const formatValue = (value: number) => {
    if (unitSystem === 'imperial') {
      if (field === 'weight') return Math.round(value);
      return value.toFixed(1);
    }
    if (field === 'bodyFat') return value.toFixed(1);
    if (field === 'weight') return Math.round(value);
    return value.toFixed(1);
  };

  const getUnit = () => {
    if (field === 'bodyFat') return '%';
    if (field === 'weight') return unitSystem === 'imperial' ? 'lbs' : 'kg';
    return unitSystem === 'imperial' ? 'in' : 'cm';
  };

  // Generate Y-axis labels
  const yLabels = [];
  const numLabels = 5;
  for (let i = 0; i < numLabels; i++) {
    const value = minValue + (range * (numLabels - 1 - i)) / (numLabels - 1);
    yLabels.push(value);
  }

  return (
    <View style={styles.container}>
      {/* Y-axis labels */}
      {yLabels.map((label, index) => {
        const y =
          padding.top +
          (index / (numLabels - 1)) * (chartHeight - padding.top - padding.bottom);

        return (
          <Text
            key={index}
            style={[
              styles.yAxisLabel,
              {
                top: y - 10,
                left: 0,
              },
            ]}
          >
            {formatValue(label)}
          </Text>
        );
      })}

      {/* Chart */}
      <Svg width={chartWidth} height={chartHeight}>
        {/* Horizontal grid lines */}
        {yLabels.map((_, index) => {
          const y =
            padding.top +
            (index / (numLabels - 1)) * (chartHeight - padding.top - padding.bottom);
          return (
            <Line
              key={index}
              x1={padding.left}
              y1={y}
              x2={chartWidth - padding.right}
              y2={y}
              stroke={Colors.border.light}
              strokeWidth="1"
              strokeDasharray="4,4"
            />
          );
        })}

        {/* Data line */}
        <Polyline
          points={polylinePoints}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Data points */}
        {points.map((point, index) => (
          <Circle
            key={index}
            cx={point.x}
            cy={point.y}
            r="5"
            fill={Colors.white}
            stroke={color}
            strokeWidth="3"
          />
        ))}
      </Svg>

      {/* X-axis labels (dates) */}
      <View style={styles.xAxis}>
        {filteredData.map((m, index) => {
          const date = new Date(m.date);
          const dateStr = date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          });
          return (
            <Text
              key={index}
              style={[
                styles.xAxisLabel,
                {
                  left:
                    padding.left +
                    (index / (filteredData.length - 1)) *
                      (chartWidth - padding.left - padding.right) -
                    20,
                },
              ]}
            >
              {dateStr}
            </Text>
          );
        })}
      </View>

      {/* Unit label */}
      <Text style={styles.unitLabel}>{getUnit()}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.md,
  },
  emptyContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background.secondary,
    borderRadius: 8,
    padding: Spacing.lg,
  },
  emptyText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  yAxisLabel: {
    position: 'absolute',
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
    width: 40,
    textAlign: 'right',
  },
  xAxis: {
    height: 20,
    marginTop: Spacing.xs,
  },
  xAxisLabel: {
    position: 'absolute',
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
    width: 40,
    textAlign: 'center',
  },
  unitLabel: {
    position: 'absolute',
    top: 5,
    right: 5,
    fontSize: Typography.fontSize.xs,
    color: Colors.primary[500],
    fontWeight: Typography.fontWeight.semibold,
  },
});
