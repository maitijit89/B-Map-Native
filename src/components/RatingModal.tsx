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
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { BMapColors, BMapElevation, BMapTypography, BMapAnimation } from '@/constants/bmap-theme';
import { UserReview } from '@/types';
import { FadeInView } from '@/components/ui/fade-in-view';
import { AnimatedPressableButton } from '@/components/ui/animated-pressable';

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

function AnimatedStar({
  index,
  rating,
  onPress,
  color,
}: {
  index: number;
  rating: number;
  onPress: (index: number) => void;
  color: string;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSequence(
      withSpring(1.35, { damping: 6, stiffness: 400 }),
      withSpring(1, BMapAnimation.pressSpring)
    );
    onPress(index);
  };

  return (
    <TouchableOpacity activeOpacity={0.7} onPress={handlePress} style={styles.starTouch}>
      <Animated.View style={animatedStyle}>
        <Ionicons
          name={index <= rating ? 'star' : 'star-outline'}
          size={36}
          color={index <= rating ? '#FFB300' : color}
        />
      </Animated.View>
    </TouchableOpacity>
  );
}

export function RatingModal({ visible, onClose, onSubmitReview }: RatingModalProps) {
  const [rating, setRating] = useState<number>(5);
  const [selectedTags, setSelectedTags] = useState<string[]>(['Navigation Accuracy', 'Traffic Updates']);
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedSuccess, setSubmittedSuccess] = useState<boolean>(false);

  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = isDark ? BMapColors.dark : BMapColors.light;

  const successScale = useSharedValue(0);

  const successAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: successScale.value }],
  }));

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleUpdateReview = async () => {
    setIsSubmitting(true);
    const payload: UserReview = {
      rating,
      categories: selectedTags,
      comment: comment.trim(),
      submittedAt: Date.now(),
    };

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmittedSuccess(true);
      successScale.value = withSpring(1, BMapAnimation.bounceSpring);
      if (onSubmitReview) onSubmitReview(payload);

      setTimeout(() => {
        setSubmittedSuccess(false);
        successScale.value = 0;
        onClose();
      }, 1200);
    }, 800);
  };

  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalBackdrop}>
          <FadeInView delay={0} from="up" slideDistance={30} style={{ width: '100%', alignItems: 'center' }}>
            <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {/* Close Button */}
              <AnimatedPressableButton
                pressScale={0.85}
                onPress={onClose}
                style={[styles.closeIcon, { backgroundColor: colors.surfaceVariant }]}
              >
                <Ionicons name="close" size={20} color={colors.textSecondary} />
              </AnimatedPressableButton>

              {submittedSuccess ? (
                <FadeInView delay={0} from="none">
                  <View style={styles.successState}>
                    <Animated.View style={successAnimatedStyle}>
                      <Ionicons name="checkmark-circle" size={54} color={BMapColors.secondary} />
                    </Animated.View>
                    <Text style={[styles.successTitle, BMapTypography.headlineMedium, { color: colors.text }]}>
                      Thank You!
                    </Text>
                    <Text style={[styles.successSubtitle, { color: colors.textSecondary }]}>
                      Your feedback helps improve Indian spatial mobility for everyone.
                    </Text>
                  </View>
                </FadeInView>
              ) : (
                <>
                  <FadeInView delay={50} from="up" slideDistance={10}>
                    <Text style={[styles.headerTitle, BMapTypography.titleLarge, { color: colors.text }]}>
                      Rate Your B Map Experience
                    </Text>
                    <Text style={[styles.headerSubtitle, BMapTypography.bodySmall, { color: colors.textSecondary }]}>
                      How accurate was your recent Indian route navigation?
                    </Text>
                  </FadeInView>

                  {/* 5-Star Interactive Rating Row with bounce */}
                  <FadeInView delay={120} from="up" slideDistance={8}>
                    <View style={styles.starRow}>
                      {[1, 2, 3, 4, 5].map(starIndex => (
                        <AnimatedStar
                          key={`star-${starIndex}`}
                          index={starIndex}
                          rating={rating}
                          onPress={setRating}
                          color={colors.textMuted}
                        />
                      ))}
                    </View>
                  </FadeInView>

                  {/* Feedback Category Chips */}
                  <FadeInView delay={200} from="up" slideDistance={8}>
                    <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
                      WHAT WENT WELL OR NEEDS IMPROVEMENT?
                    </Text>
                    <View style={styles.chipsContainer}>
                      {FEEDBACK_TAGS.map(tag => {
                        const isSelected = selectedTags.includes(tag);
                        return (
                          <AnimatedPressableButton
                            key={tag}
                            pressScale={0.94}
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
                          </AnimatedPressableButton>
                        );
                      })}
                    </View>
                  </FadeInView>

                  {/* Multiline Comments Input */}
                  <FadeInView delay={300} from="up" slideDistance={8}>
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
                  </FadeInView>

                  {/* Update Review Submit Button */}
                  <FadeInView delay={380} from="up" slideDistance={8}>
                    <AnimatedPressableButton
                      pressScale={0.96}
                      onPress={handleUpdateReview}
                      disabled={isSubmitting}
                      style={[styles.submitButton, { backgroundColor: BMapColors.primary }]}
                    >
                      {isSubmitting ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <Text style={styles.submitButtonText}>Update Review</Text>
                      )}
                    </AnimatedPressableButton>
                  </FadeInView>
                </>
              )}
            </View>
          </FadeInView>
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
