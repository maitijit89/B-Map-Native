import { voiceLanguageService } from './VoiceLanguageService';
import type { VoiceLanguageCode } from './VoiceLanguageService';
import { speechService } from './SpeechService';
import { haptics } from '../utils/haptics';

export type VoiceListeningState =
  | 'idle'
  | 'listening'
  | 'processing'
  | 'success'
  | 'error';

export type VoiceIntentType =
  | 'navigate'
  | 'nearby'
  | 'hazard'
  | 'traffic'
  | 'recalculate'
  | 'eta'
  | 'copilot_chat'
  | 'unknown';

export interface VoiceIntent {
  type: VoiceIntentType;
  actionText: string;
  targetRoute?: string;
  params?: {
    destination?: string;
    category?: 'fuel' | 'ev' | 'food' | 'parking' | 'pharmacy' | 'transit';
    hazardType?: string;
    query?: string;
  };
  spokenResponse: Partial<Record<VoiceLanguageCode, string>> & {
    en: string;
    bn?: string;
    hi?: string;
  };
}

export interface VoiceRecognitionResult {
  transcript: string;
  language: VoiceLanguageCode;
  confidence: number;
  intent: VoiceIntent;
  timestamp: string;
}

type AudioLevelListener = (level: number) => void;
type StateListener = (state: VoiceListeningState, interimTranscript?: string) => void;
type ResultListener = (result: VoiceRecognitionResult) => void;

class VoiceListenerService {
  private state: VoiceListeningState = 'idle';
  private currentTranscript: string = '';
  private audioTimer: ReturnType<typeof setInterval> | null = null;
  private recognitionTimer: ReturnType<typeof setTimeout> | null = null;

  private audioLevelListeners: Set<AudioLevelListener> = new Set();
  private stateListeners: Set<StateListener> = new Set();
  private resultListeners: Set<ResultListener> = new Set();

  getState(): VoiceListeningState {
    return this.state;
  }

  getCurrentTranscript(): string {
    return this.currentTranscript;
  }

  /**
   * Start listening for voice commands in active vernacular language
   */
  startListening(sampleSpeechPrompt?: string): void {
    if (this.state === 'listening' || this.state === 'processing') {
      return;
    }

    haptics.medium();
    this.setState('listening', '');
    this.currentTranscript = '';

    // Stop active TTS speaking so mic doesn't catch own voice
    speechService.stop();

    // Start emitting simulated realistic micro-dB audio levels for waveform rendering
    this.startAudioLevelStream();

    const currentLang = voiceLanguageService.getLanguage();

    // Sample vernacular phrases if not explicitly provided
    const poolByLang: Partial<Record<VoiceLanguageCode, string[]>> & { en: string[] } = {
      en: [
        'Find vegetarian dhaba with clean restrooms on NH-48',
        'Navigate to DLF Cyber Hub Gurugram',
        'Find 150kW CCS2 EV fast charger',
        'Check fog alerts on Yamuna Expressway',
        'Report pothole in right lane',
        'What is my ETA and traffic delay?',
      ],
      bn: [
        'কাছের নিরামিষ ধাবা এবং রেস্টরুম দেখাও',
        'ডিএলএফ সাইবার হাবে চলো',
        'নিকটতম ইভি চার্জিং স্টেশন কোথায়',
        'যমুনা এক্সপ্রেসওয়েতে কুয়াশার খবর কি',
        'রাস্তায় খানাখন্দ রিপোর্ট করো',
        'গন্তব্যে পৌঁছাতে আর কত সময় লাগবে',
      ],
      hi: [
        'रास्ते में शुद्ध शाकाहारी ढाबा ढूंढो',
        'डीएलएफ साइबर हब का रास्ता दिखाओ',
        'निकटतम 150kW ईवी फास्ट चार्जर बताओ',
        'यमुना एक्सप्रेसवे पर कोहरे का अलर्ट क्या है',
        'सड़क पर गड्ढा रिपोर्ट करो',
        'पहुंचने का अनुमानित समय (ETA) क्या है',
      ],
      ta: ['அருகிலுள்ள எரிபொருள் நிலையத்தைக் கண்டுபிடி'],
      te: ['సమీపంలోని ఇంధన స్టేషన్‌ను కనుగొనండి'],
      mr: ['जवळचे पेट्रोल पंप आणि ढाबा शोधा'],
    };

    const phrases = poolByLang[currentLang] || poolByLang.en;
    const targetTranscript =
      sampleSpeechPrompt || phrases[Math.floor(Math.random() * phrases.length)];

    // Stream progressive words to simulate live real-time speech recognition
    const words = targetTranscript.split(' ');
    let wordIndex = 0;

    const streamInterval = setInterval(() => {
      if (this.state !== 'listening') {
        clearInterval(streamInterval);
        return;
      }

      if (wordIndex < words.length) {
        wordIndex += 1;
        const interim = words.slice(0, wordIndex).join(' ');
        this.currentTranscript = interim;
        this.notifyState('listening', interim);
        haptics.selection();
      } else {
        clearInterval(streamInterval);
        this.finishListening(targetTranscript, currentLang);
      }
    }, 450);
  }

  /**
   * Complete recognition, parse intent, and notify listeners
   */
  private finishListening(finalTranscript: string, lang: VoiceLanguageCode): void {
    this.setState('processing', finalTranscript);
    this.stopAudioLevelStream();

    this.recognitionTimer = setTimeout(() => {
      const intent = this.parseIntent(finalTranscript, lang);
      const result: VoiceRecognitionResult = {
        transcript: finalTranscript,
        language: lang,
        confidence: 0.96,
        intent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      this.setState('success', finalTranscript);
      haptics.success();

      // Notify all result listeners
      this.resultListeners.forEach((fn) => {
        try {
          fn(result);
        } catch {}
      });

      // Speak confirmation in current vernacular language
      const responsePrompt = intent.spokenResponse[lang] || intent.spokenResponse.en;
      speechService.speak(responsePrompt);

      // Reset to idle after short display delay
      setTimeout(() => {
        if (this.state === 'success') {
          this.setState('idle', '');
        }
      }, 2500);
    }, 400);
  }

  /**
   * Manually stop listening
   */
  stopListening(): void {
    if (this.state === 'listening') {
      if (this.currentTranscript.trim()) {
        this.finishListening(
          this.currentTranscript,
          voiceLanguageService.getLanguage()
        );
      } else {
        this.cancelListening();
      }
    }
  }

  /**
   * Cancel voice recognition without executing intent
   */
  cancelListening(): void {
    this.stopAudioLevelStream();
    if (this.recognitionTimer) {
      clearTimeout(this.recognitionTimer);
      this.recognitionTimer = null;
    }
    this.currentTranscript = '';
    this.setState('idle', '');
    haptics.light();
  }

  /**
   * Natural Language Understanding (NLU) Intent Parser
   */
  parseIntent(rawTranscript: string, lang: VoiceLanguageCode): VoiceIntent {
    const text = rawTranscript.toLowerCase();

    // 1. Food / Dhaba POI
    if (
      text.includes('dhaba') ||
      text.includes('food') ||
      text.includes('vegetarian') ||
      text.includes('রেস্টুরেন্ট') ||
      text.includes('খাবার') ||
      text.includes('ढाबा') ||
      text.includes('भोजन')
    ) {
      return {
        type: 'nearby',
        actionText: 'Find Highway Dining & Dhabas',
        targetRoute: '/(tabs)/nearby',
        params: { category: 'food', query: 'Vegetarian Dhaba' },
        spokenResponse: {
          en: 'Finding top-rated highway dhabas with clean restrooms along NH-48 corridor.',
          bn: 'নিকটবর্তী সেরা রেটিংসহ নিরামিষ ধাবার তালিকা প্রস্তুত করা হচ্ছে।',
          hi: 'एनएच-48 पर स्वच्छ शौचालयों वाले शीर्ष रेटेड ढाबे खोजे जा रहे हैं।',
        },
      };
    }

    // 2. EV Charging POI
    if (
      text.includes('charger') ||
      text.includes('ev') ||
      text.includes('charging') ||
      text.includes('ইভি') ||
      text.includes('চার্জার') ||
      text.includes('ईवी') ||
      text.includes('चार्ज')
    ) {
      return {
        type: 'nearby',
        actionText: 'Locate 150kW EV Fast Chargers',
        targetRoute: '/ev-station',
        params: { category: 'ev', query: 'CCS2 150kW Fast Charger' },
        spokenResponse: {
          en: 'Locating 150 kilowatt CCS2 ultra-fast EV charging station directly on route.',
          bn: 'আপনার পথেই ১৫০ কিলোওয়াট আল্ট্রা-ফাস্ট ইভি চার্জিং স্টেশন খুঁজে পাওয়া গেছে।',
          hi: 'रास्ते में 150 किलोवाट सीसीएस2 अल्ट्रा-फास्ट ईवी चार्जिंग स्टेशन लोकेट किया गया।',
        },
      };
    }

    // 3. Navigation / Turn-by-Turn
    if (
      text.includes('navigate') ||
      text.includes('cyber hub') ||
      text.includes('cyber city') ||
      text.includes('চলো') ||
      text.includes('পথ') ||
      text.includes('रास्ता') ||
      text.includes('चलो')
    ) {
      return {
        type: 'navigate',
        actionText: 'Navigate to DLF Cyber Hub',
        targetRoute: '/modal',
        params: { destination: 'DLF Cyber Hub Gurugram' },
        spokenResponse: {
          en: 'Starting live turn-by-turn guidance to DLF Cyber Hub via NH-48 Express.',
          bn: 'ডিএলএফ সাইবার হাবের দিকে সক্রিয় ন্যাভিগেশন শুরু করা হচ্ছে।',
          hi: 'डीएलएफ साइबर हब के लिए टर्न-बाय-टर्न नेविगेशन शुरू किया जा रहा है।',
        },
      };
    }

    // 4. Hazard Reporting
    if (
      text.includes('hazard') ||
      text.includes('pothole') ||
      text.includes('fog') ||
      text.includes('কুয়াশা') ||
      text.includes('খানাখন্দ') ||
      text.includes('গর্ত') ||
      text.includes('गड्ढा') ||
      text.includes('कोहरा') ||
      text.includes('दुर्घटना')
    ) {
      return {
        type: 'hazard',
        actionText: 'Report Road Hazard & Pothole',
        targetRoute: '/hazard-report',
        params: { hazardType: 'pothole' },
        spokenResponse: {
          en: 'Opening road hazard reporter to broadcast corridor alert with DigiPIN verification.',
          bn: 'রাস্তার খানাখন্দ এবং বিপদের সতর্কতা সম্প্রচারের জন্য রিপোর্ট খোলা হচ্ছে।',
          hi: 'सड़क के गड्ढे और खतरे की सूचना प्रसारित करने के लिए फॉर्म खोला जा रहा है।',
        },
      };
    }

    // 5. Traffic & ETA
    if (
      text.includes('traffic') ||
      text.includes('eta') ||
      text.includes('delay') ||
      text.includes('জ্যাম') ||
      text.includes('সময়') ||
      text.includes('ट्रैफिक') ||
      text.includes('समय')
    ) {
      return {
        type: 'traffic',
        actionText: 'Corridor Traffic & ETA Status',
        targetRoute: '/modal',
        spokenResponse: {
          en: 'Corridor traffic is moving smoothly on NH-48. Estimated arrival is 01:42 AM with zero delays.',
          bn: 'এনএইচ-৪৮ করিডোরে যানজট স্বাভাবিক রয়েছে। পৌঁছানোর আনুমানিক সময় রাত ১টা ৪২ মিনিট।',
          hi: 'एनएच-48 पर यातायात सामान्य रूप से चल रहा है। अनुमानित समय रात 1:42 है, कोई देरी नहीं है।',
        },
      };
    }

    // Default Copilot Assistant
    return {
      type: 'copilot_chat',
      actionText: `AI Assistant: "${rawTranscript}"`,
      targetRoute: '/ai-copilot',
      params: { query: rawTranscript },
      spokenResponse: {
        en: `Query processed. Monitoring your route via ISRO NavIC satellite telemetry.`,
        bn: `আপনার নির্দেশ প্রক্রিয়া করা হয়েছে। ইসরো নাভিক উপগ্রহের মাধ্যমে ট্র্যাকিং সক্রিয়।`,
        hi: `आपका निर्देश प्राप्त हुआ। इसरो नाविक उपग्रह टेलीमेट्री से मार्ग की निगरानी जारी है।`,
      },
    };
  }

  // --- Audio Waveform Level Simulation ---
  private startAudioLevelStream(): void {
    this.stopAudioLevelStream();
    this.audioTimer = setInterval(() => {
      // Generate energetic speech wave amplitude (0.15 - 0.95)
      const base = 0.25;
      const variation = Math.random() * 0.7;
      const level = Math.min(1.0, base + variation);
      this.audioLevelListeners.forEach((fn) => {
        try {
          fn(level);
        } catch {}
      });
    }, 60);
  }

  private stopAudioLevelStream(): void {
    if (this.audioTimer) {
      clearInterval(this.audioTimer);
      this.audioTimer = null;
    }
    // Reset levels to quiet baseline
    this.audioLevelListeners.forEach((fn) => {
      try {
        fn(0);
      } catch {}
    });
  }

  private setState(nextState: VoiceListeningState, interim?: string): void {
    this.state = nextState;
    this.notifyState(nextState, interim);
  }

  private notifyState(state: VoiceListeningState, interim?: string): void {
    this.stateListeners.forEach((fn) => {
      try {
        fn(state, interim);
      } catch {}
    });
  }

  // --- Subscriptions ---
  subscribeAudioLevel(listener: AudioLevelListener): () => void {
    this.audioLevelListeners.add(listener);
    return () => this.audioLevelListeners.delete(listener);
  }

  subscribeState(listener: StateListener): () => void {
    this.stateListeners.add(listener);
    listener(this.state, this.currentTranscript);
    return () => this.stateListeners.delete(listener);
  }

  subscribeResult(listener: ResultListener): () => void {
    this.resultListeners.add(listener);
    return () => this.resultListeners.delete(listener);
  }
}

export const voiceListenerService = new VoiceListenerService();
