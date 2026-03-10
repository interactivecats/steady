import { useMemo } from 'react';
import type { SessionRecord } from '../utils/storage';

interface SessionSummaryProps {
  session: SessionRecord;
  streak: number;
  lang: 'en' | 'he';
  onClose: () => void;
}

const labels = {
  en: {
    title: 'Session Complete',
    avgPace: 'Average Pace',
    duration: 'Total Time',
    streak: 'Day Streak',
    exercises: 'Exercises',
    readAlong: 'Read Along',
    freeSpeech: 'Free Speech',
    breathing: 'Breathing',
    target: 'Target',
    great: 'Great work! Your pace was in the target zone.',
    good: 'Good session! Try to slow down just a bit more.',
    fast: 'You spoke quickly today. Focus on pausing between sentences.',
    done: 'Back to Home',
    days: 'days',
    min: 'min',
    wpm: 'WPM',
    highlights: 'Highlights',
    onTarget: 'Right on target!',
    slightlyFast: 'A bit fast. Try pausing between sentences.',
    tooFast: 'Too quick. Focus on slowing down next time.',
    targetLabel: 'target',
  },
  he: {
    title: 'האימון הסתיים',
    avgPace: 'קצב ממוצע',
    duration: 'זמן כולל',
    streak: 'רצף ימים',
    exercises: 'תרגילים',
    readAlong: 'קריאה בקול',
    freeSpeech: 'דיבור חופשי',
    breathing: 'נשימה',
    target: 'יעד',
    great: 'עבודה מצוינת! הקצב שלך היה בטווח היעד.',
    good: 'אימון טוב! נסו להאט עוד קצת.',
    fast: 'דיברתם מהר היום. התמקדו בהפסקות בין משפטים.',
    done: 'חזרה הביתה',
    days: 'ימים',
    min: 'דקות',
    wpm: 'מילים לדקה',
    highlights: 'סיכום',
    onTarget: 'בדיוק בטווח היעד!',
    slightlyFast: 'קצת מהר. נסו לעצור בין משפטים.',
    tooFast: 'מהר מדי. התמקדו בהאטה בפעם הבאה.',
    targetLabel: 'יעד',
  },
};

export function SessionSummary({ session, streak, lang, onClose }: SessionSummaryProps) {
  const l = labels[lang];
  const dir = lang === 'he' ? 'rtl' : 'ltr';

  const stats = useMemo(() => {
    const speechExercises = session.exercises.filter((e) => e.wpm && e.wpm > 0);
    const totalWeightedWPM = speechExercises.reduce((sum, e) => sum + (e.wpm || 0) * e.duration, 0);
    const speechDuration = speechExercises.reduce((sum, e) => sum + e.duration, 0);
    const avgWPM = speechDuration > 0 ? Math.round(totalWeightedWPM / speechDuration) : 0;
    const totalDuration = session.exercises.reduce((sum, e) => sum + e.duration, 0);
    return { avgWPM, totalDuration };
  }, [session]);

  const feedback = stats.avgWPM <= 150 ? l.great : stats.avgWPM <= 180 ? l.good : l.fast;
  const feedbackColor = stats.avgWPM <= 150 ? 'var(--color-sage-500)' : stats.avgWPM <= 180 ? 'var(--color-terra-400)' : 'var(--color-coral-400)';

  return (
    <div className="flex flex-col items-center min-h-[70vh] gap-6 animate-slide-up px-4 py-8" dir={dir}>
      {/* Celebration */}
      <div className="text-center">
        <div className="text-5xl mb-4 animate-float">
          {stats.avgWPM <= 150 ? '🌿' : stats.avgWPM <= 180 ? '🌤' : '💨'}
        </div>
        <h2 className="text-3xl md:text-4xl mb-2" style={{ fontFamily: 'var(--font-display)' }}>
          {l.title}
        </h2>
        <p className="text-sm max-w-sm mx-auto mt-2" style={{ color: feedbackColor }}>
          {feedback}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-4 w-full max-w-md">
        {[
          { label: l.avgPace, value: stats.avgWPM, unit: l.wpm },
          { label: l.duration, value: Math.ceil(stats.totalDuration / 60), unit: l.min },
          { label: l.streak, value: streak, unit: l.days },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl p-4 text-center"
            style={{
              background: 'var(--bg-card, white)',
              border: '1px solid var(--border-color, #E8E0D8)',
            }}
          >
            <div className="text-2xl md:text-3xl font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
              {stat.value}
            </div>
            <div className="text-[10px] uppercase tracking-wider opacity-40 mt-1">{stat.unit}</div>
            <div className="text-xs opacity-60 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Exercise breakdown with feedback */}
      <div
        className="w-full max-w-md rounded-2xl p-5"
        style={{
          background: 'var(--bg-card, white)',
          border: '1px solid var(--border-color, #E8E0D8)',
        }}
      >
        <div className="text-xs uppercase tracking-wider opacity-40 mb-3">{l.highlights}</div>
        <div className="space-y-4">
          {session.exercises.map((ex, i) => {
            const hasWPM = ex.wpm && ex.wpm > 0;
            const target = ex.targetWPM || 0;
            const isOnTarget = hasWPM && target > 0 && ex.wpm! <= target;
            const isSlightlyFast = hasWPM && target > 0 && ex.wpm! > target && ex.wpm! <= target + 30;
            const isTooFast = hasWPM && target > 0 && ex.wpm! > target + 30;

            const feedbackText = isOnTarget ? l.onTarget : isSlightlyFast ? l.slightlyFast : isTooFast ? l.tooFast : null;
            const feedbackColor = isOnTarget ? 'var(--color-sage-500)' : isSlightlyFast ? 'var(--color-terra-400)' : 'var(--color-coral-400)';

            return (
              <div key={i}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                      style={{
                        background: ex.type === 'breathing' ? 'var(--color-sage-100)' : ex.type === 'read-along' ? 'var(--color-terra-100)' : 'var(--color-sand-200)',
                        color: ex.type === 'breathing' ? 'var(--color-sage-600)' : ex.type === 'read-along' ? 'var(--color-terra-500)' : 'var(--color-sand-500)',
                      }}
                    >
                      {ex.type === 'breathing' ? '🌬' : ex.type === 'read-along' ? '📖' : '🎙'}
                    </div>
                    <span className="text-sm">
                      {ex.type === 'breathing' ? l.breathing : ex.type === 'read-along' ? l.readAlong : l.freeSpeech}
                    </span>
                  </div>
                  <div className="text-sm font-medium tabular-nums">
                    {hasWPM ? `${ex.wpm} ${l.wpm}` : `${Math.ceil(ex.duration)}s`}
                  </div>
                </div>
                {hasWPM && target > 0 && (
                  <div className="flex items-center gap-2 mt-1.5" style={{ paddingInlineStart: '2.75rem' }}>
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--color-sand-200)' }}>
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min((ex.wpm! / (target + 60)) * 100, 100)}%`,
                          background: feedbackColor,
                        }}
                      />
                    </div>
                    <span className="text-[10px] opacity-40 tabular-nums whitespace-nowrap">
                      {l.targetLabel}: {target}
                    </span>
                  </div>
                )}
                {feedbackText && (
                  <p className="text-xs mt-1" style={{ color: feedbackColor, paddingInlineStart: '2.75rem' }}>
                    {feedbackText}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <button
        onClick={onClose}
        className="px-8 py-3 rounded-full text-white font-medium transition-all hover:scale-105 active:scale-95 cursor-pointer mt-2"
        style={{ background: 'var(--color-sage-500)' }}
      >
        {l.done}
      </button>
    </div>
  );
}
