'use client';

import { useState } from 'react';

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
      setImages(Array.from(e.target.files));
    }
  };

  const generateDescription = async (tone?: string) => {
    if (!propertyInfo.area || !propertyInfo.price || !propertyInfo.location) {
      alert('평수, 가격, 위치를 모두 입력해주세요!');
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          area: propertyInfo.area,
          price: propertyInfo.price,
          location: propertyInfo.location,
          tone: tone || 'normal', // 톤 추가!
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

  // 나머지 코드는 그대로...
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 text-gray-900">
            🏠 부동산 AI 매물 설명문 생성기
          </h1>
          <p className="text-lg text-gray-600">
            사진만 올리면 2분 만에 전문 설명문 완성!
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-2xl p-6 md:p-10">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                평수
              </label>
              <input
                type="text"
                placeholder="예: 25평"
                value={propertyInfo.area}
                onChange={(e) => setPropertyInfo({...propertyInfo, area: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                가격
              </label>
              <input
                type="text"
                placeholder="예: 전세 3억"
                value={propertyInfo.price}
                onChange={(e) => setPropertyInfo({...propertyInfo, price: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                위치
              </label>
              <input
                type="text"
                placeholder="예: 강남역"
                value={propertyInfo.location}
                onChange={(e) => setPropertyInfo({...propertyInfo, location: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center mb-6 hover:border-blue-400 transition">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer"
            >
              <div className="text-7xl mb-4">📸</div>
              <p className="text-xl font-semibold text-gray-700 mb-2">
                매물 사진을 업로드하세요
              </p>
              <p className="text-sm text-gray-500">
                클릭하거나 드래그앤드롭 (최대 5장)
              </p>
            </label>
          </div>

          {images.length > 0 && (
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-3">
                📷 {images.length}개 사진 선택됨
              </p>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {images.map((img, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={URL.createObjectURL(img)}
                      alt={`미리보기 ${idx + 1}`}
                      className="w-full h-24 object-cover rounded-lg shadow"
                    />
                    <div className="absolute top-1 right-1 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                      {idx + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => generateDescription()}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-blue-800 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition transform hover:scale-105 shadow-lg"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                AI가 작성 중...
              </span>
            ) : (
              '✨ 설명문 자동 생성하기'
            )}
          </button>

          {description && (
            <div className="mt-8 space-y-4">
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl border border-green-200">
                <h3 className="font-bold text-lg mb-3 text-gray-800 flex items-center">
                  <span className="text-2xl mr-2">✅</span>
                  생성된 설명문
                </h3>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full h-40 p-4 border border-gray-300 rounded-lg text-gray-800 leading-relaxed"
                />
              </div>

              <div className="flex gap-3 flex-wrap">
                <button 
                  onClick={() => generateDescription('professional')}
                  disabled={loading}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:bg-gray-400"
                >
                  💼 더 전문적으로
                </button>
                <button 
                  onClick={() => generateDescription('friendly')}
                  disabled={loading}
                  className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition disabled:bg-gray-400"
                >
                  😊 더 친근하게
                </button>
                <button 
                  onClick={() => generateDescription('luxury')}
                  disabled={loading}
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition disabled:bg-gray-400"
                >
                  ✨ 고급스럽게
                </button>
              </div>

              <div className="flex gap-3 flex-wrap">
                <button 
                  onClick={() => navigator.clipboard.writeText(description)}
                  className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-semibold"
                >
                  📋 네이버부동산용 복사
                </button>
                <button 
                  onClick={() => navigator.clipboard.writeText(description)}
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
                >
                  📋 직방용 복사
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>💡 매물 등록 시간을 90% 단축하세요!</p>
        </div>
      </div>
    </main>
  );
}