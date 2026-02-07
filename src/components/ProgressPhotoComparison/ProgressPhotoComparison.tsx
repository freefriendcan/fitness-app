import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ProgressPhoto } from '@/types';
import { Card, Colors, Spacing, Typography } from '@/components';

interface Props {
  beforePhoto: ProgressPhoto;
  afterPhoto: ProgressPhoto;
  onClose?: () => void;
}

const screenWidth = Dimensions.get('window').width;

export const ProgressPhotoComparison: React.FC<Props> = ({
  beforePhoto,
  afterPhoto,
  onClose,
}) => {
  const imageWidth = (screenWidth - Spacing.lg * 2 - Spacing.md) / 2;
  const imageHeight = imageWidth * 1.33; // 3:4 aspect ratio

  const formatDate = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const calculateDaysBetween = (before: Date, after: Date) => {
    const diffMs = new Date(after).getTime() - new Date(before).getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  };

  const daysBetween = calculateDaysBetween(beforePhoto.date, afterPhoto.date);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Progress Comparison</Text>
          <Text style={styles.subtitle}>
            {daysBetween} days between photos
          </Text>
        </View>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color={Colors.text.primary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Comparison View */}
      <View style={styles.comparisonContainer}>
        {/* Before Photo */}
        <View style={styles.photoColumn}>
          <Card style={styles.photoCard}>
            <View style={styles.photoHeader}>
              <Text style={styles.photoLabel}>Before</Text>
              <Ionicons
                name="arrow-back"
                size={20}
                color={Colors.danger[500]}
              />
            </View>
            <Image
              source={{ uri: beforePhoto.photoUri }}
              style={[styles.photo, { width: imageWidth, height: imageHeight }]}
              resizeMode="cover"
            />
            <View style={styles.photoFooter}>
              <Text style={styles.photoDate}>{formatDate(beforePhoto.date)}</Text>
              {beforePhoto.notes && (
                <Text style={styles.photoNotes} numberOfLines={1}>
                  {beforePhoto.notes}
                </Text>
              )}
            </View>
          </Card>
        </View>

        {/* After Photo */}
        <View style={styles.photoColumn}>
          <Card style={styles.photoCard}>
            <View style={styles.photoHeader}>
              <Text style={styles.photoLabel}>After</Text>
              <Ionicons
                name="arrow-forward"
                size={20}
                color={Colors.success[500]}
              />
            </View>
            <Image
              source={{ uri: afterPhoto.photoUri }}
              style={[styles.photo, { width: imageWidth, height: imageHeight }]}
              resizeMode="cover"
            />
            <View style={styles.photoFooter}>
              <Text style={styles.photoDate}>{formatDate(afterPhoto.date)}</Text>
              {afterPhoto.notes && (
                <Text style={styles.photoNotes} numberOfLines={1}>
                  {afterPhoto.notes}
                </Text>
              )}
            </View>
          </Card>
        </View>
      </View>

      {/* Tips */}
      <Card style={styles.tipsCard}>
        <Text style={styles.tipsTitle}>Comparison Tips</Text>
        <Text style={styles.tipsText}>
          • Compare photos taken at the same time of day{'\n'}
          • Use similar lighting conditions{'\n'}
          • Maintain the same pose and angle{'\n'}
          • Wear similar clothing (or none)
        </Text>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  subtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
  },
  closeButton: {
    padding: Spacing.sm,
  },
  comparisonContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  photoColumn: {
    flex: 1,
  },
  photoCard: {
    padding: Spacing.sm,
  },
  photoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  photoLabel: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
  photo: {
    borderRadius: Layout.borderRadius.md,
  },
  photoFooter: {
    marginTop: Spacing.sm,
    gap: 2,
  },
  photoDate: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.primary,
  },
  photoNotes: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
  },
  tipsCard: {
    margin: Spacing.lg,
    padding: Spacing.md,
  },
  tipsTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  tipsText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    lineHeight: 22,
  },
});
