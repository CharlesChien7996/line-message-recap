import { useState } from 'react';
import { LoadingPage } from './components/LoadingPage';
import { QuizPage } from './components/QuizPage';
import { RecapPage } from './components/RecapPage';
import { UploadPage } from './components/UploadPage';
import type { AppPage, QuizQuestion, RecapData } from './types';
import { generateQuiz, generateRecap } from './utils/gemini';
import { filterContentByYear } from './utils/parser';

function App() {
  const [page, setPage] = useState<AppPage>('upload');
  const [loadingStage, setLoadingStage] = useState<'parsing' | 'analyzing' | 'generating'>('parsing');
  const [recapData, setRecapData] = useState<RecapData | null>(null);
  const [quizData, setQuizData] = useState<QuizQuestion[] | null>(null);
  const [chatContent, setChatContent] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (content: string, _fileName: string, key: string, year: number) => {
    setChatContent(content);
    setApiKey(key);
    setSelectedYear(year);
    setError(null);
    setPage('loading');
    setLoadingStage('parsing');

    try {
      // Filter content by selected year
      setLoadingStage('parsing');
      const filteredContent = filterContentByYear(content, year);

      if (!filteredContent.trim()) {
        throw new Error(`找不到 ${year} 年的對話紀錄`);
      }

      await new Promise(resolve => setTimeout(resolve, 500));
      setLoadingStage('analyzing');

      // Generate recap with filtered content for selected year
      const recap = await generateRecap(key, filteredContent, year);
      setRecapData(recap);

      setLoadingStage('generating');

      // Generate quiz with filtered content
      const quiz = await generateQuiz(key, filteredContent, 5);
      setQuizData(quiz);

      // Show recap page
      setPage('recap');
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err instanceof Error ? err.message : '分析過程中發生錯誤');
      setPage('upload');
    }
  };

  const handleStartQuiz = async () => {
    if (quizData) {
      setPage('quiz');
    } else {
      // Generate quiz if not already generated
      setPage('loading');
      setLoadingStage('generating');

      try {
        const quiz = await generateQuiz(apiKey, chatContent, 5);
        setQuizData(quiz);
        setPage('quiz');
      } catch (err) {
        console.error('Quiz generation error:', err);
        setError(err instanceof Error ? err.message : '生成題目時發生錯誤');
        setPage('recap');
      }
    }
  };

  const handleBack = () => {
    if (page === 'quiz') {
      setPage('recap');
    } else {
      setPage('upload');
      setRecapData(null);
      setQuizData(null);
    }
  };

  const handleRestartQuiz = async () => {
    // Regenerate quiz questions
    setPage('loading');
    setLoadingStage('generating');

    try {
      const quiz = await generateQuiz(apiKey, chatContent, 5);
      setQuizData(quiz);
      setPage('quiz');
    } catch (err) {
      console.error('Quiz regeneration error:', err);
      setError(err instanceof Error ? err.message : '生成題目時發生錯誤');
      setPage('recap');
    }
  };

  return (
    <div className="app-container">
      {page === 'upload' && (
        <UploadPage
          onUpload={handleUpload}
        />
      )}

      {page === 'loading' && (
        <LoadingPage stage={loadingStage} />
      )}

      {page === 'recap' && recapData && (
        <RecapPage
          data={recapData}
          year={selectedYear}
          onStartQuiz={handleStartQuiz}
          onBack={handleBack}
        />
      )}

      {page === 'quiz' && quizData && (
        <QuizPage
          questions={quizData}
          onBack={handleBack}
          onRestart={handleRestartQuiz}
        />
      )}

      {/* Error Toast */}
      {error && (
        <div
          className="animate-fade-in-up"
          style={{
            position: 'fixed',
            bottom: 'var(--space-xl)',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: 'var(--space-md) var(--space-xl)',
            background: 'rgba(239, 68, 68, 0.9)',
            borderRadius: 'var(--radius-md)',
            color: 'white',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-md)'
          }}
        >
          <span>⚠️ {error}</span>
          <button
            onClick={() => setError(null)}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              fontSize: '1.2rem'
            }}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
