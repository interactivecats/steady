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

export function useSpeechRecognition(): SpeechRecognitionResult {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [wpm, setWpm] = useState(0);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const startTimeRef = useRef<number>(0);
  const finalWordCountRef = useRef(0);
  const finalTranscriptRef = useRef('');
  const lastTranscriptRef = useRef('');
  // Track when each finalized word was spoken
  const finalWordTimesRef = useRef<number[]>([]);
  // Track which result indices have already been counted as final
  // (Android Chrome can re-deliver finalized results, causing double-counting)
  const countedFinalIndicesRef = useRef(new Set<number>());

  const isSupported = !!SpeechRecognitionAPI;

  const calculateWPM = useCallback((): number => {
    const times = finalWordTimesRef.current;
    if (times.length < 2) {
      setWpm(0);
      return 0;
    }

    const now = Date.now();

    // Overall WPM using pause-adjusted elapsed time
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

  const start = useCallback(
    (lang = 'en-US') => {
      if (!SpeechRecognitionAPI) return;

      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = lang;

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = '';
        let finalTranscript = finalTranscriptRef.current;

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal && !countedFinalIndicesRef.current.has(i)) {
            countedFinalIndicesRef.current.add(i);
            const text = result[0].transcript;
            finalTranscript += text + ' ';
            finalTranscriptRef.current = finalTranscript;

            // Count new finalized words and distribute timestamps evenly
            const newWords = text.trim().split(/\s+/).filter(Boolean);
            const now = Date.now();
            const lastTime = finalWordTimesRef.current.length > 0
              ? finalWordTimesRef.current[finalWordTimesRef.current.length - 1]
              : startTimeRef.current;
            const interval = newWords.length > 0 ? (now - lastTime) / newWords.length : 0;
            for (let w = 0; w < newWords.length; w++) {
              finalWordTimesRef.current.push(lastTime + interval * (w + 1));
            }
            finalWordCountRef.current += newWords.length;
          } else {
            interimTranscript += result[0].transcript;
          }
        }

        const displayTranscript = finalTranscript + interimTranscript;
        lastTranscriptRef.current = displayTranscript;
        setTranscript(displayTranscript);

        // Word count: use finalized count for accuracy, add interim for responsiveness
        const interimWords = interimTranscript.trim().split(/\s+/).filter(Boolean).length;
        setWordCount(finalWordCountRef.current + interimWords);
      };

      // Only set isListening once audio is actually being captured
      (recognition as unknown as EventTarget).addEventListener('audiostart', () => {
        setIsListening(true);
        startTimeRef.current = Date.now();
      });

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        if (event.error !== 'no-speech' && event.error !== 'aborted') {
          console.error('Speech recognition error:', event.error);
        }
      };

      recognition.onend = () => {
        if (recognitionRef.current) {
          countedFinalIndicesRef.current.clear();
          try {
            recognition.start();
          } catch {
            setIsListening(false);
          }
        }
      };

      recognitionRef.current = recognition;
      finalWordTimesRef.current = [];
      finalWordCountRef.current = 0;
      finalTranscriptRef.current = '';
      lastTranscriptRef.current = '';
      countedFinalIndicesRef.current.clear();

      try {
        recognition.start();
      } catch (e) {
        console.error('Failed to start recognition:', e);
      }
    },
    []
  );

  const stop = useCallback((): number => {
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

    // Try calculating from finalized word timestamps first
    const result = calculateWPM();
    if (result > 0) return result;

    // Fallback: if speech API hasn't finalized words yet, estimate from
    // the full transcript (including interim) and elapsed time
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
    finalTranscriptRef.current = '';
    lastTranscriptRef.current = '';
    countedFinalIndicesRef.current.clear();
  }, [stop]);

  useEffect(() => {
    return () => {
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
