// Chat message structure
export interface ChatMessage {
  timestamp: Date;
  sender: string;
  content: string;
  type: 'text' | 'sticker' | 'image' | 'video' | 'audio' | 'file' | 'call' | 'system';
}

// Parsed chat data
export interface ParsedChat {
  messages: ChatMessage[];
  participants: string[];
  startDate: Date | null;
  endDate: Date | null;
  chatName: string;
}

// Recap statistics
export interface RecapStats {
  totalMessages: number;
  totalDays: number;
  activeDays: number;
  messagesPerDay: number;
  longestStreak: number;
  mostActiveHour: number;
  mostActiveDay: string;
  messagesByParticipant: Record<string, number>;
}

// Recap highlights
export interface RecapHighlight {
  emoji: string;
  title: string;
  description: string;
  value?: string;
}

// Mood analysis
export interface MoodAnalysis {
  overall: string;
  emoji: string;
  keywords: string[];
}

// Memory moment
export interface MemoryMoment {
  date: string;
  title: string;
  description: string;
  quote?: string;
}

// Complete recap data
export interface RecapData {
  stats: RecapStats;
  highlights: RecapHighlight[];
  topTopics: string[];
  mood: MoodAnalysis;
  memories: MemoryMoment[];
  yearSummary: string;
  friendshipScore: number;
}

// Quiz question
export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

// Quiz state
export interface QuizState {
  questions: QuizQuestion[];
  currentIndex: number;
  answers: (number | null)[];
  showResult: boolean;
}

// App state
export type AppPage = 'upload' | 'loading' | 'recap' | 'quiz';

export interface AppState {
  page: AppPage;
  apiKey: string;
  chatContent: string;
  fileName: string;
  recapData: RecapData | null;
  quizData: QuizQuestion[] | null;
  error: string | null;
}
