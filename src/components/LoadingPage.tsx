import { useEffect, useState } from 'react';

interface LoadingPageProps {
  stage: 'parsing' | 'analyzing' | 'generating';
}

const loadingMessages = {
  parsing: [
    '正在解析對話紀錄...',
    '找到好多訊息呢！',
    '整理對話內容中...'
  ],
  analyzing: [
    '正在分析對話內容...',
    'AI 正在閱讀你們的對話...',
    '尋找有趣的回憶中...',
    '計算友誼指數...'
  ],
  generating: [
    '生成年度回顧中...',
    '精心設計中...',
    '即將完成！'
  ]
};

const funFacts = [
  '💡 你知道嗎？LINE 每天處理超過 30 億則訊息',
  '🌏 LINE 在日本、台灣、泰國最受歡迎',
  '💚 LINE 的綠色代表友誼與連結',
  '📱 第一版 LINE 在 2011 年發布',
  '🐻 熊大是 LINE 最受歡迎的表情貼圖角色'
];

export function LoadingPage({ stage }: LoadingPageProps) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [factIndex, setFactIndex] = useState(0);
  const [dots, setDots] = useState('');

  const messages = loadingMessages[stage];

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % messages.length);
    }, 3000);

    const dotsInterval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    const factInterval = setInterval(() => {
      setFactIndex(prev => (prev + 1) % funFacts.length);
    }, 5000);

    return () => {
      clearInterval(messageInterval);
      clearInterval(dotsInterval);
      clearInterval(factInterval);
    };
  }, [messages.length]);

  const progress = stage === 'parsing' ? 33 : stage === 'analyzing' ? 66 : 90;

  return (
    <div className="page page-center">
      <div className="container container-sm" style={{ textAlign: 'center' }}>
        {/* Animated Icon */}
        <div
          className="animate-float"
          style={{
            fontSize: '5rem',
            marginBottom: 'var(--space-xl)'
          }}
        >
          {stage === 'parsing' && '📝'}
          {stage === 'analyzing' && '🤖'}
          {stage === 'generating' && '✨'}
        </div>

        {/* Loading Spinner */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: 'var(--space-xl)'
        }}>
          <div className="spinner" />
        </div>

        {/* Loading Message */}
        <h3
          className="animate-fade-in"
          key={messageIndex}
          style={{ marginBottom: 'var(--space-md)' }}
        >
          {messages[messageIndex]}{dots}
        </h3>

        {/* Progress Bar */}
        <div
          className="progress-bar"
          style={{
            maxWidth: '300px',
            margin: '0 auto var(--space-3xl)'
          }}
        >
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Fun Fact */}
        <div
          className="glass-card animate-fade-in"
          key={factIndex}
          style={{
            padding: 'var(--space-lg)',
            maxWidth: '400px',
            margin: '0 auto'
          }}
        >
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: 'var(--font-size-sm)'
          }}>
            {funFacts[factIndex]}
          </p>
        </div>

        {/* Stage Indicators */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 'var(--space-lg)',
          marginTop: 'var(--space-3xl)'
        }}>
          <StageIndicator
            icon="📝"
            label="解析"
            active={stage === 'parsing'}
            completed={stage !== 'parsing'}
          />
          <StageIndicator
            icon="🤖"
            label="分析"
            active={stage === 'analyzing'}
            completed={stage === 'generating'}
          />
          <StageIndicator
            icon="✨"
            label="生成"
            active={stage === 'generating'}
            completed={false}
          />
        </div>
      </div>
    </div>
  );
}

function StageIndicator({
  icon,
  label,
  active,
  completed
}: {
  icon: string;
  label: string;
  active: boolean;
  completed: boolean;
}) {
  return (
    <div style={{
      textAlign: 'center',
      opacity: active || completed ? 1 : 0.3,
      transition: 'all var(--transition-base)'
    }}>
      <div style={{
        width: 48,
        height: 48,
        borderRadius: 'var(--radius-full)',
        background: active
          ? 'var(--gradient-primary)'
          : completed
            ? 'var(--accent)'
            : 'var(--surface)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.5rem',
        marginBottom: 'var(--space-sm)',
        boxShadow: active ? 'var(--shadow-glow)' : 'none'
      }}>
        {completed ? '✓' : icon}
      </div>
      <span style={{
        fontSize: 'var(--font-size-xs)',
        color: active ? 'var(--text-primary)' : 'var(--text-tertiary)'
      }}>
        {label}
      </span>
    </div>
  );
}
