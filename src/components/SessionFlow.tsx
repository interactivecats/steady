import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { BreathingExercise } from './BreathingExercise';
import { ReadAlongExercise } from './ReadAlongExercise';
import { FreeSpeechExercise } from './FreeSpeechExercise';
import { ExerciseResult } from './ExerciseResult';
import { SessionSummary } from './SessionSummary';
import { getTodayExercises } from '../data/exercises';
import { recordSession, getDateStr, loadPaceSpeed, savePaceSpeed } from '../utils/storage';
import type { SessionRecord } from '../utils/storage';

type Step = 'time-select' | 'breathing' | 'read-along' | 'read-along-result' | 'free-speech' | 'free-speech-result' | 'summary';

type TimeBudgetMinutes = 3 | 5 | 10 | 15 | 20;

const timeBudgets: Record<TimeBudgetMinutes, { breathing: number; readAlongWords: number; freeSpeech: number; freeSpeechMin: number }> = {
  3:  { breathing: 30,  readAlongWords: 120, freeSpeech: 60,  freeSpeechMin: 20 },
  5:  { breathing: 60,  readAlongWords: 200, freeSpeech: 90,  freeSpeechMin: 30 },
  10: { breathing: 60,  readAlongWords: 400, freeSpeech: 240, freeSpeechMin: 30 },
  15: { breathing: 90,  readAlongWords: 650, freeSpeech: 330, freeSpeechMin: 30 },
  20: { breathing: 120, readAlongWords: 800, freeSpeech: 480, freeSpeechMin: 30 },
};

const timeOptions: TimeBudgetMinutes[] = [3, 5, 10, 15, 20];

const timeSelectLabels = {
  en: { title: 'How much time do you have?', subtitle: 'Pick a session length', unit: 'min', paceTitle: 'Reading pace', paceSub: 'How fast words highlight' },
  he: { title: 'כמה זמן יש לך?', subtitle: 'בחרו אורך אימון', unit: 'דק׳', paceTitle: 'קצב קריאה', paceSub: 'מהירות הדגשת המילים' },
};

const paceOptions = [
  { en: 'Slower', he: 'איטי מאוד', multiplier: 0.7 },
  { en: 'Slow', he: 'איטי', multiplier: 0.85 },
  { en: 'Normal', he: 'רגיל', multiplier: 1.0 },
  { en: 'Fast', he: 'מהיר', multiplier: 1.2 },
];

interface SessionFlowProps {
  lang: 'en' | 'he';
  onFinish: () => void;
}

const progressSteps: Step[] = ['breathing', 'read-along', 'free-speech'];
const stepLabels = {
  en: { breathing: 'Breathe', 'read-along': 'Read', 'free-speech': 'Speak' },
  he: { breathing: 'נשימה', 'read-along': 'קריאה', 'free-speech': 'דיבור' },
};

interface LastResult {
  type: 'read-along' | 'free-speech';
  wpm: number;
  targetWPM: number;
  duration: number;
}

export function SessionFlow({ lang, onFinish }: SessionFlowProps) {
  const [currentStep, setCurrentStep] = useState<Step>('time-select');
  const [selectedTime, setSelectedTime] = useState<TimeBudgetMinutes | null>(null);
  const [paceSpeed, setPaceSpeed] = useState(loadPaceSpeed);

  const handlePaceChange = useCallback((multiplier: number) => {
    setPaceSpeed(multiplier);
    savePaceSpeed(multiplier);
  }, []);
  const [sessionData, setSessionData] = useState<SessionRecord>({
    date: getDateStr(new Date()),
    avgWPM: 0,
    exercises: [],
  });
  const [savedStreak, setSavedStreak] = useState(0);
  const [lastResult, setLastResult] = useState<LastResult | null>(null);

  const budget = selectedTime ? timeBudgets[selectedTime] : null;
  const exercises = useMemo(() => getTodayExercises(lang, budget?.readAlongWords), [lang, budget?.readAlongWords]);
  const dir = lang === 'he' ? 'rtl' : 'ltr';

  const addExercise = useCallback(
    (type: SessionRecord['exercises'][0]['type'], wpm: number | undefined, duration: number, targetWPM?: number) => {
      setSessionData((prev) => ({
        ...prev,
        exercises: [...prev.exercises, { type, wpm, targetWPM, duration }],
      }));
    },
    []
  );

  const handleTimeSelect = useCallback((minutes: TimeBudgetMinutes) => {
    setSelectedTime(minutes);
    setCurrentStep('breathing');
  }, []);

  const handleBreathingComplete = useCallback(() => {
    addExercise('breathing', undefined, budget?.breathing ?? 60);
    setCurrentStep('read-along');
  }, [addExercise, budget?.breathing]);

  const handleReadAlongComplete = useCallback(
    (wpm: number, duration: number) => {
      const target = exercises.passage.targetWPM;
      addExercise('read-along', wpm, duration, target);
      setLastResult({ type: 'read-along', wpm, targetWPM: target, duration });
      setCurrentStep('read-along-result');
    },
    [addExercise, exercises.passage.targetWPM]
  );

  const handleFreeSpeechComplete = useCallback(
    (wpm: number, duration: number) => {
      const freeSpeechTarget = 130;
      setLastResult({ type: 'free-speech', wpm, targetWPM: freeSpeechTarget, duration });

      setSessionData((prev) => {
        const allExercises = [...prev.exercises, { type: 'free-speech' as const, wpm, targetWPM: freeSpeechTarget, duration }];
        const speechExercises = allExercises.filter((e) => e.wpm && e.wpm > 0);
        const totalWeightedWPM = speechExercises.reduce((sum, e) => sum + (e.wpm || 0) * e.duration, 0);
        const speechDuration = speechExercises.reduce((sum, e) => sum + e.duration, 0);
        const avgWPM = speechDuration > 0 ? Math.round(totalWeightedWPM / speechDuration) : 0;

        return { ...prev, avgWPM, exercises: allExercises };
      });

      setCurrentStep('free-speech-result');
    },
    []
  );

  const handleResultContinue = useCallback(() => {
    if (currentStep === 'read-along-result') {
      setCurrentStep('free-speech');
    } else {
      setCurrentStep('summary');
    }
  }, [currentStep]);

  // Record the session to localStorage once when entering 'summary'
  const hasRecordedRef = useRef(false);
  useEffect(() => {
    if (currentStep === 'summary' && !hasRecordedRef.current) {
      hasRecordedRef.current = true;
      const updatedProgress = recordSession(sessionData);
      setSavedStreak(updatedProgress.streak);
    }
  }, [currentStep, sessionData]);

  const showProgressBar = !['time-select', 'summary', 'read-along-result', 'free-speech-result'].includes(currentStep);
  const currentStepIndex = progressSteps.indexOf(
    currentStep === 'read-along-result' ? 'read-along' : currentStep === 'free-speech-result' ? 'free-speech' : currentStep
  );

  return (
    <div className="min-h-dvh" dir={dir}>
      {/* Progress bar */}
      {showProgressBar && (
        <nav aria-label={lang === 'en' ? 'Session progress' : 'התקדמות האימון'} className="sticky top-0 z-10 px-4 py-3" style={{ background: 'var(--bg-primary)' }}>
          <div className="max-w-lg mx-auto">
            <div className="flex items-center gap-2 mb-2">
              {progressSteps.map((step, i) => (
                <div key={step} className="flex-1 flex flex-col items-center gap-1" {...(i === currentStepIndex ? { 'aria-current': 'step' as const } : {})}>
                  <div
                    className="w-full h-1 rounded-full transition-all duration-500"
                    style={{
                      background: i <= currentStepIndex ? 'var(--color-sage-400)' : 'var(--color-sand-200)',
                    }}
                  />
                  <span
                    className="text-xs tracking-wide"
                    style={{
                      color: i === currentStepIndex ? 'var(--color-text-muted)' : 'var(--color-text-faint)',
                      fontFamily: lang === 'he' ? 'var(--font-hebrew)' : 'var(--font-body)',
                    }}
                  >
                    {stepLabels[lang][step]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </nav>
      )}

      {/* Step content */}
      <main>
      <div className="max-w-lg mx-auto py-4">
        {currentStep === 'time-select' && (
          <div className="flex flex-col items-center min-h-[70vh] gap-6 animate-fade-in px-4" dir={dir}>
            <div className="text-center mb-4">
              <h2
                className="text-2xl md:text-3xl mb-2"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {timeSelectLabels[lang].title}
              </h2>
              <p
                className="text-sm"
                style={{ color: 'var(--color-text-muted)', fontFamily: lang === 'he' ? 'var(--font-hebrew)' : 'var(--font-body)' }}
              >
                {timeSelectLabels[lang].subtitle}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 max-w-sm w-full" role="radiogroup" aria-label={timeSelectLabels[lang].title}>
              {timeOptions.map((m) => (
                <button
                  key={m}
                  role="radio"
                  aria-checked={selectedTime === m}
                  onClick={() => handleTimeSelect(m)}
                  className="flex flex-col items-center justify-center rounded-2xl p-5 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  style={{
                    background: 'var(--bg-card, white)',
                    border: '1px solid var(--border-color, #E8E0D8)',
                  }}
                >
                  <span
                    className="text-2xl font-semibold"
                    style={{ fontFamily: 'var(--font-display)', color: 'var(--color-sage-500)' }}
                  >
                    {m}
                  </span>
                  <span
                    className="text-xs mt-1"
                    style={{ color: 'var(--color-text-muted)', fontFamily: lang === 'he' ? 'var(--font-hebrew)' : 'var(--font-body)' }}
                  >
                    {timeSelectLabels[lang].unit}
                  </span>
                </button>
              ))}
            </div>

            {/* Pace speed selector */}
            <div className="max-w-sm w-full mt-4">
              <div className="text-center mb-3">
                <div className="text-xs uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                  {timeSelectLabels[lang].paceTitle}
                </div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--color-text-faint)' }}>
                  {timeSelectLabels[lang].paceSub}
                </div>
              </div>
              <div className="flex gap-2" role="radiogroup" aria-label={timeSelectLabels[lang].paceTitle}>
                {paceOptions.map((opt) => {
                  const isSelected = paceSpeed === opt.multiplier;
                  return (
                    <button
                      key={opt.multiplier}
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => handlePaceChange(opt.multiplier)}
                      className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-105 active:scale-95 cursor-pointer"
                      style={{
                        background: isSelected ? 'var(--color-sage-500)' : 'var(--bg-card, white)',
                        color: isSelected ? 'white' : 'var(--color-text-muted)',
                        border: isSelected ? '1px solid var(--color-sage-500)' : '1px solid var(--border-color, #E8E0D8)',
                        fontFamily: lang === 'he' ? 'var(--font-hebrew)' : 'var(--font-body)',
                      }}
                    >
                      {opt[lang]}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        {currentStep === 'breathing' && (
          <BreathingExercise
            lang={lang}
            duration={budget?.breathing ?? 60}
            onComplete={handleBreathingComplete}
          />
        )}
        {currentStep === 'read-along' && (
          <ReadAlongExercise
            passage={exercises.passage}
            lang={lang}
            paceMultiplier={paceSpeed}
            onComplete={handleReadAlongComplete}
          />
        )}
        {currentStep === 'free-speech' && (
          <FreeSpeechExercise
            prompt={exercises.freePrompt}
            lang={lang}
            maxDuration={budget?.freeSpeech}
            minDuration={budget?.freeSpeechMin}
            onComplete={handleFreeSpeechComplete}
          />
        )}
        {(currentStep === 'read-along-result' || currentStep === 'free-speech-result') && lastResult && (
          <ExerciseResult
            type={lastResult.type}
            wpm={lastResult.wpm}
            targetWPM={lastResult.targetWPM}
            duration={lastResult.duration}
            lang={lang}
            onContinue={handleResultContinue}
          />
        )}
        {currentStep === 'summary' && (
          <SessionSummary
            session={sessionData}
            streak={savedStreak}
            lang={lang}
            onClose={onFinish}
          />
        )}
      </div>
      </main>
    </div>
  );
}
