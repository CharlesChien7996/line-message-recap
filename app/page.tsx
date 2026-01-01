'use client';

import { LoadingPage } from '@/components/LoadingPage';
import { QuizPage } from '@/components/QuizPage';
import { RecapPage } from '@/components/RecapPage';
import { UploadPage } from '@/components/UploadPage';
import type { QuizQuestion, RecapData } from '@/types';
import { useState } from 'react';

type AppPage = 'upload' | 'loading' | 'recap' | 'quiz';

export default function Home() {
  const [page, setPage] = useState<AppPage>('upload');
  const [loadingStage, setLoadingStage] = useState<'parsing' | 'analyzing' | 'generating'>('parsing');
  const [recapData, setRecapData] = useState<RecapData | null>(null);
  const [quizData, setQuizData] = useState<QuizQuestion[] | null>(null);
  const [chatContent, setChatContent] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleUpload = async (content: string, _fileName: string, year: number) => {
    setChatContent(content);
    setSelectedYear(year);
    setError(null);
    setIsLoading(true);
    setPage('loading');
    setLoadingStage('parsing');

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setLoadingStage('analyzing');

      // Call server API for recap - API key is stored securely on server
      const recapResponse = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, year }),
      });

      if (!recapResponse.ok) {
        const errorData = await recapResponse.json();
        throw new Error(errorData.error || '分析過程中發生錯誤');
      }

      const recap = await recapResponse.json();
      setRecapData(recap);

      setLoadingStage('generating');

      // Call server API for quiz
      const quizResponse = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, year, count: 10 }),
      });

      if (!quizResponse.ok) {
        const errorData = await quizResponse.json();
        throw new Error(errorData.error || '生成題目時發生錯誤');
      }

      const quizResult = await quizResponse.json();
      setQuizData(quizResult.questions);

      setPage('recap');
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err instanceof Error ? err.message : '分析過程中發生錯誤');
      setPage('upload');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartQuiz = async () => {
    if (quizData) {
      setPage('quiz');
    } else {
      setPage('loading');
      setLoadingStage('generating');

      try {
        const quizResponse = await fetch('/api/quiz', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: chatContent, year: selectedYear, count: 10 }),
        });

        if (!quizResponse.ok) {
          const errorData = await quizResponse.json();
          throw new Error(errorData.error || '生成題目時發生錯誤');
        }

        const quizResult = await quizResponse.json();
        setQuizData(quizResult.questions);
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
    setPage('loading');
    setLoadingStage('generating');

    try {
      const quizResponse = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: chatContent, year: selectedYear, count: 10 }),
      });

      if (!quizResponse.ok) {
        const errorData = await quizResponse.json();
        throw new Error(errorData.error || '生成題目時發生錯誤');
      }

      const quizResult = await quizResponse.json();
      setQuizData(quizResult.questions);
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
          isLoading={isLoading}
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
