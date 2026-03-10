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
  darkMode: boolean;
}

const STORAGE_KEY = 'steady_progress';

const defaultProgress: UserProgress = {
  streak: 0,
  lastSessionDate: null,
  totalSessions: 0,
  sessions: [],
  preferredLang: 'en',
  darkMode: false,
};

export function loadProgress(): UserProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultProgress };
    const data = JSON.parse(raw) as UserProgress;
    // Recalculate streak based on dates
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
  progress.sessions.push(session);
  progress.totalSessions++;
  progress.lastSessionDate = session.date;
  const updated = recalculateStreak(progress);
  saveProgress(updated);
  return updated;
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
    // Practiced yesterday, streak continues
    // streak stays as-is (will be incremented when today's session is recorded)
  } else {
    // Missed a day, reset
    progress.streak = 0;
  }

  return progress;
}

export function getDateStr(d: Date): string {
  return d.toISOString().split('T')[0];
}

export function getRecentSessions(count = 7): SessionRecord[] {
  const progress = loadProgress();
  return progress.sessions.slice(-count);
}

export function didPracticeToday(): boolean {
  const progress = loadProgress();
  return progress.lastSessionDate === getDateStr(new Date());
}
