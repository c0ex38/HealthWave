"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";

export default function ActivatePage() {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const activateAccount = async () => {
      const uid = searchParams.get('uid');
      const token = searchParams.get('token');

      if (!uid || !token) {
        setMessage("❌ Geçersiz aktivasyon linki. UID ve token parametreleri eksik.");
        setLoading(false);
        return;
      }

      try {
        console.log("Activating account with:", { uid, token });
        console.log("API URL:", `${process.env.NEXT_PUBLIC_API_URL}/api/activate-account/`);
        
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/activate-account/?uid=${uid}&token=${token}`,
          {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            }
          }
        );

        console.log("Activation response:", res.data);
        setMessage("✅ Hesabınız başarıyla aktif edildi! Artık giriş yapabilirsiniz.");
        setSuccess(true);
        
        // 3 saniye sonra login sayfasına yönlendir
        setTimeout(() => {
          router.push("/login");
        }, 3000);

      } catch (error: any) {
        console.error("Activation error:", error);
        console.error("Error response data:", error.response?.data);
        console.error("Error status:", error.response?.status);
        console.error("Error headers:", error.response?.headers);
        
        let errorMessage = "❌ Hesap aktivasyonu başarısız.";
        
        if (error.response?.data) {
          if (error.response.data.error) {
            errorMessage = `❌ ${error.response.data.error}`;
          } else if (error.response.data.message) {
            errorMessage = `❌ ${error.response.data.message}`;
          } else if (error.response.data.detail) {
            errorMessage = `❌ ${error.response.data.detail}`;
          } else {
            errorMessage = `❌ HTTP ${error.response.status}: ${JSON.stringify(error.response.data)}`;
          }
        } else if (error.message) {
          errorMessage = `❌ ${error.message}`;
        }
        
        setMessage(errorMessage);
        setSuccess(false);
      } finally {
        setLoading(false);
      }
    };

    activateAccount();
  }, [searchParams, router]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100 relative overflow-hidden">
      {/* Background animated elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animate-morphing"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-cyan-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000 animate-morphing"></div>
        
        {/* Floating particles */}
        <div className="absolute top-1/4 right-1/3 w-4 h-4 bg-emerald-300 rounded-full opacity-60 animate-float animate-delay-100"></div>
        <div className="absolute top-2/3 left-1/4 w-3 h-3 bg-teal-300 rounded-full opacity-60 animate-float animate-delay-300"></div>
        <div className="absolute top-1/2 right-1/4 w-2 h-2 bg-cyan-300 rounded-full opacity-60 animate-float animate-delay-500"></div>
        <div className="absolute top-3/4 left-2/3 w-5 h-5 bg-emerald-200 rounded-full opacity-40 animate-float animate-delay-200"></div>
      </div>

      <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-2xl w-full max-w-md relative z-10 border border-white/20 transform transition-all duration-500 hover:scale-105 hover:-translate-y-2 animate-scaleIn hover-lift">
        <div className="text-center mb-8">
          <div className="animate-bounceIn">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent animate-gradient">
              Hesap Aktivasyonu
            </h1>
          </div>
          <div className="w-16 h-1 bg-gradient-to-r from-emerald-600 to-teal-600 mx-auto mt-4 rounded-full animate-slideInLeft animate-delay-200"></div>
        </div>

        <div className="text-center space-y-6">
          {loading ? (
            <div className="animate-slideInUp">
              <div className="flex justify-center mb-4">
                <svg className="w-16 h-16 animate-spin text-emerald-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <p className="text-lg text-gray-600 animate-pulse">
                Hesabınız aktif ediliyor...
              </p>
            </div>
          ) : (
            <div className="animate-slideInUp animate-delay-300">
              {success ? (
                <div className="space-y-4">
                  <div className="flex justify-center mb-4">
                    <svg className="w-16 h-16 text-green-600 animate-bounceIn" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-lg font-semibold text-green-800">
                      Tebrikler! 🎉
                    </p>
                    <p className="text-gray-600">
                      Hesabınız başarıyla aktif edildi.
                    </p>
                    <p className="text-sm text-gray-500">
                      3 saniye içinde giriş sayfasına yönlendirileceksiniz...
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-center mb-4">
                    <svg className="w-16 h-16 text-red-600 animate-shake" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-lg font-semibold text-red-800">
                      Aktivasyon Başarısız
                    </p>
                    <p className="text-gray-600 text-sm">
                      Link geçersiz veya süresi dolmuş olabilir.
                    </p>
                  </div>
                </div>
              )}
              
              <div className={`p-4 rounded-xl text-center text-sm font-medium transform transition-all duration-500 ${
                success 
                  ? "bg-green-100 text-green-800 border border-green-200 animate-glow" 
                  : "bg-red-100 text-red-800 border border-red-200"
              }`}>
                {message}
              </div>
            </div>
          )}

          <div className="space-y-4 animate-fadeInSlide animate-delay-500">
            {!loading && !success && (
              <button
                onClick={() => router.push("/register")}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-3 rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg active:scale-95 btn-ripple"
              >
                Tekrar Kayıt Ol
              </button>
            )}
            
            <button
              onClick={() => router.push("/login")}
              className="w-full border-2 border-emerald-600 text-emerald-600 p-3 rounded-xl font-semibold hover:bg-emerald-50 transition-all duration-300 transform hover:scale-105 hover:shadow-lg active:scale-95 btn-ripple"
            >
              Giriş Sayfasına Git
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
