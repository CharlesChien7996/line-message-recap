'use client';

import { extractAvailableYears } from '@/lib/parser';
import { useRef, useState, type ChangeEvent, type DragEvent } from 'react';

interface UploadPageProps {
  onUpload: (content: string, fileName: string, year: number) => void;
  isLoading?: boolean;
}

export function UploadPage({ onUpload, isLoading }: UploadPageProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [isParsingFile, setIsParsingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const validateAndSetFile = async (f: File) => {
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
    setIsParsingFile(true);

    try {
      const content = await f.text();
      setFileContent(content);

      const years = extractAvailableYears(content);
      setAvailableYears(years);

      if (years.length > 0) {
        setSelectedYear(years[0]);
      } else {
        setSelectedYear(new Date().getFullYear());
        setAvailableYears([new Date().getFullYear()]);
      }
    } catch {
      setError('讀取檔案時發生錯誤');
    } finally {
      setIsParsingFile(false);
    }
  };

  const handleSubmit = async () => {
    if (!file || !fileContent) {
      setError('請選擇對話紀錄檔案');
      return;
    }

    if (!selectedYear) {
      setError('請選擇回顧年份');
      return;
    }

    onUpload(fileContent, file.name, selectedYear);
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

        {/* Year Selection */}
        {file && (
          <div className="animate-fade-in-up stagger-2" style={{ marginBottom: 'var(--space-xl)' }}>
            <label
              htmlFor="year"
              style={{
                display: 'block',
                marginBottom: 'var(--space-sm)',
                color: 'var(--text-secondary)',
                fontSize: 'var(--font-size-sm)'
              }}
            >
              📅 回顧年份
            </label>

            {isParsingFile ? (
              <div style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-sm)' }}>
                正在解析檔案...
              </div>
            ) : availableYears.length > 0 ? (
              <>
                <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
                  {availableYears.map((year: number) => (
                    <button
                      key={year}
                      type="button"
                      onClick={() => setSelectedYear(year)}
                      className={`btn ${selectedYear === year ? 'btn-primary' : 'btn-secondary'}`}
                      style={{
                        padding: 'var(--space-sm) var(--space-md)',
                        fontSize: 'var(--font-size-sm)'
                      }}
                    >
                      {year}
                    </button>
                  ))}
                </div>
                <p style={{
                  marginTop: 'var(--space-sm)',
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--text-muted)'
                }}>
                  偵測到聊天紀錄涵蓋 {availableYears[availableYears.length - 1]} - {availableYears[0]} 年
                </p>
              </>
            ) : (
              <div style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-sm)' }}>
                無法偵測年份，將使用當前年份
              </div>
            )}
          </div>
        )}

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
            disabled={!file || !selectedYear || isParsingFile || isLoading}
          >
            {isLoading ? (
              <>
                <div className="spinner" style={{ width: 20, height: 20 }} />
                分析中...
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 20, height: 20 }}>
                  <circle cx="12" cy="12" r="10" />
                  <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" />
                </svg>
                開始分析
              </>
            )}
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
