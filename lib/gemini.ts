import type { QuizQuestion, RecapData } from '@/types';
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Initialize Gemini API client (server-side only)
 */
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }
  return new GoogleGenerativeAI(apiKey);
}

/**
 * Get model name from environment variable or use default
 */
function getModelName(): string {
  return process.env.GEMINI_MODEL || 'gemini-2.5-flash';
}

/**
 * Generate yearly recap from chat content
 */
export async function generateRecap(
  chatContent: string,
  year: number
): Promise<RecapData> {
  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({ model: getModelName() });
  
  const prompt = `你是一位專業的對話分析師，請分析以下 LINE 對話紀錄，生成 ${year} 年度回顧報告。

對話紀錄：
${chatContent.slice(0, 50000)}

請以 JSON 格式回傳分析結果，格式如下：
{
  "stats": {
    "totalMessages": 總訊息數量（數字）,
    "totalDays": 涵蓋天數（數字）,
    "activeDays": 有對話的天數（數字）,
    "messagesPerDay": 平均每日訊息數（數字，保留一位小數）,
    "longestStreak": 最長連續對話天數（數字）,
    "mostActiveHour": 最活躍的小時（0-23 的數字）,
    "mostActiveDay": 最活躍的星期幾（如 "星期六"）,
    "messagesByParticipant": { "參與者名稱": 訊息數量 }
  },
  "highlights": [
    {
      "emoji": "適合的 emoji",
      "title": "亮點標題",
      "description": "簡短描述",
      "value": "相關數值或內容（可選）"
    }
  ],
  "topTopics": ["話題1", "話題2", "話題3", "話題4", "話題5"],
  "mood": {
    "overall": "整體情緒描述（如：歡樂溫馨、深度交流等）",
    "emoji": "代表情緒的 emoji",
    "keywords": ["關鍵詞1", "關鍵詞2", "關鍵詞3"]
  },
  "memories": [
    {
      "date": "日期描述（如：3月中旬）",
      "title": "回憶標題",
      "description": "簡短描述這個特別時刻",
      "quote": "對話中的經典語錄（可選）"
    }
  ],
  "yearSummary": "用 2-3 句話總結這一年的對話關係",
  "friendshipScore": 友誼分數（1-100 的數字，根據互動頻率、深度等評估）
}

請確保：
1. highlights 至少包含 4 個有趣的亮點
2. memories 至少包含 3 個特別時刻
3. 所有內容使用繁體中文
4. 內容要有趣、溫馨，適合分享
5. 只回傳 JSON，不要有其他文字`;

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();
  
  // Extract JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('無法解析 AI 回應');
  }
  
  try {
    const data = JSON.parse(jsonMatch[0]) as RecapData;
    return data;
  } catch {
    throw new Error('AI 回應格式錯誤');
  }
}

/**
 * Generate quiz questions from chat content
 */
export async function generateQuiz(
  chatContent: string,
  count: number = 5
): Promise<QuizQuestion[]> {
  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({ model: getModelName() });
  
  const prompt = `你是一位有趣的題目設計師，請根據以下 LINE 對話紀錄生成 ${count} 道選擇題，用來測試參與者對這段對話的記憶。

對話紀錄：
${chatContent.slice(0, 50000)}

請以 JSON 格式回傳題目，格式如下：
{
  "questions": [
    {
      "id": 題目編號（從 1 開始）,
      "question": "題目內容",
      "options": ["選項A", "選項B", "選項C", "選項D"],
      "correctIndex": 正確答案的索引（0-3）,
      "explanation": "答案說明或對話中的相關內容"
    }
  ]
}

題目類型可以包含：
1. 誰說過某句話？
2. 什麼時候討論過某個話題？
3. 關於某件事的細節
4. 對話中出現過的梗或笑話
5. 參與者的習慣或特色

請確保：
1. 題目有趣且不會太難
2. 選項設計要合理，有一定迷惑性
3. 使用繁體中文
4. 題目要與對話內容相關
5. 只回傳 JSON，不要有其他文字`;

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();
  
  // Extract JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('無法解析 AI 回應');
  }
  
  try {
    const data = JSON.parse(jsonMatch[0]) as { questions: QuizQuestion[] };
    return data.questions;
  } catch {
    throw new Error('AI 回應格式錯誤');
  }
}
