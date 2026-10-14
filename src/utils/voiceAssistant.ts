/**
 * Voice Assistant Engine
 * Comprehensive Text-to-Speech (TTS), Speech-to-Text (STT),
 * and Web Audio sound effects synthesizer.
 */

// Simple Web Audio Sound Effects (zero external audio files required)
export function playChime(type: "start" | "stop" | "success" | "click") {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === "start") {
      // Pleasant rising double tone
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === "stop") {
      // Soft falling tone
      osc.frequency.setValueAtTime(660, now);
      osc.frequency.exponentialRampToValueAtTime(330, now + 0.18);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === "success") {
      // Upbeat cheerful chord
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else {
      // Subtle click
      osc.frequency.setValueAtTime(1200, now);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.start(now);
      osc.stop(now + 0.04);
    }
  } catch {
    // Ignore audio context autoplay limitations
  }
}

export interface VoiceOption {
  name: string;
  lang: string;
  voiceURI: string;
  isDefault: boolean;
  displayName: string;
}

class VoiceManager {
  private voices: SpeechSynthesisVoice[] = [];
  private isSpeaking = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private onSpeakingChangeCallbacks: Set<(speaking: boolean, activeId?: string) => void> = new Set();
  private activeMessageId?: string;

  constructor() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      this.loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  public loadVoices(): SpeechSynthesisVoice[] {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return [];
    const list = window.speechSynthesis.getVoices();
    if (list.length > 0) {
      this.voices = list;
    }
    return this.voices;
  }

  public getVoices(): VoiceOption[] {
    const list = this.voices.length > 0 ? this.voices : this.loadVoices();
    return list.map((v) => ({
      name: v.name,
      lang: v.lang,
      voiceURI: v.voiceURI,
      isDefault: v.default,
      displayName: `${v.name} (${v.lang})`,
    }));
  }

  public subscribeSpeakingChange(callback: (speaking: boolean, activeId?: string) => void): () => void {
    this.onSpeakingChangeCallbacks.add(callback);
    return () => this.onSpeakingChangeCallbacks.delete(callback);
  }

  private notifySpeaking(speaking: boolean, id?: string) {
    this.isSpeaking = speaking;
    this.activeMessageId = speaking ? id : undefined;
    this.onSpeakingChangeCallbacks.forEach((cb) => cb(speaking, id));
  }

  public getSpeakingState() {
    return {
      isSpeaking: this.isSpeaking,
      activeMessageId: this.activeMessageId,
    };
  }

  public stop() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    this.currentUtterance = null;
    this.notifySpeaking(false);
  }

  public speak(
    text: string,
    options?: {
      messageId?: string;
      voiceURI?: string;
      rate?: number;
      pitch?: number;
      volume?: number;
      onEnd?: () => void;
    }
  ) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    this.stop();

    if (!text.trim()) return;

    // Clean text for speech: strip markdown, code fences, bullets, URLs, emojis
    const cleaned = text
      .replace(/```[\s\S]*?```/g, "Code block omitted.")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/[*_#~>]/g, "")
      .replace(/https?:\/\/\S+/g, "link")
      .replace(/\n+/g, ". ")
      .trim();

    if (!cleaned) return;

    // Split long text into manageable sentences to prevent Chrome's 15s synthesis pause
    const sentences = cleaned.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [cleaned];
    const chunks = sentences
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 8); // Keep concise

    if (chunks.length === 0) return;

    const fullSpeech = chunks.join(" ");

    const utterance = new SpeechSynthesisUtterance(fullSpeech);
    this.currentUtterance = utterance;

    // Voice selection
    const voices = this.loadVoices();
    if (options?.voiceURI) {
      const selected = voices.find((v) => v.voiceURI === options.voiceURI);
      if (selected) utterance.voice = selected;
    } else {
      // Prefer modern natural English / localized voices if available
      const preferred = voices.find(
        (v) =>
          (v.name.includes("Natural") || v.name.includes("Google") || v.name.includes("Samantha") || v.name.includes("Daniel")) &&
          v.lang.startsWith("en")
      ) || voices.find((v) => v.lang.startsWith("en")) || voices[0];
      if (preferred) utterance.voice = preferred;
    }

    utterance.rate = options?.rate ?? 1.05;
    utterance.pitch = options?.pitch ?? 1.0;
    utterance.volume = options?.volume ?? 1.0;

    utterance.onstart = () => {
      this.notifySpeaking(true, options?.messageId);
    };

    utterance.onend = () => {
      this.notifySpeaking(false);
      options?.onEnd?.();
    };

    utterance.onerror = () => {
      this.notifySpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  }
}

export const voiceManager = new VoiceManager();

/**
 * Speech Recognition Helper
 */
export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === "undefined") return false;
  return !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
}

export interface SpeechRecognitionHandlers {
  onStart: () => void;
  onResult: (transcript: string, isFinal: boolean) => void;
  onError: (errorMessage: string) => void;
  onEnd: () => void;
}

export function createSpeechRecognizer(
  lang: string = "en-US",
  handlers: SpeechRecognitionHandlers
) {
  const SpeechRecognitionClass =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognitionClass) {
    handlers.onError("Speech recognition not supported in this browser.");
    return null;
  }

  try {
    const recognition = new SpeechRecognitionClass();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = lang;

    recognition.onstart = () => {
      playChime("start");
      handlers.onStart();
    };

    recognition.onresult = (event: any) => {
      let interim = "";
      let final = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const item = event.results[i];
        if (item.isFinal) {
          final += item[0].transcript;
        } else {
          interim += item[0].transcript;
        }
      }

      handlers.onResult(final || interim, !!final);
    };

    recognition.onerror = (event: any) => {
      playChime("stop");
      let msg = "Microphone error";
      if (event.error === "not-allowed") {
        msg = "Microphone access was denied. Please allow microphone permissions in browser settings.";
      } else if (event.error === "no-speech") {
        msg = "No speech detected. Click the mic and speak clearly.";
      } else if (event.error === "network") {
        msg = "Network speech service error. Check connection.";
      }
      handlers.onError(msg);
    };

    recognition.onend = () => {
      playChime("stop");
      handlers.onEnd();
    };

    return recognition;
  } catch (err: any) {
    handlers.onError(err.message || "Failed to initialize microphone.");
    return null;
  }
}
