import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  FadeInUp,
  FadeInDown,
} from 'react-native-reanimated';
import {
  Mic,
  MicOff,
  Send,
  Sparkles,
  Bot,
  User,
  Navigation,
  Plus,
} from 'lucide-react-native';
import { useThemeColors } from '@/shared/hooks';
import { speechService } from '@/shared/services';
import { Radius, Shadows, Spacing, Typography } from '@/shared/constants/tokens';
import {
  Header,
  Card,
  Chip,
  Badge,
  Button,
} from '@/shared/components/ui';
import { haptics } from '@/shared/utils/haptics';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  actionCard?: {
    title: string;
    sub: string;
    metrics: string;
    digiPin?: string;
    extraTime?: string;
  };
}

const PRESET_PROMPTS = [
  'Find vegetarian dhaba with clean restrooms on NH-48',
  'Check fog alerts on Yamuna Expressway',
  'Find 150kW CCS2 EV fast charger along route',
  'Calculate FASTag toll from Delhi to Agra',
];

let msgCounter = 10;
const getNextMsgId = () => {
  msgCounter += 1;
  return `msg_${msgCounter}`;
};

export default function AiCopilotModal() {
  const colors = useThemeColors();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: 'Namaste Aarav! I am your B-Map AI Navigation Copilot. Ask me about real-time corridor traffic, EV chargers, highway dhabas, FASTag tolls, or weather advisories.',
      timestamp: 'Just now',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);

  const pulseScale = useSharedValue(1);

  useEffect(() => {
    if (isListening) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.35, { duration: 700 }),
          withTiming(1, { duration: 700 })
        ),
        -1,
        true
      );
    } else {
      pulseScale.value = 1;
    }
  }, [isListening, pulseScale]);

  const haloAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pulseScale.value }],
    };
  });

  const handleSendPrompt = (promptText?: string) => {
    haptics.light();
    const textToSend = promptText || inputText;
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: getNextMsgId(),
      sender: 'user',
      text: textToSend,
      timestamp: 'Now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');

    // Simulate intelligent contextual response
    setTimeout(() => {
      let reply: Message;
      const lower = textToSend.toLowerCase();

      if (lower.includes('dhaba') || lower.includes('food') || lower.includes('vegetarian')) {
        reply = {
          id: getNextMsgId(),
          sender: 'ai',
          text: 'Found top-rated vegetarian option along NH-48. Verified with clean restrooms, family dining, and FASTag parking bays.',
          timestamp: 'Now',
          actionCard: {
            title: 'Mannat Haveli Veg Dhaba',
            sub: 'NH-48 km 58 (Manesar Corridor)',
            metrics: '⭐ 4.6 · Clean Washrooms · Pure Veg',
            digiPin: '28J4-K8M2-9P',
            extraTime: '+4 min detour',
          },
        };
      } else if (lower.includes('fog') || lower.includes('weather') || lower.includes('yamuna')) {
        reply = {
          id: getNextMsgId(),
          sender: 'ai',
          text: 'Live weather sensor telemetry from Yamuna Expressway: Mild morning mist detected between km 40-75. Visibility 450m, speed limit temporarily capped at 80 km/h by Yamuna Authority.',
          timestamp: 'Now',
        };
      } else if (lower.includes('charger') || lower.includes('ev') || lower.includes('charging')) {
        reply = {
          id: getNextMsgId(),
          sender: 'ai',
          text: 'Located an ultra-fast charging hub with live availability directly on your corridor trajectory.',
          timestamp: 'Now',
          actionCard: {
            title: 'Tata Power 150kW Hypercharger',
            sub: 'Cyber City Hub B2 Basement',
            metrics: '⚡ 4/6 Guns Free · ₹18/kWh',
            digiPin: '28J4-K8M2-9P',
            extraTime: 'On Route',
          },
        };
      } else if (lower.includes('toll') || lower.includes('fastag')) {
        reply = {
          id: getNextMsgId(),
          sender: 'ai',
          text: 'Route from Central Delhi to Agra involves 3 FASTag plazas. Total estimated toll: ₹415. Your FASTag wallet balance is healthy (₹840 remaining).',
          timestamp: 'Now',
        };
      } else {
        reply = {
          id: getNextMsgId(),
          sender: 'ai',
          text: `Understood! I'm monitoring "${textToSend}" against sovereign ISRO NavIC satellite feeds and NCR road sensors. You are on the optimal path with 0 active road hazards.`,
          timestamp: 'Now',
        };
      }

      setMessages((prev) => [...prev, reply]);
      haptics.selection();
      speechService.speak(reply.text);
    }, 600);
  };

  const handleVoiceToggle = () => {
    haptics.medium();
    if (isListening) {
      setIsListening(false);
      speechService.stop();
    } else {
      setIsListening(true);
      // Simulate speech recognition capture after 2.5 seconds
      setTimeout(() => {
        setIsListening(false);
        const sampleVoiceInputs = [
          'Find vegetarian dhaba with clean restrooms on NH-48',
          'Find 150kW CCS2 EV fast charger along route',
          'Check fog alerts on Yamuna Expressway',
        ];
        const randomPick = sampleVoiceInputs[Math.floor(Math.random() * sampleVoiceInputs.length)];
        handleSendPrompt(randomPick);
      }, 2500);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      {/* Top Header */}
      <Header
        title="AI Copilot Navigator"
        onBackPress={() => {
          haptics.light();
          router.back();
        }}
        rightAction={
          <Badge label="ISRO NavIC AI Engine" variant="primary" size="sm" />
        }
      />

      {/* Suggested Quick Prompts Carousel */}
      <Animated.View
        entering={FadeInDown.duration(280).springify().damping(16)}
        style={[styles.presetContainer, { borderBottomColor: colors.surfaceContainerHigh }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.presetTrack}>
          {PRESET_PROMPTS.map((prompt, idx) => (
            <Chip
              key={idx}
              label={prompt}
              icon={<Sparkles size={14} color={colors.primary} />}
              onPress={() => handleSendPrompt(prompt)}
              size="sm"
            />
          ))}
        </ScrollView>
      </Animated.View>

      {/* Chat Messages Log */}
      <ScrollView
        style={styles.chatScroll}
        contentContainerStyle={styles.chatContent}
        showsVerticalScrollIndicator={false}>
        {messages.map((msg) => (
          <Animated.View
            key={msg.id}
            entering={FadeInUp.duration(300).springify().damping(16)}
            style={[styles.msgRow, msg.sender === 'user' && styles.msgRowUser]}>
            {msg.sender === 'ai' && (
              <View
                style={[
                  styles.avatarBox,
                  { backgroundColor: colors.primaryContainer },
                ]}>
                <Bot size={18} color={colors.onPrimary} />
              </View>
            )}

            <View style={{ flex: 1, alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
              <View
                style={[
                  styles.msgBubble,
                  msg.sender === 'ai'
                    ? [
                        styles.aiBubble,
                        {
                          backgroundColor: colors.surfaceContainerLowest,
                          borderColor: colors.surfaceContainerHigh,
                        },
                      ]
                    : [styles.userBubble, { backgroundColor: colors.primaryContainer }],
                ]}>
                <Text
                  style={[
                    styles.msgText,
                    {
                      color: msg.sender === 'ai' ? colors.onSurface : colors.onPrimary,
                    },
                  ]}>
                  {msg.text}
                </Text>
                <Text
                  style={[
                    styles.msgTime,
                    {
                      color: msg.sender === 'ai' ? colors.onSurfaceVariant : colors.onPrimary + '90',
                    },
                  ]}>
                  {msg.timestamp}
                </Text>
              </View>

              {/* Contextual Action Card */}
              {msg.actionCard && (
                <Card
                  variant="elevated"
                  padding="md"
                  style={styles.actionCardWrapper}>
                  <View style={styles.actionCardTop}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.actionCardTitle, { color: colors.onSurface }]}>
                        {msg.actionCard.title}
                      </Text>
                      <Text style={[styles.actionCardSub, { color: colors.onSurfaceVariant }]}>
                        {msg.actionCard.sub}
                      </Text>
                      <Text style={[styles.actionCardMetrics, { color: colors.trafficGreen }]}>
                        {msg.actionCard.metrics}
                      </Text>
                    </View>
                    {msg.actionCard.extraTime && (
                      <Badge label={msg.actionCard.extraTime} variant="primary" size="sm" />
                    )}
                  </View>

                  <View style={styles.actionBtnRow}>
                    <Button
                      title="Add as Stop"
                      variant="outline"
                      size="sm"
                      leftIcon={<Plus size={14} color={colors.primary} />}
                      onPress={() => {
                        haptics.selection();
                        Alert.alert('Waypoint Added', 'Added stop along active corridor route.');
                      }}
                      style={styles.actionBtnFlex}
                    />

                    <Button
                      title="Navigate"
                      variant="primary"
                      size="sm"
                      leftIcon={<Navigation size={14} color={colors.onPrimary} />}
                      onPress={() => {
                        haptics.medium();
                        router.push('/modal');
                      }}
                      style={styles.actionBtnFlex}
                    />
                  </View>
                </Card>
              )}
            </View>

            {msg.sender === 'user' && (
              <View
                style={[
                  styles.avatarBox,
                  { backgroundColor: colors.surfaceContainerHigh },
                ]}>
                <User size={18} color={colors.onSurface} />
              </View>
            )}
          </Animated.View>
        ))}
      </ScrollView>

      {/* Voice Halo Feedback State */}
      {isListening && (
        <View style={[styles.listeningBar, { backgroundColor: colors.primaryContainer }]}>
          <Animated.View
            style={[
              styles.listeningHalo,
              {
                backgroundColor: colors.primary,
              },
              haloAnimatedStyle,
            ]}
          />
          <Mic size={18} color={colors.onPrimary} />
          <Text style={[styles.listeningText, { color: colors.onPrimary }]}>
            Listening in Hindi/English... Speak naturally
          </Text>
        </View>
      )}

      {/* Input Composer Dock */}
      <View
        style={[
          styles.composerContainer,
          {
            backgroundColor: colors.surfaceContainerLowest,
            borderTopColor: colors.surfaceContainerHigh,
          },
        ]}>
        <TouchableOpacity
          style={[
            styles.micToggleBtn,
            isListening
              ? { backgroundColor: colors.error }
              : { backgroundColor: colors.primaryContainer },
          ]}
          onPress={handleVoiceToggle}
          accessibilityRole="button"
          accessibilityLabel="Toggle voice recording"
          activeOpacity={0.8}>
          {isListening ? (
            <MicOff size={20} color="#fff" />
          ) : (
            <Mic size={20} color={colors.onPrimary} />
          )}
        </TouchableOpacity>

        <TextInput
          style={[
            styles.composerInput,
            {
              backgroundColor: colors.surfaceContainerLow,
              borderColor: colors.surfaceContainerHigh,
              color: colors.onSurface,
            },
          ]}
          placeholder="Ask copilot about routes, toll, food..."
          placeholderTextColor={colors.outline}
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={() => handleSendPrompt()}
          returnKeyType="send"
        />

        <TouchableOpacity
          style={[
            styles.sendBtn,
            {
              backgroundColor: inputText.trim()
                ? colors.primaryContainer
                : colors.surfaceContainerHigh,
            },
          ]}
          disabled={!inputText.trim()}
          onPress={() => handleSendPrompt()}
          accessibilityRole="button"
          accessibilityLabel="Send prompt"
          activeOpacity={0.8}>
          <Send
            size={18}
            color={inputText.trim() ? colors.onPrimary : colors.outline}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  presetContainer: {
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  presetTrack: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  chatScroll: {
    flex: 1,
  },
  chatContent: {
    padding: Spacing.md,
    gap: 16,
    paddingBottom: 20,
  },
  msgRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  msgRowUser: {
    justifyContent: 'flex-end',
  },
  avatarBox: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  msgBubble: {
    maxWidth: '85%',
    padding: 12,
    borderRadius: Radius.xl,
    gap: 4,
  },
  aiBubble: {
    borderTopLeftRadius: 4,
    borderWidth: 1,
    ...Shadows.xs,
  },
  userBubble: {
    borderTopRightRadius: 4,
    ...Shadows.xs,
  },
  msgText: {
    ...Typography.bodyMedium,
    lineHeight: 20,
  },
  msgTime: {
    ...Typography.labelSmall,
    fontSize: 9,
    alignSelf: 'flex-end',
  },
  actionCardWrapper: {
    marginTop: 8,
    width: '100%',
    gap: 12,
  },
  actionCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  actionCardTitle: {
    ...Typography.titleSmall,
    fontWeight: '800',
  },
  actionCardSub: {
    ...Typography.bodySmall,
    marginTop: 2,
  },
  actionCardMetrics: {
    ...Typography.labelSmall,
    fontWeight: '700',
    marginTop: 4,
  },
  actionBtnRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtnFlex: {
    flex: 1,
  },
  listeningBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    position: 'relative',
    overflow: 'hidden',
  },
  listeningHalo: {
    position: 'absolute',
    left: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    opacity: 0.35,
  },
  listeningText: {
    ...Typography.labelSmall,
    fontWeight: '700',
  },
  composerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderTopWidth: 1,
    gap: 8,
  },
  micToggleBtn: {
    width: 42,
    height: 42,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  composerInput: {
    flex: 1,
    height: 42,
    borderRadius: Radius.full,
    paddingHorizontal: 16,
    borderWidth: 1,
    ...Typography.bodyMedium,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
