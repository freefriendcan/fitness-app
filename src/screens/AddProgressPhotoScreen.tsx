import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Input, Button, Colors, Spacing, Typography } from '@/components';
import { useBodyTrackingStore } from '@/store';
import type { ProfileStackParamList } from '@/navigation/types';

type AddProgressPhotoScreenNavigationProp = NativeStackNavigationProp<
  ProfileStackParamList,
  'AddProgressPhoto'
>;

type AddProgressPhotoScreenRouteProp = RouteProp<
  ProfileStackParamList,
  'AddProgressPhoto'
>;

interface Props {
  navigation: AddProgressPhotoScreenNavigationProp;
  route: AddProgressPhotoScreenRouteProp;
}

type PhotoType = 'front' | 'side' | 'back' | 'other';

const PHOTO_TYPES: { type: PhotoType; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { type: 'front', label: 'Front', icon: 'person' },
  { type: 'side', label: 'Side', icon: 'person-outline' },
  { type: 'back', label: 'Back', icon: 'arrow-undo' },
  { type: 'other', label: 'Other', icon: 'apps' },
];

export const AddProgressPhotoScreen: React.FC<Props> = ({
  navigation,
}) => {
  const { addProgressPhoto } = useBodyTrackingStore();

  const [photoUri, setPhotoUri] = useState<string>('');
  const [photoType, setPhotoType] = useState<PhotoType>('front');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please grant camera roll permissions to add a progress photo.'
      );
      return false;
    }
    return true;
  };

  const handlePickFromGallery = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setPhotoUri(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please grant camera permissions to take a progress photo.'
      );
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setPhotoUri(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const handleSave = () => {
    if (!photoUri) {
      Alert.alert('No Photo', 'Please select or take a photo first.');
      return;
    }

    setLoading(true);

    try {
      addProgressPhoto({
        date: new Date(),
        photoUri,
        photoType,
        notes: notes.trim() || undefined,
      });

      Alert.alert('Success', 'Progress photo added successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to save photo. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.title}>Add Progress Photo</Text>
        <Text style={styles.subtitle}>
          Track your visual progress over time. For best results, take photos in
          the same lighting and conditions.
        </Text>

        {/* Photo Selection */}
        <View style={styles.photoSection}>
          <Text style={styles.sectionTitle}>Photo</Text>

          {!photoUri ? (
            <View style={styles.photoButtonsContainer}>
              <TouchableOpacity
                style={styles.photoButton}
                onPress={handleTakePhoto}
              >
                <Ionicons name="camera" size={32} color={Colors.primary[500]} />
                <Text style={styles.photoButtonText}>Take Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.photoButton}
                onPress={handlePickFromGallery}
              >
                <Ionicons name="images" size={32} color={Colors.primary[500]} />
                <Text style={styles.photoButtonText}>From Gallery</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.selectedPhotoContainer}>
              <Image source={{ uri: photoUri }} style={styles.selectedPhoto} />
              <TouchableOpacity
                style={styles.removePhotoButton}
                onPress={() => setPhotoUri('')}
              >
                <Ionicons name="close-circle" size={32} color={Colors.danger[500]} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Photo Type Selection */}
        <View style={styles.typeSection}>
          <Text style={styles.sectionTitle}>Photo Type</Text>
          <View style={styles.typeButtonsContainer}>
            {PHOTO_TYPES.map((item) => (
              <TouchableOpacity
                key={item.type}
                style={[
                  styles.typeButton,
                  photoType === item.type && styles.typeButtonActive,
                ]}
                onPress={() => setPhotoType(item.type)}
              >
                <Ionicons
                  name={item.icon}
                  size={24}
                  color={photoType === item.type ? Colors.white : Colors.primary[500]}
                />
                <Text
                  style={[
                    styles.typeButtonText,
                    photoType === item.type && styles.typeButtonTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Notes */}
        <View style={styles.notesSection}>
          <Text style={styles.sectionTitle}>Notes (Optional)</Text>
          <Input
            label="Notes"
            value={notes}
            onChangeText={setNotes}
            placeholder="e.g., Morning lighting, post-workout..."
            multiline
            numberOfLines={3}
            style={styles.notesInput}
          />
        </View>

        {/* Tips */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>Tips for Best Results</Text>
          <Text style={styles.tipsText}>
            • Take photos at the same time of day{'\n'}
            • Use consistent lighting (natural light works best){'\n'}
            • Stand in the same position and distance{'\n'}
            • Wear similar clothing or minimal clothing{'\n'}
            • Use the same pose and angle
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <Button
            onPress={handleSave}
            loading={loading}
            disabled={!photoUri}
            fullWidth
            style={styles.saveButton}
          >
            Save Photo
          </Button>

          <Button
            onPress={() => navigation.goBack()}
            variant="outline"
            fullWidth
          >
            Cancel
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl3,
  },
  title: {
    fontSize: Typography.fontSize.xl2,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    marginBottom: Spacing.lg,
  },
  photoSection: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  photoButtonsContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  photoButton: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: Colors.white,
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.border.light,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  photoButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.primary,
  },
  selectedPhotoContainer: {
    position: 'relative',
    alignSelf: 'center',
  },
  selectedPhoto: {
    width: 200,
    height: 267,
    borderRadius: Layout.borderRadius.lg,
  },
  removePhotoButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: Colors.white,
    borderRadius: 16,
  },
  typeSection: {
    marginBottom: Spacing.lg,
  },
  typeButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  typeButton: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    backgroundColor: Colors.white,
    borderRadius: Layout.borderRadius.md,
    borderWidth: 2,
    borderColor: Colors.border.light,
  },
  typeButtonActive: {
    backgroundColor: Colors.primary[500],
    borderColor: Colors.primary[500],
  },
  typeButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.primary,
  },
  typeButtonTextActive: {
    color: Colors.white,
  },
  notesSection: {
    marginBottom: Spacing.lg,
  },
  notesInput: {
    marginBottom: 0,
  },
  tipsContainer: {
    backgroundColor: Colors.primary[50],
    padding: Spacing.md,
    borderRadius: Layout.borderRadius.md,
    marginBottom: Spacing.lg,
  },
  tipsTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primary[700],
    marginBottom: Spacing.sm,
  },
  tipsText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.primary[900],
    lineHeight: 20,
  },
  buttonContainer: {
    marginTop: Spacing.xl,
  },
  saveButton: {
    marginBottom: Spacing.md,
  },
});
