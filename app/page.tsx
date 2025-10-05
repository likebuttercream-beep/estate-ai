'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function Home() {
  const [images, setImages] = useState<File[]>([]);
  const [propertyInfo, setPropertyInfo] = useState({
    area: '',
    price: '',
    location: ''
  });
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files);
      setImages([...images, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        const base64Data = base64.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const generateDescription = async (tone?: string) => {
    if (!propertyInfo.area || !propertyInfo.price || !propertyInfo.location) {
      alert('평수, 가격, 위치를 모두 입력해주세요.');
      return;
    }

    setLoading(true);
    
    try {
      // 모든 이미지를 base64로 변환
      const imagesBase64 = await Promise.all(
        images.map(img => convertImageToBase64(img))
      );

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          area: propertyInfo.area,
          price: propertyInfo.price,
          location: propertyInfo.location,
          tone: tone || 'normal',
          images: imagesBase64,
        }),
      });

      const data = await response.json();

      if (data.error) {
        alert('오류: ' + data.error);
        setLoading(false);
        return;
      }

      setDescription(data.description || '생성 실패');
    } catch (error) {
      console.error('Error:', error);
      alert('AI 생성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
      {/* 헤더 */}
      <div className="border-b border-neutral-700/50 backdrop-blur-sm bg-neutral-900/80 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl font-bold">E</span>
              </div>
              <div>
                <h1 className="text-xl font-light text-white tracking-wide">ESTATE AI</h1>
                <p className="text-xs text-neutral-400 tracking-widest">PREMIUM PROPERTY SOLUTIONS</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* 타이틀 섹션 */}
        <div className="text-center mb-16">
          <p className="text-amber-400 text-sm tracking-[0.3em] mb-4 font-light">AI-POWERED DESCRIPTION</p>
          <h2 className="text-5xl md:text-6xl font-light text-white mb-6 tracking-tight">
            Elevate Your Property
          </h2>
          <p className="text-neutral-400 text-lg max-w-2xl mx-auto leading-relaxed">
            인공지능 기술을 활용한 프리미엄 매물 설명문 생성 서비스
          </p>
        </div>

        {/* 입력 카드 */}
        <div className="bg-gradient-to-br from-neutral-800/50 to-neutral-900/50 backdrop-blur-xl rounded-2xl border border-neutral-700/50 shadow-2xl p-8 md:p-12 mb-8">
          
          {/* 정보 입력 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="group">
              <label className="block text-xs text-neutral-400 mb-3 tracking-widest uppercase">
                Area
              </label>
              <input
                type="text"
                placeholder="25평"
                value={propertyInfo.area}
                onChange={(e) => setPropertyInfo({...propertyInfo, area: e.target.value})}
                className="w-full px-5 py-4 bg-neutral-900/50 border border-neutral-700 rounded-xl text-white placeholder:text-neutral-600 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300"
              />
            </div>
            
            <div className="group">
              <label className="block text-xs text-neutral-400 mb-3 tracking-widest uppercase">
                Price
              </label>
              <input
                type="text"
                placeholder="전세 3억"
                value={propertyInfo.price}
                onChange={(e) => setPropertyInfo({...propertyInfo, price: e.target.value})}
                className="w-full px-5 py-4 bg-neutral-900/50 border border-neutral-700 rounded-xl text-white placeholder:text-neutral-600 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300"
              />
            </div>
            
            <div className="group">
              <label className="block text-xs text-neutral-400 mb-3 tracking-widest uppercase">
                Location
              </label>
              <input
                type="text"
                placeholder="강남역"
                value={propertyInfo.location}
                onChange={(e) => setPropertyInfo({...propertyInfo, location: e.target.value})}
                className="w-full px-5 py-4 bg-neutral-900/50 border border-neutral-700 rounded-xl text-white placeholder:text-neutral-600 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300"
              />
            </div>
          </div>

          {/* 이미지 업로드 */}
          <div className="mb-10">
            <label className="block text-xs text-neutral-400 mb-4 tracking-widest uppercase">
              Property Images
            </label>
            
            <div className="border-2 border-dashed border-neutral-700 rounded-2xl p-12 text-center hover:border-amber-500/50 transition-all duration-300 bg-neutral-900/30 group cursor-pointer">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-neutral-300 text-lg mb-2 font-light">
                  이미지를 업로드하세요
                </p>
                <p className="text-neutral-500 text-sm">
                  여러 장 선택 가능 · AI가 자동으로 분석합니다
                </p>
              </label>
            </div>

            {/* 업로드된 이미지 미리보기 */}
            {images.length > 0 && (
              <div className="mt-6">
                <p className="text-sm text-neutral-400 mb-4">
                  {images.length}개 이미지 선택됨
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative group">
                      <Image
                        src={URL.createObjectURL(img)}
                        alt={`미리보기 ${idx + 1}`}
                        width={200}
                        height={128}
                        className="w-full h-32 object-cover rounded-lg border border-neutral-700"
                        unoptimized
                      />
                      <button
                        onClick={() => removeImage(idx)}
                        className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                      >
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      <div className="absolute bottom-2 right-2 bg-neutral-900/80 backdrop-blur-sm text-white text-xs px-2 py-1 rounded">
                        {idx + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 생성 버튼 */}
          <button
            onClick={() => generateDescription()}
            disabled={loading}
            className="w-full group relative overflow-hidden bg-gradient-to-r from-amber-500 to-amber-600 text-white py-5 rounded-xl font-light text-lg tracking-wider hover:from-amber-600 hover:to-amber-700 disabled:from-neutral-700 disabled:to-neutral-800 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-amber-500/25"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                AI 분석 중...
              </span>
            ) : (
              <span className="relative z-10">설명문 생성하기</span>
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        </div>

        {/* 결과 */}
        {description && (
          <div className="space-y-6 animate-fadeIn">
            {/* 설명문 */}
            <div className="bg-gradient-to-br from-neutral-800/50 to-neutral-900/50 backdrop-blur-xl rounded-2xl border border-neutral-700/50 p-8 shadow-2xl">
              <div className="flex items-center mb-6">
                <div className="w-1 h-6 bg-gradient-to-b from-amber-400 to-amber-600 rounded-full mr-4" />
                <h3 className="text-neutral-300 text-lg font-light tracking-wide">
                  생성된 설명문
                </h3>
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full h-48 p-6 bg-neutral-900/50 border border-neutral-700 rounded-xl text-neutral-200 leading-relaxed focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300 resize-none"
              />
            </div>

            {/* 톤 조절 버튼 */}
            <div className="bg-gradient-to-br from-neutral-800/30 to-neutral-900/30 backdrop-blur-xl rounded-2xl border border-neutral-700/50 p-6">
              <p className="text-xs text-neutral-400 mb-4 tracking-widest uppercase">Tone Adjustment</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button 
                  onClick={() => generateDescription('professional')}
                  disabled={loading}
                  className="px-6 py-4 bg-neutral-800/50 border border-neutral-700 text-neutral-300 rounded-xl hover:border-amber-500/50 hover:bg-neutral-800 transition-all duration-300 disabled:opacity-50 font-light"
                >
                  <span className="block text-sm mb-1">Professional</span>
                  <span className="block text-xs text-neutral-500">전문적인 톤</span>
                </button>
                <button 
                  onClick={() => generateDescription('friendly')}
                  disabled={loading}
                  className="px-6 py-4 bg-neutral-800/50 border border-neutral-700 text-neutral-300 rounded-xl hover:border-amber-500/50 hover:bg-neutral-800 transition-all duration-300 disabled:opacity-50 font-light"
                >
                  <span className="block text-sm mb-1">Friendly</span>
                  <span className="block text-xs text-neutral-500">친근한 톤</span>
                </button>
                <button 
                  onClick={() => generateDescription('luxury')}
                  disabled={loading}
                  className="px-6 py-4 bg-neutral-800/50 border border-neutral-700 text-neutral-300 rounded-xl hover:border-amber-500/50 hover:bg-neutral-800 transition-all duration-300 disabled:opacity-50 font-light"
                >
                  <span className="block text-sm mb-1">Luxury</span>
                  <span className="block text-xs text-neutral-500">고급스러운 톤</span>
                </button>
              </div>
            </div>

            {/* 복사 버튼 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(description);
                  alert('네이버부동산용으로 복사되었습니다.');
                }}
                className="group px-8 py-5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all duration-300 shadow-lg hover:shadow-emerald-500/25 font-light"
              >
                <span className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  네이버부동산용 복사
                </span>
              </button>
              <button 
                onClick={() => {
                  const zigbangFormat = description
                    .replace(/[✨🏠💰🚇✅🏛️💎😊💕👍🎉]/g, '')
                    .replace(/\n\n/g, '\n')
                    .trim();
                  navigator.clipboard.writeText(zigbangFormat);
                  alert('직방용으로 복사되었습니다. (이모지 제거)');
                }}
                className="group px-8 py-5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-blue-500/25 font-light"
              >
                <span className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  직방용 복사
                </span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 푸터 */}
      <div className="border-t border-neutral-800 mt-20">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center">
          <p className="text-neutral-500 text-sm font-light">
            © 2025 Estate AI. Premium Property Solutions.
          </p>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </main>
  );
}