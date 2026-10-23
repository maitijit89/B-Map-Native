import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
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
  const [pulseAnim] = useState(() => new Animated.Value(1));

  const triggerHaptic = () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {
        // Haptics unavailable
      }
    }
  };

  useEffect(() => {
    let loop: Animated.CompositeAnimation | null = null;
    if (isListening) {
      loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.35,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      loop.start();
    } else {
      pulseAnim.setValue(1);
    }
    return () => {
      if (loop) loop.stop();
    };
  }, [isListening, pulseAnim]);

  const handleSendPrompt = (promptText?: string) => {
    triggerHaptic();
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
            title: 'Mannat Haveli & Dhaba (NH-48)',
            sub: 'Pure Vegetarian · 4.8★ (3,410 reviews) · 24/7 Open',
            metrics: '28 km ahead · Adds +8 min to trip',
            digiPin: '28J4-M1K9-7P',
            extraTime: '+8 min',
          },
        };
      } else if (lower.includes('fog') || lower.includes('weather') || lower.includes('yamuna')) {
        reply = {
          id: getNextMsgId(),
          sender: 'ai',
          text: '⚠️ IMD has issued a YELLOW Fog Warning on Yamuna Expressway between km 45–95. Visibility is under 150m. Recommended speed capped at 60 km/h with fog lights active.',
          timestamp: 'Now',
          actionCard: {
            title: 'IMD Highway Warning: Dense Fog Corridor',
            sub: 'Valid until 09:00 AM IST · Yamuna Expressway',
            metrics: '60 km/h advised · Fog Lamps Mandatory',
          },
        };
      } else if (lower.includes('ev') || lower.includes('charger')) {
        reply = {
          id: getNextMsgId(),
          sender: 'ai',
          text: 'Found 150kW Ultra-Fast CCS2 Charger along your active route. 3 of 4 bays currently vacant with cafe amenities.',
          timestamp: 'Now',
          actionCard: {
            title: 'Tata Power EZ Charge (Jio-bp Hub)',
            sub: 'CCS2 150kW · ₹16/kWh · 3 Bays Available',
            metrics: '14.2 km ahead · Adds +3 min to detour',
            digiPin: '28J4-K8M2-9P',
            extraTime: '+3 min',
          },
        };
      } else {
        reply = {
          id: getNextMsgId(),
          sender: 'ai',
          text: `Analyzing your query regarding "${textToSend}". Calculating optimal OSRM coordinates, checking NavIC constellation accuracy, and inspecting real-time NHAI corridor congestion.`,
          timestamp: 'Now',
          actionCard: {
            title: 'Corridor Route Optimization',
            sub: 'NH-48 Expressway to Agra via NE-4',
            metrics: 'Total Toll: ₹435 · Duration: 2h 14m',
          },
        };
      }
      speechService.speak(reply.text);
      setMessages((prev) => [...prev, reply]);
    }, 800);
  };

  const handleVoiceToggle = () => {
    triggerHaptic();
    if (!isListening) {
      setIsListening(true);
      setTimeout(() => {
        setIsListening(false);
        handleSendPrompt('Find vegetarian dhaba with clean restrooms on NH-48');
      }, 2500);
    } else {
      setIsListening(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      {/* Header */}
      <Header
        title="B-Map AI Voice Copilot"
        subtitle="Natural Language Spatial Telematics"
        onBackPress={() => {
          triggerHaptic();
          router.back();
        }}
      />

      {/* Preset Quick Prompts Carousel */}
      <View
        style={[
          styles.presetContainer,
          {
            backgroundColor: colors.surfaceContainerLowest,
            borderBottomColor: colors.surfaceContainerHigh,
          },
        ]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetTrack}>
          {PRESET_PROMPTS.map((p, idx) => (
            <Chip
              key={idx}
              label={p}
              icon={<Sparkles size={12} color={colors.primary} />}
              onPress={() => handleSendPrompt(p)}
              size="sm"
            />
          ))}
        </ScrollView>
      </View>

      {/* Chat Messages Log */}
      <ScrollView style={styles.chatScroll} contentContainerStyle={styles.chatContent}>
        {messages.map((msg) => (
          <View
            key={msg.id}
            style={[
              styles.msgRow,
              msg.sender === 'user' ? styles.msgRowUser : styles.msgRowAi,
            ]}>
            <View
              style={[
                styles.avatarCircle,
                msg.sender === 'user'
                  ? { backgroundColor: colors.primary }
                  : { backgroundColor: colors.surfaceContainerHigh },
              ]}>
              {msg.sender === 'user' ? (
                <User size={15} color={colors.onPrimary} />
              ) : (
                <Bot size={16} color={colors.primary} />
              )}
            </View>

            <View style={{ flex: 1 }}>
              <View
                style={[
                  styles.msgBubble,
                  msg.sender === 'user'
                    ? { backgroundColor: colors.primaryContainer }
                    : {
                        backgroundColor: colors.surfaceContainerLowest,
                        borderColor: colors.surfaceContainerHigh,
                      },
                ]}>
                <Text
                  style={[
                    styles.msgText,
                    {
                      color:
                        msg.sender === 'user'
                          ? colors.onPrimary
                          : colors.onSurface,
                    },
                  ]}>
                  {msg.text}
                </Text>
              </View>

              {/* Action Card Attached to AI Message */}
              {msg.actionCard && (
                <Card variant="elevated" padding="md" style={styles.actionCard}>
                  <View style={styles.actionCardTop}>
                    <View style={{ flex: 1, gap: 2 }}>
                      <Text style={[styles.actionTitle, { color: colors.onSurface }]}>
                        {msg.actionCard.title}
                      </Text>
                      <Text style={[styles.actionSub, { color: colors.onSurfaceVariant }]}>
                        {msg.actionCard.sub}
                      </Text>
                      <Text style={[styles.actionMetrics, { color: colors.secondary }]}>
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
                        triggerHaptic();
                        Alert.alert('Waypoint Added', 'Added stop along active corridor route.');
                      }}
                      style={styles.actionBtnFlex}
                    />

                    <Button
                      title="Navigate"
                      variant="primary"
                      size="sm"
                      leftIcon={<Navigation size={14} color="#fff" />}
                      onPress={() => {
                        triggerHaptic();
                        router.push('/modal');
                      }}
                      style={styles.actionBtnFlex}
                    />
                  </View>
                </Card>
              )}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Voice Halo Feedback State */}
      {isListening && (
        <View style={[styles.listeningBar, { backgroundColor: colors.primaryFixed }]}>
          <Animated.View
            style={[
              styles.listeningHalo,
              {
                backgroundColor: colors.primary,
                transform: [{ scale: pulseAnim }],
              },
            ]}
          />
          <Mic size={18} color={colors.primary} />
          <Text style={[styles.listeningText, { color: colors.onPrimaryFixedVariant }]}>
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
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  presetTrack: {
    paddingHorizontal: Spacing.md,
    gap: 8,
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
  },
  msgRowUser: {
    flexDirection: 'row-reverse',
  },
  msgRowAi: {
    flexDirection: 'row',
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  msgBubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: Radius.xl,
    maxWidth: '92%',
    borderWidth: 1,
  },
  msgText: {
    ...Typography.bodyMedium,
    lineHeight: 20,
  },
  actionCard: {
    marginTop: 8,
    gap: 10,
  },
  actionCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  actionTitle: {
    ...Typography.titleSmall,
    fontWeight: '700',
  },
  actionSub: {
    ...Typography.bodySmall,
    fontSize: 11,
  },
  actionMetrics: {
    ...Typography.labelSmall,
    fontWeight: '700',
    marginTop: 2,
  },
  actionBtnRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  actionBtnFlex: {
    flex: 1,
  },
  listeningBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
    position: 'relative',
  },
  listeningHalo: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    opacity: 0.3,
  },
  listeningText: {
    ...Typography.labelSmall,
    fontWeight: '700',
  },
  composerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  micToggleBtn: {
    width: 42,
    height: 42,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.xs,
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
