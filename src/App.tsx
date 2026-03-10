import { useState, useCallback, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { SessionFlow } from './components/SessionFlow';
import { loadProgress, saveProgress } from './utils/storage';
import type { UserProgress } from './utils/storage';

type View = 'dashboard' | 'session';

function App() {
  const [view, setView] = useState<View>('dashboard');
  const [progress, setProgress] = useState<UserProgress>(loadProgress);

  // Apply dark mode
  useEffect(() => {
    document.documentElement.classList.toggle('dark', progress.darkMode);
  }, [progress.darkMode]);

  // Apply background color based on theme
  useEffect(() => {
    const root = document.getElementById('root');
    if (root) {
      root.style.background = progress.darkMode ? '#141618' : '#FAF8F5';
      root.style.color = progress.darkMode ? '#F5F0EB' : '#2D2926';
    }
  }, [progress.darkMode]);

  const handleStartSession = useCallback(() => {
    setView('session');
  }, []);

  const handleFinishSession = useCallback(() => {
    setProgress(loadProgress());
    setView('dashboard');
  }, []);

  const handleToggleLang = useCallback(() => {
    setProgress((prev) => {
      const updated = { ...prev, preferredLang: prev.preferredLang === 'en' ? 'he' as const : 'en' as const };
      saveProgress(updated);
      return updated;
    });
  }, []);

  const handleToggleDark = useCallback(() => {
    setProgress((prev) => {
      const updated = { ...prev, darkMode: !prev.darkMode };
      saveProgress(updated);
      return updated;
    });
  }, []);

  return (
    <div className="noise-bg">
      {view === 'dashboard' && (
        <Dashboard
          progress={progress}
          lang={progress.preferredLang}
          onStartSession={handleStartSession}
          onToggleLang={handleToggleLang}
          onToggleDark={handleToggleDark}
        />
      )}
      {view === 'session' && (
        <SessionFlow
          lang={progress.preferredLang}
          onFinish={handleFinishSession}
        />
      )}
    </div>
  );
}

export default App;
