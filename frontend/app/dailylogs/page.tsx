"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import axios from "axios";

interface Dailylog {
  id: number;
  note: string;
  stress: number;
  sleep_duration: number;
  restfulness: number;
  pulse: number;
  focus: number;
  mood: string;
  physical_activity: string;
  created_at: string;
  date: string;
  overall_wellness_score: number;
  sleep_quality: string;
}

export default function DailylogsPage() {
  const [Dailylogs, setDailylogs] = useState<Dailylog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [selectedLog, setSelectedLog] = useState<Dailylog | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [formData, setFormData] = useState({
    note: "",
    stress: 5,
    sleep_duration: 8,
    restfulness: 5,
    pulse: 70,
    focus: 5,
    mood: "",
    physical_activity: ""
  });
  const [message, setMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
      return;
    }
    
    // Dark mode tercihini kontrol et
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(savedDarkMode);
    
    fetchDailylogs();
  }, [router]);

  const fetchDailylogs = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/dailylogs/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      setDailylogs(response.data.results || response.data);
    } catch (error: any) {
      console.error("Dailylogs fetch error:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("access_token");
        router.push("/login");
      } else {
        setMessage("❌ Anketler yüklenirken bir hata oluştu.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("access_token");
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/dailylogs/`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      setMessage("✅ Günlük kayıt başarıyla oluşturuldu!");
      setShowForm(false);
      setFormData({
        note: "",
        stress: 5,
        sleep_duration: 8,
        restfulness: 5,
        pulse: 70,
        focus: 5,
        mood: "",
        physical_activity: ""
      });
      fetchDailylogs();
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(""), 3000);
    } catch (error: any) {
      console.error("Dailylog create error:", error);
      setMessage("❌ Günlük kayıt oluşturulurken bir hata oluştu.");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("darkMode", newDarkMode.toString());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['stress', 'sleep_duration', 'restfulness', 'pulse', 'focus'].includes(name) ? Number(value) : value
    }));
  };

  const getStressColor = (level: number) => {
    if (level <= 3) return "text-green-600 bg-green-100 border-green-200";
    if (level <= 6) return "text-yellow-600 bg-yellow-100 border-yellow-200";
    return "text-red-600 bg-red-100 border-red-200";
  };

  const getWellnessColor = (score: number) => {
    if (score >= 8) return "text-emerald-600 bg-emerald-50";
    if (score >= 6) return "text-blue-600 bg-blue-50";
    if (score >= 4) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const getSleepQualityColor = (quality: string) => {
    switch (quality) {
      case "Optimal": return "text-green-600 bg-green-50";
      case "İyi": return "text-blue-600 bg-blue-50";
      case "Kısa": return "text-yellow-600 bg-yellow-50";
      case "Yetersiz": return "text-red-600 bg-red-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className={`flex justify-center items-center min-h-screen transition-all duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100'}`}>
        <div className="text-center">
          <div className="relative">
            <svg className="w-16 h-16 animate-spin text-blue-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <div className="absolute inset-0 w-16 h-16 bg-blue-200 rounded-full animate-ping opacity-20 mx-auto"></div>
          </div>
          <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Günlük kayıtlar yükleniyor...</p>
          <div className="mt-4 flex justify-center space-x-1">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce animate-delay-100"></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce animate-delay-200"></div>
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
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Günlük Sağlık Kayıtları</h1>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Sağlığınızı takip edin</p>
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

              <button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Yeni Kayıt</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {message && (
          <div className={`mb-6 p-4 rounded-xl border animate-slideInUp backdrop-blur-sm ${
            message.includes('✅') 
              ? `${darkMode ? 'bg-green-900/20 text-green-300 border-green-700' : 'bg-green-100 text-green-800 border-green-200'}` 
              : `${darkMode ? 'bg-red-900/20 text-red-300 border-red-700' : 'bg-red-100 text-red-800 border-red-200'}`
          }`}>
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {message.includes('✅') ? (
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
        {Dailylogs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className={`backdrop-blur-sm rounded-2xl p-6 border shadow-lg hover:shadow-xl transition-all duration-300 ${darkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white/80 border-white/20'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Toplam Kayıt</p>
                  <p className="text-2xl font-bold text-blue-600">{Dailylogs.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
            </div>

            <div className={`backdrop-blur-sm rounded-2xl p-6 border shadow-lg hover:shadow-xl transition-all duration-300 ${darkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white/80 border-white/20'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Ortalama Wellness</p>
                  <p className="text-2xl font-bold text-green-600">
                    {Dailylogs.length > 0 ? (Dailylogs.reduce((acc, log) => acc + (log.overall_wellness_score || 0), 0) / Dailylogs.length).toFixed(1) : 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className={`backdrop-blur-sm rounded-2xl p-6 border shadow-lg hover:shadow-xl transition-all duration-300 ${darkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white/80 border-white/20'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Ortalama Uyku</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {Dailylogs.length > 0 ? (Dailylogs.reduce((acc, log) => acc + log.sleep_duration, 0) / Dailylogs.length).toFixed(1) : 0}s
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className={`backdrop-blur-sm rounded-2xl p-6 border shadow-lg hover:shadow-xl transition-all duration-300 ${darkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white/80 border-white/20'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Ortalama Stres</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {Dailylogs.length > 0 ? (Dailylogs.reduce((acc, log) => acc + log.stress, 0) / Dailylogs.length).toFixed(1) : 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dailylogs Grid */}
        {Dailylogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Dailylogs.map((dailylog, index) => (
              <div 
                key={dailylog.id} 
                onClick={() => {
                  setSelectedLog(dailylog);
                  setShowDetail(true);
                }}
                className={`backdrop-blur-sm rounded-2xl p-6 border shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 animate-scaleIn cursor-pointer group ${darkMode ? 'bg-gray-800/80 border-gray-700 hover:bg-gray-700/90' : 'bg-white/80 border-white/20 hover:bg-white/90'}`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getWellnessColor(dailylog.overall_wellness_score || 0)}`}>
                      Wellness: {dailylog.overall_wellness_score || 0}/10
                    </span>
                    <div className="flex items-center space-x-1 text-gray-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                  <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {formatDate(dailylog.date || dailylog.created_at)}
                  </h3>
                  {dailylog.note && (
                    <p className={`text-sm line-clamp-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {dailylog.note}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex justify-between items-center">
                      <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Stres</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStressColor(dailylog.stress)}`}>
                        {dailylog.stress}/10
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Uyku</span>
                      <span className={`text-xs font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                        {dailylog.sleep_duration}s
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Dinlenme</span>
                      <span className={`text-xs font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                        {dailylog.restfulness}/10
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Nabız</span>
                      <span className={`text-xs font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                        {dailylog.pulse} bpm
                      </span>
                    </div>
                  </div>
                  
                  {dailylog.mood && (
                    <div className={`mt-3 p-2 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">😊</span>
                        <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {dailylog.mood}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className={`mt-4 pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex items-center justify-between">
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      {formatTime(dailylog.created_at)}
                    </p>
                    {dailylog.sleep_quality && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSleepQualityColor(dailylog.sleep_quality)}`}>
                        {dailylog.sleep_quality}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <svg className={`w-12 h-12 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <h3 className={`text-lg font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Henüz günlük kayıt bulunmuyor
            </h3>
            <p className={`mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              İlk sağlık kaydınızı oluşturarak sağlığınızı takip etmeye başlayın!
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              İlk Kaydı Oluştur
            </button>
          </div>
        )}
      </main>

      {/* Dailylog Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className={`rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <div>
                    <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Günlük Sağlık Kaydı</h2>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Bugünkü sağlık durumunuzu kaydedin</p>
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

            <form onSubmit={handleSubmit} className="p-6 space-y-8">
              {/* Note Section */}
              <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-gray-700/30 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                <label className={`block text-sm font-semibold mb-3 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  📝 Günlük Notlarınız
                </label>
                <textarea
                  name="note"
                  value={formData.note}
                  onChange={handleInputChange}
                  rows={4}
                  className={`w-full p-4 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${darkMode ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
                  placeholder="Bugünkü genel durumunuzu, hissettiklerinizi ve önemli notlarınızı buraya yazabilirsiniz..."
                />
              </div>

              {/* Health Metrics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Mental Health */}
                <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-purple-900/10 border-purple-700/30' : 'bg-purple-50 border-purple-200'}`}>
                  <h3 className={`text-lg font-semibold mb-4 flex items-center ${darkMode ? 'text-purple-300' : 'text-purple-800'}`}>
                    🧠 Zihinsel Sağlık
                  </h3>
                  
                  <div className="space-y-6">
                    <div>
                      <label className={`block text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Stres Seviyesi: <span className="font-bold text-lg">{formData.stress}/10</span>
                      </label>
                      <input
                        type="range"
                        name="stress"
                        min="1"
                        max="10"
                        value={formData.stress}
                        onChange={handleInputChange}
                        className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-purple"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Çok Düşük</span>
                        <span>Orta</span>
                        <span>Çok Yüksek</span>
                      </div>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Odaklanma Seviyesi: <span className="font-bold text-lg">{formData.focus}/10</span>
                      </label>
                      <input
                        type="range"
                        name="focus"
                        min="1"
                        max="10"
                        value={formData.focus}
                        onChange={handleInputChange}
                        className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-blue"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Çok Düşük</span>
                        <span>Orta</span>
                        <span>Çok Yüksek</span>
                      </div>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        😊 Ruh Durumu
                      </label>
                      <input
                        type="text"
                        name="mood"
                        value={formData.mood}
                        onChange={handleInputChange}
                        className={`w-full p-4 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 ${darkMode ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
                        placeholder="Örn: Mutlu, enerjik, kaygılı, sakin..."
                      />
                    </div>
                  </div>
                </div>

                {/* Physical Health */}
                <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-green-900/10 border-green-700/30' : 'bg-green-50 border-green-200'}`}>
                  <h3 className={`text-lg font-semibold mb-4 flex items-center ${darkMode ? 'text-green-300' : 'text-green-800'}`}>
                    💪 Fiziksel Sağlık
                  </h3>
                  
                  <div className="space-y-6">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        🌙 Uyku Süresi (saat)
                      </label>
                      <input
                        type="number"
                        name="sleep_duration"
                        value={formData.sleep_duration}
                        onChange={handleInputChange}
                        min="0"
                        max="24"
                        step="0.5"
                        className={`w-full p-4 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 ${darkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Dinlenme Kalitesi: <span className="font-bold text-lg">{formData.restfulness}/10</span>
                      </label>
                      <input
                        type="range"
                        name="restfulness"
                        min="1"
                        max="10"
                        value={formData.restfulness}
                        onChange={handleInputChange}
                        className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-green"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Yorgun</span>
                        <span>Normal</span>
                        <span>Çok Dinlenmiş</span>
                      </div>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        💓 Nabız (bpm)
                      </label>
                      <input
                        type="number"
                        name="pulse"
                        value={formData.pulse}
                        onChange={handleInputChange}
                        min="40"
                        max="200"
                        className={`w-full p-4 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 ${darkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Physical Activity */}
              <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-orange-900/10 border-orange-700/30' : 'bg-orange-50 border-orange-200'}`}>
                <label className={`block text-sm font-semibold mb-3 ${darkMode ? 'text-orange-300' : 'text-orange-800'}`}>
                  🏃‍♂️ Fiziksel Aktiviteler
                </label>
                <textarea
                  name="physical_activity"
                  value={formData.physical_activity}
                  onChange={handleInputChange}
                  rows={3}
                  className={`w-full p-4 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 ${darkMode ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
                  placeholder="Bugün yaptığınız aktiviteler: yürüyüş, koşu, spor salonu, yoga, dans..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className={`px-8 py-3 border rounded-xl transition-all duration-200 hover:scale-105 ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Kaydet</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetail && selectedLog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className={`rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex justify-between items-center">
                <div>
                  <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {formatDate(selectedLog.date || selectedLog.created_at)}
                  </h2>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Saat: {formatTime(selectedLog.created_at)}
                  </p>
                </div>
                <button
                  onClick={() => setShowDetail(false)}
                  className={`p-2 rounded-lg transition-colors duration-200 ${darkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Wellness Score */}
              <div className={`p-4 rounded-xl text-center ${getWellnessColor(selectedLog.overall_wellness_score || 0)}`}>
                <h3 className="text-lg font-bold">Genel Wellness Skoru</h3>
                <p className="text-3xl font-bold">{selectedLog.overall_wellness_score || 0}/10</p>
              </div>

              {/* Note */}
              {selectedLog.note && (
                <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <h4 className={`font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>📝 Notlar</h4>
                  <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{selectedLog.note}</p>
                </div>
              )}

              {/* Health Metrics Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-xl text-center ${darkMode ? 'bg-red-900/20' : 'bg-red-50'}`}>
                  <div className="text-2xl mb-2">😰</div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Stres</p>
                  <p className="text-xl font-bold text-red-600">{selectedLog.stress}/10</p>
                </div>

                <div className={`p-4 rounded-xl text-center ${darkMode ? 'bg-purple-900/20' : 'bg-purple-50'}`}>
                  <div className="text-2xl mb-2">🌙</div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Uyku</p>
                  <p className="text-xl font-bold text-purple-600">{selectedLog.sleep_duration}s</p>
                  <p className={`text-xs mt-1 px-2 py-1 rounded-full ${getSleepQualityColor(selectedLog.sleep_quality)}`}>
                    {selectedLog.sleep_quality}
                  </p>
                </div>

                <div className={`p-4 rounded-xl text-center ${darkMode ? 'bg-green-900/20' : 'bg-green-50'}`}>
                  <div className="text-2xl mb-2">😌</div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Dinlenme</p>
                  <p className="text-xl font-bold text-green-600">{selectedLog.restfulness}/10</p>
                </div>

                <div className={`p-4 rounded-xl text-center ${darkMode ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
                  <div className="text-2xl mb-2">🧠</div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Odaklanma</p>
                  <p className="text-xl font-bold text-blue-600">{selectedLog.focus}/10</p>
                </div>
              </div>

              {/* Additional Info */}
              <div className="space-y-4">
                <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-xl">💓</span>
                    <h4 className={`font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Nabız</h4>
                  </div>
                  <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{selectedLog.pulse} bpm</p>
                </div>

                {selectedLog.mood && (
                  <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-xl">😊</span>
                      <h4 className={`font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Ruh Durumu</h4>
                    </div>
                    <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{selectedLog.mood}</p>
                  </div>
                )}

                {selectedLog.physical_activity && (
                  <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-xl">🏃‍♂️</span>
                      <h4 className={`font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Fiziksel Aktivite</h4>
                    </div>
                    <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{selectedLog.physical_activity}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
