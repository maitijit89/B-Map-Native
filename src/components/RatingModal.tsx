import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BMapColors, BMapElevation, BMapTypography } from '@/constants/bmap-theme';
import { UserReview } from '@/types';

interface RatingModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmitReview?: (review: UserReview) => void;
}

const FEEDBACK_TAGS = [
  'Navigation Accuracy',
  'Traffic Updates',
  'FASTag Tolls',
  'UI/UX',
  'Offline Maps',
  'EV Radar',
  '112 SOS Dispatch',
];

export function RatingModal({ visible, onClose, onSubmitReview }: RatingModalProps) {
  const [rating, setRating] = useState<number>(5);
  const [selectedTags, setSelectedTags] = useState<string[]>(['Navigation Accuracy', 'Traffic Updates']);
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedSuccess, setSubmittedSuccess] = useState<boolean>(false);

  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = isDark ? BMapColors.dark : BMapColors.light;

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleUpdateReview = async () => {
    setIsSubmitting(true);
    // Simulate API upsert payload
    const payload: UserReview = {
      rating,
      categories: selectedTags,
      comment: comment.trim(),
      submittedAt: Date.now(),
    };

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmittedSuccess(true);
      if (onSubmitReview) onSubmitReview(payload);

      setTimeout(() => {
        setSubmittedSuccess(false);
        onClose();
      }, 1200);
    }, 800);
  };

  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {/* Close Button */}
            <TouchableOpacity onPress={onClose} style={[styles.closeIcon, { backgroundColor: colors.surfaceVariant }]}>
              <Ionicons name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            {submittedSuccess ? (
              <View style={styles.successState}>
                <Ionicons name="checkmark-circle" size={54} color={BMapColors.secondary} />
                <Text style={[styles.successTitle, BMapTypography.headlineMedium, { color: colors.text }]}>
                  Thank You!
                </Text>
                <Text style={[styles.successSubtitle, { color: colors.textSecondary }]}>
                  Your feedback helps improve Indian spatial mobility for everyone.
                </Text>
              </View>
            ) : (
              <>
                <Text style={[styles.headerTitle, BMapTypography.titleLarge, { color: colors.text }]}>
                  Rate Your B Map Experience
                </Text>
                <Text style={[styles.headerSubtitle, BMapTypography.bodySmall, { color: colors.textSecondary }]}>
                  How accurate was your recent Indian route navigation?
                </Text>

                {/* 5-Star Interactive Rating Row */}
                <View style={styles.starRow}>
                  {[1, 2, 3, 4, 5].map(starIndex => (
                    <TouchableOpacity
                      key={`star-${starIndex}`}
                      activeOpacity={0.7}
                      onPress={() => setRating(starIndex)}
                      style={styles.starTouch}
                    >
                      <Ionicons
                        name={starIndex <= rating ? 'star' : 'star-outline'}
                        size={36}
                        color={starIndex <= rating ? '#FFB300' : colors.textMuted}
                      />
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Feedback Category Chips */}
                <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
                  WHAT WENT WELL OR NEEDS IMPROVEMENT?
                </Text>
                <View style={styles.chipsContainer}>
                  {FEEDBACK_TAGS.map(tag => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <TouchableOpacity
                        key={tag}
                        activeOpacity={0.7}
                        onPress={() => toggleTag(tag)}
                        style={[
                          styles.chip,
                          {
                            backgroundColor: isSelected ? BMapColors.primary : colors.surfaceVariant,
                            borderColor: isSelected ? BMapColors.primary : colors.border,
                          },
                        ]}
                      >
                        {isSelected && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
                        <Text
                          style={[
                            styles.chipText,
                            { color: isSelected ? '#FFFFFF' : colors.textSecondary, fontWeight: isSelected ? '700' : '500' },
                          ]}
                        >
                          {tag}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Multiline Comments Input */}
                <TextInput
                  style={[
                    styles.commentInput,
                    {
                      backgroundColor: colors.surfaceVariant,
                      borderColor: colors.border,
                      color: colors.text,
                    },
                  ]}
                  placeholder="Share details about road conditions, toll lanes, or suggestions..."
                  placeholderTextColor={colors.textMuted}
                  multiline={true}
                  numberOfLines={3}
                  value={comment}
                  onChangeText={setComment}
                />

                {/* Update Review Submit Button */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleUpdateReview}
                  disabled={isSubmitting}
                  style={[styles.submitButton, { backgroundColor: BMapColors.primary }]}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.submitButtonText}>Update Review</Text>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 440,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    ...BMapElevation.level3,
  },
  closeIcon: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  headerTitle: {
    fontWeight: '700',
    marginBottom: 4,
    paddingRight: 32,
  },
  headerSubtitle: {
    marginBottom: 16,
  },
  starRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginVertical: 12,
  },
  starTouch: {
    padding: 4,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 12,
    marginBottom: 8,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
  },
  commentInput: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  submitButton: {
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    ...BMapElevation.level2,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  successState: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 12,
  },
  successTitle: {
    fontWeight: '700',
  },
  successSubtitle: {
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 16,
  },
});
