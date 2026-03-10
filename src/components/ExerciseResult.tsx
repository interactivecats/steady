interface ExerciseResultProps {
  type: 'read-along' | 'free-speech';
  wpm: number;
  targetWPM: number;
  duration: number;
  lang: 'en' | 'he';
  onContinue: () => void;
}

const labels = {
  en: {
    readAlong: 'Read Along',
    freeSpeech: 'Free Speech',
    yourPace: 'Your pace',
    target: 'Target',
    duration: 'Duration',
    onTarget: 'Right on target! Great control.',
    slightlyFast: 'A bit fast. Try pausing between sentences next time.',
    tooFast: 'Too quick. Focus on slowing down and breathing between phrases.',
    continue: 'Continue',
    wpm: 'WPM',
    sec: 'sec',
  },
  he: {
    readAlong: 'קריאה בקול',
    freeSpeech: 'דיבור חופשי',
    yourPace: 'הקצב שלך',
    target: 'יעד',
    duration: 'משך',
    onTarget: 'בדיוק בטווח היעד! שליטה מעולה.',
    slightlyFast: 'קצת מהר. נסו לעצור בין משפטים בפעם הבאה.',
    tooFast: 'מהר מדי. התמקדו בהאטה ונשימה בין ביטויים.',
    continue: 'המשך',
    wpm: 'מילים לדקה',
    sec: 'שניות',
  },
};

export function ExerciseResult({ type, wpm, targetWPM, duration, lang, onContinue }: ExerciseResultProps) {
  const l = labels[lang];
  const dir = lang === 'he' ? 'rtl' : 'ltr';

  const isOnTarget = wpm <= targetWPM;
  const isSlightlyFast = wpm > targetWPM && wpm <= targetWPM + 30;

  const feedback = isOnTarget ? l.onTarget : isSlightlyFast ? l.slightlyFast : l.tooFast;
  const color = isOnTarget ? 'var(--color-sage-500)' : isSlightlyFast ? 'var(--color-terra-400)' : 'var(--color-coral-400)';
  const icon = isOnTarget ? '🌿' : isSlightlyFast ? '🌤' : '💨';
  const title = type === 'read-along' ? l.readAlong : l.freeSpeech;

  return (
    <div className="flex flex-col items-center min-h-[60vh] gap-6 animate-slide-up px-4 py-8" dir={dir}>
      <div className="text-4xl"><span aria-hidden="true">{icon}</span></div>

      <h2 className="text-2xl md:text-3xl" style={{ fontFamily: 'var(--font-display)' }}>
        {title}
      </h2>

      {/* WPM display */}
      <div
        className="rounded-2xl p-6 text-center w-full max-w-xs"
        style={{
          background: 'var(--bg-card, white)',
          border: '1px solid var(--border-color, #E8E0D8)',
        }}
      >
        <div className="text-5xl font-semibold" style={{ color, fontFamily: 'var(--font-display)' }}>
          {wpm}
        </div>
        <div className="text-xs uppercase tracking-wider mt-1" style={{ color: 'var(--color-text-muted)' }}>{l.wpm}</div>

        {/* Progress bar */}
        <div className="flex items-center gap-2 mt-4">
          <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--color-sand-200)' }}>
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min((wpm / (targetWPM + 60)) * 100, 100)}%`,
                background: color,
              }}
            />
          </div>
        </div>
        <div className="flex justify-between mt-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
          <span>{l.target}: {targetWPM} {l.wpm}</span>
          <span>{Math.round(duration)}{l.sec}</span>
        </div>
      </div>

      {/* Feedback */}
      <p className="text-sm text-center max-w-sm" style={{ color }}>
        {feedback}
      </p>

      <button
        onClick={onContinue}
        className="w-full sm:w-auto px-8 py-3 rounded-full text-white font-medium transition-all hover:scale-105 active:scale-95 cursor-pointer mt-2"
        style={{ background: 'var(--color-sage-500)' }}
      >
        {l.continue}
      </button>
    </div>
  );
}
