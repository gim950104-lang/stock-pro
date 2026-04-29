import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query') || '삼성전자';
  const apiKey = process.env.DART_API_KEY;

  // 오늘로부터 3개월 전 날짜 계산 (에러 방지용)
  const today = new Date();
  today.setMonth(today.getMonth() - 3);
  const bgn_de = today.toISOString().slice(0, 10).replace(/-/g, ''); // 예: 20240129

  try {
    // bgn_de를 20240101 대신 계산된 3개월 전 날짜로 변경했습니다.
    const url = `https://opendart.fss.or.kr/api/list.json?crtfc_key=${apiKey}&corp_name=${encodeURIComponent(query)}&bgn_de=${bgn_de}&page_count=10`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'DART 로드 실패' }, { status: 500 });
  }
}