import * as Speech from 'expo-speech';

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
   * Speak turn prompt or notification
   */
  speak(text: string, options?: SpeechOptions): void {
    if (this.isMuted || !text.trim()) return;

    try {
      Speech.stop(); // Stop any ongoing speech first for clear prompt delivery
      Speech.speak(text, {
        language: options?.language || 'en-US',
        pitch: options?.pitch || 1.0,
        rate: options?.rate || 0.95, // Slightly lower rate for navigation clarity
        onStart: options?.onStart,
        onDone: options?.onDone,
        onError: options?.onError,
      });
    } catch (error) {
      console.warn('SpeechService: Error speaking text', error);
    }
  }

  /**
   * Stop current speech
   */
  stop(): void {
    try {
      Speech.stop();
    } catch (error) {
      console.warn('SpeechService: Error stopping speech', error);
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
