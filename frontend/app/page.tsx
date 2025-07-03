"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

// Intersection Observer hook
function useIntersectionObserver(options = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef(null);

  const callback = useCallback((entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;
    setIsIntersecting(entry.isIntersecting);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(callback, options);
    const currentRef = ref.current;
    
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [ref, callback, options]);

  return { ref, isIntersecting };
}

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeFeatureIndex, setActiveFeatureIndex] = useState(0);
  const router = useRouter();

  // Intersection observers for different sections
  const { ref: heroRef, isIntersecting: heroVisible } = useIntersectionObserver({ threshold: 0.1 });
  const { ref: featuresRef, isIntersecting: featuresVisible } = useIntersectionObserver({ threshold: 0.1 });
  const { ref: statsRef, isIntersecting: statsVisible } = useIntersectionObserver({ threshold: 0.1 });
  const { ref: howItWorksRef, isIntersecting: howItWorksVisible } = useIntersectionObserver({ threshold: 0.1 });
  const { ref: mobileAppRef, isIntersecting: mobileAppVisible } = useIntersectionObserver({ threshold: 0.1 });
  const { ref: ctaRef, isIntersecting: ctaVisible } = useIntersectionObserver({ threshold: 0.1 });
  const [isMobile, setIsMobile] = useState(false);
  
  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    setIsVisible(true);
    
    // Feature rotation interval
    const interval = setInterval(() => {
      setActiveFeatureIndex((prevIndex) => (prevIndex + 1) % features.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Parallax effect
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const features = [
    {
      icon: "📋",
      title: "Sağlık Anketleri",
      description: "Günlük ruh durumunuzu, stres seviyenizi ve genel sağlığınızı takip edin",
      color: "blue"
    },
    {
      icon: "🎵",
      title: "Terapi Müzikleri",
      description: "Bilimsel frekanslarla tasarlanmış müziklerle rahatlatıcı deneyim yaşayın",
      color: "green"
    },
    {
      icon: "📊",
      title: "Detaylı Raporlar",
      description: "İlerlemenizi PDF raporlar ile takip edin ve gelişiminizi gözlemleyin",
      color: "purple"
    },
    {
      icon: "💬",
      title: "AI Destekli Chat",
      description: "Yapay zeka ile sohbet ederek sağlık konularında rehberlik alın",
      color: "orange"
    }
  ];

  const stats = [
    { number: "1000+", label: "Aktif Kullanıcı" },
    { number: "50k+", label: "Tamamlanan Anket" },
    { number: "25k+", label: "Dinleme Seansı" },
    { number: "99%", label: "Kullanıcı Memnuniyeti" }
  ];

  const appFeatures = [
    {
      title: "Hızlı ve Kolay",
      description: "Mobil uygulamamız ile her yerde sağlığınızı takip edin",
      icon: "📱"
    },
    {
      title: "Bildirimler",
      description: "Önemli hatırlatıcılar ve önerilerle güncel kalın",
      icon: "🔔"
    },
    {
      title: "Offline Erişim",
      description: "İnternet olmadığında bile verilerinize erişin",
      icon: "📶"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 overflow-hidden">
      {/* Animated Background Shapes */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-300/20 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute top-3/4 left-1/3 w-72 h-72 bg-purple-300/20 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-indigo-300/20 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <header className="backdrop-blur-sm bg-white/70 border-b border-white/30 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-4">
                <div className="w-50 h-50 flex items-center justify-center">
                  <Image 
                    src="/healtwave_logo.svg" 
                    alt="HealtWave Logo" 
                    width={256}
                    height={128}
                    className="drop-shadow-lg hover:scale-105 transition-transform duration-200"
                    priority
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Link 
                href="/login"
                className="text-gray-600 hover:text-blue-600 transition-colors duration-300 font-medium relative group"
              >
                Giriş Yap
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link 
                href="/register"
                className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:opacity-90 transition-all duration-300 font-medium shadow-lg hover:shadow-indigo-300/50 transform hover:scale-105"
              >
                Üye Ol
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-200/20 to-purple-200/20 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/4 opacity-60"></div>
        <div className="absolute inset-0 bg-gradient-to-l from-indigo-200/20 to-cyan-200/20 rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/4 opacity-60"></div>
        
        {/* Floating Decorative Elements */}
        <div className="absolute top-20 left-10 w-12 h-12 rounded-full bg-blue-400/10 rotating-animation"></div>
        <div className="absolute bottom-20 right-10 w-16 h-16 rounded-full bg-purple-400/10 rotating-animation" style={{ animationDirection: 'reverse', animationDuration: '20s' }}></div>
        <div className="absolute top-1/2 right-1/4 w-8 h-8 rounded-full bg-indigo-400/10 rotating-animation" style={{ animationDuration: '25s' }}></div>
        
        <div className="parallax-scroll" style={{ '--parallax-y': `${scrollY * -0.05}px` } as React.CSSProperties}>
          <div ref={heroRef} className="max-w-7xl mx-auto text-center relative z-10">
            <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight animate-text-shimmer">
                Sağlığınızı{" "}
                <span className="bg-gradient-to-r from-blue-600 via-purple-500 to-indigo-600 bg-clip-text text-transparent relative gradient-text-animation">
                  Takip Edin
                  <svg className="absolute -bottom-2 left-0 w-full h-2 text-indigo-300/50" viewBox="0 0 100 12" preserveAspectRatio="none">
                    <path d="M0,0 Q50,12 100,0" fill="currentColor" />
                  </svg>
                </span>
              </h2>
              <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
                HealtWave ile günlük sağlık durumunuzu izleyin, terapi müzikleri dinleyin ve 
                <span className="text-indigo-600 font-medium"> AI destekli rehberlik </span>
                alarak daha sağlıklı bir yaşam sürün.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={() => router.push('/register')}
                  className="group bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl transition-all duration-300 font-semibold shadow-xl hover:shadow-indigo-300/50 transform hover:scale-105 relative overflow-hidden"
                >
                  <span className="relative z-10">Ücretsiz Başlayın</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                </button>
                <button 
                  onClick={() => router.push('/login')}
                  className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-xl hover:bg-blue-600 hover:text-white transition-all duration-300 font-semibold relative overflow-hidden group"
                >
                  <span className="relative z-10">Demo İzle</span>
                  <span className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 scale-x-0 group-hover:scale-x-100 origin-left"></span>
                </button>
              </div>
              
              <div className="mt-16 flex justify-center">
                <div className="relative h-14 overflow-hidden">
                  <div className="absolute bottom-0 left-0 w-full h-full flex items-center justify-center">
                    <svg className="animate-bounce w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Health Icons - NEW */}
            <div className="absolute left-0 top-1/3 transform -translate-x-1/2">
              <div className="relative">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl shadow-lg flex items-center justify-center rotating-animation" style={{ animationDuration: '30s' }}>
                  <span className="text-3xl">❤️</span>
                </div>
              </div>
            </div>

            <div className="absolute right-0 top-1/4 transform translate-x-1/2">
              <div className="relative">
                <div className="w-20 h-20 bg-purple-50 rounded-2xl shadow-lg flex items-center justify-center rotating-animation" style={{ animationDuration: '25s', animationDirection: 'reverse' }}>
                  <span className="text-3xl">🧠</span>
                </div>
              </div>
            </div>

            <div className="absolute left-1/4 bottom-0 transform translate-y-1/2">
              <div className="relative">
                <div className="w-14 h-14 bg-indigo-50 rounded-2xl shadow-lg flex items-center justify-center rotating-animation" style={{ animationDuration: '35s' }}>
                  <span className="text-3xl">🏃</span>
                </div>
              </div>
            </div>

            <div className="absolute right-1/4 bottom-0 transform translate-y-1/2">
              <div className="relative">
                <div className="w-12 h-12 bg-green-50 rounded-2xl shadow-lg flex items-center justify-center rotating-animation" style={{ animationDuration: '20s', animationDirection: 'reverse' }}>
                  <span className="text-3xl">🥗</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-20 px-4 sm:px-6 lg:px-8 bg-white/30 backdrop-blur-sm relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-200/10 to-purple-200/10 mix-blend-multiply"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className={`text-center mb-16 transition-all duration-1000 ${featuresVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <span className="inline-block py-1 px-3 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium mb-4">Özellikler</span>
            <h3 className="text-4xl font-bold text-gray-900 mb-4">
              Modern Araçlar, <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent gradient-text-animation">Sağlıklı</span> Sonuçlar
            </h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Sağlığınızı her açıdan takip etmenizi sağlayan kapsamlı çözümler
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={feature.title}
                className={`bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-white/40 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105 group ${featuresVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} ${index === activeFeatureIndex ? 'ring-2 ring-indigo-400 ring-offset-2 ring-offset-transparent' : ''}`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <div className={`w-16 h-16 bg-gradient-to-br from-${feature.color}-500/20 to-${feature.color}-600/30 rounded-2xl flex items-center justify-center mb-5 mx-auto transform group-hover:scale-110 transition-transform duration-500 shadow-inner relative`}>
                  <div className="absolute inset-0 bg-white/50 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                  <span className="text-4xl group-hover:animate-pulse relative z-10">{feature.icon}</span>
                  
                  {/* Glow Effect */}
                  <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-blue-500/30 to-indigo-500/30 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500"></div>
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-3 text-center group-hover:text-indigo-600 transition-colors duration-300">
                  {feature.title}
                </h4>
                <p className="text-gray-600 text-center leading-relaxed">
                  {feature.description}
                </p>
                
                {/* Animated Line Under Active Feature */}
                {index === activeFeatureIndex && (
                  <div className="mt-4 w-12 h-1 bg-indigo-500 rounded-full mx-auto transition-all duration-300"></div>
                )}
              </div>
            ))}
          </div>
          
          {/* Feature Details - NEW */}
          <div className={`mt-16 bg-white/70 backdrop-blur-md rounded-2xl p-8 border border-white/40 shadow-xl transition-all duration-1000 ${featuresVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`} style={{ transitionDelay: '600ms' }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-3xl blur-xl transform rotate-3"></div>
                <div className="relative bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl shadow-inner">
                  <div className="text-6xl mb-4 transform transition-transform duration-500 hover:scale-110">{features[activeFeatureIndex].icon}</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{features[activeFeatureIndex].title}</h3>
                  <p className="text-gray-600">{features[activeFeatureIndex].description}</p>
                  
                  <div className="mt-8 flex gap-2">
                    {features.map((_, idx) => (
                      <button 
                        key={idx} 
                        onClick={() => setActiveFeatureIndex(idx)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${idx === activeFeatureIndex ? 'bg-indigo-600 w-6' : 'bg-gray-300'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">✓</div>
                  <div>
                    <h4 className="font-medium text-gray-900">Kapsamlı Veri Analizi</h4>
                    <p className="text-sm text-gray-600">Sağlık verilerinizi detaylı grafiklerle inceleyin</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow">
                  <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">✓</div>
                  <div>
                    <h4 className="font-medium text-gray-900">Kişiselleştirilmiş Öneriler</h4>
                    <p className="text-sm text-gray-600">Size özel sağlık tavsiyeleri ve öneriler alın</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">✓</div>
                  <div>
                    <h4 className="font-medium text-gray-900">Sürekli Gelişen Yapay Zeka</h4>
                    <p className="text-sm text-gray-600">Sağlık verileriniz arttıkça daha iyi tavsiyelere ulaşın</p>
                  </div>
                </div>
                
                <button 
                  onClick={() => router.push('/register')}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl mt-4 flex items-center justify-center gap-2 group hover:shadow-lg transition-shadow duration-300"
                >
                  <span>Tüm Özelliklere Erişin</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile App Section - NEW */}
      <section ref={mobileAppRef} className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-100">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-300/10 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-300/10 rounded-full mix-blend-multiply filter blur-3xl animate-pulse animation-delay-1000"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className={`transition-all duration-1000 delay-300 ${mobileAppVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-20'}`}>
              <span className="inline-block py-1 px-3 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-4">Mobil Uygulama</span>
              <h3 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
                Her Yerde <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent gradient-text-animation">Sağlığınızla</span> Bağlantıda Kalın
              </h3>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                HealtWave mobil uygulaması ile sağlığınızı her an, her yerde takip edin. 
                Hemen indirin ve sağlık yolculuğunuza kesintisiz devam edin.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                {appFeatures.map((feature, index) => (
                  <div 
                    key={feature.title}
                    className={`bg-white/70 backdrop-blur-sm rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300 border border-white/40 ${mobileAppVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                    style={{ transitionDelay: `${index * 200 + 500}ms` }}
                  >
                    <div className="text-3xl mb-3 glow-animation">{feature.icon}</div>
                    <h4 className="font-semibold text-gray-900 mb-1">{feature.title}</h4>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                ))}
              </div>
              
              <div className={`flex flex-wrap gap-4 ${mobileAppVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '800ms' }}>
                <button className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition-colors duration-300 shadow-lg transform hover:scale-105 relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.5234 12.0371C17.5083 9.36285 19.7559 8.04859 19.8426 7.99599C18.6348 6.23198 16.8112 5.99643 16.1439 5.97434C14.6063 5.8131 13.1133 6.89248 12.333 6.89248C11.5381 6.89248 10.3008 5.99275 9.02246 6.02116C7.37403 6.04976 5.84667 7.03129 5.00293 8.54174C3.26416 11.6338 4.5625 16.1855 6.24414 18.8159C7.0752 20.1044 8.05078 21.5446 9.3291 21.4883C10.5879 21.4321 11.0596 20.6738 12.5537 20.6738C14.0478 20.6738 14.4756 21.4883 15.791 21.4578C17.1504 21.4321 17.9922 20.1426 18.8086 18.8453C19.7559 17.3647 20.1396 15.9113 20.1543 15.845C20.1241 15.8321 17.541 14.7527 17.5234 12.0371Z"/>
                    <path d="M15.1953 4.22116C15.8477 3.4189 16.2949 2.31592 16.1582 1.19995C15.2109 1.24878 13.9941 1.85204 13.3125 2.63042C12.7188 3.31396 12.1836 4.45736 12.335 5.53667C13.4014 5.6269 14.5283 5.02365 15.1953 4.22116Z"/>
                  </svg>
                  <div className="text-left relative z-10">
                    <div className="text-xs">İndir</div>
                    <div className="text-sm font-medium">App Store</div>
                  </div>
                </button>
                
                <button className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition-colors duration-300 shadow-lg transform hover:scale-105 relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <svg width="22" height="24" viewBox="0 0 22 24" fill="currentColor">
                    <path d="M0.681818 23.2264C0.315166 22.8487 0.181818 22.3379 0.181818 21.6939V2.32457C0.181818 1.68048 0.315166 1.16975 0.681818 0.792052L0.774262 0.698831L11.6406 11.7262V11.8222L0.774262 22.8496L0.681818 23.2264Z"/>
                    <path d="M15.4276 7.85225L11.6401 11.7056V11.8015L15.4276 15.6549L15.5372 15.5926L20.0214 12.879C21.4041 12.0899 21.4041 11.4172 20.0214 10.6281L15.5372 7.91455L15.4276 7.85225Z"/>
                    <path d="M15.5396 15.5926L11.6425 11.7261L0.68457 22.8495C1.16722 23.3638 1.9022 23.429 2.69906 22.9138L15.5396 15.5926Z"/>
                    <path d="M15.5396 7.91455L2.69906 0.601613C1.9022 0.0854868 1.16722 0.15168 0.68457 0.659087L11.6425 11.7262L15.5396 7.91455Z"/>
                  </svg>
                  <div className="text-left relative z-10">
                    <div className="text-xs">İNDİR</div>
                    <div className="text-sm font-medium">Google Play</div>
                  </div>
                </button>
                
                {isMobile && (
                  <button className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors duration-300 shadow-lg transform hover:scale-105 ripple-animation">
                    <span>Hemen Aç</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                )}
              </div>

              {/* QR Code for App Download */}
              <div className={`mt-8 inline-block p-3 bg-white rounded-xl shadow-lg ${mobileAppVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '1000ms' }}>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                    {/* Placeholder for QR code */}
                    <div className="grid grid-cols-5 grid-rows-5 gap-1 w-20 h-20">
                      {Array(25).fill(0).map((_, i) => (
                        <div key={i} className={`w-full h-full rounded-sm ${Math.random() > 0.5 ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Hızlı Erişim</p>
                    <p className="text-xs text-gray-600">QR kodu tarayın veya<br/>uygulama mağazasından indirin</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className={`relative transition-all duration-1000 delay-500 ${mobileAppVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-20'}`}>
              <div className="absolute -z-10 inset-0 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl transform rotate-12"></div>
              
              <div className="relative floating-animation">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-lg transform -rotate-6 scale-95 opacity-20 blur-sm"></div>
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-lg transform rotate-3 scale-95 opacity-20 blur-sm"></div>
                
                <div className="relative bg-white/90 backdrop-blur-sm border border-white/40 p-4 rounded-3xl shadow-2xl overflow-hidden transform hover:scale-[1.02] transition-transform duration-500">
                  {/* Phone Top Notch */}
                  <div className="w-1/3 h-6 bg-gray-900 rounded-b-xl mx-auto mb-2 flex items-center justify-center">
                    <div className="w-4 h-1 bg-gray-700 rounded-full"></div>
                  </div>
                  
                  <div className="rounded-2xl overflow-hidden bg-indigo-900 pt-6">
                    <div className="w-12 h-2 bg-white/20 rounded-full mx-auto mb-3"></div>
                    <div className="p-4 rounded-t-2xl bg-indigo-600 relative">
                      <div className="absolute top-0 right-0 p-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 rounded-full bg-white/40"></div>
                          <div className="w-2 h-2 rounded-full bg-white/40"></div>
                          <div className="w-2 h-2 rounded-full bg-white/40"></div>
                        </div>
                      </div>
                      <div className="h-6 w-32 bg-white/20 rounded mb-2"></div>
                      <div className="h-4 w-24 bg-white/10 rounded"></div>
                    </div>
                    <div className="bg-white p-4 rounded-t-2xl -mt-4 transform translate-y-4">
                      <div className="flex justify-between mb-4">
                        <div className="w-20 h-6 bg-gray-200 rounded"></div>
                        <div className="w-10 h-6 bg-indigo-100 rounded"></div>
                      </div>
                      
                      <div className="space-y-3 mb-6">
                        <div className="h-12 bg-gray-100 rounded flex items-center px-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-200 mr-3 flex items-center justify-center">
                            <div className="w-5 h-5 rounded-full bg-indigo-400"></div>
                          </div>
                          <div>
                            <div className="w-32 h-3 bg-gray-300 rounded mb-1"></div>
                            <div className="w-24 h-2 bg-gray-200 rounded"></div>
                          </div>
                        </div>
                        <div className="h-12 bg-gray-100 rounded flex items-center px-3">
                          <div className="w-8 h-8 rounded-full bg-blue-200 mr-3 flex items-center justify-center">
                            <div className="w-5 h-5 rounded-full bg-blue-400"></div>
                          </div>
                          <div>
                            <div className="w-32 h-3 bg-gray-300 rounded mb-1"></div>
                            <div className="w-24 h-2 bg-gray-200 rounded"></div>
                          </div>
                        </div>
                        <div className="h-12 bg-gray-100 rounded flex items-center px-3">
                          <div className="w-8 h-8 rounded-full bg-purple-200 mr-3 flex items-center justify-center">
                            <div className="w-5 h-5 rounded-full bg-purple-400"></div>
                          </div>
                          <div>
                            <div className="w-32 h-3 bg-gray-300 rounded mb-1"></div>
                            <div className="w-24 h-2 bg-gray-200 rounded"></div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="h-12 w-full bg-indigo-600 rounded-lg flex items-center justify-center">
                        <div className="w-24 h-3 bg-white/40 rounded"></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-center mt-6">
                    <div className="w-20 h-2 bg-black/10 rounded-full"></div>
                  </div>

                  {/* Decorative Elements */}
                  <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-blue-400/10 rounded-full rotating-animation"></div>
                  <div className="absolute -left-4 -top-4 w-12 h-12 bg-purple-400/10 rounded-full rotating-animation" style={{ animationDirection: 'reverse' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-50 to-blue-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-indigo-100/[0.03] bg-[length:20px_20px]"></div>
        <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-300/50 to-transparent"></div>
        <div className="absolute left-0 right-0 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-300/50 to-transparent"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className={`text-center mb-16 transition-all duration-1000 ${statsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <span className="inline-block py-1 px-3 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-4">İstatistikler</span>
            <h3 className="text-4xl font-bold text-gray-900 mb-4">
              Kullanıcılarımızın <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent gradient-text-animation">Tercihi</span>
            </h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Binlerce kullanıcı HealtWave ile sağlıklı yaşama adım atıyor
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div 
                key={stat.label}
                className={`text-center relative transform transition-all duration-700 hover:scale-110 ${statsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-200/40 to-blue-100/40 rounded-2xl transform rotate-3 scale-105 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/40 shadow-lg group overflow-hidden">
                  {/* Radial gradient background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-100/30 via-transparent to-blue-100/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Number counter effect */}
                  <div className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3 transform transition-transform group-hover:scale-110 gradient-text-animation">
                    {stat.number}
                  </div>
                  <div className="text-gray-600 font-medium">
                    {stat.label}
                  </div>
                  
                  {/* Decorative corner */}
                  <div className="absolute top-0 right-0 w-0 h-0 border-t-[40px] border-r-[40px] border-t-transparent border-r-indigo-100/40 group-hover:border-r-indigo-200/60 transition-colors duration-300"></div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Trust badges - NEW */}
          <div className={`mt-16 p-8 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/40 shadow-lg transition-all duration-1000 ${statsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '600ms' }}>
            <div className="text-center mb-8">
              <h4 className="text-xl font-semibold text-gray-900">Güvenilir Teknoloji Altyapısı</h4>
              <p className="text-gray-600">En güncel teknolojileri kullanarak güvenli bir deneyim sunuyoruz</p>
            </div>
            
            <div className="flex flex-wrap justify-center items-center gap-6 md:gap-12">
              <div className="flex items-center justify-center h-12 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                <div className="bg-gray-800 text-white rounded px-3 py-1 font-mono text-sm">Next.js</div>
              </div>
              <div className="flex items-center justify-center h-12 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                <div className="bg-green-700 text-white rounded px-3 py-1 font-mono text-sm">Django</div>
              </div>
              <div className="flex items-center justify-center h-12 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                <div className="bg-blue-600 text-white rounded px-3 py-1 font-mono text-sm">TypeScript</div>
              </div>
              <div className="flex items-center justify-center h-12 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                <div className="bg-indigo-600 text-white rounded px-3 py-1 font-mono text-sm">TailwindCSS</div>
              </div>
              <div className="flex items-center justify-center h-12 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                <div className="bg-yellow-600 text-white rounded px-3 py-1 font-mono text-sm">Python</div>
              </div>
              <div className="flex items-center justify-center h-12 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                <div className="bg-purple-700 text-white rounded px-3 py-1 font-mono text-sm">AI/ML</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section ref={howItWorksRef} className="py-20 px-4 sm:px-6 lg:px-8 bg-white/30 backdrop-blur-sm relative">
        <div className="absolute inset-0 bg-gradient-to-tl from-blue-100/20 to-purple-100/20 mix-blend-multiply"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className={`text-center mb-16 transition-all duration-1000 ${howItWorksVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <span className="inline-block py-1 px-3 rounded-full bg-purple-100 text-purple-700 text-sm font-medium mb-4">Nasıl Çalışır</span>
            <h3 className="text-4xl font-bold text-gray-900 mb-4">
              Sağlıklı Yaşam <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent gradient-text-animation">3 Adımda</span>
            </h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Sadece birkaç adımda sağlık yolculuğunuza başlayın
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connection Lines */}
            <div className="absolute top-1/3 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-blue-300 to-indigo-300 hidden md:block"></div>
            <div className="absolute top-1/3 left-1/4 w-0.5 h-10 bg-indigo-300 hidden md:block"></div>
            <div className="absolute top-1/3 right-1/4 w-0.5 h-10 bg-indigo-300 hidden md:block"></div>
            
            <div className={`text-center relative z-10 transform transition-all duration-500 hover:scale-105 ${howItWorksVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '150ms' }}>
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6 shadow-lg shadow-blue-300/30 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative z-10">1</span>
                {/* Ripple effect */}
                <div className="absolute inset-0 scale-0 rounded-full bg-white/30 group-hover:scale-150 group-hover:opacity-0 transition-all duration-1000"></div>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">
                Hesap Oluşturun
              </h4>
              <p className="text-gray-600 px-4">
                Ücretsiz hesabınızı oluşturun ve hemen sağlık takibine başlayın
              </p>
            </div>

            <div className={`text-center relative z-10 transform transition-all duration-500 hover:scale-105 md:mt-12 ${howItWorksVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '300ms' }}>
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6 shadow-lg shadow-indigo-300/30 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative z-10">2</span>
                {/* Ripple effect */}
                <div className="absolute inset-0 scale-0 rounded-full bg-white/30 group-hover:scale-150 group-hover:opacity-0 transition-all duration-1000"></div>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">
                Anketleri Doldurun
              </h4>
              <p className="text-gray-600 px-4">
                Günlük sağlık anketlerinizi doldurarak durumunuzu kaydedin
              </p>
            </div>

            <div className={`text-center relative z-10 transform transition-all duration-500 hover:scale-105 ${howItWorksVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '450ms' }}>
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6 shadow-lg shadow-purple-300/30 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative z-10">3</span>
                {/* Ripple effect */}
                <div className="absolute inset-0 scale-0 rounded-full bg-white/30 group-hover:scale-150 group-hover:opacity-0 transition-all duration-1000"></div>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">
                İlerlemenizi İzleyin
              </h4>
              <p className="text-gray-600 px-4">
                Detaylı raporlarla gelişiminizi takip edin ve hedeflerinize ulaşın
              </p>
            </div>
          </div>
          
          {/* Interactive Demo - NEW */}
          <div className={`mt-20 bg-white/60 backdrop-blur-sm rounded-2xl overflow-hidden shadow-xl border border-white/40 transition-all duration-1000 ${howItWorksVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`} style={{ transitionDelay: '600ms' }}>
            <div className="bg-indigo-600 p-4 text-white flex justify-between items-center">
              <div className="flex space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
              <div className="text-sm font-medium">HealtWave Demo</div>
              <div></div>
            </div>
            
            <div className="p-6">
              <div className="flex gap-6 flex-col md:flex-row">
                <div className="flex-1 space-y-4">
                  <div className="h-8 w-3/4 bg-gray-100 rounded"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-100 rounded w-full"></div>
                    <div className="h-4 bg-gray-100 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-100 rounded w-4/6"></div>
                  </div>
                  
                  <div className="mt-6 space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xs">✓</div>
                      <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xs">✓</div>
                      <div className="h-4 bg-gray-100 rounded w-2/3"></div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs">→</div>
                      <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 bg-gray-50 rounded-xl p-4">
                  <div className="h-32 bg-indigo-50 rounded-lg mb-4 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-indigo-500 glow-animation"></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="h-10 bg-indigo-500 rounded"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex justify-center">
                <button 
                  onClick={() => router.push('/register')}
                  className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors duration-300 shadow flex items-center gap-2"
                >
                  <span>Gerçek Demo İzle</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section ref={ctaRef} className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-indigo-600/5"></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className={`bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-12 text-white shadow-xl shadow-indigo-300/20 transform transition-all duration-1000 ${ctaVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-95'}`}>
            <div className="absolute inset-0 bg-white opacity-10 rounded-3xl blur-xl"></div>
            
            {/* Animated Particles */}
            <div className="absolute inset-0 overflow-hidden rounded-3xl">
              {[...Array(8)].map((_, i) => (
                <div 
                  key={i}
                  className="absolute w-6 h-6 rounded-full bg-white/10"
                  style={{
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    animation: `floatingDevice ${3 + Math.random() * 5}s ease-in-out infinite`,
                    animationDelay: `${Math.random() * 5}s`
                  }}
                ></div>
              ))}
            </div>
            
            <div className="relative z-10">
              <span className="inline-block py-1 px-3 rounded-full bg-white/20 text-white text-sm font-medium mb-4">
                Sağlıklı Yaşam İçin
              </span>
              <h3 className="text-4xl font-bold mb-4">
                Sağlıklı Yaşama <span className="bg-gradient-to-r from-blue-200 to-purple-200 bg-clip-text text-transparent">Bugün Başlayın</span>
              </h3>
              <p className="text-xl mb-8 opacity-90 max-w-xl mx-auto">
                HealtWave ile sağlığınızı takip edin, gelişiminizi gözlemleyin ve 
                daha iyi bir yaşam kalitesine sahip olun.
              </p>
              <button 
                onClick={() => router.push('/register')}
                className="bg-white text-indigo-600 px-8 py-4 rounded-xl hover:bg-blue-50 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 group ripple-animation"
              >
                <span className="relative inline-flex items-center">
                  Ücretsiz Denemeye Başla
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
              </button>
              
              <div className="mt-6 text-sm opacity-80">
                Kredi kartı gerektirmez. İstediğiniz zaman iptal edebilirsiniz.
              </div>
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 -mt-6 -mr-6 w-24 h-24 bg-purple-500 opacity-20 rounded-full blur-xl"></div>
            <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-32 h-32 bg-blue-500 opacity-20 rounded-full blur-xl"></div>
            
            {/* Corner Pattern */}
            <div className="absolute top-0 left-0 w-20 h-20 overflow-hidden">
              <div className="absolute -top-10 -left-10 w-20 h-20 border-8 border-white/10 rounded-full"></div>
            </div>
            <div className="absolute bottom-0 right-0 w-20 h-20 overflow-hidden">
              <div className="absolute -bottom-10 -right-10 w-20 h-20 border-8 border-white/10 rounded-full"></div>
            </div>
          </div>
          
          {/* Testimonial - NEW */}
          <div className={`mt-12 bg-white rounded-2xl p-8 border border-gray-100 shadow-lg transform transition-all duration-700 ${ctaVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '300ms' }}>
            <div className="flex items-center mb-4">
              <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center mr-4">
                <div className="text-2xl">👨‍⚕️</div>
              </div>
              <div>
                <div className="font-semibold text-gray-900">Dr. Mehmet Yılmaz</div>
                <div className="text-sm text-gray-600">Sağlık Uzmanı</div>
              </div>
            </div>
            <p className="text-gray-700 italic">
              "HealtWave, hastaların günlük sağlık durumlarını takip etmelerine yardımcı olan en etkili platformlardan biri. 
              Özellikle terapi frekansları ve kişiselleştirilmiş raporları çok faydalı buluyorum."
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 to-indigo-950 text-white py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:20px_20px]"></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-4">
                <div className="w-50 h-50 flex items-center justify-center">
                  <Image 
                    src="/healtwave_logo.svg" 
                    alt="HealtWave Logo" 
                    width={256}
                    height={128}
                    className="drop-shadow-lg hover:scale-105 transition-transform duration-200"
                    priority
                  />
                </div>
              </div>
              <p className="text-gray-300 mb-6 max-w-md leading-relaxed">
                Sağlığınızı takip etmenin en modern ve etkili yolu. 
                Yapay zeka destekli teknoloji ile daha sağlıklı bir yaşam için yanınızdayız.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer">
                  <span className="text-blue-300">📧</span>
                </div>
                <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer">
                  <span className="text-blue-300">�</span>
                </div>
                <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer">
                  <span className="text-blue-300">🌐</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-5 text-lg text-indigo-300">Özellikler</h4>
              <ul className="space-y-3 text-gray-300">
                <li>
                  <Link href="/surveys" className="hover:text-white transition-colors relative group flex items-center">
                    <span className="absolute -left-3 top-1/2 transform -translate-y-1/2 w-0 h-0.5 bg-indigo-400 group-hover:w-2 transition-all duration-300"></span>
                    Sağlık Anketleri
                  </Link>
                </li>
                <li>
                  <Link href="/sessions" className="hover:text-white transition-colors relative group flex items-center">
                    <span className="absolute -left-3 top-1/2 transform -translate-y-1/2 w-0 h-0.5 bg-indigo-400 group-hover:w-2 transition-all duration-300"></span>
                    Terapi Müzikleri
                  </Link>
                </li>
                <li>
                  <Link href="/reports" className="hover:text-white transition-colors relative group flex items-center">
                    <span className="absolute -left-3 top-1/2 transform -translate-y-1/2 w-0 h-0.5 bg-indigo-400 group-hover:w-2 transition-all duration-300"></span>
                    Raporlar
                  </Link>
                </li>
                <li>
                  <Link href="/chat" className="hover:text-white transition-colors relative group flex items-center">
                    <span className="absolute -left-3 top-1/2 transform -translate-y-1/2 w-0 h-0.5 bg-indigo-400 group-hover:w-2 transition-all duration-300"></span>
                    AI Chat
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-5 text-lg text-indigo-300">Hesap</h4>
              <ul className="space-y-3 text-gray-300">
                <li>
                  <Link href="/login" className="hover:text-white transition-colors relative group flex items-center">
                    <span className="absolute -left-3 top-1/2 transform -translate-y-1/2 w-0 h-0.5 bg-indigo-400 group-hover:w-2 transition-all duration-300"></span>
                    Giriş Yap
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="hover:text-white transition-colors relative group flex items-center">
                    <span className="absolute -left-3 top-1/2 transform -translate-y-1/2 w-0 h-0.5 bg-indigo-400 group-hover:w-2 transition-all duration-300"></span>
                    Üye Ol
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-white transition-colors relative group flex items-center">
                    <span className="absolute -left-3 top-1/2 transform -translate-y-1/2 w-0 h-0.5 bg-indigo-400 group-hover:w-2 transition-all duration-300"></span>
                    Dashboard
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 HealtWave. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
