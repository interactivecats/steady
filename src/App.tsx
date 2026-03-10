import { useState, useCallback, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { SessionFlow } from './components/SessionFlow';
import { Terms } from './components/Terms';
import { loadProgress, saveProgress } from './utils/storage';
import type { UserProgress } from './utils/storage';

type View = 'dashboard' | 'session' | 'terms';

function App() {
  const [view, setView] = useState<View>('dashboard');
  const [progress, setProgress] = useState<UserProgress>(loadProgress);

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

  useEffect(() => {
    document.documentElement.lang = progress.preferredLang === 'he' ? 'he' : 'en';
    document.documentElement.dir = progress.preferredLang === 'he' ? 'rtl' : 'ltr';
  }, [progress.preferredLang]);

  const handleShowTerms = useCallback(() => {
    setView('terms');
  }, []);

  const handleBackToDashboard = useCallback(() => {
    setView('dashboard');
  }, []);

  return (
    <div className="noise-bg overflow-x-hidden">
      {view === 'dashboard' && (
        <Dashboard
          progress={progress}
          lang={progress.preferredLang}
          onStartSession={handleStartSession}
          onToggleLang={handleToggleLang}
          onShowTerms={handleShowTerms}
        />
      )}
      {view === 'session' && (
        <SessionFlow
          lang={progress.preferredLang}
          onFinish={handleFinishSession}
        />
      )}
      {view === 'terms' && (
        <Terms
          lang={progress.preferredLang}
          onBack={handleBackToDashboard}
        />
      )}
    </div>
  );
}

export default App;
