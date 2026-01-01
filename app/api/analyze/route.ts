import { generateRecap } from '@/lib/gemini';
import { filterContentByYear } from '@/lib/parser';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { content, year } = await request.json();

    if (!content || !year) {
      return NextResponse.json(
        { error: '請提供對話內容和年份' },
        { status: 400 }
      );
    }

    // Filter content by year
    const filteredContent = filterContentByYear(content, year);

    if (!filteredContent.trim()) {
      return NextResponse.json(
        { error: `找不到 ${year} 年的對話紀錄` },
        { status: 400 }
      );
    }

    // Generate recap using server-side API key
    const recap = await generateRecap(filteredContent, year);

    return NextResponse.json(recap);
  } catch (error) {
    console.error('Analyze API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '分析過程中發生錯誤' },
      { status: 500 }
    );
  }
}
