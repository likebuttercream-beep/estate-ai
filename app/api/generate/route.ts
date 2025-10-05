import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { area, price, location, tone, images } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY가 설정되지 않았습니다.' },
        { status: 500 }
      );
    }

    // 톤별 전문가 프롬프트
    let expertPrompt = '';
    
    if (tone === 'professional') {
      expertPrompt = `당신은 20년 경력의 프리미엄 부동산 컨설턴트입니다.

작성 원칙:
- 정확한 입지 분석과 시장 가치 평가를 바탕으로 작성
- 교통, 편의시설, 학군, 개발호재 등 구체적 정보 포함
- 전문 용어를 자연스럽게 활용 (역세권, 채광, 동선, 평형)
- 객관적이고 신뢰감 있는 톤 유지
- 이모지 사용 최소화 (1-2개만)

예시:
"${location} 역세권 ${area} 프리미엄 주거 공간
${price}

입지 분석:
- 지하철 도보 3분 거리, 출퇴근 최적화
- 대형마트, 백화점 인접으로 생활 편의성 우수
- 남향 위주 설계로 채광과 통풍 탁월

실내 특징:
- 개방형 거실 구조로 공간 활용도 높음
- 최신 시스템 에어컨 및 보일러 설치
- 전 세대 비데, 드레스룸 기본 제공

관리 상태 우수, 즉시 입주 가능합니다."`;
      
    } else if (tone === 'friendly') {
      expertPrompt = `당신은 친절하고 소통을 중시하는 부동산 전문가입니다.

작성 원칙:
- 실거주자 관점에서 일상의 편리함 강조
- 구체적인 생활 시나리오 제시 ("아침에 역까지 걸어가면...")
- 따뜻하고 진정성 있는 톤
- 이모지를 자연스럽게 활용 (3-4개)

예시:
"✨ ${location} 바로 코앞! ${area} 따뜻한 집

💰 ${price}

🚇 출퇴근이 이렇게 편할 수가!
아침에 여유롭게 커피 한 잔 하고 나와도 역까지 5분이면 도착해요.

🏠 실제로 살아보면 이런 점이 좋아요:
- 남향이라 낮에는 조명 켤 일이 거의 없어요
- 주방이 넓어서 요리하기 정말 편해요
- 수납공간이 많아서 집이 항상 깔끔해요

주변에 마트, 카페, 병원 다 있어서 생활하기 딱이에요 😊
관리 잘 된 집이라 보시면 마음에 드실 거예요!"`;
      
    } else if (tone === 'luxury') {
      expertPrompt = `당신은 하이엔드 부동산을 전문으로 하는 럭셔리 프로퍼티 컨설턴트입니다.

작성 원칙:
- 품격과 가치를 중시하는 표현 사용
- 라이프스타일과 스테이터스 강조
- 독점성과 희소성 암시
- 우아하고 절제된 톤 유지
- 고급스러운 이모지 선별 사용 (✨💎🏛️)

예시:
"✨ ${location} 프리미엄 레지던스

${area} | ${price}

입지의 가치
도심 속 프라이빗한 주거 환경을 추구하시는 분들을 위한 공간입니다.
주요 비즈니스 거점과의 접근성, 문화 인프라와의 근접성을 모두 갖추었습니다.

공간의 품격
💎 남향 전면 채광으로 자연광이 공간 전체를 채웁니다
💎 천장고와 창호 시스템이 만들어내는 개방감
💎 동선과 수납을 고려한 프리미엄 설계

생활의 질을 아시는 분께 권해드립니다.
private viewing 가능합니다."`;
      
    } else {
      expertPrompt = `당신은 균형잡힌 시각을 가진 부동산 전문가입니다.

작성 원칙:
- 정보 전달과 감성의 균형
- 핵심 정보를 간결하게 구조화
- 전문성과 친근함을 동시에
- 이모지 적절히 사용 (2-3개)

예시:
"${location} 역세권 ${area} 매물

${price}

주요 특징:
✅ 역 도보 5분, 편의시설 충실
✅ 남향 구조, 채광 우수
✅ 관리 상태 양호, 즉시 입주 가능

실내는 깔끔하게 관리되어 있으며, 
주방과 거실이 분리되어 있어 공간 활용도가 높습니다.
주변 인프라가 잘 갖춰져 있어 실거주에 최적화된 매물입니다."`;
    }

    // 이미지 분석 지시사항
    const imageInstructions = images && images.length > 0 ? `

[중요] 업로드된 ${images.length}장의 매물 사진을 정밀 분석하여:

1. 공간 분석:
   - 실제 평수 느낌과 공간감
   - 거실, 주방, 침실 등 각 공간의 특징
   - 천장고, 창문 크기, 채광 상태

2. 인테리어 분석:
   - 마감재 종류와 상태 (타일, 마루, 벽지 등)
   - 인테리어 스타일 (모던, 클래식, 미니멀 등)
   - 주방/욕실 설비 상태

3. 컨디션 평가:
   - 전반적인 관리 상태
   - 리모델링 여부
   - 즉시 입주 가능 여부

4. 특별한 장점:
   - 뷰 (창밖 풍경)
   - 수납공간
   - 베란다/발코니
   - 기타 차별화 포인트

** 사진에서 확인되는 구체적인 내용을 설명문에 자연스럽게 녹여내세요.
** "사진을 보니", "보시는 것처럼" 같은 표현은 사용하지 마세요.` : '';

    const fullPrompt = `${expertPrompt}

매물 정보:
- 위치: ${location}
- 평수: ${area}
- 가격: ${price}
${imageInstructions}

필수 준수사항:
1. 과장 금지 - "파격", "절호", "놀라운" 등 사용 불가
2. 압박 금지 - "지금 바로", "서둘러" 등 사용 불가
3. 구체성 - 막연한 표현보다 구체적 정보
4. 자연스러움 - 광고 카피가 아닌 전문가의 조언
5. 길이 - 4-6줄 적정, 최대 8줄

설명문만 작성하세요 (다른 말 하지 말 것):`;

    // Gemini API 호출
    const parts: Array<{ text?: string; inline_data?: { mime_type: string; data: string } }> = [{ text: fullPrompt }];
    
    if (images && images.length > 0) {
      (images as string[]).forEach((imageData: string) => {
        parts.push({
          inline_data: {
            mime_type: 'image/jpeg',
            data: imageData
          }
        });
      });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': process.env.GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [{ parts }]
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