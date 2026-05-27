import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.content || !body.url) {
      return NextResponse.json({
        summary: "뉴스 정보가 없습니다.",
      });
    }

    // 1. 기존 요약 있는지 확인
    const { data: existing } = await supabase
      .from("ai_summaries")
      .select("summary")
      .eq("article_url", body.url)
      .single();

    // 2. 이미 저장된 요약 있으면 재사용
    if (existing?.summary) {
      console.log("기존 요약 사용");

      return NextResponse.json({
        summary: existing.summary,
      });
    }

    // 3. 새 AI 요약 생성
    const prompt = `
너는 반도체 전문 애널리스트다.

아래 뉴스 내용을 분석해서 반드시 아래 형식으로만 출력해.

규칙:
- 서론 금지
- "파악하기 어렵습니다" 같은 말 금지
- markdown 기호(###, **, ---) 사용 금지
- 핵심만 짧고 강하게 정리
- 투자자 관점으로 작성
- 문장은 짧게
- 가독성 좋게

출력 형식:

📈 핵심 요약
- 내용
- 내용

🔥 시장 영향
- 내용
- 내용

🧠 핵심 테마
- 내용
- 내용

⚠️ 리스크
- 내용
- 내용

뉴스:
${body.content}
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      }
    );

    // 응답 실패 로그
    if (!response.ok) {
      const errorText = await response.text();

      console.log("GEMINI ERROR:", errorText);

      return NextResponse.json({
        summary: `Gemini API 오류: ${errorText}`,
      });
    }

    const data = await response.json();

    console.log("STATUS:", response.status);
    console.log("GEMINI:", JSON.stringify(data, null, 2));

    const summary =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!summary) {
      return NextResponse.json({
        summary: "요약 결과 없음",
      });
    }

    // 4. 새 요약 DB 저장
    await supabase.from("ai_summaries").insert({
      article_url: body.url,
      summary,
    });

    console.log("새 요약 저장 완료");

    return NextResponse.json({ summary });

  } catch (error) {
    console.log("AI ERROR:", error);

    return NextResponse.json({
      summary: "AI 요약 서버 오류",
    });
  }
}