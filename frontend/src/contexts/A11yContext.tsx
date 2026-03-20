import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

const STORAGE_KEY = 'taskspop-a11y';

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  }
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onerror: ((e: Event) => void) | null;
  start(): void;
  stop(): void;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface A11yState {
  ttsEnabled: boolean;
  sttEnabled: boolean;
  simplifiedMode: boolean;
}

interface A11yContextType extends A11yState {
  speak: (text: string) => void;
  stopSpeaking: () => void;
  startListening: (onResult: (text: string) => void) => void;
  stopListening: () => void;
  setTtsEnabled: (v: boolean) => void;
  setSttEnabled: (v: boolean) => void;
  setSimplifiedMode: (v: boolean) => void;
  ttsSupported: boolean;
  sttSupported: boolean;
}

const defaultState: A11yState = {
  ttsEnabled: false,
  sttEnabled: false,
  simplifiedMode: false,
};

function loadState(): A11yState {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (s) {
      const parsed = JSON.parse(s) as Partial<A11yState>;
      return { ...defaultState, ...parsed };
    }
  } catch {
    // ignore
  }
  return defaultState;
}

function saveState(state: A11yState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

const A11yContext = createContext<A11yContextType | null>(null);

export function A11yProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<A11yState>(loadState);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  const ttsSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const sttSupported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const speak = useCallback(
    (text: string) => {
      if (!ttsSupported || !state.ttsEnabled || !text?.trim()) return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text.trim());
      u.lang = 'pt-BR';
      u.rate = 0.95;
      window.speechSynthesis.speak(u);
    },
    [ttsSupported, state.ttsEnabled]
  );

  const stopSpeaking = useCallback(() => {
    if (ttsSupported) window.speechSynthesis.cancel();
  }, [ttsSupported]);

  const startListening = useCallback(
    (onResult: (text: string) => void) => {
      if (!sttSupported || !state.sttEnabled) return;
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognitionAPI) return;
      const rec = new SpeechRecognitionAPI();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'pt-BR';
      rec.onresult = (e: SpeechRecognitionEvent) => {
        const t = e.results[e.results.length - 1];
        if (t.isFinal && t[0]) onResult(t[0].transcript);
      };
      rec.onerror = () => {};
      rec.start();
      recognitionRef.current = rec;
    },
    [sttSupported, state.sttEnabled]
  );

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }
  }, []);

  const setTtsEnabled = useCallback((v: boolean) => {
    setState((s) => ({ ...s, ttsEnabled: v }));
    if (!v && ttsSupported) window.speechSynthesis.cancel();
  }, [ttsSupported]);

  const setSttEnabled = useCallback((v: boolean) => {
    setState((s) => ({ ...s, sttEnabled: v }));
  }, []);

  const setSimplifiedMode = useCallback((v: boolean) => {
    setState((s) => ({ ...s, simplifiedMode: v }));
    document.documentElement.classList.toggle('a11y-simplified', v);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('a11y-simplified', state.simplifiedMode);
  }, [state.simplifiedMode]);

  return (
    <A11yContext.Provider
      value={{
        ...state,
        speak,
        stopSpeaking,
        startListening,
        stopListening,
        setTtsEnabled,
        setSttEnabled,
        setSimplifiedMode,
        ttsSupported,
        sttSupported,
      }}
    >
      {children}
    </A11yContext.Provider>
  );
}

export function useA11y() {
  const ctx = useContext(A11yContext);
  if (!ctx) throw new Error('useA11y must be used within A11yProvider');
  return ctx;
}
