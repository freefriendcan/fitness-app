import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, Colors, Spacing, Typography } from '@/components';
import { Routes } from '@/constants';
import { useBodyTrackingStore } from '@/store';
import { ProgressPhotoGallery } from '@/components/ProgressPhotoGallery/ProgressPhotoGallery';
import { ProgressPhotoComparison } from '@/components/ProgressPhotoComparison/ProgressPhotoComparison';
import type { ProfileStackParamList } from '@/navigation/types';
import type { ProgressPhoto } from '@/types';

type ProgressPhotosScreenNavigationProp = NativeStackNavigationProp<
  ProfileStackParamList,
  'ProgressPhotos'
>;

type ProgressPhotosScreenRouteProp = RouteProp<
  ProfileStackParamList,
  'ProgressPhotos'
>;

interface Props {
  navigation: ProgressPhotosScreenNavigationProp;
  route: ProgressPhotosScreenRouteProp;
}

type ViewMode = 'gallery' | 'comparison';

export const ProgressPhotosScreen: React.FC<Props> = ({
  navigation,
}) => {
  const { progressPhotos, deleteProgressPhoto } = useBodyTrackingStore();

  const [viewMode, setViewMode] = useState<ViewMode>('gallery');
  const [selectedPhotos, setSelectedPhotos] = useState<ProgressPhoto[]>([]);
  const [comparisonModalVisible, setComparisonModalVisible] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);

  const handlePhotoPress = (photo: ProgressPhoto) => {
    if (selectionMode) {
      if (selectedPhotos.find((p) => p.id === photo.id)) {
        setSelectedPhotos(selectedPhotos.filter((p) => p.id !== photo.id));
      } else {
        if (selectedPhotos.length < 2) {
          setSelectedPhotos([...selectedPhotos, photo]);
        }
      }
    } else {
      // View single photo (could navigate to detail screen in future)
      if (selectedPhotos.length === 0) {
        setSelectedPhotos([photo]);
        setComparisonModalVisible(true);
      }
    }
  };

  const handlePhotoLongPress = (photo: ProgressPhoto) => {
    if (!selectionMode) {
      setSelectionMode(true);
      setSelectedPhotos([photo]);
    }
  };

  const handleCompare = () => {
    if (selectedPhotos.length === 2) {
      setComparisonModalVisible(true);
      setSelectionMode(false);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedPhotos.length === 0) return;

    // Confirm deletion
    const message =
      selectedPhotos.length === 1
        ? 'Are you sure you want to delete this photo?'
        : `Are you sure you want to delete ${selectedPhotos.length} photos?`;

    // In a real app, you'd show an alert here
    selectedPhotos.forEach((photo) => {
      deleteProgressPhoto(photo.id);
    });

    setSelectedPhotos([]);
    setSelectionMode(false);
  };

  const handleCancelSelection = () => {
    setSelectedPhotos([]);
    setSelectionMode(false);
  };

  const handleAddPhoto = () => {
    navigation.navigate(Routes.ADD_PROGRESS_PHOTO as never);
  };

  const sortedPhotos = [...progressPhotos].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Progress Photos</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddPhoto}
        >
          <Ionicons name="add" size={24} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {/* View Mode Toggle */}
      <View style={styles.viewModeToggle}>
        <TouchableOpacity
          style={[styles.viewModeButton, viewMode === 'gallery' && styles.viewModeButtonActive]}
          onPress={() => setViewMode('gallery')}
        >
          <Ionicons
            name="grid"
            size={20}
            color={viewMode === 'gallery' ? Colors.white : Colors.text.secondary}
          />
          <Text
            style={[
              styles.viewModeButtonText,
              viewMode === 'gallery' && styles.viewModeButtonTextActive,
            ]}
          >
            Gallery
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.viewModeButton, viewMode === 'comparison' && styles.viewModeButtonActive]}
          onPress={() => setViewMode('comparison')}
        >
          <Ionicons
            name="swap-horizontal"
            size={20}
            color={viewMode === 'comparison' ? Colors.white : Colors.text.secondary}
          />
          <Text
            style={[
              styles.viewModeButtonText,
              viewMode === 'comparison' && styles.viewModeButtonTextActive,
            ]}
          >
            Compare
          </Text>
        </TouchableOpacity>
      </View>

      {/* Selection Mode Actions */}
      {selectionMode && (
        <View style={styles.selectionActions}>
          <Text style={styles.selectionText}>
            {selectedPhotos.length} photo{selectedPhotos.length !== 1 ? 's' : ''} selected
          </Text>
          <View style={styles.selectionButtons}>
            {selectedPhotos.length === 2 && (
              <Button
                onPress={handleCompare}
                variant="primary"
                style={styles.selectionButton}
                size="sm"
              >
                Compare
              </Button>
            )}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancelSelection}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <ScrollView style={styles.content}>
        {viewMode === 'gallery' ? (
          <>
            {/* Instructions */}
            {sortedPhotos.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons
                  name="camera-outline"
                  size={64}
                  color={Colors.neutral[300]}
                />
                <Text style={styles.emptyTitle}>No Progress Photos Yet</Text>
                <Text style={styles.emptyText}>
                  Start tracking your visual progress by taking your first photo.
                </Text>
                <Button
                  onPress={handleAddPhoto}
                  style={styles.emptyButton}
                >
                  Add First Photo
                </Button>
              </View>
            ) : (
              <>
                <Text style={styles.infoText}>
                  Long press on photos to select them for comparison or deletion.
                </Text>
                <ProgressPhotoGallery
                  photos={sortedPhotos}
                  onPhotoPress={handlePhotoPress}
                  onLongPress={handlePhotoLongPress}
                  selectedIds={selectedPhotos.map((p) => p.id)}
                />
              </>
            )}
          </>
        ) : (
          /* Comparison Mode */
          <>
            {sortedPhotos.length < 2 ? (
              <View style={styles.emptyContainer}>
                <Ionicons
                  name="swap-horizontal-outline"
                  size={64}
                  color={Colors.neutral[300]}
                />
                <Text style={styles.emptyTitle}>Not Enough Photos</Text>
                <Text style={styles.emptyText}>
                  You need at least 2 progress photos to compare them.
                </Text>
              </View>
            ) : (
              <>
                <Card style={styles.comparisonInstructions}>
                  <Text style={styles.comparisonTitle}>Select 2 Photos to Compare</Text>
                  <Text style={styles.comparisonText}>
                    Tap on two photos to compare them side by side and see your progress.
                  </Text>
                </Card>
                <ProgressPhotoGallery
                  photos={sortedPhotos}
                  onPhotoPress={handlePhotoPress}
                  onLongPress={handlePhotoLongPress}
                  selectedIds={selectedPhotos.map((p) => p.id)}
                />
              </>
            )}
          </>
        )}
      </ScrollView>

      {/* Comparison Modal */}
      <Modal
        visible={comparisonModalVisible}
        animationType="slide"
        onRequestClose={() => {
          setComparisonModalVisible(false);
          setSelectedPhotos([]);
        }}
      >
        {selectedPhotos.length === 2 && (
          <ProgressPhotoComparison
            beforePhoto={selectedPhotos[0]}
            afterPhoto={selectedPhotos[1]}
            onClose={() => {
              setComparisonModalVisible(false);
              setSelectedPhotos([]);
            }}
          />
        )}
      </Modal>
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
  title: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewModeToggle: {
    flexDirection: 'row',
    margin: Spacing.lg,
    backgroundColor: Colors.white,
    borderRadius: Layout.borderRadius.md,
    padding: Spacing.xs,
    gap: Spacing.xs,
  },
  viewModeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    borderRadius: Layout.borderRadius.md,
  },
  viewModeButtonActive: {
    backgroundColor: Colors.primary[500],
  },
  viewModeButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.secondary,
  },
  viewModeButtonTextActive: {
    color: Colors.white,
  },
  selectionActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  selectionText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.primary,
  },
  selectionButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
  },
  selectionButton: {
    minWidth: 100,
  },
  cancelButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  cancelButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.danger[500],
  },
  content: {
    flex: 1,
  },
  infoText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl3,
    paddingHorizontal: Spacing.xl,
  },
  emptyTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginTop: Spacing.lg,
  },
  emptyText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  emptyButton: {
    minWidth: 200,
  },
  comparisonInstructions: {
    margin: Spacing.lg,
    padding: Spacing.lg,
  },
  comparisonTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  comparisonText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
});
