import { useState, useRef, useCallback } from 'react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import type { Prompt } from '../data/exercises';

interface FreeSpeechExerciseProps {
  prompt: Prompt;
  lang: 'en' | 'he';
  maxDuration?: number;
  minDuration?: number;
  onComplete: (wpm: number, duration: number) => void;
}

const labels = {
  en: {
    title: 'Free Speech',
    subtitle: 'Speak naturally about the topic below',
    tapToStart: 'Tap the microphone to begin',
    listening: 'Listening...',
    done: 'Finish',
    hint: 'Tip',
    transcript: 'What I heard',
    minTime: 'Speak for at least 30 seconds',
    noMic: 'Microphone access needed. Please allow microphone permissions.',
  },
  he: {
    title: 'דיבור חופשי',
    subtitle: 'דברו באופן טבעי על הנושא שלמטה',
    tapToStart: 'לחצו על המיקרופון כדי להתחיל',
    listening: 'מקשיבים...',
    done: 'סיום',
    hint: 'טיפ',
    transcript: 'מה ששמעתי',
    minTime: 'דברו לפחות 30 שניות',
    noMic: 'נדרשת גישה למיקרופון. אנא אפשרו הרשאות מיקרופון.',
  },
};

export function FreeSpeechExercise({ prompt, lang, maxDuration, minDuration, onComplete }: FreeSpeechExerciseProps) {
  const effectiveMin = minDuration ?? 30;
  const effectiveMax = maxDuration;
  const [started, setStarted] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const startTimeRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const finishedRef = useRef(false);
  const l = labels[lang];
  const { isListening, transcript, isSupported, start, stop } = useSpeechRecognition();

  const handleFinish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    const finalWPM = stop();
    if (timerRef.current) clearInterval(timerRef.current);
    const duration = (Date.now() - startTimeRef.current) / 1000;
    onComplete(finalWPM, duration);
  }, [stop, onComplete]);

  const handleStart = useCallback(() => {
    if (!isSupported) return;
    setStarted(true);
    finishedRef.current = false;
    startTimeRef.current = Date.now();
    start(lang === 'he' ? 'he-IL' : 'en-US');

    timerRef.current = setInterval(() => {
      const now = (Date.now() - startTimeRef.current) / 1000;
      setElapsed(now);
      if (effectiveMax && now >= effectiveMax) {
        handleFinish();
      }
    }, 500);
  }, [isSupported, start, lang, effectiveMax, handleFinish]);

  const dir = lang === 'he' ? 'rtl' : 'ltr';
  const canFinish = elapsed >= effectiveMin;
  const remaining = effectiveMax ? Math.max(0, effectiveMax - elapsed) : null;

  return (
    <div className="flex flex-col items-center min-h-[70vh] gap-6 animate-fade-in px-4" dir={dir}>
      <div className="text-center mb-2">
        <h2 className="text-2xl md:text-3xl mb-2" style={{ fontFamily: 'var(--font-display)' }}>
          {l.title}
        </h2>
        <p className="opacity-50 text-sm">{l.subtitle}</p>
      </div>

      {!isSupported && (
        <div className="p-4 rounded-xl text-center max-w-md" style={{ background: 'var(--color-terra-100)', color: 'var(--color-terra-500)' }}>
          {l.noMic}
        </div>
      )}

      {/* Prompt card */}
      <div
        className="max-w-lg w-full rounded-2xl p-6 text-center"
        style={{
          background: 'var(--bg-card, white)',
          border: '1px solid var(--border-color, #E8E0D8)',
        }}
      >
        <p className="text-lg md:text-xl font-medium mb-3" style={{ fontFamily: lang === 'he' ? 'var(--font-hebrew)' : 'var(--font-body)' }}>
          {prompt.prompt[lang]}
        </p>
        <p className="text-sm opacity-50" style={{ fontFamily: lang === 'he' ? 'var(--font-hebrew)' : 'var(--font-body)' }}>
          <span className="font-medium">{l.hint}:</span> {prompt.hint[lang]}
        </p>
      </div>

      {/* Live transcript */}
      {started && transcript && (
        <div className="max-w-lg w-full animate-fade-in">
          <div className="text-xs uppercase tracking-wider opacity-40 mb-2">{l.transcript}</div>
          <div
            className="rounded-xl p-4 text-sm leading-relaxed max-h-32 overflow-y-auto"
            style={{
              background: 'var(--bg-card, white)',
              border: '1px solid var(--border-color, #E8E0D8)',
              fontFamily: lang === 'he' ? 'var(--font-hebrew)' : 'var(--font-body)',
            }}
          >
            {transcript}
          </div>
        </div>
      )}

      {/* Timer */}
      {started && (
        <div className="text-center animate-fade-in">
          <div className="text-3xl font-light tabular-nums" style={{ fontFamily: 'var(--font-body)' }}>
            {remaining !== null
              ? `${Math.floor(remaining / 60)}:${String(Math.floor(remaining % 60)).padStart(2, '0')}`
              : `${Math.floor(elapsed / 60)}:${String(Math.floor(elapsed % 60)).padStart(2, '0')}`}
          </div>
          {!canFinish && (
            <p className="text-xs opacity-40 mt-1">{l.minTime}</p>
          )}
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col items-center gap-4 mt-2">
        {!started ? (
          <button
            onClick={handleStart}
            disabled={!isSupported}
            className="group flex items-center gap-3 px-6 py-3 rounded-full text-white font-medium transition-all hover:scale-105 active:scale-95 disabled:opacity-30 cursor-pointer"
            style={{ background: 'var(--color-sage-500)' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" x2="12" y1="19" y2="22" />
            </svg>
            {l.tapToStart}
          </button>
        ) : (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-sage-500)' }}>
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--color-sage-500)' }} />
              {isListening ? l.listening : ''}
            </div>
            <button
              onClick={handleFinish}
              disabled={!canFinish}
              className="px-5 py-2 rounded-full text-white text-sm font-medium transition-all hover:scale-105 active:scale-95 disabled:opacity-30 cursor-pointer"
              style={{ background: canFinish ? 'var(--color-terra-400)' : 'var(--color-sand-400)' }}
            >
              {l.done}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
