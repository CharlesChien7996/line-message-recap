import { useState } from 'react';
import type { QuizQuestion } from '../types';

interface QuizPageProps {
  questions: QuizQuestion[];
  onBack: () => void;
  onRestart: () => void;
}

export function QuizPage({ questions, onBack, onRestart }: QuizPageProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(questions.length).fill(null));
  const [showResult, setShowResult] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const correctCount = answers.filter((a, i) => a === questions[i].correctIndex).length;

  const handleSelect = (index: number) => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(index);
    setShowExplanation(true);

    const newAnswers = [...answers];
    newAnswers[currentIndex] = index;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (isLastQuestion) {
      setShowResult(true);
    } else {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    }
  };

  const getOptionClass = (index: number) => {
    if (selectedAnswer === null) return '';
    if (index === currentQuestion.correctIndex) return 'correct';
    if (index === selectedAnswer && index !== currentQuestion.correctIndex) return 'incorrect';
    return '';
  };

  const getScoreEmoji = () => {
    const percentage = (correctCount / questions.length) * 100;
    if (percentage >= 80) return '🏆';
    if (percentage >= 60) return '🎉';
    if (percentage >= 40) return '👍';
    return '💪';
  };

  const getScoreMessage = () => {
    const percentage = (correctCount / questions.length) * 100;
    if (percentage >= 80) return '太厲害了！你們的對話都記得很清楚呢！';
    if (percentage >= 60) return '很棒！看來這些對話都有留下印象~';
    if (percentage >= 40) return '還不錯！有些細節可能需要回顧一下';
    return '沒關係，重要的是你們一起度過的時光！';
  };

  if (showResult) {
    return (
      <div className="page page-center">
        <div className="container container-sm" style={{ textAlign: 'center' }}>
          <div
            className="animate-scale-in"
            style={{ fontSize: '6rem', marginBottom: 'var(--space-xl)' }}
          >
            {getScoreEmoji()}
          </div>

          <h2 className="animate-fade-in-up" style={{ marginBottom: 'var(--space-md)' }}>
            挑戰完成！
          </h2>

          <div
            className="glass-card animate-fade-in-up stagger-1"
            style={{
              padding: 'var(--space-2xl)',
              marginBottom: 'var(--space-xl)'
            }}
          >
            <div className="stat-value" style={{ fontSize: 'var(--font-size-5xl)' }}>
              {correctCount} / {questions.length}
            </div>
            <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-md)' }}>
              答對題數
            </p>
          </div>

          <p
            className="animate-fade-in-up stagger-2"
            style={{
              color: 'var(--text-secondary)',
              fontSize: 'var(--font-size-lg)',
              marginBottom: 'var(--space-2xl)'
            }}
          >
            {getScoreMessage()}
          </p>

          {/* Answer Summary */}
          <div
            className="glass-card animate-fade-in-up stagger-3"
            style={{
              padding: 'var(--space-xl)',
              marginBottom: 'var(--space-xl)',
              textAlign: 'left'
            }}
          >
            <h5 style={{ marginBottom: 'var(--space-lg)' }}>📋 答題結果</h5>
            {questions.map((q, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-md)',
                  padding: 'var(--space-sm) 0',
                  borderBottom: index < questions.length - 1 ? '1px solid var(--glass-border)' : 'none'
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>
                  {answers[index] === q.correctIndex ? '✅' : '❌'}
                </span>
                <span style={{
                  flex: 1,
                  color: 'var(--text-secondary)',
                  fontSize: 'var(--font-size-sm)'
                }}>
                  {q.question.slice(0, 50)}...
                </span>
              </div>
            ))}
          </div>

          <div
            className="animate-fade-in-up stagger-4"
            style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-md)' }}
          >
            <button className="btn btn-secondary" onClick={onBack}>
              ← 回到回顧
            </button>
            <button className="btn btn-primary" onClick={onRestart}>
              再玩一次 🔄
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page page-center">
      <div className="container container-md">
        {/* Progress */}
        <div style={{ marginBottom: 'var(--space-xl)' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 'var(--space-sm)',
            color: 'var(--text-secondary)',
            fontSize: 'var(--font-size-sm)'
          }}>
            <span>題目 {currentIndex + 1} / {questions.length}</span>
            <span>{Math.round(((currentIndex + 1) / questions.length) * 100)}%</span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div
          className="glass-card animate-fade-in"
          key={currentIndex}
          style={{
            padding: 'var(--space-2xl)',
            marginBottom: 'var(--space-xl)'
          }}
        >
          {/* Question Number Badge */}
          <span className="badge badge-primary" style={{ marginBottom: 'var(--space-lg)' }}>
            Q{currentQuestion.id}
          </span>

          {/* Question Text */}
          <h3 style={{ marginBottom: 'var(--space-2xl)', lineHeight: 1.5 }}>
            {currentQuestion.question}
          </h3>

          {/* Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                className={`quiz-option ${selectedAnswer === index ? 'selected' : ''} ${getOptionClass(index)}`}
                onClick={() => handleSelect(index)}
                disabled={selectedAnswer !== null}
              >
                <span className="quiz-option-letter">
                  {String.fromCharCode(65 + index)}
                </span>
                <span style={{ flex: 1 }}>{option}</span>
                {selectedAnswer !== null && index === currentQuestion.correctIndex && (
                  <span>✓</span>
                )}
                {selectedAnswer !== null && index === selectedAnswer && index !== currentQuestion.correctIndex && (
                  <span>✗</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Explanation */}
        {showExplanation && (
          <div
            className="glass-card animate-fade-in-up"
            style={{
              padding: 'var(--space-xl)',
              marginBottom: 'var(--space-xl)',
              borderLeft: selectedAnswer === currentQuestion.correctIndex
                ? '3px solid #10B981'
                : '3px solid #EF4444'
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-sm)',
              marginBottom: 'var(--space-md)'
            }}>
              <span style={{ fontSize: '1.5rem' }}>
                {selectedAnswer === currentQuestion.correctIndex ? '🎉' : '💡'}
              </span>
              <strong>
                {selectedAnswer === currentQuestion.correctIndex ? '答對了！' : '正確答案是...'}
              </strong>
            </div>
            <p style={{ color: 'var(--text-secondary)' }}>
              {currentQuestion.explanation}
            </p>
          </div>
        )}

        {/* Next Button */}
        {selectedAnswer !== null && (
          <div className="animate-fade-in-up" style={{ textAlign: 'center' }}>
            <button
              className="btn btn-primary btn-lg"
              onClick={handleNext}
            >
              {isLastQuestion ? '查看結果 🏆' : '下一題 →'}
            </button>
          </div>
        )}

        {/* Back link */}
        <div style={{
          textAlign: 'center',
          marginTop: 'var(--space-xl)',
          paddingTop: 'var(--space-xl)',
          borderTop: '1px solid var(--glass-border)'
        }}>
          <button className="btn btn-ghost" onClick={onBack}>
            ← 返回年度回顧
          </button>
        </div>
      </div>
    </div>
  );
}
