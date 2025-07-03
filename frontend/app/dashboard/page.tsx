"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import axios from "axios";

interface DashboardStats {
  surveys_count: number;
  sessions_count: number;
  reports_count: number;
  chatbot_logs_count: number;
  last_activity: string | null;
  member_since: string;
  total_listening_time: number;
  most_used_frequency: string | null;
}

interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  member_since: string;
  last_login_formatted: string;
  is_active: boolean;
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetchDashboardData();
    
    // Dark mode tercihini kontrol et
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(savedDarkMode);
  }, [router]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      // Fetch dashboard stats and user profile
      const [statsRes, profileRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/dashboard-stats/`, { headers }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/profile/`, { headers })
      ]);

      setStats(statsRes.data);
      setProfile(profileRes.data);
      
      console.log("Dashboard data loaded successfully:", {
        stats: statsRes.data,
        profile: profileRes.data
      });
    } catch (error: any) {
      console.error("Dashboard fetch error:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("access_token");
        router.push("/login");
      } else {
        const errorMsg = error.response?.data?.error || error.response?.data?.detail || "Dashboard verilerini yüklerken bir hata oluştu.";
        setMessage(`❌ ${errorMsg}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    router.push("/login");
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("darkMode", newDarkMode.toString());
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}s ${minutes}dk`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Günaydın";
    if (hour < 18) return "İyi günler";
    return "İyi akşamlar";
  };

  const quickActions = [
    {
      title: "Günlük Sağlık Anketi",
      description: "Sağlık anketinizi doldurun",
      icon: "📋",
      color: "blue",
      bgColor: "bg-blue-50",
      hoverColor: "hover:bg-blue-100",
      iconBg: "bg-blue-600",
      action: () => router.push("/dailylogs")
    },
    {
      title: "Dinleme Başlat",
      description: "Terapi müziği dinleyin",
      icon: "🎵",
      color: "green",
      bgColor: "bg-green-50",
      hoverColor: "hover:bg-green-100",
      iconBg: "bg-green-600",
      action: () => router.push("/sessions")
    },
    {
      title: "Rapor Oluştur",
      description: "İlerleme raporunuzu görün",
      icon: "📊",
      color: "purple",
      bgColor: "bg-purple-50",
      hoverColor: "hover:bg-purple-100",
      iconBg: "bg-purple-600",
      action: () => router.push("/reports")
    },
    {
      title: "Chat Başlat",
      description: "AI destekli sohbet",
      icon: "💬",
      color: "orange",
      bgColor: "bg-orange-50",
      hoverColor: "hover:bg-orange-100",
      iconBg: "bg-orange-600",
      action: () => router.push("/chat")
    }
  ];

  if (loading) {
    return (
      <div className={`flex justify-center items-center min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100'}`}>
        <div className="text-center">
          <div className="relative">
            <svg className="w-16 h-16 animate-spin text-blue-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <div className="absolute inset-0 w-16 h-16 bg-blue-200 rounded-full animate-ping opacity-20 mx-auto"></div>
          </div>
          <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Dashboard yükleniyor...</p>
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

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button
                onClick={() => setNotifications(!notifications)}
                className={`p-2 rounded-lg transition-colors duration-200 relative ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                title="Bildirimler"
              >
                <svg className={`w-5 h-5 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-5a6 6 0 0112 0v5z" />
                </svg>
                {notifications && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                )}
              </button>

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

              {/* Settings */}
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2 rounded-lg transition-colors duration-200 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                title="Ayarlar"
              >
                <svg className={`w-5 h-5 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>

              <div className="text-right">
                <p className={`text-sm font-medium ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                  {profile?.full_name || profile?.username}
                </p>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{profile?.email}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-semibold">
                  {profile?.first_name?.[0] || profile?.username?.[0] || "U"}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className={`transition-colors duration-200 p-2 rounded-lg ${darkMode ? 'text-gray-400 hover:text-red-400 hover:bg-gray-700' : 'text-gray-500 hover:text-red-600 hover:bg-gray-100'}`}
                title="Çıkış Yap"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center animate-fadeIn">
          <div className={`p-6 rounded-2xl shadow-2xl max-w-md w-full mx-4 animate-scaleIn ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Ayarlar</h3>
              <button
                onClick={() => setShowSettings(false)}
                className={`p-2 rounded-lg transition-colors duration-200 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <svg className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Koyu Tema</span>
                <button
                  onClick={toggleDarkMode}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${darkMode ? 'bg-blue-600' : 'bg-gray-200'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${darkMode ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Bildirimler</span>
                <button
                  onClick={() => setNotifications(!notifications)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${notifications ? 'bg-blue-600' : 'bg-gray-200'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${notifications ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {message && (
          <div className={`mb-6 p-4 rounded-xl border animate-slideInUp ${darkMode ? 'bg-red-900/20 text-red-300 border-red-800' : 'bg-red-100 text-red-800 border-red-200'}`}>
            {message}
          </div>
        )}

        {/* Welcome Section */}
        <div className="mb-8 animate-fadeInSlide">
          <h2 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {getGreeting()}, {profile?.first_name || profile?.username}! 👋
          </h2>
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Son giriş: {profile?.last_login_formatted || "İlk giriş"} • 
            Üyelik: {profile?.member_since}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className={`backdrop-blur-sm rounded-2xl p-6 border shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 animate-scaleIn ${darkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white/80 border-white/20'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Anketler</p>
                <p className="text-2xl font-bold text-blue-600">{stats?.surveys_count || 0}</p>
                <div className="flex items-center mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className="bg-blue-600 h-1.5 rounded-full animate-slideWidth" style={{width: `${Math.min((stats?.surveys_count || 0) * 10, 100)}%`}}></div>
                  </div>
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
            </div>
          </div>

          <div className={`backdrop-blur-sm rounded-2xl p-6 border shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 animate-scaleIn animate-delay-100 ${darkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white/80 border-white/20'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Dinleme Seansları</p>
                <p className="text-2xl font-bold text-green-600">{stats?.sessions_count || 0}</p>
                <div className="flex items-center mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className="bg-green-600 h-1.5 rounded-full animate-slideWidth" style={{width: `${Math.min((stats?.sessions_count || 0) * 8, 100)}%`}}></div>
                  </div>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
            </div>
          </div>

          <div className={`backdrop-blur-sm rounded-2xl p-6 border shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 animate-scaleIn animate-delay-200 ${darkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white/80 border-white/20'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>PDF Raporları</p>
                <p className="text-2xl font-bold text-purple-600">{stats?.reports_count || 0}</p>
                <div className="flex items-center mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className="bg-purple-600 h-1.5 rounded-full animate-slideWidth" style={{width: `${Math.min((stats?.reports_count || 0) * 15, 100)}%`}}></div>
                  </div>
                </div>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className={`backdrop-blur-sm rounded-2xl p-6 border shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 animate-scaleIn animate-delay-300 ${darkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white/80 border-white/20'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Chat Geçmişi</p>
                <p className="text-2xl font-bold text-orange-600">{stats?.chatbot_logs_count || 0}</p>
                <div className="flex items-center mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className="bg-orange-600 h-1.5 rounded-full animate-slideWidth" style={{width: `${Math.min((stats?.chatbot_logs_count || 0) * 5, 100)}%`}}></div>
                  </div>
                </div>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickActions.map((action, index) => (
            <button
              key={action.title}
              onClick={action.action}
              className={`text-left p-6 rounded-2xl border shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 animate-scaleIn group ${action.bgColor} ${action.hoverColor} ${darkMode ? 'border-gray-600' : 'border-white/20'}`}
              style={{ animationDelay: `${(index + 4) * 100}ms` }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${action.iconBg} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shadow-lg`}>
                  <span className="text-2xl">{action.icon}</span>
                </div>
                <svg className={`w-5 h-5 text-${action.color}-600 group-hover:translate-x-1 transition-transform duration-200`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{action.title}</h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{action.description}</p>
            </button>
          ))}
        </div>

        {/* Detailed Stats and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Stats Details */}
          <div className={`backdrop-blur-sm rounded-2xl p-6 border shadow-lg animate-scaleIn animate-delay-800 ${darkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white/80 border-white/20'}`}>
            <h3 className={`text-lg font-semibold mb-6 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
              📊 Detaylı İstatistikler
            </h3>
            <div className="space-y-6">
              <div className="flex justify-between items-center p-4 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="font-medium text-gray-800">Toplam Dinleme Süresi</span>
                </div>
                <span className="font-bold text-blue-600 text-lg">
                  {formatTime(stats?.total_listening_time || 0)}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-4 rounded-lg bg-gradient-to-r from-green-50 to-green-100">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                  </div>
                  <span className="font-medium text-gray-800">En Çok Kullanılan Frekans</span>
                </div>
                <span className="font-bold text-green-600 text-lg">
                  {stats?.most_used_frequency || "Henüz yok"}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-4 rounded-lg bg-gradient-to-r from-purple-50 to-purple-100">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <span className="font-medium text-gray-800">Son Aktivite</span>
                </div>
                <span className="font-bold text-purple-600 text-lg">
                  {stats?.last_activity ? formatDate(stats.last_activity) : "Henüz yok"}
                </span>
              </div>

              {/* Progress Indicators */}
              <div className="mt-6">
                <h4 className={`text-md font-medium mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Haftalık Hedefler</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Dinleme Seansları</span>
                      <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{stats?.sessions_count || 0}/7</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all duration-500" 
                        style={{width: `${Math.min(((stats?.sessions_count || 0) / 7) * 100, 100)}%`}}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Günlük Kayıtlar</span>
                      <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{stats?.surveys_count || 0}/7</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                        style={{width: `${Math.min(((stats?.surveys_count || 0) / 7) * 100, 100)}%`}}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className={`backdrop-blur-sm rounded-2xl p-6 border shadow-lg animate-scaleIn animate-delay-900 ${darkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white/80 border-white/20'}`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                🕒 Son Aktiviteler
              </h3>
            </div>
            <div className="text-center py-8">
              <svg className={`w-12 h-12 mx-auto mb-4 opacity-50 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className={darkMode ? 'text-gray-500' : 'text-gray-500'}>Henüz aktivite bulunmuyor</p>
              <p className={`text-sm ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>İlk anketinizi oluşturarak başlayabilirsiniz!</p>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className={`backdrop-blur-sm rounded-2xl p-6 border shadow-lg animate-fadeInSlide animate-delay-1000 ${darkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white/80 border-white/20'}`}>
          <h3 className={`text-lg font-semibold mb-6 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
            ⚡ Sistem Durumu
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3 p-4 rounded-lg bg-gradient-to-r from-green-50 to-green-100">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <div>
                <span className="font-medium text-gray-800">Sistem Aktif</span>
                <p className="text-sm text-gray-600">Tüm servisler çalışıyor</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              <div>
                <span className="font-medium text-gray-800">API Bağlantısı</span>
                <p className="text-sm text-gray-600">Bağlantı sağlıklı</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 rounded-lg bg-gradient-to-r from-purple-50 to-purple-100">
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
              <div>
                <span className="font-medium text-gray-800">Hesap Durumu</span>
                <p className="text-sm text-gray-600">Aktif ve güvenli</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
