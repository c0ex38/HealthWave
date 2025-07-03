from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator, FileExtensionValidator


# --------------------- DailyLog Modeli ---------------------
class DailyLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='daily_logs')
    
    date = models.DateField(auto_now_add=True, help_text="Kayıt tarihi") 
    created_at = models.DateTimeField(auto_now_add=True, help_text="Oluşturulma zamanı (API uyumluluğu için)")
    
    note = models.TextField(blank=True, null=True, help_text="Günlük notlar / açıklamalar")
    
    stress = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(10)],
        help_text="Stres seviyesi (1-10 arası)"
    )
    sleep_duration = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(24.0)],
        help_text="Uyku süresi (saat cinsinden)"
    )
    restfulness = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(10)],
        help_text="Dinlenmişlik seviyesi (1-10 arası)"
    )
    pulse = models.IntegerField(
        validators=[MinValueValidator(30), MaxValueValidator(220)],
        help_text="Nabız (bpm)"
    )
    focus = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(10)],
        help_text="Odaklanma seviyesi (1-10 arası)"
    )
    mood = models.CharField(
        max_length=200,
        blank=True,
        null=True,
        help_text="Ruh durumu (örn. mutlu, kaygılı, yorgun)"
    )
    physical_activity = models.TextField(
        blank=True,
        null=True,
        help_text="Fiziksel aktivite (ör. yürüyüş, spor, yoga)"
    )

    @property
    def overall_wellness_score(self):
        """
        Genel sağlık skoru hesapla (1-10)
        Düşük stres → yüksek skor
        """
        adjusted_stress = 11 - self.stress
        scores = [adjusted_stress, self.restfulness, self.focus]
        return round(sum(scores) / len(scores), 1)

    @property
    def sleep_quality(self):
        """
        Uyku kalitesini kategorik olarak döndür
        """
        if self.sleep_duration < 6:
            return "Yetersiz"
        elif self.sleep_duration < 7:
            return "Kısa"
        elif self.sleep_duration <= 9:
            return "Optimal"
        else:
            return "Uzun"

    def __str__(self):
        return f"{self.user.username} - {self.date.strftime('%d/%m/%Y')} - Skor: {self.overall_wellness_score}"

    @property
    def user_is_active(self):
        return self.user.is_active

    class Meta:
        ordering = ['-date']
        verbose_name = "Günlük Kayıt"
        verbose_name_plural = "Günlük Kayıtlar"
        unique_together = ('user', 'date')


# --------------------- Frequency Modeli ---------------------
def frequency_audio_upload_path(instance, filename):
    # Örneğin: frequencies/396hz/filename.mp3
    return f"frequencies/{int(instance.frequency_hz)}hz/{filename}"

class Frequency(models.Model):
    name = models.CharField(
        max_length=100,
        help_text="Frekans adı"
    )
    frequency_hz = models.FloatField(
        validators=[MinValueValidator(0.1), MaxValueValidator(1000.0)],
        help_text="Frekans değeri (Hz)"
    )
    category = models.CharField(
        max_length=100,
        help_text="Kategori (Stres, Uyku, vs.)"
    )
    description = models.TextField(
        blank=True,
        null=True,
        help_text="Frekansın etkisi ve açıklaması"
    )
    scientific_reference = models.TextField(
        blank=True,
        null=True,
        help_text="Bilimsel kaynak"
    )
    audio_file = models.FileField(
        upload_to=frequency_audio_upload_path,
        blank=True,
        null=True,
        help_text="Frekansın ses dosyası (MP3, WAV vs.)"
    )
    audio_url = models.URLField(
        blank=True,
        null=True,
        help_text="Alternatif olarak harici ses URL'i (YouTube, SoundCloud vs.)"
    )
    usage_count = models.PositiveIntegerField(
        default=0,
        help_text="Kullanım sayısı"
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Aktif frekans"
    )

    @property
    def audio_source(self):
        """Ses kaynağını döndürür - önce local dosya, sonra URL"""
        if self.audio_file:
            return self.audio_file.url
        elif self.audio_url:
            return self.audio_url
    @property
    def audio_source(self):
        """Ses kaynağını döndürür - önce local dosya, sonra URL"""
        if self.audio_file:
            return self.audio_file.url
        elif self.audio_url:
            return self.audio_url
        return None

    @property
    def has_audio(self):
        """Ses dosyası var mı kontrol eder"""
        return bool(self.audio_file or self.audio_url)

    @property
    def frequency_range(self):
        """Frekans aralığı kategorisi"""
        if self.frequency_hz < 4:
            return "Delta (0.5-4 Hz)"
        elif self.frequency_hz < 8:
            return "Theta (4-8 Hz)"
        elif self.frequency_hz < 13:
            return "Alpha (8-13 Hz)"
        elif self.frequency_hz < 30:
            return "Beta (13-30 Hz)"
        else:
            return "Gamma (30+ Hz)"

    @property
    def popularity_level(self):
        """Popülerlik seviyesi"""
        if self.usage_count < 10:
            return "Yeni"
        elif self.usage_count < 50:
            return "Popüler"
        else:
            return "Çok Popüler"

    def increment_usage(self):
        """Kullanım sayısını artır"""
        self.usage_count += 1
        self.save(update_fields=['usage_count'])

    def __str__(self):
        return f"{self.name} - {self.frequency_hz} Hz - {self.category}"

    class Meta:
        ordering = ['category', 'frequency_hz']
        verbose_name = "Frekans"
        verbose_name_plural = "Frekanslar"


# --------------------- Session Modeli ---------------------
class Session(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='sessions',
        help_text="Oturumu gerçekleştiren kullanıcı"
    )
    frequency = models.ForeignKey(
        'Frequency',
        on_delete=models.CASCADE,
        related_name='sessions',
        help_text="Dinlenen frekans"
    )
    listened_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Oturumun başladığı zaman"
    )
    duration_seconds = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(7200)],
        help_text="Dinleme süresi (saniye cinsinden)"
    )
    completed = models.BooleanField(
        default=True,
        help_text="Oturum tamamlandı mı?"
    )
    rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        blank=True, 
        null=True,
        help_text="Oturum puanı (1-5 yıldız)"
    )

    @property
    def duration_minutes(self):
        """
        Süreyi dakika cinsinden döndürür.
        Örn: 90 saniye → 1.5 dakika
        """
        return round(self.duration_seconds / 60, 1)

    @property
    def duration_formatted(self):
        """
        Süreyi dakika:saniye biçiminde döndürür.
        Örn: 90 → 01:30
        """
        minutes = self.duration_seconds // 60
        seconds = self.duration_seconds % 60
        return f"{minutes:02d}:{seconds:02d}"

    def save(self, *args, **kwargs):
        """
        Oturum kaydedilirken, frekans kullanım sayısını artırır.
        """
        is_new = self.pk is None
        super().save(*args, **kwargs)
        
        if is_new and self.frequency:
            self.frequency.increment_usage()

    def __str__(self):
        status = "✓" if self.completed else "◯"
        return f"{status} {self.user.username} - {self.frequency.frequency_hz} Hz - {self.duration_minutes} dk"

    @property
    def user_is_active(self):
        return self.user.is_active

    class Meta:
        ordering = ['-listened_at']
        verbose_name = "Dinleme Oturumu"
        verbose_name_plural = "Dinleme Oturumları"


# --------------------- PDFReport Modeli ---------------------
def report_upload_path(instance, filename):
    # Örn. reports/user_12/filename.pdf
    return f"reports/user_{instance.user.id}/{filename}"

class PDFReport(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='pdf_reports',
        help_text="Raporu oluşturan kullanıcı"
    )
    title = models.CharField(
        max_length=200,
        help_text="Rapor başlığı"
    )
    description = models.TextField(
        blank=True,
        null=True,
        help_text="Rapor açıklaması / içeriği hakkında bilgi"
    )
    file = models.FileField(
        upload_to=report_upload_path,
        validators=[FileExtensionValidator(allowed_extensions=['pdf'])],
        blank=True,
        null=True,
        help_text="Yüklenen PDF dosyası"
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Rapor oluşturulma tarihi"
    )
    file_size = models.PositiveIntegerField(
        default=0,
        help_text="Dosya boyutu (bytes cinsinden)"
    )
    download_count = models.PositiveIntegerField(
        default=0,
        help_text="Raporun indirilme sayısı"
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Rapor aktif mi?"
    )

    @property
    def file_size_formatted(self):
        """
        Dosya boyutunu okunabilir formatta döndürür.
        Örn. 2500 → 2.4 KB
        """
        if self.file_size < 1024:
            return f"{self.file_size} B"
        elif self.file_size < 1024 * 1024:
            return f"{self.file_size / 1024:.1f} KB"
        else:
            return f"{self.file_size / (1024 * 1024):.1f} MB"

    @property
    def download_url(self):
        """
        Dosya yüklü ise, dosyanın URL'ini döner.
        """
        if self.file:
            return self.file.url
        return None

    def save(self, *args, **kwargs):
        """
        Kaydedilirken dosya boyutunu günceller.
        """
        if self.file:
            self.file_size = self.file.size
        super().save(*args, **kwargs)

    def increment_download(self):
        """
        İndirilme sayısını artırır.
        """
        self.download_count += 1
        self.save(update_fields=['download_count'])

    def __str__(self):
        return f"{self.title} - {self.user.username} ({self.created_at.strftime('%d/%m/%Y')})"

    @property
    def user_is_active(self):
        return self.user.is_active

    class Meta:
        ordering = ['-created_at']
        verbose_name = "PDF Raporu"
        verbose_name_plural = "PDF Raporları"


# --------------------- ChatbotLog Modeli ---------------------
class ChatbotLog(models.Model):
    MESSAGE_TYPES = [
        ('question', 'Soru'),
        ('complaint', 'Şikayet'),
        ('request', 'İstek'),
        ('feedback', 'Geri Bildirim'),
        ('general', 'Genel'),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='chatbot_logs',
        help_text="Mesajı gönderen kullanıcı"
    )
    user_message = models.TextField(
        help_text="Kullanıcının yazdığı mesaj"
    )
    bot_response = models.TextField(
        help_text="Chatbot'un cevabı"
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Mesaj oluşturulma zamanı"
    )
    message_type = models.CharField(
        max_length=20,
        choices=MESSAGE_TYPES,
        default='general',
        help_text="Mesaj türü"
    )
    user_rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        blank=True,
        null=True,
        help_text="Kullanıcının yanıt için verdiği puan (1-5 yıldız)"
    )
    is_helpful = models.BooleanField(
        blank=True,
        null=True,
        help_text="Yanıt yardımcı oldu mu?"
    )
    response_time_seconds = models.FloatField(
        default=0.0,
        help_text="Chatbot'un yanıt süresi (saniye cinsinden)"
    )

    @property
    def message_preview(self):
        """
        Kullanıcı mesajından ilk 100 karakteri döndürür.
        """
        return self.user_message[:100] + '...' if len(self.user_message) > 100 else self.user_message

    @property
    def bot_response_preview(self):
        """
        Bot yanıtından ilk 100 karakteri döndürür.
        """
        return self.bot_response[:100] + '...' if len(self.bot_response) > 100 else self.bot_response

    @property
    def response_length(self):
        """
        Bot yanıtının karakter sayısını döndürür.
        """
        return len(self.bot_response) if self.bot_response else 0

    def __str__(self):
        preview = self.message_preview
        return f"{self.user.username} - {preview} ({self.created_at.strftime('%d/%m/%Y %H:%M')})"

    @property
    def user_is_active(self):
        return self.user.is_active

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Chatbot Mesajı"
        verbose_name_plural = "Chatbot Mesajları"

