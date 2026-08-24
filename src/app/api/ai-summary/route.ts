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
너는 반도체 산업을 전문적으로 분석하는 투자 애널리스트다.

아래 뉴스 내용을 투자자가 빠르게 이해할 수 있도록 분석해라.

반드시 아래 형식으로만 작성해라.

📈 핵심 요약
- 뉴스에서 가장 중요한 사실 2~3개
- 숫자, 계약 규모, 일정 등 중요한 정보가 있으면 반드시 포함

💡 왜 중요한가
- 이 뉴스가 반도체 시장에서 왜 중요한지 설명
- 산업이나 기업에 어떤 변화가 생길 수 있는지 설명

🔥 시장 영향
- 단기적으로 시장에 미칠 영향
- 수혜 가능성이 있는 분야나 기업
- 부정적인 영향을 받을 수 있는 분야나 기업

🧠 핵심 테마
- 관련된 반도체 기술이나 산업
- HBM, AI, 파운드리, 장비 등 핵심 키워드

🏢 관련 기업
- 직접적으로 언급된 기업
- 수혜 가능성이 높은 기업
- 영향을 받을 가능성이 있는 기업
- 근거가 없는 기업은 억지로 추가하지 마라

⚠️ 리스크 및 체크포인트
- 투자자가 주의해야 할 부분
- 앞으로 확인해야 할 일정이나 뉴스
- 실제 실적에 영향을 주기 위해 필요한 조건

📌 한줄 결론
- 투자자 입장에서 이 뉴스의 핵심을 한 문장으로 정리

규칙:
- 서론과 인사말은 쓰지 마라.
- 뉴스에 없는 사실을 만들어내지 마라.
- 확실하지 않은 내용은 추측이라고 명확히 표시해라.
- 문장은 짧고 이해하기 쉽게 작성해라.
- 투자 판단을 직접적으로 지시하지 마라.
- markdown 기호(###, **, ---)는 사용하지 마라.
- 각 항목은 최대 3개 정도의 핵심 내용만 작성해라.

뉴스:
${body.content}
`;

    console.log("GEMINI API 호출됨");

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
    const { error: insertError } = await supabase
      .from("ai_summaries")
      .insert({
        article_url: body.url,
        summary,
      });

    if (insertError) {
      console.log("DB 저장 오류:", insertError);
    } else {
      console.log("새 요약 저장 완료");
    }

    return NextResponse.json({
      summary,
    });

  } catch (error) {
    console.log("AI ERROR:", error);

    return NextResponse.json({
      summary: "AI 요약 서버 오류",
    });
  }
}