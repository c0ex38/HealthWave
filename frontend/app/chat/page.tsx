"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  message: string;
  timestamp: Date;
}

interface ChatbotLog {
  id: number;
  user_message: string;
  bot_response: string;
  created_at: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'bot',
      message: 'Merhaba! Ben HealtWave sağlık asistanınızım. Size nasıl yardımcı olabilirim? Sağlığınız, ruh durumunuz veya dinleme seanslarınız hakkında sorular sorabilirsiniz.',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatbotLog[]>([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetchChatHistory();
  }, [router]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchChatHistory = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/chatbotlogs/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      setChatHistory(response.data.results || response.data);
    } catch (error: any) {
      console.error("Chat history fetch error:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("access_token");
        router.push("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const generateBotResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    // Sağlık durumu soruları
    if (message.includes('stres') || message.includes('endişe') || message.includes('kaygı')) {
      return "Stres yönetimi için düzenli nefes egzersizleri, meditasyon ve rahatlatıcı müzik dinlemenizi öneriyorum. Uygulamadaki binaural frekanslar stresi azaltmada çok etkilidir. Alpha (8-12 Hz) frekanslarını deneyebilirsiniz.";
    }
    
    if (message.includes('uyku') || message.includes('uykusuzluk') || message.includes('uyuyamıyorum')) {
      return "Uyku kalitesini iyileştirmek için düzenli uyku saatleri, mavi ışık maruziyetini azaltma ve yatmadan önce Delta frekansları (0.5-4 Hz) dinlemenizi öneriyorum. Bu frekanslar derin uyku durumunu destekler.";
    }
    
    if (message.includes('odak') || message.includes('konsantrasyon') || message.includes('dikkat')) {
      return "Odaklanma ve konsantrasyon için Beta frekansları (13-30 Hz) idealdir. Çalışma sırasında bu frekansları dinleyerek zihinsel performansınızı artırabilirsiniz. Günlük 15-20 dakikalık seanslar önerilir.";
    }
    
    if (message.includes('ruh durumu') || message.includes('moral') || message.includes('mutluluk')) {
      return "Ruh durumunuzu iyileştirmek için Theta frekansları (4-8 Hz) ve doğa seslerini kombinasyonunu deneyebilirsiniz. Ayrıca günlük aktivitelerinizi ve ruh durumunuzu takip etmek için anket özelliğimizi kullanabilirsiniz.";
    }
    
    if (message.includes('müzik') || message.includes('frekans') || message.includes('dinleme')) {
      return "Binaural frekanslar, beyin dalgalarınızı hedeflenen duruma getirerek çeşitli faydalar sağlar. Her frekans türünün kendine özgü etkileri vardır. Hangi amaç için müzik dinlemek istediğinizi belirtirseniz size en uygun frekansı önerebilirim.";
    }
    
    if (message.includes('nasıl') && message.includes('başla')) {
      return "Uygulamayı kullanmaya başlamak için: 1) Günlük sağlık anketini doldurun, 2) Amacınıza uygun bir dinleme seansı başlatın, 3) Düzenli kullanımla ilerlemenizi takip edin. Dashboard'da tüm istatistiklerinizi görebilirsiniz.";
    }
    
    if (message.includes('rapor') || message.includes('ilerleme') || message.includes('gelişim')) {
      return "İlerlemenizi takip etmek için düzenli olarak PDF raporlarınızı oluşturabilirsiniz. Bu raporlar haftalık, aylık veya yıllık olarak sağlık trendlerinizi analiz eder ve kişiselleştirilmiş öneriler sunar.";
    }
    
    if (message.includes('merhaba') || message.includes('selam') || message.includes('hey')) {
      return "Merhaba! Size yardımcı olmaktan mutluluk duyarım. Sağlığınız, ruh durumunuz veya uygulamanın özelliklerini nasıl kullanacağınız hakkında her türlü sorunuzu sorabilirsiniz.";
    }
    
    if (message.includes('teşekkür') || message.includes('sağol')) {
      return "Rica ederim! Sağlığınız ve refahınız için buradayım. Başka sorularınız varsa çekinmeden sorabilirsiniz.";
    }
    
    // Genel yanıt
    return "Bu konuda size nasıl yardımcı olabilirim? Sağlık durumunuz, ruh haliniz, dinleme seansları veya uygulama özellikleri hakkında daha spesifik sorular sorabilirsiniz. Ayrıca 'stres', 'uyku', 'odaklanma' gibi konularda öneriler alabilirim.";
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      message: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const botResponse = generateBotResponse(inputMessage);
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        message: botResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);

      // Save to backend
      saveChatLog(inputMessage, botResponse);
    }, 1000 + Math.random() * 2000);
  };

  const saveChatLog = async (userMessage: string, botResponse: string) => {
    try {
      const token = localStorage.getItem("access_token");
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/chatbotlogs/`, {
        user_message: userMessage,
        bot_response: botResponse
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
    } catch (error: any) {
      console.error("Chat log save error:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickQuestions = [
    "Stresimi nasıl azaltabilirim?",
    "Uyku kalitemi iyileştirmek için ne yapabilirim?",
    "Odaklanmada hangi frekansları kullanmaliyim?",
    "Nasıl başlamalıyım?",
    "İlerleme raporlarımı nasıl görürüm?"
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100">
        <div className="text-center">
          <svg className="w-16 h-16 animate-spin text-blue-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-lg text-gray-600">Chat yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push("/dashboard")}
                className="text-gray-500 hover:text-blue-600 transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">AI Sağlık Asistanı</h1>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-green-600">Online</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-8rem)] flex flex-col">
        {/* Quick Questions */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Hızlı Sorular:</h3>
          <div className="flex flex-wrap gap-2">
            {quickQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => setInputMessage(question)}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 transition-colors duration-200"
              >
                {question}
              </button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-slideInUp`}
              >
                <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                  <div
                    className={`px-4 py-3 rounded-2xl ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white rounded-br-md'
                        : 'bg-gray-100 text-gray-900 rounded-bl-md'
                    }`}
                  >
                    <p className="text-sm">{message.message}</p>
                    <p className={`text-xs mt-1 ${
                      message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString('tr-TR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  message.type === 'user' ? 'order-1 ml-3 bg-blue-600' : 'order-2 mr-3 bg-orange-500'
                }`}>
                  {message.type === 'user' ? (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  )}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start animate-slideInUp">
                <div className="order-2 max-w-[80%]">
                  <div className="bg-gray-100 text-gray-900 px-4 py-3 rounded-2xl rounded-bl-md">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce animate-delay-100"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce animate-delay-200"></div>
                    </div>
                  </div>
                </div>
                <div className="order-1 mr-3 w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-4">
              <div className="flex-1">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Mesajınızı yazın..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows={1}
                  disabled={isTyping}
                />
              </div>
              <button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                <span>Gönder</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
