export interface SessionRecord {
  date: string; // YYYY-MM-DD
  avgWPM: number;
  exercises: {
    type: 'breathing' | 'read-along' | 'free-speech';
    wpm?: number;
    targetWPM?: number;
    duration: number; // seconds
  }[];
}

export interface UserProgress {
  streak: number;
  lastSessionDate: string | null;
  totalSessions: number;
  sessions: SessionRecord[];
  preferredLang: 'en' | 'he';
}

const STORAGE_KEY = 'steady_progress';
const PACE_KEY = 'steady_pace_speed';

export function loadPaceSpeed(): number {
  try {
    const raw = localStorage.getItem(PACE_KEY);
    if (!raw) return 1.0;
    const val = parseFloat(raw);
    if (!isFinite(val)) return 1.0;
    return Math.max(0.5, Math.min(2.0, val));
  } catch {
    return 1.0;
  }
}

export function savePaceSpeed(speed: number) {
  localStorage.setItem(PACE_KEY, String(speed));
}

const defaultProgress: UserProgress = {
  streak: 0,
  lastSessionDate: null,
  totalSessions: 0,
  sessions: [],
  preferredLang: 'en',
};

function normalizeProgress(data: unknown): UserProgress {
  const d = (data && typeof data === 'object' ? data : {}) as Record<string, unknown>;
  return {
    streak: typeof d.streak === 'number' && isFinite(d.streak) ? Math.max(0, Math.round(d.streak)) : 0,
    lastSessionDate: typeof d.lastSessionDate === 'string' ? d.lastSessionDate : null,
    totalSessions: typeof d.totalSessions === 'number' && isFinite(d.totalSessions) ? Math.max(0, Math.round(d.totalSessions)) : 0,
    sessions: Array.isArray(d.sessions) ? d.sessions.filter(
      (s): s is SessionRecord =>
        s && typeof s === 'object' &&
        typeof (s as SessionRecord).date === 'string' &&
        typeof (s as SessionRecord).avgWPM === 'number' &&
        Array.isArray((s as SessionRecord).exercises)
    ) : [],
    preferredLang: d.preferredLang === 'he' ? 'he' : 'en',
  };
}

export function loadProgress(): UserProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultProgress };
    const parsed = JSON.parse(raw);
    const data = normalizeProgress(parsed);
    return recalculateStreak(data);
  } catch {
    return { ...defaultProgress };
  }
}

export function saveProgress(progress: UserProgress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function recordSession(session: SessionRecord): UserProgress {
  const progress = loadProgress();
  const today = getDateStr(new Date());
  const yesterday = getDateStr(new Date(Date.now() - 86400000));

  if (progress.lastSessionDate === yesterday) {
    // Practiced yesterday, extend the streak
    progress.streak = (progress.streak || 0) + 1;
  } else if (progress.lastSessionDate !== today) {
    // First session today after a gap (or ever), start new streak
    progress.streak = 1;
  }
  // If lastSessionDate === today, streak already counted for today

  progress.sessions.push(session);
  progress.totalSessions++;
  progress.lastSessionDate = session.date;
  saveProgress(progress);
  return progress;
}

function recalculateStreak(progress: UserProgress): UserProgress {
  if (!progress.lastSessionDate) {
    progress.streak = 0;
    return progress;
  }

  const today = getDateStr(new Date());
  const yesterday = getDateStr(new Date(Date.now() - 86400000));

  if (progress.lastSessionDate === today) {
    // Already practiced today, streak is valid
    if (progress.streak === 0) progress.streak = 1;
  } else if (progress.lastSessionDate === yesterday) {
    // Practiced yesterday, streak is still valid (will increment on next session)
  } else {
    // Missed a day, reset
    progress.streak = 0;
  }

  return progress;
}

export function getDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function getRecentSessions(count = 7): SessionRecord[] {
  const progress = loadProgress();
  return progress.sessions.slice(-count);
}

export function didPracticeToday(): boolean {
  const progress = loadProgress();
  return progress.lastSessionDate === getDateStr(new Date());
}
