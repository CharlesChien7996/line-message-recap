import type { ChatMessage, ParsedChat } from '../types';

/**
 * Parse LINE chat export file content
 * LINE chat format varies by platform, this parser handles common formats
 */
export function parseLineChatFile(content: string): ParsedChat {
  const lines = content.split('\n');
  const messages: ChatMessage[] = [];
  const participantSet = new Set<string>();
  let chatName = 'LINE 對話';
  
  // Common LINE chat export patterns
  // Format 1: [2024/12/25 10:30] Name: Message
  // Format 2: 2024/12/25（週三）\n10:30\tName\tMessage
  // Format 3: 2024.12.25 10:30 Name Message
  
  const dateTimePattern1 = /^\[(\d{4}\/\d{1,2}\/\d{1,2})\s+(\d{1,2}:\d{2})\]\s+(.+?):\s*(.*)$/;
  const dateTimePattern2 = /^(\d{4}\/\d{1,2}\/\d{1,2})（.*?）$/;
  const timeMessagePattern = /^(\d{1,2}:\d{2})\t(.+?)\t(.*)$/;
  const dateTimePattern3 = /^(\d{4}\.\d{1,2}\.\d{1,2})\s+(\d{1,2}:\d{2})\s+(.+?)\s+(.*)$/;
  
  // Check for chat title in first few lines
  const titleMatch = lines[0]?.match(/\[LINE\]\s*(.+?)的對話紀錄/) || 
                     lines[0]?.match(/(.+?)的聊天記錄/);
  if (titleMatch) {
    chatName = titleMatch[1];
  }
  
  let currentDate = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Try pattern 1: [2024/12/25 10:30] Name: Message
    const match1 = line.match(dateTimePattern1);
    if (match1) {
      const [, date, time, sender, content] = match1;
      const timestamp = parseDateTime(date, time);
      if (timestamp && content) {
        participantSet.add(sender);
        messages.push({
          timestamp,
          sender,
          content,
          type: categorizeMessage(content)
        });
      }
      continue;
    }
    
    // Try pattern 2: Date header followed by time\tsender\tmessage
    const match2 = line.match(dateTimePattern2);
    if (match2) {
      currentDate = match2[1];
      continue;
    }
    
    // Check for time\tsender\tmessage format
    const match2b = line.match(timeMessagePattern);
    if (match2b && currentDate) {
      const [, time, sender, content] = match2b;
      const timestamp = parseDateTime(currentDate, time);
      if (timestamp && content) {
        participantSet.add(sender);
        messages.push({
          timestamp,
          sender,
          content,
          type: categorizeMessage(content)
        });
      }
      continue;
    }
    
    // Try pattern 3: 2024.12.25 10:30 Name Message
    const match3 = line.match(dateTimePattern3);
    if (match3) {
      const [, date, time, sender, content] = match3;
      const timestamp = parseDateTime(date.replace(/\./g, '/'), time);
      if (timestamp && content) {
        participantSet.add(sender);
        messages.push({
          timestamp,
          sender,
          content,
          type: categorizeMessage(content)
        });
      }
      continue;
    }
    
    // Simple fallback: try to extract any message-like content
    const simpleDateMatch = line.match(/^(\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2})\s+(\d{1,2}:\d{2})/);
    if (simpleDateMatch) {
      const restOfLine = line.substring(simpleDateMatch[0].length).trim();
      const colonIndex = restOfLine.indexOf(':');
      if (colonIndex > 0 && colonIndex < 30) {
        const sender = restOfLine.substring(0, colonIndex).trim();
        const content = restOfLine.substring(colonIndex + 1).trim();
        const dateStr = simpleDateMatch[1].replace(/[\-\.]/g, '/');
        const timestamp = parseDateTime(dateStr, simpleDateMatch[2]);
        if (timestamp && sender && content) {
          participantSet.add(sender);
          messages.push({
            timestamp,
            sender,
            content,
            type: categorizeMessage(content)
          });
        }
      }
    }
  }
  
  const participants = Array.from(participantSet);
  const startDate = messages.length > 0 ? messages[0].timestamp : null;
  const endDate = messages.length > 0 ? messages[messages.length - 1].timestamp : null;
  
  return {
    messages,
    participants,
    startDate,
    endDate,
    chatName
  };
}

function parseDateTime(dateStr: string, timeStr: string): Date | null {
  try {
    const [year, month, day] = dateStr.split('/').map(Number);
    const [hour, minute] = timeStr.split(':').map(Number);
    return new Date(year, month - 1, day, hour, minute);
  } catch {
    return null;
  }
}

function categorizeMessage(content: string): ChatMessage['type'] {
  const lowerContent = content.toLowerCase();
  
  if (content.includes('[貼圖]') || content.includes('[Sticker]') || content.includes('sticker')) {
    return 'sticker';
  }
  if (content.includes('[照片]') || content.includes('[Photo]') || content.includes('[圖片]')) {
    return 'image';
  }
  if (content.includes('[影片]') || content.includes('[Video]')) {
    return 'video';
  }
  if (content.includes('[語音訊息]') || content.includes('[Audio]')) {
    return 'audio';
  }
  if (content.includes('[檔案]') || content.includes('[File]')) {
    return 'file';
  }
  if (lowerContent.includes('通話') || lowerContent.includes('call')) {
    return 'call';
  }
  if (content.includes('已加入聊天') || content.includes('已離開聊天') || content.includes('已建立群組')) {
    return 'system';
  }
  
  return 'text';
}

/**
 * Format date for display
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Get message count by date
 */
export function getMessagesByDate(messages: ChatMessage[]): Map<string, number> {
  const byDate = new Map<string, number>();
  
  for (const msg of messages) {
    const dateKey = msg.timestamp.toISOString().split('T')[0];
    byDate.set(dateKey, (byDate.get(dateKey) || 0) + 1);
  }
  
  return byDate;
}

/**
 * Extract text content for analysis (filter out non-text messages)
 */
export function extractTextContent(messages: ChatMessage[]): string {
  return messages
    .filter(m => m.type === 'text')
    .map(m => `${m.sender}: ${m.content}`)
    .join('\n');
}

/**
 * Extract available years from chat content (quick scan without full parsing)
 */
export function extractAvailableYears(content: string): number[] {
  const yearSet = new Set<number>();
  
  // Quick regex to find year patterns in the content
  const yearPatterns = [
    /\[(\d{4})\/\d{1,2}\/\d{1,2}/g,           // [2024/12/25
    /^(\d{4})\/\d{1,2}\/\d{1,2}（/gm,          // 2024/12/25（
    /^(\d{4})\.\d{1,2}\.\d{1,2}\s/gm,         // 2024.12.25 
    /^(\d{4})-\d{1,2}-\d{1,2}\s/gm,           // 2024-12-25
    /^[一二三四五六日],\s*\d{1,2}\/\d{1,2}\/(\d{4})/gm,  // 五, 11/29/2024 (mobile format)
    /\d{1,2}\/\d{1,2}\/(\d{4})/g,             // MM/DD/YYYY anywhere
  ];
  
  for (const pattern of yearPatterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const year = parseInt(match[1], 10);
      if (year >= 2010 && year <= 2030) {
        yearSet.add(year);
      }
    }
  }
  
  // Sort years in descending order (newest first)
  return Array.from(yearSet).sort((a, b) => b - a);
}

/**
 * Get date range info from parsed chat
 */
export function getDateRangeInfo(parsedChat: ParsedChat): {
  startYear: number | null;
  endYear: number | null;
  availableYears: number[];
} {
  if (!parsedChat.startDate || !parsedChat.endDate) {
    return { startYear: null, endYear: null, availableYears: [] };
  }
  
  const startYear = parsedChat.startDate.getFullYear();
  const endYear = parsedChat.endDate.getFullYear();
  
  const availableYears: number[] = [];
  for (let year = endYear; year >= startYear; year--) {
    availableYears.push(year);
  }
  
  return { startYear, endYear, availableYears };
}

/**
 * Filter raw chat content to only include messages from a specific year
 * This is used to send only relevant content to the AI for analysis
 */
export function filterContentByYear(content: string, year: number): string {
  const lines = content.split('\n');
  const filteredLines: string[] = [];
  let currentDateYear: number | null = null;
  let includeFollowingMessages = false;
  
  // Patterns to detect year in date formats
  const datePatterns: Array<{pattern: RegExp, yearGroup: number}> = [
    {pattern: /^\[(\d{4})\/\d{1,2}\/\d{1,2}/, yearGroup: 1},           // [2024/12/25
    {pattern: /^(\d{4})\/\d{1,2}\/\d{1,2}（/, yearGroup: 1},            // 2024/12/25（
    {pattern: /^(\d{4})\.\d{1,2}\.\d{1,2}\s/, yearGroup: 1},           // 2024.12.25 
    {pattern: /^(\d{4})-\d{1,2}-\d{1,2}\s/, yearGroup: 1},             // 2024-12-25
    {pattern: /^[一二三四五六日],\s*\d{1,2}\/\d{1,2}\/(\d{4})/, yearGroup: 1},  // 五, 11/29/2024 (mobile format)
  ];
  
  for (const line of lines) {
    // Check if line contains a date
    let lineYear: number | null = null;
    
    for (const {pattern} of datePatterns) {
      const match = line.match(pattern);
      if (match) {
        lineYear = parseInt(match[1], 10);
        break;
      }
    }
    
    if (lineYear !== null) {
      // This line has a date, update current year tracking
      currentDateYear = lineYear;
      includeFollowingMessages = (lineYear === year);
    }
    
    // Include line if it's from the target year
    if (includeFollowingMessages || currentDateYear === year) {
      // For lines with dates, only include if year matches
      if (lineYear !== null) {
        if (lineYear === year) {
          filteredLines.push(line);
        }
      } else if (currentDateYear === year) {
        // For lines without dates (continuation messages), include if current context is target year
        filteredLines.push(line);
      }
    }
  }
  
  return filteredLines.join('\n');
}
