import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { area, price, location, tone } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY가 설정되지 않았습니다.' },
        { status: 500 }
      );
    }

    // 톤별 프롬프트 - 훨씬 개선됨!
    let toneInstruction = '';
    let examples = '';
    
    if (tone === 'professional') {
      toneInstruction = `전문적이고 신뢰감 있는 톤으로 작성하세요.`;
      examples = `
좋은 예시:
"${location} 역세권 ${area} 매물입니다.
남향 구조로 채광이 우수하며, 역까지 도보 5분 거리입니다.
${price} / 관리비 저렴
깔끔한 실내 상태, 즉시 입주 가능합니다."

피해야 할 표현:
- "파격가", "절호의 찬스", "놀라운" 등 과장된 표현
- "지금 바로", "서둘러" 등 압박 표현`;
      
    } else if (tone === 'friendly') {
      toneInstruction = `친근하고 편안한 톤으로 작성하세요.`;
      examples = `
좋은 예시:
"✨ ${location} 바로 앞이에요!
🏠 ${area}로 넉넉한 공간
💰 ${price}
🚇 출퇴근 편하고, 주변 편의시설 다 있어요
깨끗하게 관리된 집이라 보시면 마음에 드실 거예요 😊"

피해야 할 표현:
- 너무 많은 이모지 (적절하게 3-4개)
- 과도한 감탄사`;
      
    } else if (tone === 'luxury') {
      toneInstruction = `고급스럽고 품격있는 톤으로 작성하세요.`;
      examples = `
좋은 예시:
"✨ ${location} 프리미엄 레지던스
🏛️ ${area} / ${price}
역세권 입지의 가치를 아시는 분께 권해드립니다.
남향 구조, 채광 우수
정돈된 주거 환경에서 품격있는 라이프를 누리실 수 있습니다."

피해야 할 표현:
- "럭셔리", "VIP" 등 직접적인 표현 (암묵적으로 표현)
- 과도한 수식어`;
      
    } else {
      toneInstruction = `자연스럽고 균형잡힌 톤으로 작성하세요.`;
      examples = `
좋은 예시:
"${location} 역세권 ${area} 매물
${price}
✅ 역 도보 5분, 편의시설 인접
✅ 남향, 채광 좋음
✅ 깔끔한 실내, 관리 잘 된 상태
즉시 입주 가능합니다."`;
    }

    const prompt = `당신은 실력있는 부동산 중개사입니다. 
네이버부동산/직방 스타일로 매물 설명문을 작성해주세요.

매물 정보:
- 위치: ${location}
- 평수: ${area}
- 가격: ${price}

작성 스타일:
${toneInstruction}

${examples}

핵심 원칙:
1. 과장하지 말 것 - 실제 있을 법한 정보만
2. 구체적으로 - "역세권"이면 "도보 5분" 같은 구체적 표현
3. 자연스러운 한국어 - 광고 카피가 아닌 실용적 정보
4. 4-5줄 정도 간결하게
5. 이모지는 적절히 (2-4개)

주의사항:
- "파격가", "놀라운", "절호의 찬스" 같은 과장 금지
- "지금 바로 문의", "서둘러" 같은 압박 금지  
- 있지도 않은 정보 지어내지 말 것
- 설명문만 작성 (다른 말 하지 말 것)

설명문:`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': process.env.GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API Error:', errorData);
      return NextResponse.json(
        { error: 'Gemini API 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0]) {
      console.error('Unexpected response:', data);
      return NextResponse.json(
        { error: '응답 형식이 올바르지 않습니다.' },
        { status: 500 }
      );
    }

    const description = data.candidates[0].content.parts[0].text;

    return NextResponse.json({ description });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'AI 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}