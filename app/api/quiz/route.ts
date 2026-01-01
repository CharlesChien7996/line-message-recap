import { generateQuiz } from '@/lib/gemini';
import { filterContentByYear } from '@/lib/parser';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { content, year, count = 5 } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: '請提供對話內容' },
        { status: 400 }
      );
    }

    // Filter content by year if provided
    const filteredContent = year ? filterContentByYear(content, year) : content;

    if (!filteredContent.trim()) {
      return NextResponse.json(
        { error: '沒有足夠的對話內容生成題目' },
        { status: 400 }
      );
    }

    // Generate quiz using server-side API key
    const questions = await generateQuiz(filteredContent, count);

    return NextResponse.json({ questions });
  } catch (error) {
    console.error('Quiz API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '生成題目時發生錯誤' },
      { status: 500 }
    );
  }
}
