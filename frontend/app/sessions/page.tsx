"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

interface Frequency {
  id: number;
  name: string;
  frequency_hz: number;
  description: string;
  category?: string;
}

interface Session {
  id: number;
  frequency: number; // This is just the frequency ID
  frequency_name: string; // This comes from the backend
  duration_seconds: number;
  duration_formatted: string;
  listened_at: string;
  listened_at_formatted: string;
  completed: boolean;
  rating: number;
  user_name: string;
  user: number;
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [frequencies, setFrequencies] = useState<Frequency[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSession, setCurrentSession] = useState<any>(null);
  const [timer, setTimer] = useState(0);
  const [darkMode, setDarkMode] = useState(false);
  const [selectedFrequency, setSelectedFrequency] = useState<Frequency | null>(null);
  const [showFrequencyDetail, setShowFrequencyDetail] = useState(false);
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    frequency: 1,
    duration: 900, // 15 minutes default
    completed: false,
    rating: 5
  });
  const [message, setMessage] = useState("");
  const router = useRouter();

  // Audio cleanup function
  const cleanupAudio = useCallback((audio: HTMLAudioElement) => {
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      
      // Blob URL'yi temizle
      if (audio.src && audio.src.startsWith('blob:')) {
        URL.revokeObjectURL(audio.src);
      }
      
      // Src'yi temizle ve yeniden yükle
      audio.src = '';
      audio.load();
      
      // Event listener'ları temizle
      audio.onloadstart = null;
      audio.oncanplay = null;
      audio.onerror = null;
      audio.onended = null;
      audio.onplay = null;
      audio.onpause = null;
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
      return;
    }
    
    // Dark mode tercihini kontrol et
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(savedDarkMode);
    
    fetchData();

    // Cleanup function for component unmount
    return () => {
      if (audioRef) {
        cleanupAudio(audioRef);
      }
    };
  }, [router, cleanupAudio]); // cleanupAudio'yu dependency'e ekledim

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => {
      clearInterval(interval);
      // Sayfa kapanırken audio'yu temizle
      if (audioRef) {
        cleanupAudio(audioRef);
      }
    };
  }, [isPlaying, audioRef, cleanupAudio]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      const [sessionsRes, frequenciesRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/sessions/`, { headers }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/frequencies/`, { headers })
      ]);

      setSessions(sessionsRes.data.results || sessionsRes.data);
      setFrequencies(frequenciesRes.data.results || frequenciesRes.data);
    } catch (error: any) {
      console.error("Data fetch error:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("access_token");
        router.push("/login");
      } else {
        setMessage("❌ Veriler yüklenirken bir hata oluştu.");
      }
    } finally {
      setLoading(false);
    }
  };

  const startSession = async (frequencyId: number, duration: number) => {
    try {
      // Önce frekans bilgisini al
      const selectedFreq = frequencies.find(f => f.id === frequencyId);
      if (!selectedFreq) {
        setMessage("❌ Seçilen frekans bulunamadı.");
        return;
      }

      // Session'ı başlat
      setCurrentSession({ frequency: frequencyId, duration, startTime: Date.now() });
      setTimer(0);
      setShowForm(false);
      setAudioError(null);

      // MP3 dosyasını çalmaya çalış
      const token = localStorage.getItem("access_token");
      const audioUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/frequencies/${frequencyId}/stream/`;
      
      // Yeni audio element oluştur
      const audio = new Audio();
      audio.preload = 'auto';
      audio.loop = true; // Sürekli çalsın
      audio.volume = 0.7; // Ses seviyesi
      
      // Audio event listeners
      audio.onloadstart = () => {
        setMessage("🎵 Ses dosyası yükleniyor...");
      };
      
      audio.oncanplay = () => {
        setMessage("🎵 Terapötik seans başladı!");
        setIsPlaying(true);
        audio.play().catch(error => {
          console.error("Audio play error:", error);
          setAudioError("Ses çalınamadı. Tarayıcı ayarlarını kontrol edin.");
          setMessage("⚠️ Ses çalınamadı, sessiz mod devam ediyor.");
        });
      };
      
      audio.onerror = () => {
        console.error("Audio load error");
        setAudioError("Ses dosyası yüklenemedi.");
        setMessage("⚠️ Ses dosyası bulunamadı, sessiz mod devam ediyor.");
        setIsPlaying(true); // Sessiz modda devam et
      };

      // Authorization header için fetch ile blob al
      try {
        const response = await fetch(audioUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
        
        if (response.ok) {
          const blob = await response.blob();
          const audioObjectUrl = URL.createObjectURL(blob);
          audio.src = audioObjectUrl;
          setAudioRef(audio);
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        console.error("Audio fetch error:", error);
        setAudioError("Ses dosyasına erişilemedi.");
        setMessage("⚠️ Ses dosyasına erişilemedi, sessiz mod devam ediyor.");
        setIsPlaying(true); // Sessiz modda devam et
      }
      
    } catch (error) {
      console.error("Session start error:", error);
      setMessage("❌ Seans başlatılırken bir hata oluştu.");
    }
  };

  const stopSession = async () => {
    if (!currentSession) return;

    // Audio'yu tamamen durdur ve temizle
    if (audioRef) {
      cleanupAudio(audioRef);
      setAudioRef(null);
    }

    const actualDuration = timer;
    const completed = timer >= (currentSession.duration * 0.8); // %80 tamamlandıysa completed

    try {
      const token = localStorage.getItem("access_token");
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/sessions/`, {
        frequency: currentSession.frequency,
        duration_seconds: actualDuration,
        completed: completed,
        rating: formData.rating
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      setMessage(completed ? "✅ Seans başarıyla tamamlandı!" : "⏸️ Seans durduruldu ve kaydedildi.");
      setIsPlaying(false);
      setCurrentSession(null);
      setTimer(0);
      setAudioError(null);
      fetchData();
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(""), 3000);
    } catch (error: any) {
      console.error("Session save error:", error);
      setMessage("❌ Seans kaydedilirken bir hata oluştu.");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("darkMode", newDarkMode.toString());
  };

  const toggleAudio = () => {
    if (audioRef) {
      if (audioRef.paused) {
        audioRef.play().catch(error => {
          console.error("Audio play error:", error);
          setAudioError("Ses çalınamadı.");
        });
      } else {
        audioRef.pause();
      }
    }
  };

  const adjustVolume = (volume: number) => {
    if (audioRef) {
      audioRef.volume = Math.max(0, Math.min(1, volume));
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}s ${minutes}dk`;
    }
    return `${minutes}dk`;
  };

  const getFrequencyIcon = (frequency_hz: number) => {
    if (frequency_hz <= 100) return "🔴"; // Düşük frekanslar - Kırmızı
    if (frequency_hz <= 300) return "🟠"; // Orta-düşük frekanslar - Turuncu  
    if (frequency_hz <= 500) return "🟡"; // Orta frekanslar - Sarı
    if (frequency_hz <= 700) return "🟢"; // Orta-yüksek frekanslar - Yeşil
    if (frequency_hz <= 900) return "🔵"; // Yüksek frekanslar - Mavi
    return "🟣"; // Çok yüksek frekanslar - Mor
  };

  const getFrequencyColor = (frequency_hz: number) => {
    if (frequency_hz <= 100) return "from-red-400 to-red-600";
    if (frequency_hz <= 300) return "from-orange-400 to-orange-600";
    if (frequency_hz <= 500) return "from-yellow-400 to-yellow-600";
    if (frequency_hz <= 700) return "from-green-400 to-green-600";
    if (frequency_hz <= 900) return "from-blue-400 to-blue-600";
    return "from-purple-400 to-purple-600";
  };

  const getSessionStats = () => {
    const totalSessions = sessions.length;
    const completedSessions = sessions.filter(s => s.completed).length;
    const totalDuration = sessions.reduce((acc, s) => acc + s.duration_seconds, 0);
    const averageRating = sessions.length > 0 
      ? (sessions.reduce((acc, s) => acc + s.rating, 0) / sessions.length).toFixed(1)
      : 0;
    
    return { totalSessions, completedSessions, totalDuration, averageRating };
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 8) return darkMode ? "text-green-400 bg-green-900/20" : "text-green-600 bg-green-100";
    if (rating >= 6) return darkMode ? "text-yellow-400 bg-yellow-900/20" : "text-yellow-600 bg-yellow-100";
    if (rating >= 4) return darkMode ? "text-orange-400 bg-orange-900/20" : "text-orange-600 bg-orange-100";
    return darkMode ? "text-red-400 bg-red-900/20" : "text-red-600 bg-red-100";
  };

  if (loading) {
    return (
      <div className={`flex justify-center items-center min-h-screen transition-all duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100'}`}>
        <div className="text-center">
          <div className="relative">
            <svg className="w-16 h-16 animate-spin text-indigo-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <div className="absolute inset-0 w-16 h-16 bg-indigo-200 rounded-full animate-ping opacity-20 mx-auto"></div>
          </div>
          <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Terapötik seanslar yükleniyor...</p>
          <div className="mt-4 flex justify-center space-x-1">
            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce animate-delay-100"></div>
            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce animate-delay-200"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-all duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'}`}>
      {/* Header */}
      <header className={`backdrop-blur-sm border-b sticky top-0 z-50 transition-all duration-300 ${darkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white/80 border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push("/dashboard")}
                className={`p-2 rounded-lg transition-colors duration-200 ${darkMode ? 'text-gray-300 hover:text-blue-400 hover:bg-gray-700' : 'text-gray-500 hover:text-blue-600 hover:bg-gray-100'}`}
                title="Dashboard'a Dön"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                </div>
                <div>
                  <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Terapötik Müzik Seansları</h1>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Frekans terapisi ile iyileşin</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg transition-colors duration-200 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                title={darkMode ? "Açık tema" : "Koyu tema"}
              >
                {darkMode ? (
                  <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>

              {!isPlaying && (
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.01M15 10h1.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Yeni Seans</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {message && (
          <div className={`mb-6 p-4 rounded-xl border animate-slideInUp backdrop-blur-sm ${
            message.includes('✅') || message.includes('🎵')
              ? `${darkMode ? 'bg-green-900/20 text-green-300 border-green-700' : 'bg-green-100 text-green-800 border-green-200'}` 
              : message.includes('⏸️')
              ? `${darkMode ? 'bg-yellow-900/20 text-yellow-300 border-yellow-700' : 'bg-yellow-100 text-yellow-800 border-yellow-200'}`
              : `${darkMode ? 'bg-red-900/20 text-red-300 border-red-700' : 'bg-red-100 text-red-800 border-red-200'}`
          }`}>
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {message.includes('✅') || message.includes('🎵') ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                )}
              </svg>
              <span>{message}</span>
            </div>
          </div>
        )}

        {/* Stats Summary */}
        {sessions.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {(() => {
              const stats = getSessionStats();
              return (
                <>
                  <div className={`backdrop-blur-sm rounded-2xl p-6 border shadow-lg hover:shadow-xl transition-all duration-300 ${darkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white/80 border-white/20'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Toplam Seans</p>
                        <p className="text-2xl font-bold text-indigo-600">{stats.totalSessions}</p>
                      </div>
                      <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className={`backdrop-blur-sm rounded-2xl p-6 border shadow-lg hover:shadow-xl transition-all duration-300 ${darkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white/80 border-white/20'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Tamamlanan</p>
                        <p className="text-2xl font-bold text-green-600">{stats.completedSessions}</p>
                      </div>
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className={`backdrop-blur-sm rounded-2xl p-6 border shadow-lg hover:shadow-xl transition-all duration-300 ${darkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white/80 border-white/20'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Toplam Süre</p>
                        <p className="text-2xl font-bold text-purple-600">{formatDuration(stats.totalDuration)}</p>
                      </div>
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className={`backdrop-blur-sm rounded-2xl p-6 border shadow-lg hover:shadow-xl transition-all duration-300 ${darkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white/80 border-white/20'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Ortalama Puan</p>
                        <p className="text-2xl font-bold text-orange-600">{stats.averageRating}/10</p>
                      </div>
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {/* Current Session */}
        {isPlaying && currentSession && (
          <div className={`mb-8 backdrop-blur-sm rounded-3xl p-8 border shadow-2xl animate-scaleIn ${darkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white/80 border-white/20'}`}>
            <div className="text-center">
              <div className={`w-32 h-32 mx-auto mb-6 bg-gradient-to-r ${getFrequencyColor(frequencies.find(f => f.id === currentSession.frequency)?.frequency_hz || 440)} rounded-full flex items-center justify-center animate-pulse shadow-lg`}>
                <div className="text-4xl">
                  {getFrequencyIcon(frequencies.find(f => f.id === currentSession.frequency)?.frequency_hz || 440)}
                </div>
              </div>
              
              <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                🎵 Terapötik Seans Aktif
              </h2>
              <p className={`mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {frequencies.find(f => f.id === currentSession.frequency)?.name || "Bilinmeyen Frekans"}
              </p>
              <p className={`text-sm mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {frequencies.find(f => f.id === currentSession.frequency)?.frequency_hz || 0} Hz
              </p>

              {/* Audio Error Display */}
              {audioError && (
                <div className={`mb-4 p-3 rounded-lg ${darkMode ? 'bg-yellow-900/20 text-yellow-400' : 'bg-yellow-100 text-yellow-800'}`}>
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm">{audioError}</span>
                  </div>
                </div>
              )}

              {/* Audio Controls */}
              {audioRef && !audioError && (
                <div className={`mb-6 p-4 rounded-xl ${darkMode ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                  <div className="flex items-center justify-center space-x-4 mb-3">
                    <button
                      onClick={toggleAudio}
                      className={`p-2 rounded-lg transition-colors duration-200 ${darkMode ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-white hover:bg-gray-50 text-gray-700 shadow'}`}
                    >
                      {audioRef.paused ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.01M15 10h1.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6l5-3-5-3zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </button>
                    
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728" />
                      </svg>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        defaultValue="0.7"
                        onChange={(e) => adjustVolume(Number(e.target.value))}
                        className="w-20"
                      />
                    </div>
                  </div>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {audioRef.paused ? '⏸️ Ses duraklatıldı' : '🔊 Ses çalıyor'}
                  </p>
                </div>
              )}
              
              <div className="space-y-4 mb-6">
                <div className={`text-5xl font-mono font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                  {formatTime(timer)}
                </div>
                
                <div className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Hedef: {formatTime(currentSession.duration)}
                </div>
              </div>
              
              <div className={`w-full rounded-full h-4 mb-8 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                <div 
                  className={`bg-gradient-to-r from-green-400 to-blue-500 h-4 rounded-full transition-all duration-300 shadow-md`}
                  style={{ width: `${Math.min((timer / currentSession.duration) * 100, 100)}%` }}
                ></div>
              </div>
              
              <div className="flex justify-center space-x-4">
                <button
                  onClick={stopSession}
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-8 py-3 rounded-xl transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9h6v6H9z" />
                  </svg>
                  <span>Seansı Bitir</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Sessions History */}
        {sessions.length > 0 ? (
          <div>
            <h2 className={`text-xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Geçmiş Seanslar</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sessions.map((session, index) => {
                // Find the frequency details from the frequencies array
                const frequency = frequencies.find(f => f.id === session.frequency);
                
                return (
                <div 
                  key={session.id} 
                  className={`backdrop-blur-sm rounded-2xl p-6 border shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 animate-scaleIn cursor-pointer group ${darkMode ? 'bg-gray-800/80 border-gray-700 hover:bg-gray-700/90' : 'bg-white/80 border-white/20 hover:bg-white/90'}`}
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => {
                    if (frequency) {
                      setSelectedFrequency(frequency);
                      setShowFrequencyDetail(true);
                    }
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 bg-gradient-to-r ${getFrequencyColor(frequency?.frequency_hz || 440)} rounded-xl flex items-center justify-center shadow-lg`}>
                        <span className="text-lg">
                          {getFrequencyIcon(frequency?.frequency_hz || 440)}
                        </span>
                      </div>
                      <div>
                        <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {session.frequency_name || frequency?.name || "Bilinmeyen Frekans"}
                        </h3>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {frequency?.frequency_hz || 0} Hz
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {session.completed && (
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                      <div className="flex items-center space-x-1 text-gray-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col">
                        <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Süre</span>
                        <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                          {session.duration_formatted || formatDuration(session.duration_seconds)}
                        </span>
                      </div>
                      
                      <div className="flex flex-col">
                        <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Durum</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          session.completed 
                            ? (darkMode ? 'bg-green-900/20 text-green-400' : 'bg-green-100 text-green-800')
                            : (darkMode ? 'bg-yellow-900/20 text-yellow-400' : 'bg-yellow-100 text-yellow-800')
                        }`}>
                          {session.completed ? 'Tamamlandı' : 'Yarım Kaldı'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Değerlendirme</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getRatingColor(session.rating)}`}>
                        ⭐ {session.rating}/10
                      </span>
                    </div>
                  </div>

                  <div className={`mt-4 pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex items-center justify-between">
                      <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        {session.listened_at_formatted || new Date(session.listened_at).toLocaleDateString('tr-TR', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      {frequency?.category && (
                        <span className={`px-2 py-1 rounded-full text-xs ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                          {frequency.category}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
          </div>
        ) : !isPlaying && (
          <div className="text-center py-16">
            <div className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <svg className={`w-12 h-12 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
            <h3 className={`text-lg font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Henüz terapötik seans bulunmuyor
            </h3>
            <p className={`mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              İlk frekans terapisi seansınızı başlatarak iyileşme yolculuğunuza adım atın!
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              İlk Seansı Başlat
            </button>
          </div>
        )}
      </main>

      {/* Session Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className={`rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13" />
                    </svg>
                  </div>
                  <div>
                    <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Yeni Terapötik Seans</h2>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Frekans ve süre seçimi yapın</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowForm(false)}
                  className={`p-2 rounded-lg transition-colors duration-200 ${darkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-8">
              {/* Frequency Selection */}
              <div>
                <label className={`block text-sm font-semibold mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  🎵 Terapötik Frekans Seçin
                </label>
                <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto">
                  {frequencies.map((freq) => (
                    <label 
                      key={freq.id} 
                      className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all duration-200 hover:scale-105 ${
                        formData.frequency === freq.id 
                          ? (darkMode ? 'border-indigo-500 bg-indigo-900/20' : 'border-indigo-500 bg-indigo-50')
                          : (darkMode ? 'border-gray-600 hover:border-gray-500 hover:bg-gray-700/50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50')
                      }`}
                    >
                      <input
                        type="radio"
                        name="frequency"
                        value={freq.id}
                        checked={formData.frequency === freq.id}
                        onChange={(e) => setFormData(prev => ({ ...prev, frequency: Number(e.target.value) }))}
                        className="sr-only"
                      />
                      <div className={`w-12 h-12 bg-gradient-to-r ${getFrequencyColor(freq.frequency_hz)} rounded-xl flex items-center justify-center mr-4 shadow-lg`}>
                        <span className="text-lg">
                          {getFrequencyIcon(freq.frequency_hz)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {freq.name}
                        </div>
                        <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {freq.frequency_hz} Hz
                        </div>
                        <div className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                          {freq.description}
                        </div>
                      </div>
                      {formData.frequency === freq.id && (
                        <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {/* Duration Selection */}
              <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-indigo-900/10 border-indigo-700/30' : 'bg-indigo-50 border-indigo-200'}`}>
                <label className={`block text-sm font-semibold mb-4 ${darkMode ? 'text-indigo-300' : 'text-indigo-800'}`}>
                  ⏱️ Seans Süresi
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { value: 300, label: "5 dk", desc: "Hızlı" },
                    { value: 600, label: "10 dk", desc: "Kısa" },
                    { value: 900, label: "15 dk", desc: "Önerilen" },
                    { value: 1200, label: "20 dk", desc: "Orta" },
                    { value: 1800, label: "30 dk", desc: "Uzun" },
                    { value: 3600, label: "60 dk", desc: "Derin" }
                  ].map((duration) => (
                    <button
                      key={duration.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, duration: duration.value }))}
                      className={`p-4 rounded-xl border transition-all duration-200 text-center ${
                        formData.duration === duration.value
                          ? (darkMode ? 'border-indigo-400 bg-indigo-800/50 text-indigo-300' : 'border-indigo-500 bg-indigo-100 text-indigo-800')
                          : (darkMode ? 'border-gray-600 text-gray-300 hover:border-gray-500 hover:bg-gray-700/50' : 'border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50')
                      }`}
                    >
                      <div className="text-lg font-bold">{duration.label}</div>
                      <div className="text-xs opacity-70">{duration.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowForm(false)}
                  className={`px-8 py-3 border rounded-xl transition-all duration-200 hover:scale-105 ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                >
                  İptal
                </button>
                <button
                  onClick={() => startSession(formData.frequency, formData.duration)}
                  className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.01M15 10h1.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Seansı Başlat</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Frequency Detail Modal */}
      {showFrequencyDetail && selectedFrequency && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className={`rounded-3xl shadow-2xl max-w-md w-full animate-scaleIn ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 bg-gradient-to-r ${getFrequencyColor(selectedFrequency.frequency_hz)} rounded-xl flex items-center justify-center`}>
                    <span className="text-xl">
                      {getFrequencyIcon(selectedFrequency.frequency_hz)}
                    </span>
                  </div>
                  <div>
                    <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {selectedFrequency.name}
                    </h2>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {selectedFrequency.frequency_hz} Hz
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowFrequencyDetail(false)}
                  className={`p-2 rounded-lg transition-colors duration-200 ${darkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className={`p-4 rounded-xl mb-4 ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {selectedFrequency.description}
                </p>
              </div>
              
              {selectedFrequency.category && (
                <div className="mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm ${darkMode ? 'bg-indigo-900/20 text-indigo-400' : 'bg-indigo-100 text-indigo-800'}`}>
                    {selectedFrequency.category}
                  </span>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setFormData(prev => ({ ...prev, frequency: selectedFrequency.id }));
                    setShowFrequencyDetail(false);
                    setShowForm(true);
                  }}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg transition-all duration-200"
                >
                  Bu Frekansla Seans Başlat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
