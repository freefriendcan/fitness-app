import React, { useMemo } from 'react';
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
import { Colors, Spacing, Typography, Layout } from '@/constants';

interface Props {
  photos: ProgressPhoto[];
  onPhotoPress: (photo: ProgressPhoto) => void;
  onLongPress?: (photo: ProgressPhoto) => void;
  selectedIds?: string[];
}

const screenWidth = Dimensions.get('window').width;

export const ProgressPhotoGallery: React.FC<Props> = ({
  photos,
  onPhotoPress,
  onLongPress,
  selectedIds = [],
}) => {
  const numColumns = 3;
  const gap = Spacing.sm;
  const cardSize = (screenWidth - Spacing.lg * 2 - gap * (numColumns - 1)) / numColumns;

  // Lazy style creation to avoid circular dependency with Layout
  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          paddingVertical: Spacing.sm,
        },
        gallery: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          marginHorizontal: Spacing.lg,
        },
        photoCard: {
          borderRadius: Layout.borderRadius.md,
          overflow: 'hidden',
          backgroundColor: Colors.neutral[200],
          position: 'relative',
        },
        photoCardSelected: {
          borderWidth: 3,
          borderColor: Colors.primary[500],
        },
        photo: {
          width: '100%',
          height: '100%',
        },
        photoOverlay: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          paddingTop: Spacing.xs,
          paddingBottom: Spacing.sm,
          paddingHorizontal: Spacing.xs,
        },
        photoInfo: {
          gap: 2,
        },
        photoTypeBadge: {
          alignSelf: 'flex-start',
          paddingHorizontal: Spacing.xs,
          paddingVertical: 2,
          borderRadius: 4,
        },
        photoTypeText: {
          fontSize: Typography.fontSize.xs,
          fontWeight: Typography.fontWeight.semibold,
          color: Colors.white,
        },
        photoDate: {
          fontSize: Typography.fontSize.xs,
          color: Colors.white,
          fontWeight: Typography.fontWeight.medium,
        },
        selectedIndicator: {
          position: 'absolute',
          top: Spacing.xs,
          right: Spacing.xs,
          backgroundColor: Colors.white,
          borderRadius: 12,
        },
        emptyContainer: {
          alignItems: 'center',
          paddingVertical: Spacing.xl3,
          paddingHorizontal: Spacing.xl,
        },
        emptyText: {
          fontSize: Typography.fontSize.base,
          fontWeight: Typography.fontWeight.semibold,
          color: Colors.text.primary,
          marginTop: Spacing.md,
        },
        emptySubtext: {
          fontSize: Typography.fontSize.sm,
          color: Colors.text.secondary,
          textAlign: 'center',
          marginTop: Spacing.xs,
        },
      }),
    []
  );

  const formatDate = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getPhotoTypeLabel = (type?: string) => {
    if (!type) return '';
    const labels: Record<string, string> = {
      front: 'Front',
      side: 'Side',
      back: 'Back',
      other: 'Other',
    };
    return labels[type] || '';
  };

  const getPhotoTypeColor = (type?: string) => {
    if (!type) return Colors.primary[500];
    const colors: Record<string, string> = {
      front: Colors.primary[500],
      side: Colors.secondary[500],
      back: Colors.success[500],
      other: Colors.neutral[500],
    };
    return colors[type] || Colors.primary[500];
  };

  if (photos.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="image-outline" size={64} color={Colors.neutral[300]} />
        <Text style={styles.emptyText}>No progress photos yet</Text>
        <Text style={styles.emptySubtext}>
          Take your first photo to start tracking your visual progress
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.gallery}>
        {photos.map((photo) => {
          const isSelected = selectedIds.includes(photo.id);

          return (
            <TouchableOpacity
              key={photo.id}
              style={[
                styles.photoCard,
                {
                  width: cardSize,
                  height: cardSize,
                  marginRight: (photos.indexOf(photo) + 1) % numColumns === 0 ? 0 : gap,
                  marginBottom: gap,
                },
                isSelected && styles.photoCardSelected,
              ]}
              onPress={() => onPhotoPress(photo)}
              onLongPress={() => onLongPress?.(photo)}
              activeOpacity={0.7}
            >
              {/* Photo */}
              <Image
                source={{ uri: photo.photoUri }}
                style={styles.photo}
                resizeMode="cover"
              />

              {/* Overlay with date and type */}
              <View style={styles.photoOverlay}>
                <View style={styles.photoInfo}>
                  {photo.photoType && (
                    <View
                      style={[
                        styles.photoTypeBadge,
                        { backgroundColor: getPhotoTypeColor(photo.photoType) },
                      ]}
                    >
                      <Text style={styles.photoTypeText}>
                        {getPhotoTypeLabel(photo.photoType)}
                      </Text>
                    </View>
                  )}
                  <Text style={styles.photoDate}>{formatDate(photo.date)}</Text>
                </View>
              </View>

              {/* Selected indicator */}
              {isSelected && (
                <View style={styles.selectedIndicator}>
                  <Ionicons name="checkmark-circle" size={24} color={Colors.primary[500]} />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};
