import { useMemo } from 'react';
import type { UserProgress } from '../utils/storage';

interface DashboardProps {
  progress: UserProgress;
  lang: 'en' | 'he';
  onStartSession: () => void;
  onToggleLang: () => void;
  onToggleDark: () => void;
}

const labels = {
  en: {
    welcome: 'Welcome back',
    firstTime: 'Welcome to Steady',
    subtitle: 'Your daily speech pace trainer',
    start: 'Start Today\'s Session',
    completed: 'Done for today!',
    startAnother: 'Practice Again',
    streak: 'Day Streak',
    sessions: 'Total Sessions',
    avgPace: 'Avg Pace',
    recentTitle: 'Recent Sessions',
    noSessions: 'Complete your first session to see your progress here.',
    wpm: 'WPM',
    days: 'days',
    today: 'Today',
    tipTitle: 'Tip of the Day',
    tips: [
      'Focus on pausing between sentences. Even a half-second pause makes a big difference.',
      'Try to breathe between phrases. It naturally slows your pace.',
      'Exaggerate slowness at first. It feels weird, but it trains your brain.',
      'Record yourself and listen back. You\'ll notice patterns you can\'t hear in the moment.',
      'Think of speaking like walking. Steady, rhythmic, one step at a time.',
      'Start each sentence slowly. The rest will follow.',
    ],
  },
  he: {
    welcome: 'ברוכים השבים',
    firstTime: 'ברוכים הבאים ל-Steady',
    subtitle: 'אימון קצב הדיבור היומי שלך',
    start: 'התחלת האימון היומי',
    completed: 'סיימת להיום!',
    startAnother: 'תרגול נוסף',
    streak: 'רצף ימים',
    sessions: 'סך אימונים',
    avgPace: 'קצב ממוצע',
    recentTitle: 'אימונים אחרונים',
    noSessions: 'השלימו את האימון הראשון כדי לראות את ההתקדמות שלכם כאן.',
    wpm: 'מילים/דקה',
    days: 'ימים',
    today: 'היום',
    tipTitle: 'טיפ היום',
    tips: [
      'התמקדו בהפסקות בין משפטים. אפילו הפסקה של חצי שנייה עושה הבדל גדול.',
      'נסו לנשום בין ביטויים. זה מאט את הקצב באופן טבעי.',
      'הגזימו באיטיות בהתחלה. זה מרגיש מוזר, אבל זה מאמן את המוח.',
      'הקליטו את עצמכם והקשיבו. תבחינו בדפוסים שלא שומעים ברגע.',
      'חשבו על דיבור כמו הליכה. יציב, קצבי, צעד אחר צעד.',
      'התחילו כל משפט לאט. השאר יבוא.',
    ],
  },
};

export function Dashboard({ progress, lang, onStartSession, onToggleLang, onToggleDark }: DashboardProps) {
  const l = labels[lang];
  const dir = lang === 'he' ? 'rtl' : 'ltr';
  const isFirstTime = progress.totalSessions === 0;
  const todayDone = progress.lastSessionDate === new Date().toISOString().split('T')[0];

  const tipIndex = new Date().getDate() % l.tips.length;
  const tip = l.tips[tipIndex];

  const recentSessions = useMemo(() => {
    return progress.sessions.slice(-7).reverse();
  }, [progress.sessions]);

  const avgWPM = useMemo(() => {
    const speechSessions = progress.sessions.filter((s) => s.avgWPM > 0);
    if (speechSessions.length === 0) return 0;
    return Math.round(speechSessions.reduce((sum, s) => sum + s.avgWPM, 0) / speechSessions.length);
  }, [progress.sessions]);

  return (
    <div className="min-h-dvh px-4 py-8 max-w-lg mx-auto" dir={dir}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl" style={{ fontFamily: 'var(--font-display)' }}>
            {isFirstTime ? l.firstTime : l.welcome}
          </h1>
          <p className="text-sm opacity-50 mt-1">{l.subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleLang}
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition-all hover:scale-110 active:scale-95 cursor-pointer"
            style={{
              background: 'var(--bg-card, white)',
              border: '1px solid var(--border-color, #E8E0D8)',
            }}
          >
            {lang === 'en' ? 'עב' : 'EN'}
          </button>
          <button
            onClick={onToggleDark}
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm transition-all hover:scale-110 active:scale-95 cursor-pointer"
            style={{
              background: 'var(--bg-card, white)',
              border: '1px solid var(--border-color, #E8E0D8)',
            }}
          >
            {progress.darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </div>

      {/* Streak + Stats */}
      {!isFirstTime && (
        <div className="grid grid-cols-3 gap-3 mb-6 animate-slide-up">
          {[
            { label: l.streak, value: progress.streak, unit: l.days, color: 'var(--color-sage-500)' },
            { label: l.sessions, value: progress.totalSessions, unit: '', color: 'var(--color-terra-400)' },
            { label: l.avgPace, value: avgWPM, unit: l.wpm, color: 'var(--color-sand-500)' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl p-4 text-center"
              style={{
                background: 'var(--bg-card, white)',
                border: '1px solid var(--border-color, #E8E0D8)',
              }}
            >
              <div className="text-2xl font-semibold" style={{ color: stat.color, fontFamily: 'var(--font-display)' }}>
                {stat.value}
              </div>
              {stat.unit && <div className="text-[10px] uppercase tracking-wider opacity-40">{stat.unit}</div>}
              <div className="text-xs opacity-50 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* CTA Button */}
      <button
        onClick={onStartSession}
        className="w-full py-4 rounded-2xl text-white text-lg font-medium transition-all hover:scale-[1.02] active:scale-[0.98] mb-6 cursor-pointer"
        style={{
          background: todayDone
            ? 'linear-gradient(135deg, var(--color-terra-300), var(--color-terra-400))'
            : 'linear-gradient(135deg, var(--color-sage-400), var(--color-sage-600))',
          boxShadow: todayDone
            ? '0 4px 20px rgba(212, 137, 106, 0.3)'
            : '0 4px 20px rgba(94, 138, 106, 0.3)',
        }}
      >
        {todayDone ? l.startAnother : l.start}
      </button>

      {todayDone && (
        <div className="text-center text-sm mb-6 animate-fade-in" style={{ color: 'var(--color-sage-500)' }}>
          ✓ {l.completed}
        </div>
      )}

      {/* Tip */}
      <div
        className="rounded-2xl p-5 mb-6"
        style={{
          background: 'var(--bg-card, white)',
          border: '1px solid var(--border-color, #E8E0D8)',
        }}
      >
        <div className="text-xs uppercase tracking-wider opacity-40 mb-2">{l.tipTitle}</div>
        <p className="text-sm leading-relaxed" style={{ fontFamily: lang === 'he' ? 'var(--font-hebrew)' : 'var(--font-body)' }}>
          {tip}
        </p>
      </div>

      {/* Recent sessions mini chart */}
      {recentSessions.length > 0 && (
        <div
          className="rounded-2xl p-5"
          style={{
            background: 'var(--bg-card, white)',
            border: '1px solid var(--border-color, #E8E0D8)',
          }}
        >
          <div className="text-xs uppercase tracking-wider opacity-40 mb-4">{l.recentTitle}</div>
          <div className="flex items-end gap-2 h-24">
            {recentSessions.map((s, i) => {
              const maxWPM = 220;
              const height = Math.max((s.avgWPM / maxWPM) * 100, 10);
              const isGood = s.avgWPM <= 150;
              const isOk = s.avgWPM <= 180;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="text-[10px] opacity-40 tabular-nums">{s.avgWPM}</div>
                  <div
                    className="w-full rounded-t-md transition-all"
                    style={{
                      height: `${height}%`,
                      background: isGood ? 'var(--color-sage-400)' : isOk ? 'var(--color-terra-300)' : 'var(--color-coral-400)',
                      opacity: i === 0 ? 1 : 0.5 + i * 0.05,
                    }}
                  />
                  <div className="text-[9px] opacity-30">
                    {i === 0 ? l.today : s.date.slice(5)}
                  </div>
                </div>
              );
            })}
          </div>
          {/* Target line label */}
          <div className="flex items-center gap-2 mt-3">
            <div className="flex-1 h-px" style={{ background: 'var(--color-sage-400)', opacity: 0.3 }} />
            <span className="text-[10px] opacity-40">150 {l.wpm} target</span>
            <div className="flex-1 h-px" style={{ background: 'var(--color-sage-400)', opacity: 0.3 }} />
          </div>
        </div>
      )}

      {isFirstTime && (
        <div className="text-center text-sm opacity-40 mt-6">
          {l.noSessions}
        </div>
      )}
    </div>
  );
}
