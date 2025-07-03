"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

interface PDFReport {
  id: number;
  title: string;
  content: string;
  file_path: string;
  created_at: string;
  user_name: string;
  created_at_formatted: string;
  file_size_formatted: string;
  download_url: string;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<PDFReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    period: "week" // week, month, year
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
    
    fetchReports();
  }, [router]);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("darkMode", newDarkMode.toString());
  };

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/pdfreports/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      setReports(response.data.results || response.data);
    } catch (error: any) {
      console.error("Reports fetch error:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("access_token");
        router.push("/login");
      } else {
        setMessage("❌ Raporlar yüklenirken bir hata oluştu.");
      }
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    setGenerating(true);
    try {
      const token = localStorage.getItem("access_token");
      
      // Get period dates
      const endDate = new Date();
      const startDate = new Date();
      
      switch (formData.period) {
        case 'week':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(endDate.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
      }

      // Fetch user data for the period
      const [surveysRes, sessionsRes, dashboardRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/dailylogs/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/sessions/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/dashboard-stats/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const surveys = surveysRes.data.results || surveysRes.data;
      const sessions = sessionsRes.data.results || sessionsRes.data;
      const stats = dashboardRes.data;

      // Generate report content
      const periodName = formData.period === 'week' ? 'Haftalık' : 
                        formData.period === 'month' ? 'Aylık' : 'Yıllık';
      
      const reportContent = generateReportContent(surveys, sessions, stats, periodName);
      
      const reportData = {
        title: formData.title || `${periodName} Sağlık Raporu - ${new Date().toLocaleDateString('tr-TR')}`,
        content: reportContent
      };

      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/pdfreports/`, reportData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      setMessage("✅ Rapor başarıyla oluşturuldu!");
      setShowForm(false);
      setFormData({ title: "", content: "", period: "week" });
      fetchReports();
    } catch (error: any) {
      console.error("Report generate error:", error);
      setMessage("❌ Rapor oluşturulurken bir hata oluştu.");
    } finally {
      setGenerating(false);
    }
  };

  const generateReportContent = (surveys: any[], sessions: any[], stats: any, period: string) => {
    const totalSurveys = surveys.length;
    const totalSessions = sessions.length;
    const completedSessions = sessions.filter(s => s.completed).length;
    const avgStress = surveys.length > 0 ? 
      (surveys.reduce((sum, s) => sum + s.stress, 0) / surveys.length).toFixed(1) : 0;
    const avgSleep = surveys.length > 0 ? 
      (surveys.reduce((sum, s) => sum + s.sleep_duration, 0) / surveys.length).toFixed(1) : 0;
    const totalDuration = sessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0);

    return `
${period} Sağlık Durumu Raporu

📊 GENEL İSTATİSTİKLER
• Toplam Anket Sayısı: ${totalSurveys}
• Toplam Dinleme Seansı: ${totalSessions}
• Tamamlanan Seanslar: ${completedSessions}
• Ortalama Stres Seviyesi: ${avgStress}/10
• Ortalama Uyku Süresi: ${avgSleep} saat

🎵 DİNLEME SEANSLARİ
• Toplam Dinleme Süresi: ${Math.floor(totalDuration / 60)} dakika
• En Çok Kullanılan Frekans: ${stats.most_used_frequency || 'Belirtilmemiş'}
• Seans Başarı Oranı: %${totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0}

📋 SAĞLIK TRENDLERİ
${surveys.length > 0 ? `
• Stres seviyeniz ortalaması ${avgStress}/10 seviyesinde
• Uyku süreniz ortalama ${avgSleep} saat
• Dinleme seanslarınızın %${totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0} başarı oranınız var
` : '• Henüz yeterli veri bulunmuyor'}

📈 ÖNERİLER
${Number(avgStress) > 6 ? '• Stres seviyeniz yüksek, daha fazla rahatlatıcı aktivite önerilir\n' : ''}
${Number(avgSleep) < 7 ? '• Uyku sürenizi artırmaya çalışın (önerilen 7-9 saat)\n' : ''}
${totalSessions > 0 && completedSessions < totalSessions * 0.7 ? '• Dinleme seanslarını tamamlama oranınızı artırmaya çalışın\n' : ''}
${totalSessions === 0 ? '• Düzenli frekans terapisi seansları başlatmanız önerilir\n' : ''}

Bu rapor ${new Date().toLocaleDateString('tr-TR')} tarihinde otomatik olarak oluşturulmuştur.
    `;
  };

  const downloadReport = async (report: PDFReport) => {
    try {
      const token = localStorage.getItem("access_token");
      
      // Backend'den PDF dosyasını indir
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pdfreports/${report.id}/download/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (response.ok) {
        // PDF dosyasını blob olarak al
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${report.title}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        setMessage("✅ PDF raporu başarıyla indirildi!");
      } else {
        // Hata durumunda fallback olarak text dosyası indir
        const content = report.content || 'Rapor içeriği mevcut değil';
        const blob = new Blob([content], { type: 'text/plain; charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${report.title}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        setMessage("⚠️ PDF indirilemedi, metin dosyası olarak indirildi.");
      }
    } catch (error) {
      console.error("Download error:", error);
      // Hata durumunda fallback
      const content = report.content || 'Rapor içeriği mevcut değil';
      const blob = new Blob([content], { type: 'text/plain; charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report.title}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      setMessage("❌ İndirme sırasında bir hata oluştu, metin dosyası olarak indirildi.");
    }
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
          <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Sağlık raporları yükleniyor...</p>
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
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V9a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Sağlık Raporları</h1>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Kişisel sağlık analiz raporları</p>
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
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V9a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2z" />
                </svg>
                <span>Yeni Rapor</span>
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
        {reports.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className={`backdrop-blur-sm rounded-2xl p-6 border shadow-lg hover:shadow-xl transition-all duration-300 ${darkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white/80 border-white/20'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Toplam Rapor</p>
                  <p className="text-2xl font-bold text-purple-600">{reports.length}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className={`backdrop-blur-sm rounded-2xl p-6 border shadow-lg hover:shadow-xl transition-all duration-300 ${darkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white/80 border-white/20'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Son Rapor</p>
                  <p className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                    {reports.length > 0 ? new Date(reports[0].created_at).toLocaleDateString('tr-TR') : 'Henüz yok'}
                  </p>
                </div>
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className={`backdrop-blur-sm rounded-2xl p-6 border shadow-lg hover:shadow-xl transition-all duration-300 ${darkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white/80 border-white/20'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Bu Ay</p>
                  <p className="text-2xl font-bold text-green-600">
                    {reports.filter(r => new Date(r.created_at).getMonth() === new Date().getMonth()).length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reports Grid */}
        {reports.length > 0 ? (
          <div>
            <h2 className={`text-xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Raporlarım</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reports.map((report, index) => (
                <div 
                  key={report.id} 
                  className={`backdrop-blur-sm rounded-2xl p-6 border shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 animate-scaleIn group ${darkMode ? 'bg-gray-800/80 border-gray-700 hover:bg-gray-700/90' : 'bg-white/80 border-white/20 hover:bg-white/90'}`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-semibold line-clamp-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {report.title}
                        </h3>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Sağlık Raporu
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className={`text-sm line-clamp-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {report.content && report.content.length > 0 
                        ? `${report.content.substring(0, 150)}...` 
                        : 'Rapor içeriği mevcut değil'}
                    </p>
                  </div>

                  <div className={`mb-4 p-3 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <div className="flex justify-between items-center text-sm">
                      <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Oluşturulma</span>
                      <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                        {report.created_at_formatted || new Date(report.created_at).toLocaleDateString('tr-TR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => downloadReport(report)}
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>İndir</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <svg className={`w-12 h-12 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className={`text-lg font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Henüz sağlık raporu bulunmuyor
            </h3>
            <p className={`mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              İlk kişisel sağlık raporunuzu oluşturarak sağlık verilerinizi analiz edin!
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              İlk Raporu Oluştur
            </button>
          </div>
        )}
      </main>

      {/* Report Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className={`rounded-3xl shadow-2xl max-w-lg w-full animate-scaleIn ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V9a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Yeni Sağlık Raporu</h2>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Kişisel sağlık analizi oluşturun</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowForm(false)}
                  className={`p-2 rounded-lg transition-colors duration-200 ${darkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                  disabled={generating}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className={`block text-sm font-medium mb-3 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  📋 Rapor Başlığı
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder="Rapor başlığı (boş bırakılırsa otomatik oluşturulur)"
                  disabled={generating}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  📅 Rapor Dönemi
                </label>
                <div className="space-y-3">
                  {[
                    { value: 'week', label: 'Son 7 Gün', desc: 'Haftalık sağlık özeti', icon: '📊' },
                    { value: 'month', label: 'Son 30 Gün', desc: 'Aylık detaylı analiz', icon: '📈' },
                    { value: 'year', label: 'Son 1 Yıl', desc: 'Yıllık trend raporu', icon: '📉' }
                  ].map((option) => (
                    <label 
                      key={option.value} 
                      className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all duration-200 hover:scale-105 ${
                        formData.period === option.value 
                          ? (darkMode ? 'border-purple-500 bg-purple-900/20' : 'border-purple-500 bg-purple-50')
                          : (darkMode ? 'border-gray-600 hover:border-gray-500 hover:bg-gray-700/50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50')
                      }`}
                    >
                      <input
                        type="radio"
                        name="period"
                        value={option.value}
                        checked={formData.period === option.value}
                        onChange={(e) => setFormData(prev => ({ ...prev, period: e.target.value }))}
                        className="sr-only"
                        disabled={generating}
                      />
                      <div className="text-2xl mr-4">{option.icon}</div>
                      <div className="flex-1">
                        <div className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {option.label}
                        </div>
                        <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {option.desc}
                        </div>
                      </div>
                      {formData.period === option.value && (
                        <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </label>
                  ))}
                </div>
              </div>

              <div className={`flex justify-end space-x-4 pt-6 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <button
                  onClick={() => setShowForm(false)}
                  className={`px-8 py-3 border rounded-xl transition-all duration-200 hover:scale-105 ${
                    darkMode 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                  disabled={generating}
                >
                  İptal
                </button>
                <button
                  onClick={generateReport}
                  disabled={generating}
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-2"
                >
                  {generating ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Oluşturuluyor...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span>Rapor Oluştur</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
