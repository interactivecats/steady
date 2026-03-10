import { useState, useEffect, useRef, useCallback } from 'react';

interface BreathingExerciseProps {
  duration?: number; // total seconds
  lang: 'en' | 'he';
  onComplete: () => void;
}

const labels = {
  en: {
    title: 'Breathing Exercise',
    subtitle: 'Let\'s slow down and center ourselves',
    inhale: 'Breathe in',
    hold: 'Hold',
    exhale: 'Breathe out',
    skip: 'Skip',
    getReady: 'Get ready...',
  },
  he: {
    title: 'תרגיל נשימה',
    subtitle: 'בואו נאט ונתרכז',
    inhale: 'שאפו',
    hold: 'החזיקו',
    exhale: 'נשפו',
    skip: 'דלג',
    getReady: 'התכוננו...',
  },
};

type Phase = 'ready' | 'inhale' | 'hold' | 'exhale';

const INHALE_MS = 4000;
const HOLD_MS = 4000;
const EXHALE_MS = 6000;
const CYCLE_MS = INHALE_MS + HOLD_MS + EXHALE_MS;

export function BreathingExercise({ duration = 60, lang, onComplete }: BreathingExerciseProps) {
  const [phase, setPhase] = useState<Phase>('ready');
  const [elapsed, setElapsed] = useState(0);
  const [cycleProgress, setCycleProgress] = useState(0);
  const animationRef = useRef<number>(0);
  const startTimeRef = useRef(0);
  const l = labels[lang];

  const animate = useCallback(() => {
    const now = Date.now();
    const totalElapsed = (now - startTimeRef.current) / 1000;
    setElapsed(totalElapsed);

    if (totalElapsed >= duration) {
      onComplete();
      return;
    }

    // Determine phase within the cycle
    const cycleTime = ((now - startTimeRef.current) % CYCLE_MS);
    setCycleProgress(cycleTime / CYCLE_MS);

    if (cycleTime < INHALE_MS) {
      setPhase('inhale');
    } else if (cycleTime < INHALE_MS + HOLD_MS) {
      setPhase('hold');
    } else {
      setPhase('exhale');
    }

    animationRef.current = requestAnimationFrame(animate);
  }, [duration, onComplete]);

  useEffect(() => {
    // Brief "ready" pause
    const readyTimeout = setTimeout(() => {
      startTimeRef.current = Date.now();
      animationRef.current = requestAnimationFrame(animate);
    }, 1500);

    return () => {
      clearTimeout(readyTimeout);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [animate]);

  const progress = Math.min(elapsed / duration, 1);

  const getScale = () => {
    if (phase === 'ready') return 0.6;
    if (phase === 'inhale') {
      const t = (cycleProgress * CYCLE_MS) / INHALE_MS;
      return 0.6 + 0.4 * Math.min(t, 1);
    }
    if (phase === 'hold') return 1;
    // exhale
    const exhaleStart = (INHALE_MS + HOLD_MS) / CYCLE_MS;
    const t = (cycleProgress - exhaleStart) / (EXHALE_MS / CYCLE_MS);
    return 1 - 0.4 * Math.min(t, 1);
  };

  const getOpacity = () => {
    if (phase === 'inhale') return 0.7;
    if (phase === 'hold') return 0.8;
    if (phase === 'exhale') return 0.4;
    return 0.3;
  };

  const phaseLabel = phase === 'ready' ? l.getReady : l[phase];

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-8 animate-fade-in px-4">
      <div className="text-center mb-4">
        <h2 className="text-2xl md:text-3xl mb-2" style={{ fontFamily: 'var(--font-display)' }}>
          {l.title}
        </h2>
        <p className="opacity-50 text-sm md:text-base">{l.subtitle}</p>
      </div>

      {/* Breathing circle */}
      <div className="relative flex items-center justify-center" style={{ width: 260, height: 260 }}>
        {/* Outer rings */}
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="absolute rounded-full border transition-all"
            style={{
              width: 260,
              height: 260,
              borderColor: 'var(--color-sage-400)',
              opacity: 0.06 * i,
              transform: `scale(${getScale() * (1 + i * 0.08)})`,
              transition: `transform ${phase === 'inhale' ? '4s' : phase === 'exhale' ? '6s' : '0.5s'} ease-in-out, opacity 1s ease`,
            }}
          />
        ))}

        {/* Main breathing circle */}
        <div
          className="rounded-full flex items-center justify-center"
          style={{
            width: 200,
            height: 200,
            background: `radial-gradient(circle, var(--color-sage-300), var(--color-sage-500))`,
            transform: `scale(${getScale()})`,
            opacity: getOpacity(),
            transition: `transform ${phase === 'inhale' ? '4s' : phase === 'exhale' ? '6s' : '0.5s'} ease-in-out, opacity ${phase === 'exhale' ? '6s' : '4s'} ease-in-out`,
            boxShadow: `0 0 60px rgba(123, 166, 140, ${getOpacity() * 0.4})`,
          }}
        >
          <span
            className="text-white text-lg font-medium tracking-wide"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            {phaseLabel}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-xs">
        <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--color-sand-200)' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progress * 100}%`,
              background: 'var(--color-sage-400)',
            }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs opacity-40">
          <span>{Math.floor(elapsed)}s</span>
          <span>{duration}s</span>
        </div>
      </div>

      <button
        onClick={onComplete}
        className="text-sm opacity-40 hover:opacity-70 transition-opacity underline underline-offset-4 cursor-pointer"
      >
        {l.skip}
      </button>
    </div>
  );
}
