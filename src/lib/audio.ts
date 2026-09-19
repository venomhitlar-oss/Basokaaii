import { cleanTextForSpeech } from './kurdish';

/**
 * Text-to-Speech (TTS) Manager for Basoka AI
 */
class TTSManager {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isSpeakingState = false;
  private listeners: Set<(speaking: boolean) => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  public isAvailable(): boolean {
    return this.synth !== null;
  }

  public subscribe(listener: (speaking: boolean) => void): () => void {
    this.listeners.add(listener);
    listener(this.isSpeakingState);
    return () => this.listeners.delete(listener);
  }

  private notify(speaking: boolean) {
    this.isSpeakingState = speaking;
    this.listeners.forEach((l) => l(speaking));
  }

  public speak(text: string, options?: { rate?: number; pitch?: number; voiceLang?: string }): Promise<void> {
    return new Promise((resolve) => {
      if (!this.synth) {
        resolve();
        return;
      }

      this.stop();

      const cleaned = cleanTextForSpeech(text);
      if (!cleaned.trim()) {
        resolve();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(cleaned);
      utterance.rate = options?.rate ?? 1.0;
      utterance.pitch = options?.pitch ?? 1.0;

      // Select Kurdish/Arabic/regional voice if available
      const voices = this.synth.getVoices();
      const preferred = voices.find(
        (v) =>
          v.lang.startsWith('ku') ||
          v.lang.startsWith('ckb') ||
          v.lang.startsWith('ar') ||
          v.lang.startsWith('fa')
      );
      if (preferred) {
        utterance.voice = preferred;
      }

      utterance.onstart = () => {
        this.notify(true);
      };

      utterance.onend = () => {
        this.notify(false);
        this.currentUtterance = null;
        resolve();
      };

      utterance.onerror = () => {
        this.notify(false);
        this.currentUtterance = null;
        resolve();
      };

      this.currentUtterance = utterance;
      this.synth.speak(utterance);
    });
  }

  public stop() {
    if (this.synth) {
      this.synth.cancel();
    }
    this.currentUtterance = null;
    this.notify(false);
  }

  public pause() {
    if (this.synth && this.synth.speaking) {
      this.synth.pause();
    }
  }

  public resume() {
    if (this.synth && this.synth.paused) {
      this.synth.resume();
    }
  }

  public isSpeaking(): boolean {
    return this.synth ? this.synth.speaking : false;
  }
}

export const tts = new TTSManager();

/**
 * Speech-to-Text (STT) Manager for Basoka AI
 */
class STTManager {
  private recognition: any = null;
  private isListeningState = false;
  private listeners: Set<(listening: boolean) => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        // Language setup - prioritize Kurdish Sorani or fallback
        this.recognition.lang = 'ckb-IQ';
      }
    }
  }

  public isAvailable(): boolean {
    return this.recognition !== null;
  }

  public subscribe(listener: (listening: boolean) => void): () => void {
    this.listeners.add(listener);
    listener(this.isListeningState);
    return () => this.listeners.delete(listener);
  }

  private notify(listening: boolean) {
    this.isListeningState = listening;
    this.listeners.forEach((l) => l(listening));
  }

  public startListening(
    onResult: (transcript: string, isFinal: boolean) => void,
    onError?: (err: string) => void
  ): boolean {
    if (!this.recognition) {
      onError?.('خزمەتگوزاری وەرگرتنی دەنگ لەم وێبگەڕەدا بەردەست نییە.');
      return false;
    }

    try {
      this.recognition.onstart = () => {
        this.notify(true);
      };

      this.recognition.onresult = (event: any) => {
        let transcript = '';
        let isFinal = false;
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            isFinal = true;
          }
        }
        onResult(transcript, isFinal);
      };

      this.recognition.onerror = (event: any) => {
        this.notify(false);
        if (event.error !== 'no-speech') {
          onError?.(`هەڵە لە وەرگرتنی دەنگ: ${event.error}`);
        }
      };

      this.recognition.onend = () => {
        this.notify(false);
      };

      this.recognition.start();
      return true;
    } catch (e: any) {
      this.notify(false);
      onError?.(e.message || 'نەتوانرا مایکرۆفۆن کارپێبکرێت');
      return false;
    }
  }

  public stopListening() {
    if (this.recognition && this.isListeningState) {
      this.recognition.stop();
      this.notify(false);
    }
  }
}

export const stt = new STTManager();
