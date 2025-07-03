from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.utils import timezone
from api.models import DailyLog, Frequency, Session, ChatbotLog
import random
from datetime import datetime, timedelta

class Command(BaseCommand):
    help = 'Generate fake users and data for testing (No external dependencies)'

    def add_arguments(self, parser):
        parser.add_argument('--users', type=int, default=10, help='Number of users to create')
        parser.add_argument('--days', type=int, default=100, help='Number of days of data per user')

    def handle(self, *args, **options):
        num_users = options['users']
        num_days = options['days']
        
        self.stdout.write(
            self.style.SUCCESS(f'🚀 {num_users} kullanıcı ve {num_days} günlük veri oluşturuluyor...')
        )
        
        # First, create frequencies if they don't exist
        self.create_frequencies()
        
        # Create fake users
        users = self.create_fake_users(num_users)
        
        # Create data for each user
        for user in users:
            self.create_user_data(user, num_days)
            
        self.stdout.write(
            self.style.SUCCESS(f'✅ Başarıyla tamamlandı! {num_users} kullanıcı ve toplam veri oluşturuldu.')
        )

    def create_frequencies(self):
        """Create Solfeggio frequency data if not exists"""
        # The 6 main Solfeggio frequencies with their Turkish descriptions
        frequencies_data = [
            {
                'name': 'Ut (Do) - Korku ve Suçluluk Direnci',
                'frequency_hz': 396.0,
                'category': 'Korku Direnci',
                'description': 'Negatif duygularla bağ kurma özelliği olan 396 Hz, bilinçaltında şekillenen suçluluk ve korku duygularını yatıştırmaya ve bireye psikolojik direnç uygulamaya odaklıdır.',
                'is_active': True,
                'audio_url': 'https://example.com/solfeggio/396hz'
            },
            {
                'name': 'Re - Değişimi Kabullenme',
                'frequency_hz': 417.0,
                'category': 'Uyum ve Denge',
                'description': '417 Hz, sakral çakrayla birebir etkileşim halindedir bu nedenle "denge" ve "iyileşme" çağrışımlarıyla bağdaştırılır. Geçmişe takılı kalmadan anın koşullarına uyum sağlama yetisini güçlendirir.',
                'is_active': True,
                'audio_url': 'https://example.com/solfeggio/417hz'
            },
            {
                'name': 'Mi - DNA Onarımı ve Sevgi',
                'frequency_hz': 528.0,
                'category': 'Sevgi ve Gelişim',
                'description': 'Dr. Leonard Horowitz\'e göre 528 Hz, varoluşun müzikal matematiğidir. Sevgi frekansı olarak bilinen 528, duyguları harekete geçiren ve DNA yenilenmesine pozitif etkilerde bulunan en popüler Solfeggio frekansıdır.',
                'is_active': True,
                'audio_url': 'https://example.com/solfeggio/528hz'
            },
            {
                'name': 'Fa - Bağ Kurma ve İlişkisel Denge',
                'frequency_hz': 639.0,
                'category': 'İlişki ve Bağlantı',
                'description': 'Kalp çakrasını etkileyen 639 Hz; pozitivite, empati, tolerans, bağlılık ve birliktelik gibi olguların gelişimine katkı sağlar. Bireysel ve çevresel ilişkilere ahenk getirir.',
                'is_active': True,
                'audio_url': 'https://example.com/solfeggio/639hz'
            },
            {
                'name': 'Sol - İfade Gücü ve Çözüm',
                'frequency_hz': 741.0,
                'category': 'İfade ve Çözüm',
                'description': 'Konuşma gücü ve yaratıcılıkla ilişkilendirilen 741 Hz, kendini ifade, analiz, neden-sonuç ilişkisi kurma ve amaca yönelik ilerleme gibi konularda aktivite gösterir. Hücrelerdeki elektromanyetik radyasyonu temizler.',
                'is_active': True,
                'audio_url': 'https://example.com/solfeggio/741hz'
            },
            {
                'name': 'La - Kendine Dönüş',
                'frequency_hz': 852.0,
                'category': 'Farkındalık',
                'description': 'Farkındalığı arttıran, gizli olanı açığa çıkaran, içe dönmeyi, sakinleşmeyi ve arındırmayı esas alan 852 Hz, spiritüel bir frekans olarak bilinir. Ruhsal farkındalığı geliştirir.',
                'is_active': True,
                'audio_url': 'https://example.com/solfeggio/852hz'
            }
        ]
        
        created_count = 0
        for freq_data in frequencies_data:
            frequency, created = Frequency.objects.get_or_create(
                name=freq_data['name'],
                defaults=freq_data
            )
            if created:
                created_count += 1
                
        self.stdout.write(f'📊 {created_count} yeni frekans oluşturuldu.')

    def create_fake_users(self, num_users):
        """Create fake users with Turkish names"""
        
        turkish_first_names = [
            'Ahmet', 'Mehmet', 'Ali', 'Hasan', 'Hüseyin', 'Mustafa', 'Ömer', 'İbrahim',
            'Fatma', 'Ayşe', 'Emine', 'Hatice', 'Zeynep', 'Elif', 'Meryem', 'Büşra',
            'Emre', 'Cem', 'Burak', 'Onur', 'Gökhan', 'Serkan', 'Tolga', 'Murat',
            'Selen', 'Deniz', 'Pınar', 'Gizem', 'Şule', 'Cansu', 'İpek', 'Merve'
        ]
        
        turkish_last_names = [
            'Yılmaz', 'Kaya', 'Demir', 'Çelik', 'Şahin', 'Öztürk', 'Arslan', 'Doğan',
            'Kılıç', 'Aslan', 'Özkan', 'Polat', 'Özdemir', 'Korkmaz', 'Aydın', 'Bulut',
            'Güneş', 'Kara', 'Koç', 'Kurt', 'Özgür', 'Erdoğan', 'Yıldız', 'Tan',
            'Akın', 'Başar', 'Çakır', 'Ersoy', 'Güven', 'Işık', 'Karaca', 'Özcan'
        ]
        
        users = []
        
        for i in range(num_users):
            username = f"test_user_{i+1}"
            first_name = random.choice(turkish_first_names)
            last_name = random.choice(turkish_last_names)
            email = f"{first_name.lower()}.{last_name.lower()}@example.com"
            
            user, created = User.objects.get_or_create(
                username=username,
                defaults={
                    'email': email,
                    'first_name': first_name,
                    'last_name': last_name,
                    'is_active': True
                }
            )
            
            if created:
                user.set_password('testpass123')
                user.save()
                users.append(user)
                
        self.stdout.write(f'👥 {len(users)} kullanıcı oluşturuldu.')
        return users

    def create_user_data(self, user, num_days):
        """Create comprehensive data for a user"""
        self.stdout.write(f'📝 {user.username} için veri oluşturuluyor...')
        
        # Get all frequencies
        frequencies = list(Frequency.objects.all())
        
        # Create data for the last num_days days
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=num_days-1)
        
        daily_logs_created = 0
        sessions_created = 0
        chatbot_logs_created = 0
        
        for day_offset in range(num_days):
            current_date = start_date + timedelta(days=day_offset)
            current_datetime = timezone.make_aware(
                datetime.combine(current_date, datetime.min.time()) + 
                timedelta(hours=random.randint(6, 22), minutes=random.randint(0, 59))
            )
            
            # Create DailyLog (80% chance each day)
            if random.random() < 0.8:
                daily_log, created = self.create_daily_log(user, current_date, current_datetime)
                if created:
                    daily_logs_created += 1
                
                # Create 1-3 Sessions per day (60% chance)
                if random.random() < 0.6:
                    num_sessions = random.randint(1, 3)
                    for session_num in range(num_sessions):
                        session_datetime = current_datetime + timedelta(
                            hours=random.randint(0, 16),
                            minutes=random.randint(0, 59)
                        )
                        self.create_session(user, frequencies, session_datetime)
                        sessions_created += 1
                
                # Create ChatbotLog (40% chance)
                if random.random() < 0.4:
                    chat_datetime = current_datetime + timedelta(
                        hours=random.randint(0, 20),
                        minutes=random.randint(0, 59)
                    )
                    self.create_chatbot_log(user, chat_datetime)
                    chatbot_logs_created += 1
        
        self.stdout.write(
            f'  ✅ {user.username}: {daily_logs_created} günlük kayıt, '
            f'{sessions_created} oturum, {chatbot_logs_created} chatbot mesajı'
        )

    def create_daily_log(self, user, date, created_at):
        """Create a realistic daily log entry"""
        # Generate correlated health data
        base_stress = random.randint(1, 10)
        base_sleep = random.uniform(5.0, 9.5)
        
        # Stress and restfulness are inversely correlated
        restfulness = max(1, min(10, 11 - base_stress + random.randint(-2, 2)))
        
        # Sleep quality affects other metrics
        sleep_quality_factor = 1.0 if base_sleep >= 7 else 0.8
        focus = max(1, min(10, int((10 - base_stress) * sleep_quality_factor + random.randint(-1, 2))))
        
        # Pulse varies with stress
        base_pulse = 60 + (base_stress * 3) + random.randint(-10, 15)
        pulse = max(50, min(120, base_pulse))
        
        moods = [
            'mutlu', 'sakin', 'enerjik', 'yorgun', 'stresli', 'kaygılı', 
            'huzurlu', 'motiveli', 'üzgün', 'kararlı', 'rahat', 'gergin',
            'neşeli', 'melankolik', 'coşkulu', 'durgun', 'optimist', 'endişeli'
        ]
        
        activities = [
            'yürüyüş', 'koşu', 'yoga', 'pilates', 'bisiklet', 'yüzme',
            'ev işleri', 'bahçe işleri', 'merdiven çıkma', 'dans',
            'spor salonu', 'futbol', 'basketbol', 'tenis', 'jimnastik'
        ]
        
        notes = [
            'Bugün kendimi oldukça iyi hissediyorum',
            'Yorgun bir gün geçirdim',
            'Stresli bir iş günü oldu',
            'Harika bir gün, çok enerjiktim',
            'Uyku kalitem iyiydi',
            'Kafam oldukça karışık',
            'Motivasyonum yüksek',
            'Biraz kaygılı hissediyorum',
            'Çok productive bir gün',
            'Dinlenmaya ihtiyacım var',
            'Sosyal aktiviteler güzeldi',
            'İşten yorgun döndüm',
            'Egzersiz sonrası kendimi harika hissediyorum',
            'Ailecek güzel vakit geçirdik',
            'Bugün meditasyon yaptım, çok rahatlattı',
            'İşte yoğun bir gün oldu',
            'Arkadaşlarımla buluştuk, keyifliydi',
            'Yeni bir hobiye başladım',
            'Sağlıklı beslenmeye odaklandım',
            'Erken yattım, sabah zinde uyandım'
        ]
        
        try:
            daily_log, created = DailyLog.objects.get_or_create(
                user=user,
                date=date,
                defaults={
                    'created_at': created_at,
                    'note': random.choice(notes),
                    'stress': base_stress,
                    'sleep_duration': round(base_sleep, 1),
                    'restfulness': restfulness,
                    'pulse': pulse,
                    'focus': focus,
                    'mood': f"{random.choice(moods)}, {random.choice(moods)}",
                    'physical_activity': f"{random.randint(15, 90)} dakika {random.choice(activities)}"
                }
            )
        except Exception:
            # Eğer zaten varsa, mevcut kaydı al
            daily_log = DailyLog.objects.get(user=user, date=date)
            created = False
        
        return daily_log, created

    def create_session(self, user, frequencies, listened_at):
        """Create a realistic session entry"""
        frequency = random.choice(frequencies)
        
        # Duration based on Solfeggio frequency category (minutes converted to seconds)
        duration_ranges = {
            'Korku Direnci': (900, 2400),      # 15-40 minutes - Deep emotional work
            'Uyum ve Denge': (1200, 2700),     # 20-45 minutes - Balance and adaptation
            'Sevgi ve Gelişim': (600, 1800),   # 10-30 minutes - Love and development
            'İlişki ve Bağlantı': (900, 2100), # 15-35 minutes - Relationship building
            'İfade ve Çözüm': (600, 1500),     # 10-25 minutes - Expression and problem solving
            'Farkındalık': (1800, 3600),       # 30-60 minutes - Deep awareness and meditation
        }
        
        duration_range = duration_ranges.get(frequency.category, (900, 1800))
        duration_seconds = random.randint(duration_range[0], duration_range[1])
        
        # 85% completion rate
        completed = random.random() < 0.85
        
        # Rating only if completed (70% give rating)
        rating = None
        if completed and random.random() < 0.7:
            # Higher frequencies tend to get better ratings, Solfeggio frequencies are generally well-rated
            if frequency.category in ['Sevgi ve Gelişim', 'Farkındalık', 'Uyum ve Denge']:
                rating = random.choices([3, 4, 5], weights=[1, 3, 5])[0]
            else:
                rating = random.choices([2, 3, 4, 5], weights=[1, 2, 4, 3])[0]
        
        session = Session.objects.create(
            user=user,
            frequency=frequency,
            listened_at=listened_at,
            duration_seconds=duration_seconds,
            completed=completed,
            rating=rating
        )
        
        return session

    def create_chatbot_log(self, user, created_at):
        """Create realistic chatbot conversation"""
        
        user_messages = [
            "Solfeggio frekansları nedir?",
            "396 Hz frekansı hangi durumlarda etkili?",
            "Korku ve kaygı için hangi frekansı dinlemeliyim?",
            "528 Hz sevgi frekansı hakkında bilgi verebilir misiniz?",
            "İlişkilerimi iyileştirmek için hangi frekans uygun?",
            "Kendimi ifade etmekte zorlanıyorum, hangi frekansı önerirsiniz?",
            "Farkındalığımı artırmak istiyorum",
            "DNA onarımı ve iyileşme için hangi frekans?",
            "Geçmişten kurtulmak ve değişime uyum sağlamak için ne önerirsiniz?",
            "852 Hz frekansının faydaları neler?",
            "Hangi Solfeggio frekansını ne kadar dinlemeliyim?",
            "Bu frekansların bilimsel temeli var mı?",
            "Solfeggio frekanslarını dinlerken nelere dikkat etmeliyim?",
            "Günde kaç saat Solfeggio frekansı dinleyebilirim?",
            "Hangi durumlarda 741 Hz frekansını tercih etmeliyim?",
            "417 Hz ile nasıl değişime uyum sağlayabilirim?",
            "639 Hz ilişki frekansının etkilerini ne zaman görürüm?",
            "Solfeggio frekanslarının çakra sistemiyle ilişkisi nedir?",
            "Kulaklık kullanmak zorunda mıyım?",
            "Frekans kombinasyonları yapabilir miyim?"
        ]
        
        bot_responses = [
            "Solfeggio frekansları 6 temel frekanstan oluşur: 396, 417, 528, 639, 741 ve 852 Hz. Her biri farklı psikolojik ve spiritüel etkiler sağlar.",
            "396 Hz korku ve suçluluk duygularına karşı direnç kazanmanıza yardımcı olur. Negatif duyguları temizlemek için idealdir.",
            "Korku ve kaygı için 396 Hz (Ut) frekansını öneriyorum. Günde 15-30 dakika dinleyerek etkisini hissedebilirsiniz.",
            "528 Hz 'sevgi frekansı' olarak bilinir. DNA onarımı, sevgi, gelişim ve yaratıcılığı destekler. En popüler Solfeggio frekansıdır.",
            "İlişkiler için 639 Hz (Fa) frekansı mükemmeldir. Empati, tolerans ve bağlılığı artırarak ilişkisel dengeyi sağlar.",
            "Kendini ifade etmek için 741 Hz (Sol) frekansını dinleyin. Konuşma gücü, yaratıcılık ve problem çözme becerinizi geliştirir.",
            "Farkındalık için 852 Hz (La) ideal. İçe dönmeyi, sakinleşmeyi ve ruhsal farkındalığı artırır. 30-60 dakika dinlemenizi öneririm.",
            "DNA onarımı ve iyileşme için 528 Hz frekansını seçin. Sevgi frekansı olarak da bilinen bu frekans hücresel yenilenmeyi destekler.",
            "417 Hz (Re) değişime uyum ve geçmişten kurtulmak için idealdir. Sakral çakrayı dengeleyerek iyileşme sürecini hızlandırır.",
            "852 Hz spiritüel bir frekanstır. Gizli olanı açığa çıkarır, farkındalığı artırır ve ruhsal gelişimi destekler.",
            "Her frekansı günde 15-45 dakika arası dinleyebilirsiniz. 528 Hz için 10-30 dakika, 852 Hz için 30-60 dakika ideal.",
            "Evet, Solfeggio frekansları Dr. Joseph Puleo'nun araştırmalarıyla bilimsel olarak incelenmiştir. Beyin dalgalarını etkiler.",
            "Rahat bir ortamda, kulaklık kullanarak, orta ses seviyesinde dinleyin. Meditasyon yaparken daha etkili olur.",
            "Günde toplam 1-2 saat yeterlidir. Farklı frekansları ihtiyacınıza göre kombinleyebilirsiniz.",
            "741 Hz analiz, neden-sonuç ilişkisi kurma ve yaratıcı problem çözme için kullanılır. Zihinsel berraklık sağlar.",
            "417 Hz düzenli dinleyerek geçmiş travmaları bırakabilir, değişimlere daha kolay adapte olabilirsiniz.",
            "639 Hz'in ilişki üzerindeki etkilerini 2-4 hafta içinde görmeye başlarsınız. Empati ve anlayışınız artar.",
            "Her Solfeggio frekansı belirli çakralarla rezonans halindedir. 396 Hz kök, 417 Hz sakral, 528 Hz kalp çakrasıyla uyumludur.",
            "Kulaklık şart değil ama daha etkili olur. Stereo hoparlör de kullanabilirsiniz, önemli olan frekansın doğru şekilde iletilmesi.",
            "Aynı anda farklı frekanslar karıştırmayın. Tek seferde bir frekansa odaklanın, günün farklı saatlerinde farklı frekanslar dinleyebilirsiniz."
        ]
        
        message_types = ['question', 'request', 'general', 'feedback', 'complaint']
        
        user_message = random.choice(user_messages)
        bot_response = random.choice(bot_responses)
        message_type = random.choice(message_types)
        
        # 70% helpful, 20% neutral, 10% not helpful
        is_helpful_choices = [True, None, False]
        is_helpful_weights = [7, 2, 1]
        is_helpful = random.choices(is_helpful_choices, weights=is_helpful_weights)[0]
        
        # Rating (60% of users give rating)
        user_rating = None
        if random.random() < 0.6:
            if is_helpful == True:
                user_rating = random.choices([4, 5], weights=[3, 7])[0]
            elif is_helpful == False:
                user_rating = random.choices([1, 2], weights=[3, 7])[0]
            else:
                user_rating = random.choice([2, 3, 4])
        
        response_time = round(random.uniform(1.0, 5.0), 1)
        
        chatbot_log = ChatbotLog.objects.create(
            user=user,
            user_message=user_message,
            bot_response=bot_response,
            created_at=created_at,
            message_type=message_type,
            user_rating=user_rating,
            is_helpful=is_helpful,
            response_time_seconds=response_time
        )
        
        return chatbot_log
