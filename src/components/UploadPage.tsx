import { useRef, useState, type ChangeEvent, type DragEvent } from 'react';

interface UploadPageProps {
  onUpload: (content: string, fileName: string, apiKey: string) => void;
}

// 從環境變數取得預設 API Key
const DEFAULT_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

export function UploadPage({ onUpload }: UploadPageProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [useCustomKey, setUseCustomKey] = useState(!DEFAULT_API_KEY);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 取得實際使用的 API Key
  const effectiveApiKey = useCustomKey ? apiKey : DEFAULT_API_KEY;

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      validateAndSetFile(droppedFile);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  const validateAndSetFile = (f: File) => {
    setError('');

    if (!f.name.endsWith('.txt')) {
      setError('請上傳 .txt 檔案');
      return;
    }

    if (f.size > 10 * 1024 * 1024) {
      setError('檔案大小不能超過 10MB');
      return;
    }

    setFile(f);
  };

  const handleSubmit = async () => {
    if (!file) {
      setError('請選擇對話紀錄檔案');
      return;
    }

    if (!effectiveApiKey.trim()) {
      setError('請輸入 Gemini API Key');
      return;
    }

    try {
      const content = await file.text();
      onUpload(content, file.name, effectiveApiKey.trim());
    } catch {
      setError('讀取檔案時發生錯誤');
    }
  };

  const handleZoneClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="page page-center">
      <div className="container container-md">
        {/* Header */}
        <div className="text-center animate-fade-in-down" style={{ marginBottom: 'var(--space-3xl)' }}>
          <div style={{ fontSize: '4rem', marginBottom: 'var(--space-md)' }}>💬</div>
          <h1 style={{ marginBottom: 'var(--space-md)' }}>
            <span className="text-gradient">LINE 對話</span>
            <br />
            年度回顧
          </h1>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: 'var(--font-size-lg)',
            maxWidth: '500px',
            margin: '0 auto'
          }}>
            上傳你的 LINE 對話紀錄，用 AI 生成精美的年度回顧與有趣的挑戰題目
          </p>
        </div>

        {/* Upload Zone */}
        <div
          className={`upload-zone glass-card animate-fade-in-up stagger-1 ${isDragging ? 'drag-over' : ''} ${file ? 'has-file' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleZoneClick}
          style={{ marginBottom: 'var(--space-xl)' }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />

          {file ? (
            <>
              <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>📄</div>
              <h4 style={{ marginBottom: 'var(--space-sm)' }}>{file.name}</h4>
              <p style={{ color: 'var(--text-secondary)' }}>
                {(file.size / 1024).toFixed(1)} KB
              </p>
              <p style={{ color: 'var(--accent)', marginTop: 'var(--space-md)', fontSize: 'var(--font-size-sm)' }}>
                點擊更換檔案
              </p>
            </>
          ) : (
            <>
              <svg
                className="upload-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <h4 style={{ marginBottom: 'var(--space-sm)' }}>
                拖放檔案至此處
              </h4>
              <p style={{ color: 'var(--text-secondary)' }}>
                或點擊選擇 LINE 對話紀錄 (.txt)
              </p>
            </>
          )}
        </div>

        {/* API Key Section */}
        <div className="animate-fade-in-up stagger-2" style={{ marginBottom: 'var(--space-xl)' }}>
          {DEFAULT_API_KEY ? (
            // 有預設 API Key 時顯示切換選項
            <>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 'var(--space-md)'
              }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                  Gemini API Key
                </span>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setUseCustomKey(!useCustomKey)}
                  style={{ fontSize: 'var(--font-size-xs)' }}
                >
                  {useCustomKey ? '使用預設 Key' : '使用自訂 Key'}
                </button>
              </div>

              {useCustomKey ? (
                <input
                  id="apiKey"
                  type="password"
                  className={`input ${error && !apiKey ? 'input-error' : ''}`}
                  placeholder="輸入你的 Gemini API Key"
                  value={apiKey}
                  onChange={(e) => {
                    setApiKey(e.target.value);
                    setError('');
                  }}
                />
              ) : (
                <div
                  className="glass-card"
                  style={{
                    padding: 'var(--space-md) var(--space-lg)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-sm)'
                  }}
                >
                  <span style={{ color: 'var(--accent)' }}>✓</span>
                  <span style={{ color: 'var(--text-secondary)' }}>已設定預設 API Key</span>
                </div>
              )}
            </>
          ) : (
            // 沒有預設 API Key 時顯示輸入框
            <>
              <label
                htmlFor="apiKey"
                style={{
                  display: 'block',
                  marginBottom: 'var(--space-sm)',
                  color: 'var(--text-secondary)',
                  fontSize: 'var(--font-size-sm)'
                }}
              >
                Gemini API Key
              </label>
              <input
                id="apiKey"
                type="password"
                className={`input ${error && !apiKey ? 'input-error' : ''}`}
                placeholder="輸入你的 Gemini API Key"
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setError('');
                }}
              />
              <p style={{
                marginTop: 'var(--space-sm)',
                fontSize: 'var(--font-size-xs)',
                color: 'var(--text-muted)'
              }}>
                請至{' '}
                <a
                  href="https://makersuite.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--primary-light)' }}
                >
                  Google AI Studio
                </a>
                {' '}取得免費的 API Key
              </p>
            </>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div
            className="animate-fade-in"
            style={{
              padding: 'var(--space-md)',
              marginBottom: 'var(--space-xl)',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#F87171',
              textAlign: 'center'
            }}
          >
            {error}
          </div>
        )}

        {/* Submit Button */}
        <div className="animate-fade-in-up stagger-3" style={{ textAlign: 'center' }}>
          <button
            className="btn btn-primary btn-lg"
            onClick={handleSubmit}
            disabled={!file || !effectiveApiKey}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 20, height: 20 }}>
              <circle cx="12" cy="12" r="10" />
              <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" />
            </svg>
            開始分析
          </button>
        </div>

        {/* Instructions */}
        <div
          className="glass-card animate-fade-in-up stagger-4"
          style={{
            marginTop: 'var(--space-3xl)',
            padding: 'var(--space-xl)'
          }}
        >
          <h5 style={{ marginBottom: 'var(--space-md)', color: 'var(--text-secondary)' }}>
            📱 如何匯出 LINE 對話紀錄？
          </h5>
          <ol style={{
            paddingLeft: 'var(--space-lg)',
            color: 'var(--text-tertiary)',
            fontSize: 'var(--font-size-sm)',
            lineHeight: 1.8
          }}>
            <li>開啟 LINE 應用程式，進入想要分析的聊天室</li>
            <li>點擊右上角選單 → 設定</li>
            <li>選擇「傳送聊天紀錄」</li>
            <li>儲存 .txt 檔案並上傳至此</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
