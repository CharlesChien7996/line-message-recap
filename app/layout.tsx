import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'LINE 對話年度回顧 | Message Recap',
  description: '上傳你的 LINE 對話紀錄，用 AI 生成精美的年度回顧與有趣的挑戰題目',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-TW">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Noto+Sans+TC:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
