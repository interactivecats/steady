import { useState, useEffect, useRef, useCallback } from 'react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import type { Passage } from '../data/exercises';

interface ReadAlongExerciseProps {
  passage: Passage;
  lang: 'en' | 'he';
  onComplete: (wpm: number, duration: number) => void;
}

const labels = {
  en: {
    title: 'Read Along',
    subtitle: 'Read the passage at a steady, comfortable pace',
    tapToStart: 'Tap to start reading',
    waitingForMic: 'Setting up microphone...',
    scrollAndRead: 'Scroll down and follow the highlighted words',
    listening: 'Reading...',
    done: 'Finish',
    target: 'Target pace',
    noMic: 'Microphone access needed. Please allow microphone permissions.',
  },
  he: {
    title: 'קריאה בקול',
    subtitle: 'קראו את הקטע בקצב יציב ונוח',
    tapToStart: 'לחצו כדי להתחיל לקרוא',
    waitingForMic: 'מכין מיקרופון...',
    scrollAndRead: 'גללו למטה ועקבו אחרי המילים המודגשות',
    listening: 'קוראים...',
    done: 'סיום',
    target: 'קצב יעד',
    noMic: 'נדרשת גישה למיקרופון. אנא אפשרו הרשאות מיקרופון.',
  },
};

export function ReadAlongExercise({ passage, lang, onComplete }: ReadAlongExerciseProps) {
  const [phase, setPhase] = useState<'ready' | 'waiting-mic' | 'reading'>('ready');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const startTimeRef = useRef(0);
  const pacingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const l = labels[lang];
  const { isListening, isSupported, start, stop } = useSpeechRecognition();

  const text = passage.text[lang];
  const words = text.split(/\s+/);
  const targetWPM = passage.targetWPM;
  const msPerWord = 60000 / targetWPM;

  const scheduleNextWord = useCallback((index: number) => {
    if (index >= words.length - 1) return;

    const word = words[index];
    // Add pauses after punctuation
    let delay = msPerWord;
    if (/[.!?]$/.test(word)) {
      delay += msPerWord * 1.5; // long pause after sentences
    } else if (/[,;:]$/.test(word)) {
      delay += msPerWord * 0.6; // shorter pause after commas
    }

    pacingIntervalRef.current = setTimeout(() => {
      setCurrentWordIndex(index + 1);
      scheduleNextWord(index + 1);
    }, delay) as unknown as ReturnType<typeof setInterval>;
  }, [words, msPerWord]);

  const startPacing = useCallback(() => {
    startTimeRef.current = Date.now();
    setPhase('reading');

    // Scroll the passage into view
    if (textRef.current) {
      textRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    scheduleNextWord(0);
  }, [scheduleNextWord]);

  const handleStart = useCallback(() => {
    if (!isSupported) return;
    setPhase('waiting-mic');
    start(lang === 'he' ? 'he-IL' : 'en-US');
  }, [isSupported, start, lang]);

  // Wait for mic to actually connect before starting the pacing
  useEffect(() => {
    if (phase === 'waiting-mic' && isListening) {
      // Mic is ready, give a 2 second countdown so user can prepare
      const timeout = setTimeout(startPacing, 2000);
      return () => clearTimeout(timeout);
    }
  }, [phase, isListening, startPacing]);

  const handleFinish = useCallback(() => {
    const finalWPM = stop();
    if (pacingIntervalRef.current) {
      clearTimeout(pacingIntervalRef.current);
    }
    const duration = (Date.now() - startTimeRef.current) / 1000;
    onComplete(finalWPM, duration);
  }, [stop, onComplete]);

  // Auto-finish when pacing guide reaches the end
  useEffect(() => {
    if (currentWordIndex >= words.length - 1 && phase === 'reading') {
      const timeout = setTimeout(handleFinish, 2000);
      return () => clearTimeout(timeout);
    }
  }, [currentWordIndex, words.length, phase, handleFinish]);

  useEffect(() => {
    return () => {
      if (pacingIntervalRef.current) {
        clearTimeout(pacingIntervalRef.current);
      }
    };
  }, []);

  // Auto-scroll to keep the active word visible
  useEffect(() => {
    if (phase !== 'reading') return;
    const activeWord = document.querySelector('.word-token.active');
    if (activeWord) {
      activeWord.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentWordIndex, phase]);

  const dir = lang === 'he' ? 'rtl' : 'ltr';

  return (
    <div className="flex flex-col items-center min-h-[70vh] gap-6 animate-fade-in px-4" dir={dir}>
      <div className="text-center mb-2">
        <h2 className="text-2xl md:text-3xl mb-2" style={{ fontFamily: 'var(--font-display)' }}>
          {l.title}
        </h2>
        <p className="opacity-50 text-sm">{l.subtitle}</p>
        <div className="mt-2 text-xs opacity-40">
          {l.target}: {targetWPM} WPM / {passage.title[lang]}
        </div>
      </div>

      {!isSupported && (
        <div className="p-4 rounded-xl text-center max-w-md" style={{ background: 'var(--color-terra-100)', color: 'var(--color-terra-500)' }}>
          {l.noMic}
        </div>
      )}

      {/* Controls — ABOVE the passage */}
      <div className="flex flex-col items-center gap-3 sticky top-12 z-10 py-2" style={{ background: 'var(--bg-primary)' }}>
        {phase === 'ready' && (
          <button
            onClick={handleStart}
            disabled={!isSupported}
            className="group flex items-center gap-3 px-6 py-3 rounded-full text-white font-medium transition-all hover:scale-105 active:scale-95 disabled:opacity-30 cursor-pointer shadow-lg"
            style={{ background: 'var(--color-sage-500)' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" x2="12" y1="19" y2="22" />
            </svg>
            {l.tapToStart}
          </button>
        )}

        {phase === 'waiting-mic' && (
          <div className="flex items-center gap-3 px-6 py-3 rounded-full font-medium animate-pulse"
            style={{ background: 'var(--color-sage-100)', color: 'var(--color-sage-600)' }}
          >
            <div className="w-3 h-3 rounded-full animate-ping" style={{ background: 'var(--color-sage-500)' }} />
            {l.waitingForMic}
          </div>
        )}

        {phase === 'reading' && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-sage-500)' }}>
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--color-sage-500)' }} />
              {isListening ? l.listening : ''}
            </div>
            <button
              onClick={handleFinish}
              className="px-5 py-2 rounded-full text-white text-sm font-medium transition-all hover:scale-105 active:scale-95 cursor-pointer"
              style={{ background: 'var(--color-terra-400)' }}
            >
              {l.done}
            </button>
          </div>
        )}
      </div>

      {phase === 'reading' && (
        <p className="text-xs opacity-40 -mt-3">{l.scrollAndRead}</p>
      )}

      {/* The passage text */}
      <div
        ref={textRef}
        className="max-w-2xl w-full rounded-2xl p-6 md:p-8 leading-relaxed text-lg md:text-xl"
        style={{
          background: 'var(--bg-card, white)',
          border: '1px solid var(--border-color, #E8E0D8)',
          fontFamily: lang === 'he' ? 'var(--font-hebrew)' : 'var(--font-body)',
          lineHeight: 2,
        }}
      >
        {words.map((word, i) => {
          let cls = 'word-token ';
          if (phase === 'reading') {
            if (i === currentWordIndex) {
              cls += 'active';
            } else if (i < currentWordIndex) {
              cls += 'past';
            }
          }
          return (
            <span key={i} className={cls} style={{
              color: phase === 'reading' && i === currentWordIndex ? 'var(--color-sage-500)' : undefined,
              marginInlineEnd: '0.3em',
            }}>
              {word}
            </span>
          );
        })}
      </div>
    </div>
  );
}
