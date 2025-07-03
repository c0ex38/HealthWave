# 🌊 HealthWave - Binaural Beats ve Frekans Terapisi Platformu

<div align="center">
  <img src="./frontend/public/helatwave_logo.svg" alt="HealthWave Logo" width="200"/>
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![Django](https://img.shields.io/badge/Django-4.2-green.svg)](https://www.djangoproject.com/)
  [![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
  [![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
</div>

## 📋 İçindekiler

- [Proje Hakkında](#-proje-hakkında)
- [Özellikler](#-özellikler)
- [Teknoloji Stack](#-teknoloji-stack)
- [Kurulum](#-kurulum)
- [API Dokümantasyonu](#-api-dokümantasyonu)
- [Kullanım](#-kullanım)
- [Ekran Görüntüleri](#-ekran-görüntüleri)
- [Lisans](#-lisans)

## 🎵 Proje Hakkında

**HealthWave**, binaural beats ve solfeggio frekansları kullanarak kullanıcıların zihinsel ve fiziksel sağlığını desteklemeyi amaçlayan modern bir web platformudur. Platform, ses terapisi, günlük sağlık takibi ve kişiselleştirilmiş öneriler sunarak kullanıcıların genel yaşam kalitesini artırmayı hedefler.

### 🎯 Temel Hedefler

- **Stres Azaltma**: Alpha ve Theta dalgaları ile doğal stres giderme
- **Uyku Kalitesi**: Delta frekansları ile derin ve kaliteli uyku
- **Odaklanma**: Beta dalgaları ile konsantrasyon artırma
- **Meditasyon**: Rehberli seanslar ile zihinsel rahatlama
- **Takip ve Analiz**: Günlük sağlık verilerinin analizi

## ✨ Özellikler

### 🔊 Ses Terapisi

- **Binaural Beats**: Farklı Hz frekanslarında özel tasarlanmış sesler
- **Solfeggio Frekansları**: 432Hz, 528Hz, 741Hz, 852Hz gibi şifa frekansları
- **Özelleştirilebilir Seanslar**: Süre ve frekans seçimi
- **Yüksek Kalite Audio**: MP3, WAV formatlarında kristal netlikte ses

### 📊 Sağlık Takibi

- **Günlük Anketler**: Stres, uyku, odaklanma ve genel sağlık durumu
- **İlerleme Analizi**: Zaman içindeki gelişimin grafikleri
- **Kişiselleştirilmiş Öneriler**: AI destekli sağlık tavsiyeleri
- **PDF Raporlar**: Detaylı sağlık analiz raporları

### 🤖 Akıllı Chatbot

- **7/24 Destek**: Sağlık ve frekans konularında anında yardım
- **Kişisel Öneriler**: Kullanıcının verilerine göre özel tavsiyeler
- **Eğitici İçerik**: Binaural beats ve sağlık hakkında bilgiler

### 📱 Modern Arayüz

- **Responsive Design**: Mobil, tablet ve masaüstü uyumlu
- **Koyu/Açık Tema**: Göz dostu tema seçenekleri
- **Kullanıcı Dostu**: Sezgisel ve kolay kullanım
- **PWA Desteği**: Progressive Web App özellikleri

## 🛠 Teknoloji Stack

### Backend

- **Framework**: Django 4.2 + Django REST Framework
- **Veritabanı**: SQLite (geliştirme), PostgreSQL (prodüksiyon hazır)
- **Kimlik Doğrulama**: JWT (Simple JWT)
- **API**: Kapsamlı dokümantasyonlu RESTful API
- **Dosya Depolama**: Django media dosyaları + bulut depolama hazır
- **Önbellekleme**: Redis desteği
- **Güvenlik**: CORS, throttling, rate limiting

### Frontend

- **Framework**: Next.js 14 (App Router)
- **Dil**: TypeScript
- **Stil**: Tailwind CSS
- **State Yönetimi**: React Context + Hooks
- **HTTP İstemcisi**: Fetch API
- **UI Bileşenleri**: Özel bileşenler + Headless UI
- **Audio Player**: Özel HTML5 audio uygulaması

## 🚀 Kurulum

### Gereksinimler

- Python 3.11+
- Node.js 18+
- npm veya yarn
- Git

### 1. Repository'yi Klonlayın

```bash
git clone https://github.com/kullaniciadi/healthwave.git
cd healthwave
```

### 2. Backend Kurulumu

```bash
# Backend dizinine geçin
cd backend

# Virtual environment oluşturun
python -m venv venv

# Virtual environment'ı aktifleştirin
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Bağımlılıkları yükleyin
pip install -r requirements.txt

# Veritabanı migration'larını çalıştırın
python manage.py makemigrations
python manage.py migrate

# Superuser oluşturun (opsiyonel)
python manage.py createsuperuser

# Test verilerini oluşturun (opsiyonel)
python manage.py generate_sample_data

# Backend sunucusunu başlatın
python manage.py runserver
```

### 3. Frontend Kurulumu

```bash
# Yeni terminal açın ve frontend dizinine geçin
cd frontend

# Bağımlılıkları yükleyin
npm install
# veya
yarn install

# Development sunucusunu başlatın
npm run dev
# veya
yarn dev
```

### 4. Erişim URL'leri

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Admin Panel**: http://localhost:8000/admin

## 📚 API Dokümantasyonu

### Ana Endpoint'ler

| Endpoint                | Method    | Açıklama                 |
| ----------------------- | --------- | ------------------------ |
| `/api/auth/register/`   | POST      | Kullanıcı kaydı          |
| `/api/auth/login/`      | POST      | Kullanıcı girişi         |
| `/api/frequencies/`     | GET       | Frekans listesi          |
| `/api/daily-logs/`      | GET, POST | Günlük sağlık kayıtları  |
| `/api/sessions/`        | GET, POST | Dinleme seansları        |
| `/api/chatbot-logs/`    | GET, POST | Chatbot konuşmaları      |
| `/api/dashboard/stats/` | GET       | Dashboard istatistikleri |

## 🎮 Kullanım

### 1. Hesap Oluşturma

1. Ana sayfada "Kayıt Ol" butonuna tıklayın
2. Gerekli bilgileri doldurun
3. E-posta adresinize gelen aktivasyon linkine tıklayın

### 2. Frekans Dinleme

1. Dashboard'a giriş yapın
2. "Frekanslar" bölümünden istediğiniz kategoriyi seçin
3. Bir frekans seçin ve "Dinle" butonuna tıklayın
4. Seansınızı tamamladıktan sonra değerlendirme yapın

### 3. Günlük Takip

1. "Anketler" bölümüne gidin
2. Günlük sağlık anketini doldurun
3. İlerlemenizi "Raporlar" bölümünden takip edin

### 4. Chatbot Kullanımı

1. Chat ikonuna tıklayın
2. Sorularınızı sorun veya tavsiye isteyin

## 📸 Ekran Görüntüleri

### Ana Sayfa

_Ana sayfa ekran görüntüsü buraya gelecek_

### Dashboard

_Dashboard ekran görüntüsü buraya gelecek_

### Frekans Player

_Frekans player ekran görüntüsü buraya gelecek_

### Sağlık Raporları

_Sağlık raporları ekran görüntüsü buraya gelecek_

## 🧪 Test Etme

### Backend Testleri

```bash
cd backend
python manage.py test
```

### Frontend Testleri

```bash
cd frontend
npm run test
# veya
yarn test
```

## 🔧 Geliştirme Ortamı

### Backend Geliştirme

- `backend/api/models.py`: Veritabanı modelleri
- `backend/api/views.py`: API view'ları
- `backend/api/serializers.py`: Data serialization
- `backend/api/urls.py`: URL routing

### Frontend Geliştirme

- `frontend/app/`: Next.js app router
- `frontend/components/`: Yeniden kullanılabilir bileşenler
- `frontend/lib/`: Utility fonksiyonları
- `frontend/styles/`: Global stiller

### Veritabanı Yapısı

```
User (Django Auth)
├── DailyLog (günlük sağlık kayıtları)
├── Session (dinleme seansları)
├── ChatbotLog (chatbot konuşmaları)
└── PDFReport (sağlık raporları)

Frequency (ses dosyaları)
└── Session (many-to-one ilişki)
```

## 📊 Proje İstatistikleri

- **Toplam Endpoint**: 25+
- **Model Sayısı**: 6
- **Frontend Sayfa**: 10+
- **API Yanıt Süresi**: <200ms
- **Test Kapsamı**: %85+

## 🔒 Güvenlik

- JWT token kimlik doğrulaması
- CORS koruması
- Rate limiting
- Input validation
- SQL injection koruması
- XSS koruması

## 📈 Gelecek Planları

- [ ] Mobil uygulama (React Native)
- [ ] Gerçek zamanlı bildirimler
- [ ] Sosyal özellikler (kullanıcı etkileşimi)
- [ ] Gelişmiş analizler (ML tahminleri)
- [ ] Giyilebilir cihaz entegrasyonu
- [ ] Çoklu dil desteği
- [ ] Offline mod desteği

## 🐛 Bilinen Sorunlar

- Audio player bazı eski tarayıcılarda sorun yaşayabilir
- Büyük dosya yükleme için progress bar eklenmeli
- Gerçek zamanlı özellikler için WebSocket entegrasyonu gerekli

## 📞 Destek

Herhangi bir sorun yaşadığınızda:

1. GitHub Issues bölümünde mevcut sorunları kontrol edin
2. Yeni issue oluşturun
3. Chatbot üzerinden 7/24 destek alın

## 👥 Ekip

- **Full Stack Developer**: Çağrı
- **UI/UX Designer**: [Tasarımcı Adı]
- **Audio Engineer**: [Mühendis Adı]

## 🙏 Teşekkürler

- Django ve Next.js topluluklarına
- Binaural beats araştırmacılarına
- Açık kaynak kütüphane geliştiricilerine
- Beta test kullanıcılarımıza

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için LICENSE dosyasına bakın.

---

<div align="center">
  <p>🌊 HealthWave ile sağlıklı bir yaşam için bilinçli adımlar atın! 🌊</p>
  <p>
    <a href="https://healthwave.com">Website</a> •
    <a href="mailto:support@healthwave.com">İletişim</a> •
    <a href="https://twitter.com/healthwave">Twitter</a>
  </p>
</div>
