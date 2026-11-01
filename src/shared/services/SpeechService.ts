import * as Speech from 'expo-speech';
import {
  voiceLanguageService,
  NavigationPromptKey,
} from './VoiceLanguageService';
import {
  storageService,
  type VoiceLanguageCode,
  type UserGender,
  type VoiceGender,
  getPairedVoiceGender,
} from './StorageService';

export interface SpeechOptions {
  language?: string;
  pitch?: number;
  rate?: number;
  voice?: string;
  voiceGender?: VoiceGender;
  onStart?: () => void;
  onDone?: () => void;
  onError?: (error: any) => void;
}

type VoiceGenderListener = (voiceGender: VoiceGender, userGender: UserGender) => void;

class SpeechService {
  private isMuted: boolean = false;
  private userGender: UserGender = 'male';
  private voiceGender: VoiceGender = 'female';
  private availableVoices: Speech.Voice[] = [];
  private listeners: Set<VoiceGenderListener> = new Set();
  private isInitialized: boolean = false;

  constructor() {
    this.init();
  }

  async init(): Promise<void> {
    if (this.isInitialized) return;
    try {
      const profile = await storageService.getUserProfile();
      this.userGender = profile.gender || 'male';
      this.voiceGender = getPairedVoiceGender(this.userGender);

      Speech.getAvailableVoicesAsync()
        .then((voices) => {
          this.availableVoices = voices || [];
        })
        .catch(() => {
          this.availableVoices = [];
        });

      this.isInitialized = true;
    } catch {
      this.isInitialized = true;
    }
  }

  /**
   * Set user gender, which automatically selects the paired voice gender:
   * - Male user -> Female app voice
   * - Female user -> Male app voice
   */
  async setUserGender(gender: UserGender): Promise<VoiceGender> {
    this.userGender = gender;
    const pairedVoice = getPairedVoiceGender(gender);
    this.voiceGender = pairedVoice;

    await storageService.saveUserProfile({
      gender,
      voiceGender: pairedVoice,
    });

    this.notifyListeners();
    return pairedVoice;
  }

  /**
   * Manual override of app voice gender (which also updates user gender pairing)
   */
  async setVoiceGender(voiceGender: VoiceGender): Promise<void> {
    this.voiceGender = voiceGender;
    this.userGender = voiceGender === 'female' ? 'male' : 'female';

    await storageService.saveUserProfile({
      gender: this.userGender,
      voiceGender,
    });

    this.notifyListeners();
  }

  getUserGender(): UserGender {
    return this.userGender;
  }

  getVoiceGender(): VoiceGender {
    return this.voiceGender;
  }

  subscribe(listener: VoiceGenderListener): () => void {
    this.listeners.add(listener);
    listener(this.voiceGender, this.userGender);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach((fn) => {
      try {
        fn(this.voiceGender, this.userGender);
      } catch {}
    });
  }

  /**
   * Find matching device voice identifier based on language and gender keywords
   */
  private findVoiceIdentifier(locale: string, gender: VoiceGender): string | undefined {
    if (!this.availableVoices || this.availableVoices.length === 0) {
      return undefined;
    }

    const langPrefix = locale.toLowerCase().split('-')[0];
    const langVoices = this.availableVoices.filter((v) =>
      v.language?.toLowerCase().startsWith(langPrefix)
    );

    const femaleKeywords = [
      'female', 'woman', 'girl', 'samantha', 'kavya', 'veena', 'zira',
      'priya', 'shruti', 'aditi', 'lekha', 'ananya', 'siri', 'f',
    ];
    const maleKeywords = [
      'male', 'man', 'boy', 'david', 'rishi', 'neel', 'ravi',
      'arun', 'alex', 'daniel', 'george', 'm',
    ];
    const targetKeywords = gender === 'female' ? femaleKeywords : maleKeywords;

    // 1. Language + gender match in name/identifier
    for (const v of langVoices) {
      const hay = `${v.name || ''} ${v.identifier || ''}`.toLowerCase();
      if (targetKeywords.some((kw) => hay.includes(kw))) {
        return v.identifier;
      }
    }

    // 2. Global voice with gender match
    for (const v of this.availableVoices) {
      const hay = `${v.name || ''} ${v.identifier || ''}`.toLowerCase();
      if (targetKeywords.some((kw) => hay.includes(kw))) {
        return v.identifier;
      }
    }

    // 3. Fallback to any voice for this language
    if (langVoices.length > 0) {
      return langVoices[0].identifier;
    }

    return undefined;
  }

  setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (muted) {
      this.stop();
    }
  }

  getIsMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Speak turn prompt or notification using the current voice language & paired gender
   */
  speak(text: string, options?: SpeechOptions): void {
    if (this.isMuted || !text.trim()) return;

    const currentLangInfo = voiceLanguageService.getLanguageInfo();
    const targetLanguage = options?.language || currentLangInfo.locale || 'en-IN';
    const activeGender = options?.voiceGender || this.voiceGender;

    // Flowstep v3.0 Formant-Preserved Acoustic Tuning:
    // Avoid severe 1.18x/0.88x pitch warping ("chipmunk" or artificial bass distortion).
    // Native neural voices are matched via findVoiceIdentifier; subtle natural pitch tuning (1.05 / 0.95)
    // is applied to preserve vocal formants while ensuring pleasant gender distinction.
    const voiceId = options?.voice || this.findVoiceIdentifier(targetLanguage, activeGender);
    const genderPitch = voiceId
      ? (activeGender === 'female' ? 1.03 : 0.97)
      : (activeGender === 'female' ? 1.06 : 0.94);
    const genderRate = activeGender === 'female' ? 0.98 : 0.96;

    try {
      Speech.stop(); // Stop any ongoing speech first for clear prompt delivery
      Speech.speak(text, {
        language: targetLanguage,
        pitch: options?.pitch ?? genderPitch,
        rate: options?.rate ?? genderRate,
        voice: voiceId,
        onStart: options?.onStart,
        onDone: options?.onDone,
        onError: options?.onError,
      });
    } catch (error) {
      if (__DEV__) {
        console.debug('SpeechService: Error speaking text', error);
      }
    }
  }

  /**
   * Speak a localized navigation prompt by key (e.g., 'startRoute', 'turnRight')
   */
  speakPrompt(key: NavigationPromptKey, langCode?: VoiceLanguageCode, options?: SpeechOptions): void {
    const targetCode = langCode || voiceLanguageService.getLanguage();
    const promptText = voiceLanguageService.getPrompt(key, targetCode);
    const langInfo = voiceLanguageService.getLanguageInfo(targetCode);

    if (promptText) {
      this.speak(promptText, {
        ...options,
        language: langInfo.locale,
      });
    }
  }

  /**
   * Play an audible voice confirmation sample reflecting the active gender pairing
   */
  async speakVoiceSample(langCode?: VoiceLanguageCode): Promise<void> {
    const code = langCode || voiceLanguageService.getLanguage();
    const isFemale = this.voiceGender === 'female';

    const sampleByLang: Record<string, string> = {
      en: isFemale
        ? 'Namaste! I am your female voice navigator. You are on the fastest route via NH-48.'
        : 'Namaste! I am your male voice navigator. You are on the fastest route via NH-48.',
      bn: isFemale
        ? 'নমস্কার! আমি আপনার মহিলা ভয়েস ন্যাভিগেটর। আপনি NH-48 দিয়ে দ্রুততম পথে আছেন।'
        : 'নমস্কার! আমি আপনার পুরুষ ভয়েস ন্যাভিগেটর। আপনি NH-48 দিয়ে দ্রুততম পথে আছেন।',
      hi: isFemale
        ? 'नमस्ते! मैं आपकी महिला वॉइस नेविगेटर हूँ। आप NH-48 के माध्यम से सबसे तेज़ मार्ग पर हैं।'
        : 'नमस्ते! मैं आपका पुरुष वॉइस नेविगेटर हूँ। आप NH-48 के माध्यम से सबसे तेज़ मार्ग पर हैं।',
    };

    const text = sampleByLang[code] || sampleByLang.en;
    this.speak(text);
  }

  /**
   * Switch the voice guidance language and speak confirmation in that language
   */
  async switchLanguageAndSpeak(code: VoiceLanguageCode): Promise<void> {
    await voiceLanguageService.setLanguage(code);
    this.speakPrompt('languageChanged', code);
  }

  /**
   * Stop current speech
   */
  stop(): void {
    try {
      Speech.stop();
    } catch (error) {
      if (__DEV__) {
        console.debug('SpeechService: Error stopping speech', error);
      }
    }
  }

  /**
   * Check if speech is currently active
   */
  async isSpeaking(): Promise<boolean> {
    try {
      return await Speech.isSpeakingAsync();
    } catch {
      return false;
    }
  }
}

export const speechService = new SpeechService();
