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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  Mic,
  MicOff,
  Send,
  X,
  Sparkles,
  Bot,
  User,
  Navigation,
  Plus,
} from 'lucide-react-native';

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
          id: (Date.now() + 1).toString(),
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
      setMessages((prev) => [...prev, reply]);
    }, 800);
  };

  const handleVoiceToggle = () => {
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
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.aiBadgeIcon}>
            <Sparkles size={18} color="#ffffff" />
          </View>
          <View>
            <Text style={styles.headerTitle}>B-Map AI Voice Copilot</Text>
            <Text style={styles.headerSub}>Natural Language Spatial Telematics</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()} activeOpacity={0.8}>
          <X size={20} color="#111C2D" />
        </TouchableOpacity>
      </View>

      {/* Preset Quick Prompts Carousel */}
      <View style={styles.presetContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetTrack}>
          {PRESET_PROMPTS.map((p, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.presetChip}
              onPress={() => handleSendPrompt(p)}
              activeOpacity={0.8}>
              <Sparkles size={11} color="#0096FF" />
              <Text style={styles.presetChipText} numberOfLines={1}>{p}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Chat Messages Log */}
      <ScrollView style={styles.chatScroll} contentContainerStyle={styles.chatContent}>
        {messages.map((msg) => (
          <View key={msg.id} style={[styles.msgRow, msg.sender === 'user' ? styles.msgRowUser : styles.msgRowAi]}>
            <View style={[styles.avatarCircle, msg.sender === 'user' ? styles.avatarUser : styles.avatarAi]}>
              {msg.sender === 'user' ? <User size={15} color="#fff" /> : <Bot size={16} color="#0096FF" />}
            </View>

            <View style={{ flex: 1, alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
              <View style={[styles.msgBubble, msg.sender === 'user' ? styles.msgBubbleUser : styles.msgBubbleAi]}>
                <Text style={[styles.msgText, msg.sender === 'user' ? styles.msgTextUser : styles.msgTextAi]}>
                  {msg.text}
                </Text>
              </View>

              {/* Action Card Attached to AI Message */}
              {msg.actionCard && (
                <View style={styles.actionCard}>
                  <View style={styles.actionCardHeader}>
                    <Text style={styles.actionCardTitle}>{msg.actionCard.title}</Text>
                    {msg.actionCard.extraTime && (
                      <View style={styles.timeTag}>
                        <Text style={styles.timeTagText}>{msg.actionCard.extraTime}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.actionCardSub}>{msg.actionCard.sub}</Text>
                  <Text style={styles.actionCardMetrics}>{msg.actionCard.metrics}</Text>

                  {msg.actionCard.digiPin && (
                    <View style={styles.digiRow}>
                      <View style={styles.digiBadge}>
                        <Text style={styles.digiBadgeText}>DigiPIN</Text>
                      </View>
                      <Text style={styles.digiCode}>{msg.actionCard.digiPin}</Text>
                    </View>
                  )}

                  <View style={styles.actionCardButtons}>
                    <TouchableOpacity
                      style={styles.addStopBtn}
                      onPress={() => Alert.alert('Waypoint Added', `Added ${msg.actionCard?.title} as next stop.`)}>
                      <Plus size={14} color="#0096FF" />
                      <Text style={styles.addStopBtnText}>Add as Stop</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.navNowBtn}
                      onPress={() => {
                        router.back();
                        router.push('/modal');
                      }}>
                      <Navigation size={14} color="#fff" />
                      <Text style={styles.navNowBtnText}>Navigate</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              <Text style={styles.msgTime}>{msg.timestamp}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Voice Assistant Wave & Input Footer */}
      <View style={styles.footer}>
        {isListening && (
          <View style={styles.listeningNotice}>
            <View style={styles.redDot} />
            <Text style={styles.listeningNoticeText}>Listening to voice prompt... Speak naturally</Text>
          </View>
        )}

        <View style={styles.inputRow}>
          <TouchableOpacity style={styles.micWrapper} onPress={handleVoiceToggle} activeOpacity={0.8}>
            <Animated.View
              style={[
                styles.micHalo,
                isListening && {
                  transform: [{ scale: pulseAnim }],
                  opacity: 0.35,
                },
              ]}
            />
            <View style={[styles.micBtn, isListening && styles.micBtnActive]}>
              {isListening ? <MicOff size={20} color="#fff" /> : <Mic size={20} color="#fff" />}
            </View>
          </TouchableOpacity>

          <TextInput
            style={styles.textInput}
            placeholder={isListening ? 'Listening...' : 'Type highway, fuel, or traffic query...'}
            placeholderTextColor="#707884"
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={() => handleSendPrompt()}
          />

          <TouchableOpacity
            style={[styles.sendBtn, inputText.trim() ? styles.sendBtnActive : null]}
            onPress={() => handleSendPrompt()}
            disabled={!inputText.trim()}
            activeOpacity={0.8}>
            <Send size={18} color={inputText.trim() ? '#fff' : '#A0A8B4'} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFF' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E8EEFF',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  aiBadgeIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#0096FF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0096FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#111C2D' },
  headerSub: { fontSize: 11, color: '#707884', marginTop: 1 },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F0F4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  presetContainer: { backgroundColor: '#fff', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#E8EEFF' },
  presetTrack: { paddingHorizontal: 16, gap: 8 },
  presetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E8F4FF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D0E4FF',
  },
  presetChipText: { fontSize: 11, fontWeight: '600', color: '#0061A7' },

  chatScroll: { flex: 1 },
  chatContent: { padding: 16, gap: 16 },
  msgRow: { flexDirection: 'row', gap: 10, maxWidth: '100%' },
  msgRowAi: { justifyContent: 'flex-start' },
  msgRowUser: { flexDirection: 'row-reverse' },
  avatarCircle: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  avatarAi: { backgroundColor: '#E8F4FF' },
  avatarUser: { backgroundColor: '#0096FF' },
  msgBubble: { padding: 12, borderRadius: 16, maxWidth: '85%' },
  msgBubbleAi: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#E8EEFF' },
  msgBubbleUser: { backgroundColor: '#0096FF' },
  msgText: { fontSize: 13, lineHeight: 19 },
  msgTextAi: { color: '#111C2D' },
  msgTextUser: { color: '#ffffff', fontWeight: '500' },
  msgTime: { fontSize: 9, color: '#A0A8B4', marginTop: 4 },

  actionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    marginTop: 8,
    borderWidth: 1.5,
    borderColor: '#D0E4FF',
    shadowColor: '#0096FF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    maxWidth: '92%',
  },
  actionCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  actionCardTitle: { fontSize: 14, fontWeight: '800', color: '#111C2D', flex: 1 },
  timeTag: { backgroundColor: '#FFF4E5', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  timeTagText: { fontSize: 10, fontWeight: '700', color: '#D57E00' },
  actionCardSub: { fontSize: 11, color: '#707884', marginTop: 3 },
  actionCardMetrics: { fontSize: 12, fontWeight: '700', color: '#0096FF', marginTop: 6 },
  digiRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  digiBadge: { backgroundColor: '#0096FF', paddingHorizontal: 5, paddingVertical: 1, borderRadius: 4 },
  digiBadgeText: { fontSize: 8, fontWeight: '800', color: '#fff' },
  digiCode: { fontSize: 11, fontWeight: '700', color: '#111C2D', fontFamily: 'monospace' },
  actionCardButtons: { flexDirection: 'row', gap: 8, marginTop: 12 },
  addStopBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#E8F4FF',
    paddingVertical: 9,
    borderRadius: 10,
  },
  addStopBtnText: { fontSize: 12, fontWeight: '700', color: '#0096FF' },
  navNowBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#0096FF',
    paddingVertical: 9,
    borderRadius: 10,
  },
  navNowBtnText: { fontSize: 12, fontWeight: '700', color: '#fff' },

  footer: {
    backgroundColor: '#fff',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#E8EEFF',
  },
  listeningNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingBottom: 8,
  },
  redDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#F44336' },
  listeningNoticeText: { fontSize: 11, fontWeight: '700', color: '#F44336' },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  micWrapper: { alignItems: 'center', justifyContent: 'center' },
  micHalo: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0096FF',
  },
  micBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#0096FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  micBtnActive: { backgroundColor: '#F44336' },
  textInput: {
    flex: 1,
    backgroundColor: '#F8FAFF',
    borderWidth: 1,
    borderColor: '#E8EEFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 13,
    color: '#111C2D',
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnActive: { backgroundColor: '#0096FF' },
});
