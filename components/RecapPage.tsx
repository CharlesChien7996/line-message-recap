'use client';

import type { RecapData } from '@/types';

interface RecapPageProps {
  data: RecapData;
  year: number;
  onStartQuiz: () => void;
  onBack: () => void;
}

export function RecapPage({ data, year, onStartQuiz, onBack }: RecapPageProps) {
  const { stats, highlights, topTopics, mood, memories, yearSummary, friendshipScore } = data;

  return (
    <div className="page">
      <div className="container">
        {/* Header */}
        <header style={{
          textAlign: 'center',
          marginBottom: 'var(--space-3xl)',
          paddingTop: 'var(--space-xl)'
        }}>
          <div className="animate-fade-in-down">
            <span className="badge badge-primary" style={{ marginBottom: 'var(--space-md)' }}>
              {year} 年度回顧
            </span>
            <h1 style={{ marginBottom: 'var(--space-lg)' }}>
              <span className="text-gradient">你們的對話故事</span>
            </h1>
            <p style={{
              color: 'var(--text-secondary)',
              maxWidth: '600px',
              margin: '0 auto',
              fontSize: 'var(--font-size-lg)'
            }}>
              {yearSummary}
            </p>
          </div>
        </header>

        {/* Friendship Score */}
        <section
          className="glass-card animate-fade-in-up"
          style={{
            textAlign: 'center',
            padding: 'var(--space-2xl)',
            marginBottom: 'var(--space-2xl)'
          }}
        >
          <h3 style={{ marginBottom: 'var(--space-lg)' }}>友誼指數</h3>
          <div style={{
            position: 'relative',
            width: 180,
            height: 180,
            margin: '0 auto var(--space-lg)'
          }}>
            <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="var(--surface)"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${friendshipScore * 2.83} 283`}
                style={{ transition: 'stroke-dasharray 1s ease-out' }}
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="var(--primary)" />
                  <stop offset="100%" stopColor="var(--secondary)" />
                </linearGradient>
              </defs>
            </svg>
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span className="text-gradient" style={{ fontSize: 'var(--font-size-4xl)', fontWeight: 800 }}>
                {friendshipScore}
              </span>
              <span style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-sm)' }}>
                / 100
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-sm)' }}>
            <span style={{ fontSize: '2rem' }}>{mood.emoji}</span>
            <span style={{ color: 'var(--text-secondary)', alignSelf: 'center' }}>{mood.overall}</span>
          </div>
        </section>

        {/* Stats Grid */}
        <section style={{ marginBottom: 'var(--space-2xl)' }}>
          <h3 className="animate-fade-in" style={{ marginBottom: 'var(--space-lg)' }}>
            📊 數據統計
          </h3>
          <div className="stats-grid">
            <StatCard
              value={stats.totalMessages.toLocaleString()}
              label="總訊息數"
              delay="100ms"
            />
            <StatCard
              value={stats.activeDays.toString()}
              label="活躍天數"
              delay="200ms"
            />
            <StatCard
              value={stats.messagesPerDay.toFixed(1)}
              label="平均每日訊息"
              delay="300ms"
            />
            <StatCard
              value={`${stats.longestStreak} 天`}
              label="最長連續對話"
              delay="400ms"
            />
            <StatCard
              value={`${stats.mostActiveHour}:00`}
              label="最活躍時段"
              delay="500ms"
            />
            <StatCard
              value={stats.mostActiveDay}
              label="最活躍日"
              delay="600ms"
            />
          </div>
        </section>

        {/* Participants */}
        {Object.keys(stats.messagesByParticipant).length > 0 && (
          <section
            className="glass-card animate-fade-in-up"
            style={{
              padding: 'var(--space-xl)',
              marginBottom: 'var(--space-2xl)'
            }}
          >
            <h4 style={{ marginBottom: 'var(--space-lg)' }}>👥 訊息分布</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              {Object.entries(stats.messagesByParticipant)
                .sort(([, a], [, b]) => b - a)
                .map(([name, count]) => {
                  const percentage = (count / stats.totalMessages) * 100;
                  return (
                    <div key={name}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: 'var(--space-xs)'
                      }}>
                        <span>{name}</span>
                        <span style={{ color: 'var(--text-tertiary)' }}>
                          {count.toLocaleString()} ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </section>
        )}

        {/* Highlights */}
        <section style={{ marginBottom: 'var(--space-2xl)' }}>
          <h3 className="animate-fade-in" style={{ marginBottom: 'var(--space-lg)' }}>
            ✨ 年度亮點
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 'var(--space-lg)'
          }}>
            {highlights.map((highlight, index) => (
              <div
                key={index}
                className="glass-card animate-fade-in-up"
                style={{
                  padding: 'var(--space-xl)',
                  animationDelay: `${index * 100}ms`
                }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-md)' }}>
                  {highlight.emoji}
                </div>
                <h5 style={{ marginBottom: 'var(--space-sm)' }}>{highlight.title}</h5>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                  {highlight.description}
                </p>
                {highlight.value && (
                  <p className="text-gradient" style={{
                    marginTop: 'var(--space-sm)',
                    fontWeight: 600
                  }}>
                    {highlight.value}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Top Topics */}
        <section
          className="glass-card animate-fade-in-up"
          style={{
            padding: 'var(--space-xl)',
            marginBottom: 'var(--space-2xl)'
          }}
        >
          <h4 style={{ marginBottom: 'var(--space-lg)' }}>🔥 熱門話題</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
            {topTopics.map((topic, index) => (
              <span
                key={index}
                className={`badge ${index % 3 === 0 ? 'badge-primary' : index % 3 === 1 ? 'badge-secondary' : 'badge-accent'}`}
                style={{
                  fontSize: 'var(--font-size-sm)',
                  padding: 'var(--space-sm) var(--space-md)'
                }}
              >
                {topic}
              </span>
            ))}
          </div>
        </section>

        {/* Mood Keywords */}
        <section
          className="glass-card animate-fade-in-up"
          style={{
            padding: 'var(--space-xl)',
            marginBottom: 'var(--space-2xl)',
            textAlign: 'center'
          }}
        >
          <h4 style={{ marginBottom: 'var(--space-lg)' }}>💭 情緒關鍵詞</h4>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: 'var(--space-md)'
          }}>
            {mood.keywords.map((keyword, index) => (
              <span
                key={index}
                style={{
                  fontSize: 'var(--font-size-xl)',
                  color: 'var(--text-secondary)'
                }}
              >
                {keyword}
              </span>
            ))}
          </div>
        </section>

        {/* Memories */}
        <section style={{ marginBottom: 'var(--space-2xl)' }}>
          <h3 className="animate-fade-in" style={{ marginBottom: 'var(--space-lg)' }}>
            📸 特別時刻
          </h3>
          <div style={{
            display: 'grid',
            gap: 'var(--space-lg)'
          }}>
            {memories.map((memory, index) => (
              <div
                key={index}
                className="glass-card animate-fade-in-up"
                style={{
                  padding: 'var(--space-xl)',
                  animationDelay: `${index * 150}ms`,
                  borderLeft: '3px solid var(--primary)'
                }}
              >
                <span className="badge" style={{ marginBottom: 'var(--space-sm)' }}>
                  {memory.date}
                </span>
                <h5 style={{ marginBottom: 'var(--space-sm)' }}>{memory.title}</h5>
                <p style={{ color: 'var(--text-secondary)' }}>{memory.description}</p>
                {memory.quote && (
                  <blockquote style={{
                    marginTop: 'var(--space-md)',
                    paddingLeft: 'var(--space-md)',
                    borderLeft: '2px solid var(--glass-border)',
                    color: 'var(--text-tertiary)',
                    fontStyle: 'italic'
                  }}>
                    "{memory.quote}"
                  </blockquote>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Actions */}
        <section style={{
          textAlign: 'center',
          padding: 'var(--space-2xl) 0'
        }}>
          <h3 style={{ marginBottom: 'var(--space-lg)' }}>🎯 準備好挑戰了嗎？</h3>
          <p style={{
            color: 'var(--text-secondary)',
            marginBottom: 'var(--space-xl)',
            maxWidth: '400px',
            margin: '0 auto var(--space-xl)'
          }}>
            根據對話內容生成的趣味問答，來看看你對這些對話記得多少！
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-md)' }}>
            <button className="btn btn-secondary" onClick={onBack}>
              ← 重新上傳
            </button>
            <button className="btn btn-primary btn-lg" onClick={onStartQuiz}>
              開始挑戰 🎮
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({
  value,
  label,
  delay
}: {
  value: string;
  label: string;
  delay: string;
}) {
  return (
    <div
      className="glass-card stat-card animate-fade-in-up"
      style={{ animationDelay: delay }}
    >
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}
