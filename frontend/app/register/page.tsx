"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    password_confirm: "",
    first_name: "",
    last_name: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Debug: Check if API URL is configured
  useEffect(() => {
    console.log("NEXT_PUBLIC_API_URL:", process.env.NEXT_PUBLIC_API_URL);
    if (!process.env.NEXT_PUBLIC_API_URL) {
      setMessage("⚠️ API URL yapılandırılmamış. .env.local dosyasını kontrol edin.");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // Client-side validation
    if (form.password !== form.password_confirm) {
      setMessage("❌ Şifreler eşleşmiyor!");
      setLoading(false);
      return;
    }

    if (form.password.length < 8) {
      setMessage("❌ Şifre en az 8 karakter olmalıdır!");
      setLoading(false);
      return;
    }

    if (!form.email.includes('@')) {
      setMessage("❌ Geçerli bir e-posta adresi girin!");
      setLoading(false);
      return;
    }

    if (form.username.length < 3) {
      setMessage("❌ Kullanıcı adı en az 3 karakter olmalıdır!");
      setLoading(false);
      return;
    }

    console.log("Sending registration data:", {
      ...form,
      password_confirm: "[HIDDEN]",
      password: "[HIDDEN]"
    });

    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/register/`;
      console.log("API URL:", apiUrl);
      
      // Clean and validate form data
      const formData = {
        username: form.username.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        password_confirm: form.password_confirm,
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim()
      };
      
      console.log("Form data being sent:", {
        ...formData,
        password: "[HIDDEN]",
        password_confirm: "[HIDDEN]"
      });

      const res = await axios.post(apiUrl, formData, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });
      setMessage("✅ Kayıt başarılı! E-postanızı kontrol edin ve aktivasyon linkine tıklayın.");
      
      // Başarılı kayıttan sonra login sayfasına yönlendir
      setTimeout(() => {
        router.push("/login");
      }, 5000);
      
      console.log(res.data);
    } catch (error: any) {
      console.error("Registration error:", error);
      console.error("Error response:", error.response?.data);
      
      let errorMessage = "❌ Kayıt hatası.";
      
      if (error.response?.data) {
        const data = error.response.data;
        
        // Check for specific field errors
        if (data.username) {
          errorMessage = `❌ Kullanıcı adı hatası: ${Array.isArray(data.username) ? data.username[0] : data.username}`;
        } else if (data.email) {
          errorMessage = `❌ E-posta hatası: ${Array.isArray(data.email) ? data.email[0] : data.email}`;
        } else if (data.password) {
          errorMessage = `❌ Şifre hatası: ${Array.isArray(data.password) ? data.password[0] : data.password}`;
        } else if (data.password_confirm) {
          errorMessage = `❌ Şifre doğrulama hatası: ${Array.isArray(data.password_confirm) ? data.password_confirm[0] : data.password_confirm}`;
        } else if (data.first_name) {
          errorMessage = `❌ Ad hatası: ${Array.isArray(data.first_name) ? data.first_name[0] : data.first_name}`;
        } else if (data.last_name) {
          errorMessage = `❌ Soyad hatası: ${Array.isArray(data.last_name) ? data.last_name[0] : data.last_name}`;
        } else if (data.error) {
          errorMessage = `❌ ${data.error}`;
        } else if (data.message) {
          errorMessage = `❌ ${data.message}`;
        } else if (data.detail) {
          errorMessage = `❌ ${data.detail}`;
        } else {
          // If we have multiple field errors, show them all
          const errors = [];
          for (const [field, messages] of Object.entries(data)) {
            if (Array.isArray(messages)) {
              errors.push(`${field}: ${messages[0]}`);
            } else if (typeof messages === 'string') {
              errors.push(`${field}: ${messages}`);
            }
          }
          if (errors.length > 0) {
            errorMessage = `❌ ${errors.join(', ')}`;
          }
        }
      }
      
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Form steps
  const steps = [
    {
      title: "Hesap Bilgileri",
      fields: ["username", "email"],
      icon: "👤"
    },
    {
      title: "Güvenlik",
      fields: ["password", "password_confirm"],
      icon: "🔒"
    },
    {
      title: "Kişisel Bilgiler",
      fields: ["first_name", "last_name"],
      icon: "📝"
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepValid = () => {
    const currentFields = steps[currentStep].fields;
    return currentFields.every(field => form[field as keyof typeof form].trim() !== "");
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 relative overflow-hidden">
      {/* Background animated elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animate-morphing"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000 animate-morphing"></div>
        
        {/* Floating particles */}
        <div className="absolute top-1/4 right-1/3 w-4 h-4 bg-blue-300 rounded-full opacity-60 animate-float animate-delay-100"></div>
        <div className="absolute top-2/3 left-1/4 w-3 h-3 bg-indigo-300 rounded-full opacity-60 animate-float animate-delay-300"></div>
        <div className="absolute top-1/2 right-1/4 w-2 h-2 bg-purple-300 rounded-full opacity-60 animate-float animate-delay-500"></div>
        <div className="absolute top-3/4 left-2/3 w-5 h-5 bg-blue-200 rounded-full opacity-40 animate-float animate-delay-200"></div>
      </div>

      <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-2xl w-full max-w-md relative z-10 border border-white/20 transform transition-all duration-500 hover:scale-105 hover:-translate-y-2 animate-scaleIn hover-lift">
        <div className="text-center mb-8">
          <div className="animate-bounceIn">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent animate-gradient">
              Kayıt Ol
            </h1>
          </div>
          <div className="animate-slideInUp animate-delay-200">
            <p className="text-gray-600">Adım {currentStep + 1} / {steps.length}</p>
          </div>
          <div className="w-16 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto mt-4 rounded-full animate-slideInLeft animate-delay-300"></div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8 animate-slideInUp animate-delay-100">
          <div className="flex justify-between mb-4">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`text-3xl transition-all duration-500 relative ${
                  index <= currentStep 
                    ? 'opacity-100 scale-110 animate-bounceIn' 
                    : 'opacity-30 scale-90'
                }`}
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className={`${index <= currentStep ? 'animate-glow' : ''}`}>
                  {step.icon}
                </div>
                {index <= currentStep && (
                  <div className="absolute -inset-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-20 animate-pulse"></div>
                )}
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all duration-700 ease-in-out animate-glow"
              style={{ 
                width: `${((currentStep + 1) / steps.length) * 100}%`,
                animation: 'slideInLeft 0.7s ease-out'
              }}
            />
          </div>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-xl text-center text-sm font-medium transform transition-all duration-500 animate-slideInUp ${
            message.includes("✅") 
              ? "bg-green-100 text-green-800 border border-green-200 scale-100 animate-glow" 
              : "bg-red-100 text-red-800 border border-red-200 animate-shake"
          }`}>
            <div className="flex items-center justify-center gap-2">
              {message.includes("✅") ? (
                <svg className="w-5 h-5 animate-bounceIn" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 animate-spin" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              )}
              <span>{message}</span>
            </div>
            {message.includes("✅") && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-700">
                  📧 Aktivasyon e-postası gönderildi. E-postanızdaki linke tıklayarak hesabınızı aktif edin.
                  <br />
                  <span className="font-semibold">5 saniye içinde giriş sayfasına yönlendirileceksiniz...</span>
                </p>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div
            key={currentStep}
            className="space-y-4 transform transition-all duration-500 animate-scaleIn"
          >
            <div className="animate-bounceIn animate-delay-100">
              <h3 className="text-xl font-semibold text-center text-gray-700 mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {steps[currentStep].title}
              </h3>
            </div>

            {steps[currentStep].fields.map((fieldName, index) => (
              <div
                key={fieldName}
                className="transform transition-all duration-300 hover:scale-102 animate-slideInUp"
                style={{
                  animationDelay: `${(index + 2) * 100}ms`
                }}
              >
                <div className="relative group">
                  <input
                    type={
                      fieldName.includes("password") ? "password" :
                      fieldName === "email" ? "email" : "text"
                    }
                    name={fieldName}
                    placeholder={
                      fieldName === "username" ? "Kullanıcı Adı" :
                      fieldName === "email" ? "E-posta" :
                      fieldName === "password" ? "Şifre" :
                      fieldName === "password_confirm" ? "Şifre Tekrar" :
                      fieldName === "first_name" ? "Ad" :
                      fieldName === "last_name" ? "Soyad" : fieldName
                    }
                    value={form[fieldName as keyof typeof form]}
                    onChange={handleChange}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 focus:scale-102 transition-all duration-300 bg-white/70 hover:bg-white/90 hover-glow group-hover:shadow-lg"
                    required
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-focus-within:opacity-20 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-4 mt-8 animate-slideInUp animate-delay-500">
            {currentStep > 0 && (
              <button
                type="button"
                onClick={prevStep}
                className="flex-1 p-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-gray-400 hover:scale-105 active:scale-95 transition-all duration-300 transform hover:shadow-lg hover-lift btn-ripple"
              >
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Geri
                </div>
              </button>
            )}

            {currentStep < steps.length - 1 ? (
              <button
                type="button"
                onClick={nextStep}
                disabled={!isStepValid()}
                className={`flex-1 p-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 hover:shadow-2xl hover:-translate-y-1 btn-ripple ${
                  isStepValid()
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover-lift"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  İleri
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading || !isStepValid()}
                className={`flex-1 p-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 hover:shadow-2xl hover:-translate-y-1 btn-ripple ${
                  loading || !isStepValid()
                    ? "bg-gray-400 cursor-not-allowed text-white" 
                    : "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover-lift"
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
                    {loading ? "Kaydediliyor..." : "Kayıt Ol"}
                  </span>
                </div>
              </button>
            )}
          </div>
        </form>

        <div className="mt-6 text-center transform transition-all duration-500 hover:scale-105 animate-fadeInSlide animate-delay-700">
          <p className="text-gray-600">
            Zaten hesabınız var mı?{" "}
            <a
              href="/login"
              className="text-blue-600 hover:text-blue-700 font-semibold transition-all duration-200 hover:scale-110 inline-block transform hover-glow relative group"
            >
              Giriş Yap
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300 group-hover:w-full"></span>
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
