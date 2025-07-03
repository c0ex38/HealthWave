"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/login/`,
        form
      );

      console.log(res.data);
      localStorage.setItem("access_token", res.data.tokens.access);
      setMessage("✅ Giriş başarılı!");
      
      // Başarılı girişten sonra ana sayfaya yönlendir
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);

    } catch (error: any) {
      console.error(error);
      const errorMessage = error.response?.data?.error || "❌ Giriş hatası.";
      setMessage(errorMessage);
      
      // If user is not active, show activation message
      if (errorMessage.includes("aktif değil") || errorMessage.includes("inactive")) {
        setMessage("⚠️ Hesabınız henüz aktif değil. E-postanızdaki aktivasyon linkine tıklayın.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100 relative overflow-hidden">
      {/* Background animated elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animate-morphing"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000 animate-morphing"></div>
        
        {/* Floating particles */}
        <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-green-300 rounded-full opacity-60 animate-float animate-delay-100"></div>
        <div className="absolute top-3/4 right-1/4 w-3 h-3 bg-emerald-300 rounded-full opacity-60 animate-float animate-delay-300"></div>
        <div className="absolute top-1/2 left-3/4 w-2 h-2 bg-teal-300 rounded-full opacity-60 animate-float animate-delay-500"></div>
      </div>

      <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-2xl w-full max-w-md relative z-10 border border-white/20 transform transition-all duration-500 hover:scale-105 hover:-translate-y-2 animate-scaleIn hover-lift">
        <div className="text-center mb-8">
          <div className="animate-bounceIn">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent animate-gradient">
              Giriş Yap
            </h1>
          </div>
          <div className="w-16 h-1 bg-gradient-to-r from-green-600 to-emerald-600 mx-auto mt-4 rounded-full animate-slideInLeft animate-delay-200"></div>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-xl text-center text-sm font-medium transform transition-all duration-500 animate-slideInUp ${
            message.includes("✅") 
              ? "bg-green-100 text-green-800 border border-green-200 scale-100 animate-glow" 
              : message.includes("⚠️")
              ? "bg-yellow-100 text-yellow-800 border border-yellow-200 animate-pulse"
              : "bg-red-100 text-red-800 border border-red-200 animate-shake"
          }`}>
            <div className="flex items-center justify-center gap-2">
              {message.includes("✅") ? (
                <svg className="w-5 h-5 animate-bounceIn" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : message.includes("⚠️") ? (
                <svg className="w-5 h-5 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 animate-spin" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              )}
              <span>{message}</span>
            </div>
            {message.includes("⚠️") && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-700">
                  📧 E-postanızı kontrol edin ve aktivasyon linkine tıklayın.
                  <br />
                  <a 
                    href="/register" 
                    className="text-blue-600 hover:text-blue-800 font-semibold underline"
                  >
                    Aktivasyon e-postası almadıysanız tekrar kayıt olun
                  </a>
                </p>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="transform transition-all duration-300 hover:scale-102 animate-slideInLeft animate-delay-100">
            <div className="relative group">
              <input
                type="text"
                name="username"
                placeholder="Kullanıcı Adı"
                value={form.username}
                onChange={handleChange}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-400 focus:ring-4 focus:ring-green-100 focus:scale-102 transition-all duration-300 bg-white/70 hover:bg-white/90 hover-glow group-hover:shadow-lg"
                required
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-green-400 to-emerald-400 opacity-0 group-focus-within:opacity-20 transition-opacity duration-300 pointer-events-none"></div>
            </div>
          </div>

          <div className="transform transition-all duration-300 hover:scale-102 animate-slideInRight animate-delay-200">
            <div className="relative group">
              <input
                type="password"
                name="password"
                placeholder="Şifre"
                value={form.password}
                onChange={handleChange}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-400 focus:ring-4 focus:ring-green-100 focus:scale-102 transition-all duration-300 bg-white/70 hover:bg-white/90 hover-glow group-hover:shadow-lg"
                required
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-green-400 to-emerald-400 opacity-0 group-focus-within:opacity-20 transition-opacity duration-300 pointer-events-none"></div>
            </div>
          </div>

          <div className="animate-slideInUp animate-delay-300">
            <button
              type="submit"
              disabled={loading}
              className={`w-full p-4 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-105 hover:shadow-2xl active:scale-95 btn-ripple ${
                loading 
                  ? "bg-gray-400 cursor-not-allowed animate-pulse" 
                  : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:-translate-y-1 hover-lift"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                {loading && (
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                <span className={loading ? "animate-pulse-custom" : ""}>
                  {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
                </span>
              </div>
            </button>
          </div>
        </form>

        <div className="mt-6 text-center transform transition-all duration-500 hover:scale-105 animate-fadeInSlide animate-delay-500">
          <p className="text-gray-600">
            Hesabınız yok mu?{" "}
            <a
              href="/register"
              className="text-green-600 hover:text-green-700 font-semibold transition-all duration-200 hover:scale-110 inline-block transform hover-glow relative group"
            >
              Kayıt Ol
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-green-600 to-emerald-600 transition-all duration-300 group-hover:w-full"></span>
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
