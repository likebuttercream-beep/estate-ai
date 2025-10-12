'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function Home() {
  const [images, setImages] = useState<File[]>([]);
  const [propertyInfo, setPropertyInfo] = useState({
    area: '',
    price: '',
    location: '',
    rooms: '',
    bathrooms: '',
    floor: '',
    length: 'normal',
    additionalInfo: ''
  });
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [toneLoading, setToneLoading] = useState<string | null>(null);

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

    if (tone) {
      setToneLoading(tone);
    } else {
      setLoading(true);
    }
    
    try {
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
          rooms: propertyInfo.rooms,
          bathrooms: propertyInfo.bathrooms,
          floor: propertyInfo.floor,
          length: propertyInfo.length,
          additionalInfo: propertyInfo.additionalInfo,
          tone: tone || 'normal',
          images: imagesBase64,
        }),
      });

      const data = await response.json();

      if (data.error) {
        alert('오류: ' + data.error);
        return;
      }

      setDescription(data.description || '생성 실패');
    } catch (error) {
      console.error('Error:', error);
      alert('AI 생성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
      setToneLoading(null);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(description);
    alert('설명문이 복사되었습니다!');
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-black rounded-2xl flex items-center justify-center">
              <span className="text-white text-xl">🏠</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">방글방글</h1>
              <p className="text-xs text-gray-500">매물 설명문 AI</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-black rounded-3xl mx-auto mb-4 flex items-center justify-center">
            <span className="text-3xl">🏠</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            매물 설명문, 이제 쉽게 써보세요
          </h2>
          <p className="text-gray-600 text-gray-900">
            정보만 입력하면 AI가 멋진 소개글을 만들어드려요 ✨
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <span className="text-xl mr-2">📐</span>
                평수
              </label>
              <input
                type="text"
                placeholder="25평 또는 25"
                value={propertyInfo.area}
                onChange={(e) => setPropertyInfo({...propertyInfo, area: e.target.value})}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all placeholder:text-gray-600 text-gray-900"
              />
            </div>
            
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <span className="text-xl mr-2">🔥</span>
                가격
              </label>
              <input
                type="text"
                placeholder="매매: 5억 | 전세: 3억 | 월세: 500/50"
                value={propertyInfo.price}
                onChange={(e) => setPropertyInfo({...propertyInfo, price: e.target.value})}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all placeholder:text-gray-600 text-gray-900"
              />
            </div>
            
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <span className="text-xl mr-2">📍</span>
                위치
              </label>
              <input
                type="text"
                placeholder="강남구 역삼동"
                value={propertyInfo.location}
                onChange={(e) => setPropertyInfo({...propertyInfo, location: e.target.value})}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all placeholder:text-gray-600 text-gray-900"
              />
            </div>
          </div>
           {/* 상세 정보 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <span className="text-xl mr-2">🚪</span>
              방 개수
            </label>
            <select
              value={propertyInfo.rooms}
              onChange={(e) => setPropertyInfo({...propertyInfo, rooms: e.target.value})}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
            >
              <option value="">선택</option>
              <option value="원룸">원룸</option>
              <option value="1개">1개</option>
              <option value="2개">2개</option>
              <option value="3개">3개</option>
              <option value="4개 이상">4개 이상</option>
            </select>
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <span className="text-xl mr-2">🚿</span>
              욕실
            </label>
            <select
              value={propertyInfo.bathrooms}
              onChange={(e) => setPropertyInfo({...propertyInfo, bathrooms: e.target.value})}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
            >
              <option value="">선택</option>
              <option value="1개">1개</option>
              <option value="2개">2개</option>
              <option value="3개 이상">3개 이상</option>
            </select>
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <span className="text-xl mr-2">🏢</span>
              층수
            </label>
            <select
              value={propertyInfo.floor}
              onChange={(e) => setPropertyInfo({...propertyInfo, floor: e.target.value})}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
            >
              <option value="">선택</option>
              <option value="반지하">반지하</option>
              <option value="1층">1층</option>
              <option value="2층">2층</option>
              <option value="3-5층">3-5층</option>
              <option value="6-10층">6-10층</option>
              <option value="고층">고층</option>
              <option value="옥탑">옥탑</option>
            </select>
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <span className="text-xl mr-2">📏</span>
              길이
            </label>
            <select
              value={propertyInfo.length}
              onChange={(e) => setPropertyInfo({...propertyInfo, length: e.target.value})}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
            >
              <option value="short">짧게</option>
              <option value="normal">보통</option>
              <option value="long">길게</option>
            </select>
              </div>
          </div>

          <div className="mb-8">
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <span className="text-xl mr-2">💬</span>
              추가 정보 (선택)
            </label>
            <textarea
              placeholder="예: 반려동물 가능, 보증보험 가입 가능, 전세자금대출 가능, 리모델링 완료, 즉시 입주 가능 등"
              value={propertyInfo.additionalInfo}
              onChange={(e) => setPropertyInfo({...propertyInfo, additionalInfo: e.target.value})}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all placeholder:text-gray-600 text-gray-900 resize-none h-24"
            />
            <p className="text-xs text-gray-500 mt-2">
              💡 보증보험, 반려동물, 주차, 옵션 등 특별히 강조하고 싶은 내용을 적어주세요
            </p>
          </div>

          <div className="mb-8">
            <label className="flex items-center text-sm font-medium text-gray-700 mb-4">
              <span className="text-xl mr-2">📷</span>
              매물 사진
            </label>
            
            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-purple-400 transition-all bg-gray-50">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center hover:scale-110 transition-transform">
                  <span className="text-4xl">📷</span>
                </div>
                <p className="text-gray-700 font-medium mb-2">
                  📷 사진을 업로드하세요
                </p>
                <p className="text-sm text-gray-500">
                  여러 장 선택 가능 · AI가 자동으로 분석해드려요! ✨
                </p>
              </label>
            </div>

            {images.length > 0 && (
              <div className="mt-6 grid grid-cols-3 md:grid-cols-6 gap-4">
                {images.map((img, idx) => (
                  <div key={idx} className="relative group">
                    <Image
                      src={URL.createObjectURL(img)}
                      alt={`미리보기 ${idx + 1}`}
                      width={200}
                      height={128}
                      className="w-full h-24 object-cover rounded-xl border-2 border-gray-200"
                      unoptimized
                    />
                    <button
                      onClick={() => removeImage(idx)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs hover:bg-red-600"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => generateDescription()}
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 px-6 rounded-2xl font-bold text-lg hover:from-purple-600 hover:to-pink-600 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                AI가 작성 중...
              </>
            ) : (
              <>
                <span className="text-xl mr-2">✏️</span>
                설명문 생성하기
              </>
            )}
          </button>
        </div>

        {description && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <span className="text-2xl mr-2">✨</span>
                  생성된 설명문
                </h3>
                <button
                  onClick={copyToClipboard}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all shadow-md hover:shadow-lg text-sm font-medium flex items-center"
                >
                  <span className="mr-1">📋</span>
                  복사
                </button>
              </div>
              <div className="w-full p-6 border border-gray-200 rounded-2xl text-gray-800 leading-relaxed bg-gray-50 whitespace-pre-wrap">
                {description}
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-xl p-6">
              <p className="text-sm font-medium text-gray-700 mb-4">💫 톤 변경하기</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button 
                  onClick={() => generateDescription('professional')}
                  disabled={loading || toneLoading !== null}
                  className="px-6 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl hover:border-purple-400 hover:bg-purple-50 transition-all disabled:opacity-50 font-medium text-gray-700"
                >
                  {toneLoading === 'professional' ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      작성 중...
                    </span>
                  ) : (
                    <>
                      <span className="block text-base mb-1">💼 전문적으로</span>
                      <span className="block text-xs text-gray-500">Professional</span>
                    </>
                  )}
                </button>
                <button 
                  onClick={() => generateDescription('friendly')}
                  disabled={loading || toneLoading !== null}
                  className="px-6 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl hover:border-purple-400 hover:bg-purple-50 transition-all disabled:opacity-50 font-medium text-gray-700"
                >
                  {toneLoading === 'friendly' ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      작성 중...
                    </span>
                  ) : (
                    <>
                      <span className="block text-base mb-1">😊 친근하게</span>
                      <span className="block text-xs text-gray-500">Friendly</span>
                    </>
                  )}
                </button>
                <button 
                  onClick={() => generateDescription('luxury')}
                  disabled={loading || toneLoading !== null}
                  className="px-6 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl hover:border-purple-400 hover:bg-purple-50 transition-all disabled:opacity-50 font-medium text-gray-700"
                >
                  {toneLoading === 'luxury' ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      작성 중...
                    </span>
                  ) : (
                    <>
                      <span className="block text-base mb-1">✨ 고급스럽게</span>
                      <span className="block text-xs text-gray-500">Luxury</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(description);
                  alert('네이버부동산용으로 복사되었습니다!');
                }}
                className="px-8 py-5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg hover:shadow-xl font-bold flex items-center justify-center"
              >
                <span className="text-xl mr-2">📋</span>
                네이버부동산용 복사
              </button>
              <button 
                onClick={() => {
                  const zigbangFormat = description
                    .replace(/[✨🏠💰🚇✅🏛️💎😊💕👍🎉]/g, '')
                    .replace(/\n\n/g, '\n')
                    .trim();
                  navigator.clipboard.writeText(zigbangFormat);
                  alert('직방용으로 복사되었습니다! (이모지 제거)');
                }}
                className="px-8 py-5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-2xl hover:from-blue-600 hover:to-indigo-600 transition-all shadow-lg hover:shadow-xl font-bold flex items-center justify-center"
              >
                <span className="text-xl mr-2">📋</span>
                직방용 복사
              </button>
            </div>
          </div>
        )}
      </div>

      <footer className="border-t border-gray-200 mt-20 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-gray-600 text-gray-900 text-sm">
            © 2025 방글방글. 🏠 AI로 쉽고 빠르게!
          </p>
        </div>
      </footer>

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