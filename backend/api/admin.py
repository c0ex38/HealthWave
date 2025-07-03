from django.contrib import admin
from .models import DailyLog, Frequency, Session, PDFReport, ChatbotLog

# ------------------ DailyLog Admin ------------------
@admin.register(DailyLog)
class DailyLogAdmin(admin.ModelAdmin):
    list_display = ('user', 'date', 'stress', 'sleep_duration', 'restfulness', 'pulse', 'focus', 'overall_wellness_score')
    search_fields = ('user__username', 'mood', 'note')
    list_filter = ('date', 'stress', 'restfulness', 'focus')
    date_hierarchy = 'date'
    readonly_fields = ('overall_wellness_score', 'sleep_quality', 'created_at')
    
    fieldsets = (
        ('Kullanıcı Bilgileri', {
            'fields': ('user',)
        }),
        ('Tarih ve Zaman', {
            'fields': ('date', 'created_at')
        }),
        ('Sağlık Verileri', {
            'fields': ('stress', 'sleep_duration', 'restfulness', 'pulse', 'focus')
        }),
        ('Notlar ve Aktiviteler', {
            'fields': ('note', 'mood', 'physical_activity')
        }),
        ('Hesaplanan Değerler', {
            'fields': ('overall_wellness_score', 'sleep_quality'),
            'classes': ('collapse',)
        })
    )

# ------------------ Frequency Admin ------------------
@admin.register(Frequency)
class FrequencyAdmin(admin.ModelAdmin):
    list_display = ('name', 'frequency_hz', 'category', 'usage_count', 'is_active', 'frequency_range', 'popularity_level')
    search_fields = ('name', 'category', 'description')
    list_filter = ('category', 'is_active', 'frequency_hz')
    readonly_fields = ('usage_count', 'frequency_range', 'popularity_level')
    
    fieldsets = (
        ('Temel Bilgiler', {
            'fields': ('name', 'frequency_hz', 'category', 'is_active')
        }),
        ('Açıklamalar', {
            'fields': ('description', 'scientific_reference')
        }),
        ('Ses Dosyası', {
            'fields': ('audio_file',),
            'description': 'Sadece MP3 formatında ses dosyası yükleyin'
        }),
        ('İstatistikler', {
            'fields': ('usage_count', 'frequency_range', 'popularity_level'),
            'classes': ('collapse',)
        })
    )
    
    actions = ['mark_as_active', 'mark_as_inactive']
    
    def mark_as_active(self, request, queryset):
        queryset.update(is_active=True)
        self.message_user(request, f"{queryset.count()} frekans aktif hale getirildi.")
    mark_as_active.short_description = "Seçili frekansları aktif yap"
    
    def mark_as_inactive(self, request, queryset):
        queryset.update(is_active=False)
        self.message_user(request, f"{queryset.count()} frekans pasif hale getirildi.")
    mark_as_inactive.short_description = "Seçili frekansları pasif yap"

# ------------------ Session Admin ------------------
@admin.register(Session)
class SessionAdmin(admin.ModelAdmin):
    list_display = ('user', 'frequency', 'listened_at', 'duration_formatted', 'completed', 'rating', 'user_is_active')
    search_fields = ('user__username', 'frequency__name', 'frequency__category')
    list_filter = ('listened_at', 'completed', 'rating', 'frequency__category', 'frequency__name')
    date_hierarchy = 'listened_at'
    readonly_fields = ('duration_minutes', 'duration_formatted', 'user_is_active')
    
    fieldsets = (
        ('Kullanıcı ve Frekans', {
            'fields': ('user', 'frequency')
        }),
        ('Oturum Detayları', {
            'fields': ('listened_at', 'duration_seconds', 'completed', 'rating')
        }),
        ('Hesaplanan Değerler', {
            'fields': ('duration_minutes', 'duration_formatted', 'user_is_active'),
            'classes': ('collapse',)
        })
    )
    
    actions = ['mark_as_completed']
    
    def mark_as_completed(self, request, queryset):
        queryset.update(completed=True)
        self.message_user(request, f"{queryset.count()} oturum tamamlandı olarak işaretlendi.")
    mark_as_completed.short_description = "Seçili oturumları tamamlandı olarak işaretle"

# ------------------ PDFReport Admin ------------------
@admin.register(PDFReport)
class PDFReportAdmin(admin.ModelAdmin):
    list_display = ('user', 'title', 'created_at', 'file_size_formatted', 'download_count', 'is_active')
    search_fields = ('user__username', 'title', 'description')
    list_filter = ('created_at', 'is_active')
    date_hierarchy = 'created_at'
    readonly_fields = ('file_size', 'file_size_formatted', 'download_count', 'download_url', 'user_is_active')
    
    fieldsets = (
        ('Kullanıcı ve Başlık', {
            'fields': ('user', 'title', 'is_active')
        }),
        ('İçerik', {
            'fields': ('description', 'file')
        }),
        ('Tarih ve İstatistikler', {
            'fields': ('created_at', 'file_size', 'file_size_formatted', 'download_count')
        }),
        ('URL ve Durum', {
            'fields': ('download_url', 'user_is_active'),
            'classes': ('collapse',)
        })
    )
    
    actions = ['mark_as_active', 'mark_as_inactive']
    
    def mark_as_active(self, request, queryset):
        queryset.update(is_active=True)
        self.message_user(request, f"{queryset.count()} rapor aktif hale getirildi.")
    mark_as_active.short_description = "Seçili raporları aktif yap"
    
    def mark_as_inactive(self, request, queryset):
        queryset.update(is_active=False)
        self.message_user(request, f"{queryset.count()} rapor pasif hale getirildi.")
    mark_as_inactive.short_description = "Seçili raporları pasif yap"

# ------------------ ChatbotLog Admin ------------------
@admin.register(ChatbotLog)
class ChatbotLogAdmin(admin.ModelAdmin):
    list_display = ('user', 'created_at', 'message_preview', 'message_type', 'user_rating', 'is_helpful', 'response_time_seconds')
    search_fields = ('user__username', 'user_message', 'bot_response')
    list_filter = ('created_at', 'message_type', 'user_rating', 'is_helpful')
    date_hierarchy = 'created_at'
    readonly_fields = ('response_length', 'message_preview', 'bot_response_preview', 'user_is_active')
    
    fieldsets = (
        ('Kullanıcı ve Tarih', {
            'fields': ('user', 'created_at', 'message_type')
        }),
        ('Mesaj İçeriği', {
            'fields': ('user_message', 'bot_response')
        }),
        ('Değerlendirme', {
            'fields': ('user_rating', 'is_helpful', 'response_time_seconds')
        }),
        ('Hesaplanan Değerler', {
            'fields': ('message_preview', 'bot_response_preview', 'response_length', 'user_is_active'),
            'classes': ('collapse',)
        })
    )
    
    actions = ['mark_as_helpful', 'mark_as_not_helpful']
    
    def mark_as_helpful(self, request, queryset):
        queryset.update(is_helpful=True)
        self.message_user(request, f"{queryset.count()} mesaj yardımcı olarak işaretlendi.")
    mark_as_helpful.short_description = "Seçili mesajları yardımcı olarak işaretle"
    
    def mark_as_not_helpful(self, request, queryset):
        queryset.update(is_helpful=False)
        self.message_user(request, f"{queryset.count()} mesaj yardımcı değil olarak işaretlendi.")
    mark_as_not_helpful.short_description = "Seçili mesajları yardımcı değil olarak işaretle"

# Admin site başlık ve açıklamaları
admin.site.site_header = "HealtWave Yönetim Paneli"
admin.site.site_title = "HealtWave Admin"
admin.site.index_title = "HealtWave Yönetim Paneli"
