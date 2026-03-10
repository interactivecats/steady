import { useState, useRef, useCallback, useEffect } from 'react';

interface SpeechRecognitionResult {
  isListening: boolean;
  transcript: string;
  wordCount: number;
  wpm: number;
  isSupported: boolean;
  start: (lang?: string) => void;
  stop: () => number;
  reset: () => void;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition: new () => SpeechRecognitionInstance;
  }
}

/**
 * Returns elapsed ms from times[fromIdx] to toTime, subtracting long pauses.
 * Any gap > 8s between consecutive words is reduced to 2s.
 */
function getAdjustedElapsed(times: number[], fromIdx: number, toTime: number): number {
  if (fromIdx >= times.length) return 0;
  let elapsed = 0;
  let prev = times[fromIdx];
  for (let i = fromIdx + 1; i < times.length; i++) {
    const gap = times[i] - prev;
    elapsed += gap > 8000 ? 2000 : gap;
    prev = times[i];
  }
  const finalGap = toTime - prev;
  elapsed += finalGap > 8000 ? 2000 : finalGap;
  return elapsed;
}

const SpeechRecognitionAPI =
  typeof window !== 'undefined'
    ? window.SpeechRecognition || window.webkitSpeechRecognition || null
    : null;

const isAndroid = typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent);

export function useSpeechRecognition(): SpeechRecognitionResult {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [wpm, setWpm] = useState(0);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const startTimeRef = useRef<number>(0);
  const finalWordCountRef = useRef(0);
  const lastTranscriptRef = useRef('');
  const finalWordTimesRef = useRef<number[]>([]);
  const activeRef = useRef(false);
  const langRef = useRef('en-US');
  // Accumulated final transcript from previous recognition sessions (across onend restarts).
  // On Android, onend fires after each utterance and we create a fresh instance.
  // This ref carries the finalized text across those restarts.
  const priorTranscriptRef = useRef('');
  // The total final transcript (prior + current session), updated in onresult
  // so onend can snapshot it before creating a new instance.
  const totalFinalRef = useRef('');

  const isSupported = !!SpeechRecognitionAPI;

  const calculateWPM = useCallback((): number => {
    const times = finalWordTimesRef.current;
    if (times.length < 2) {
      setWpm(0);
      return 0;
    }

    const now = Date.now();
    const adjustedMs = getAdjustedElapsed(times, 0, now);
    const adjustedMin = adjustedMs / 60000;
    if (adjustedMin <= 0) {
      setWpm(0);
      return 0;
    }

    const result = Math.min(Math.round(times.length / adjustedMin), 250);
    setWpm(result);
    return result;
  }, []);

  const createRecognition = useCallback((lang: string): SpeechRecognitionInstance | null => {
    if (!SpeechRecognitionAPI) return null;

    const recognition = new SpeechRecognitionAPI();
    // Android Chrome doesn't support continuous mode properly — it causes
    // duplicate/repeated words. Use non-continuous mode and restart in onend.
    recognition.continuous = !isAndroid;
    recognition.interimResults = true;
    recognition.lang = lang;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      // Rebuild session transcript from event.results each time (idempotent).
      // On Android, onresult can re-fire with stale results — rebuilding
      // from scratch each time means duplicates are harmless.
      let sessionFinal = '';
      let interim = '';

      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          sessionFinal += result[0].transcript + ' ';
        } else {
          interim += result[0].transcript;
        }
      }

      const totalFinal = priorTranscriptRef.current + sessionFinal;
      totalFinalRef.current = totalFinal;

      const totalFinalWords = totalFinal.trim().split(/\s+/).filter(Boolean);
      const totalWordCount = totalFinalWords.length;

      // Add timestamps only for genuinely new words
      const newWords = totalWordCount - finalWordCountRef.current;
      if (newWords > 0) {
        const now = Date.now();
        const lastTime = finalWordTimesRef.current.length > 0
          ? finalWordTimesRef.current[finalWordTimesRef.current.length - 1]
          : startTimeRef.current;
        const interval = (now - lastTime) / newWords;
        for (let w = 0; w < newWords; w++) {
          finalWordTimesRef.current.push(lastTime + interval * (w + 1));
        }
        finalWordCountRef.current = totalWordCount;
      }

      const displayTranscript = totalFinal + interim;
      lastTranscriptRef.current = displayTranscript;
      setTranscript(displayTranscript);

      const interimWords = interim.trim().split(/\s+/).filter(Boolean).length;
      setWordCount(totalWordCount + interimWords);
    };

    (recognition as unknown as EventTarget).addEventListener('audiostart', () => {
      setIsListening(true);
      if (startTimeRef.current === 0) {
        startTimeRef.current = Date.now();
      }
    });

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        console.error('Speech recognition error:', event.error);
      }
    };

    recognition.onend = () => {
      if (!activeRef.current) return;

      // Snapshot the total finalized transcript so the next session builds on it
      priorTranscriptRef.current = totalFinalRef.current;

      // Create a fresh instance to avoid Android's stale-results bug
      // (restarting the same instance can leave old results in event.results)
      const next = createRecognition(langRef.current);
      if (next) {
        recognitionRef.current = next;
        try {
          next.start();
        } catch {
          setIsListening(false);
          activeRef.current = false;
        }
      } else {
        setIsListening(false);
        activeRef.current = false;
      }
    };

    return recognition;
  }, []);

  const start = useCallback(
    (lang = 'en-US') => {
      if (!SpeechRecognitionAPI) return;

      // Clean up any existing instance
      if (recognitionRef.current) {
        const old = recognitionRef.current;
        recognitionRef.current = null;
        activeRef.current = false;
        old.onend = null;
        try { old.abort(); } catch { /* ignore */ }
      }

      langRef.current = lang;
      finalWordTimesRef.current = [];
      finalWordCountRef.current = 0;
      lastTranscriptRef.current = '';
      priorTranscriptRef.current = '';
      totalFinalRef.current = '';
      startTimeRef.current = 0;

      const recognition = createRecognition(lang);
      if (!recognition) return;

      recognitionRef.current = recognition;
      activeRef.current = true;

      try {
        recognition.start();
      } catch (e) {
        console.error('Failed to start recognition:', e);
      }
    },
    [createRecognition]
  );

  const stop = useCallback((): number => {
    activeRef.current = false;
    if (recognitionRef.current) {
      const ref = recognitionRef.current;
      recognitionRef.current = null;
      ref.onend = null;
      try {
        ref.stop();
      } catch {
        // ignore
      }
    }
    setIsListening(false);

    const result = calculateWPM();
    if (result > 0) return result;

    // Fallback: estimate from transcript and elapsed time
    const allWords = lastTranscriptRef.current.trim().split(/\s+/).filter(Boolean);
    const elapsedMs = Date.now() - startTimeRef.current;
    if (allWords.length >= 2 && elapsedMs > 2000) {
      const fallbackWPM = Math.min(Math.round(allWords.length / (elapsedMs / 60000)), 250);
      setWpm(fallbackWPM);
      return fallbackWPM;
    }

    return 0;
  }, [calculateWPM]);

  const reset = useCallback(() => {
    stop();
    setTranscript('');
    setWordCount(0);
    setWpm(0);
    finalWordTimesRef.current = [];
    finalWordCountRef.current = 0;
    lastTranscriptRef.current = '';
    priorTranscriptRef.current = '';
    totalFinalRef.current = '';
  }, [stop]);

  useEffect(() => {
    return () => {
      activeRef.current = false;
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  return {
    isListening,
    transcript,
    wordCount,
    wpm,
    isSupported,
    start,
    stop,
    reset,
  };
}
