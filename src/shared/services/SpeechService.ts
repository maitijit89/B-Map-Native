import * as Speech from 'expo-speech';
import {
  voiceLanguageService,
  NavigationPromptKey,
} from './VoiceLanguageService';
import type { VoiceLanguageCode } from './StorageService';

export interface SpeechOptions {
  language?: string;
  pitch?: number;
  rate?: number;
  onStart?: () => void;
  onDone?: () => void;
  onError?: (error: any) => void;
}

class SpeechService {
  private isMuted: boolean = false;

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
   * Speak turn prompt or notification using the current voice language
   */
  speak(text: string, options?: SpeechOptions): void {
    if (this.isMuted || !text.trim()) return;

    const currentLangInfo = voiceLanguageService.getLanguageInfo();
    const targetLanguage = options?.language || currentLangInfo.locale || 'en-IN';

    try {
      Speech.stop(); // Stop any ongoing speech first for clear prompt delivery
      Speech.speak(text, {
        language: targetLanguage,
        pitch: options?.pitch || 1.0,
        rate: options?.rate || 0.95, // Slightly lower rate for navigation clarity
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
