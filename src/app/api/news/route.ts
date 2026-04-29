import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query') || '반도체';
  const apiKey = process.env.NEXT_PUBLIC_NEWS_API_KEY;

  try {
    // 서버 환경(Vercel)에서 News API를 호출하여 도메인 제한을 우회합니다.
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&apiKey=${apiKey}&language=ko&sortBy=publishedAt&pageSize=10`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'StockDataPro/1.0' // News API 보안 정책을 위해 추가
      }
    });
    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('News fetch error:', error);
    return NextResponse.json({ error: '뉴스 로드 실패' }, { status: 500 });
  }
}