# 🌊 HealthWave - Solfeggio Frekans Terapisi Platformu

<div align="center">
  <img src="https://ibb.co/KjCTBGn2" alt="HealthWave Logo" width="200"/>
  
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

**HealthWave**, solfeggio frekansları kullanarak kullanıcıların zihinsel ve fiziksel sağlığını desteklemeyi amaçlayan modern bir platform projesidir. Platform, ses terapisi, günlük sağlık takibi ve yapay zeka destekli chatbot ile kişiselleştirilmiş öneriler sunarak kullanıcıların genel yaşam kalitesini artırmayı hedefler.

### 🎯 Temel Hedefler

- **Stres Azaltma**: Alpha ve Theta dalgaları ile doğal stres giderme
- **Uyku Kalitesi**: Delta frekansları ile derin ve kaliteli uyku
- **Odaklanma**: Beta dalgaları ile konsantrasyon artırma
- **Meditasyon**: Rehberli seanslar ile zihinsel rahatlama
- **Takip ve Analiz**: Günlük sağlık verilerinin analizi

## ✨ Özellikler

### 🔊 Ses Terapisi

- **Solfeggio Frekansları**: 174Hz, 285Hz, 396Hz, 417Hz, 528Hz, 639Hz, 741Hz, 852Hz, 963Hz şifa frekansları
- **Özelleştirilebilir Seanslar**: Süre ve frekans seçimi
- **Yüksek Kalite Audio**: MP3 formatlarında kristal netlikte ses
- **Bilimsel Temelli**: Araştırmalara dayalı frekans terapisi

### 📊 Sağlık Takibi

- **Günlük Anketler**: Stres, uyku, odaklanma ve genel sağlık durumu
- **İlerleme Analizi**: Zaman içindeki gelişimin grafikleri
- **Kişiselleştirilmiş Öneriler**: AI destekli sağlık tavsiyeleri
- **PDF Raporlar**: Detaylı sağlık analiz raporları

### 🤖 Yapay Zeka Chatbot

- **7/24 AI Destek**: Yapay zeka ile sağlık ve frekans konularında anında yardım
- **Eğitici İçerik**: Solfeggio frekansları ve sağlık hakkında bilgiler
- **Doğal Dil İşleme**: İnsan benzeri etkileşim deneyimi

### 📱 Modern Arayüz

- **Responsive Web**: Mobil, tablet ve masaüstü uyumlu web arayüzü
- **Android Uygulaması**: Kotlin ile geliştirilmiş native Android app
- **Koyu/Açık Tema**: Göz dostu tema seçenekleri
- **Kullanıcı Dostu**: Sezgisel ve kolay kullanım
- **Modern UI/UX**: Çağdaş tasarım anlayışı

## 🛠 Teknoloji Stack

### Backend

- **Framework**: Django 4.2 + Django REST Framework
- **Veritabanı**: Supabase PostgreSQL
- **Kimlik Doğrulama**: JWT (Simple JWT)
- **API**: Kapsamlı dokümantasyonlu RESTful API(POSTMAN Dökümantasyonu)
- **Dosya Depolama**: Supabase Storage
- **Gerçek Zamanlı**: Supabase Realtime
- **Güvenlik**: CORS, throttling, rate limiting

### Frontend

- **Web Framework**: Next.js 14 (App Router)
- **Mobile**: Kotlin (Android Native)
- **Dil**: TypeScript, Kotlin
- **Stil**: Tailwind CSS
- **State Yönetimi**: React Context + Hooks
- **HTTP İstemcisi**: Fetch API, Retrofit (Android)
- **UI Bileşenleri**: Özel bileşenler + Material Design (Android)
- **Audio Player**: Özel HTML5 audio + MediaPlayer (Android)

## 🚀 Kurulum

### Gereksinimler

- Python 3.11+
- Node.js 18+
- Android Studio (Android uygulama geliştirme için)
- Supabase hesabı
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
- **Supabase Dashboard**: https://app.supabase.com

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

### 🌐 Web Arayüzü

#### Ana Sayfa

<div align="center">
  <img src="resimler/web/Homepage.png" alt="HealthWave Ana Sayfa" width="600"/>
  <p><em>Modern ve kullanıcı dostu ana sayfa tasarımı</em></p>
</div>

#### Dashboard - Koyu Tema

<div align="center">
  <img src="resimler/web/dashboard_black.png" alt="Dashboard - Koyu Tema" width="600"/>
  <p><em>Göz dostu koyu tema ile dashboard görünümü</em></p>
</div>

#### Dashboard - Açık Tema

<div align="center">
  <img src="resimler/web/dashboard_white.png" alt="Dashboard - Açık Tema" width="600"/>
  <p><em>Aydınlık ve temiz açık tema dashboard</em></p>
</div>

#### Platform Özellikleri

<div align="center">
  <table>
    <tr>
      <td align="center">
        <img src="resimler/web/web_1.png" alt="Frekans Player" width="280"/>
        <br>
        <strong>🎵 Solfeggio Frekans Player</strong>
      </td>
      <td align="center">
        <img src="resimler/web/web_2.png" alt="Sağlık Takibi" width="280"/>
        <br>
        <strong>📊 Günlük Sağlık Takibi</strong>
      </td>
    </tr>
    <tr>
      <td align="center">
        <img src="resimler/web/web_3.png" alt="AI Chatbot" width="280"/>
        <br>
        <strong>🤖 Yapay Zeka Chatbot</strong>
      </td>
      <td align="center">
        <img src="resimler/web/web_4.png" alt="Raporlar" width="280"/>
        <br>
        <strong>📋 Detaylı Raporlar</strong>
      </td>
    </tr>
  </table>
</div>

### 📱 Android Uygulaması

<div align="center">
  <p><em>🚧 Android uygulama ekran görüntüleri yakında eklenecek...</em></p>
</div>

## 🔧 Geliştirme Ortamı

### Backend Geliştirme

- `backend/api/models.py`: Veritabanı modelleri
- `backend/api/views.py`: API view'ları
- `backend/api/serializers.py`: Data serialization
- `backend/api/urls.py`: URL routing

### Frontend Geliştirme

- `frontend/app/`: Next.js app router
- `android/`: Kotlin Android uygulaması

### Veritabanı Yapısı (Supabase PostgreSQL)

```sql
-- Ana Uygulama Tabloları
┌─────────────────────────────────────────────────────────────┐
│                     🗄️ HEALTHWAVE DATABASE                   │
└─────────────────────────────────────────────────────────────┘

📊 api_dailylog                    🎵 api_frequency
├── id (bigint, PK)               ├── id (bigint, PK)
├── date (date)                   ├── name (varchar)
├── stress (integer)              ├── frequency_hz (double)
├── sleep_duration (double)       ├── category (varchar)
├── restfulness (integer)         ├── description (text)
├── pulse (integer)               ├── scientific_reference (text)
├── focus (integer)               ├── usage_count (integer)
├── mood (varchar)                ├── is_active (boolean)
├── physical_activity (text)      ├── audio_file (varchar)
├── note (text)                   └── audio_url (varchar)
├── created_at (timestamp)
└── user_id (FK → auth_user)

🎧 api_session                     🤖 api_chatbotlog
├── id (bigint, PK)               ├── id (bigint, PK)
├── listened_at (timestamp)       ├── user_message (text)
├── duration_seconds (integer)    ├── bot_response (text)
├── completed (boolean)           ├── message_type (varchar)
├── rating (integer)              ├── user_rating (integer)
├── user_id (FK → auth_user)      ├── is_helpful (boolean)
└── frequency_id (FK → api_frequency) ├── response_time_seconds (double)
                                  ├── created_at (timestamp)
                                  └── user_id (FK → auth_user)

📋 api_pdfreport                   👤 auth_user (Django Auth)
├── id (bigint, PK)               ├── id (integer, PK)
├── title (varchar)               ├── username (varchar, UNIQUE)
├── description (text)            ├── email (varchar)
├── file (varchar)                ├── password (varchar)
├── file_size (integer)           ├── first_name (varchar)
├── download_count (integer)      ├── last_name (varchar)
├── is_active (boolean)           ├── is_active (boolean)
├── created_at (timestamp)        ├── is_staff (boolean)
└── user_id (FK → auth_user)      ├── is_superuser (boolean)
                                  ├── last_login (timestamp)
                                  └── date_joined (timestamp)

🔗 İlişkiler:
├── User → DailyLog (1:N)
├── User → Session (1:N)
├── User → ChatbotLog (1:N)
├── User → PDFReport (1:N)
└── Frequency → Session (1:N)

📈 Analitik Verileri:
├── Günlük sağlık metrikleri (stress, uyku, odaklanma)
├── Frekans dinleme geçmişi ve süreleri
├── AI chatbot etkileşim analizi
└── Kullanıcı aktivite raporları
```

## 🔒 Güvenlik

- JWT token kimlik doğrulaması
- CORS koruması
- Rate limiting
- Input validation
- SQL injection koruması
- XSS koruması

## 📈 Gelecek Planları

- [ ] iOS versiyonu (Swift)
- [ ] Gerçek zamanlı bildirimler
- [ ] Sosyal özellikler (kullanıcı etkileşimi)
- [ ] Gelişmiş AI analizleri (ML tahminleri)
- [ ] Giyilebilir cihaz entegrasyonu
- [ ] Çoklu dil desteği
- [ ] Offline mod desteği

## 📞 Destek

Herhangi bir sorun yaşadığınızda:

1. GitHub Issues bölümünde mevcut sorunları kontrol edin
2. Yeni issue oluşturun

## 👥 Yaratıcısı

- **Full Stack Developer & UI/UX Designer**: Çağrı Özay
- **Teknolojiler**: Django, Next.js, Kotlin, Supabase, AI/ML

## 🙏 Teşekkürler

- Django ve Next.js topluluklarına
- Supabase ekibine
- Kotlin/Android geliştirici topluluğuna
- Solfeggio frekansları araştırmacılarına (https://ouraring.com/blog/the-benefits-of-the-9-solfeggio-frequencies/?srsltid=AfmBOortJDCGle_fnSfLhzDo3MqrErqpoMpKncKzWGVZewbaFqL_Z-Ze, https://livetobloom.com/solfeggio-frekanslari-psikolojide-ses-titresimleri/, https://science.howstuffworks.com/science-vs-myth/unexplained-phenomena/solfeggio-frequencies.htm)
- Açık kaynak kütüphane geliştiricilerine

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için LICENSE dosyasına bakın.

---

<div align="center">
  <p>🌊 HealthWave ile sağlıklı bir yaşam için bilinçli adımlar atın! 🌊</p>
</div>
