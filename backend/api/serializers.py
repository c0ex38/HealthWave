# Django imports
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
import re

# DRF imports
from rest_framework import serializers
from rest_framework.validators import UniqueValidator

# Local imports
from .models import DailyLog, Frequency, Session, PDFReport, ChatbotLog

# ----------------- Kullanıcı Yönetimi Serializer'ları -----------------

class RegisterSerializer(serializers.ModelSerializer):
    """Kullanıcı kayıt serializer'ı - Güçlü validasyon ile"""
    
    email = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(queryset=User.objects.all(), message="Bu e-posta adresi zaten kullanılıyor.")]
    )
    username = serializers.CharField(
        validators=[UniqueValidator(queryset=User.objects.all(), message="Bu kullanıcı adı zaten kullanılıyor.")]
    )
    password = serializers.CharField(
        write_only=True,
        min_length=8,
        style={'input_type': 'password'}
    )
    password_confirm = serializers.CharField(
        write_only=True,
        style={'input_type': 'password'}
    )
    first_name = serializers.CharField(max_length=30, required=False, allow_blank=True)
    last_name = serializers.CharField(max_length=30, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm', 'first_name', 'last_name']

    def validate_username(self, value):
        """Kullanıcı adı validasyonu"""
        if len(value) < 3:
            raise serializers.ValidationError("Kullanıcı adı en az 3 karakter olmalıdır.")
        if not re.match(r'^[a-zA-Z0-9_.]+$', value):
            raise serializers.ValidationError(
                "Kullanıcı adı sadece harf, rakam, alt çizgi ve nokta içerebilir."
            )
        return value

    def validate_email(self, value):
        """E-posta validasyonu"""
        blocked_domains = ['10minutemail.com', 'tempmail.org']
        domain = value.split('@')[1].lower()
        if domain in blocked_domains:
            raise serializers.ValidationError("Geçici e-posta adresleri kullanılamaz.")
        return value.lower()

    def validate_password(self, value):
        """Şifre validasyonu"""
        try:
            validate_password(value)
        except ValidationError as e:
            raise serializers.ValidationError(list(e.messages))
        if value.lower() in ['password', '123456', 'qwerty']:
            raise serializers.ValidationError("Çok basit bir şifre seçtiniz.")
        return value

    def validate(self, attrs):
        """Genel validasyon"""
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({
                'password_confirm': 'Şifreler eşleşmiyor.'
            })
        if attrs['username'].lower() == attrs['password'].lower():
            raise serializers.ValidationError({
                'password': 'Şifre kullanıcı adı ile aynı olamaz.'
            })
        return attrs

    def create(self, validated_data):
        """Güvenli kullanıcı oluşturma"""
        validated_data.pop('password_confirm')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            is_active=False
        )
        return user


class LoginSerializer(serializers.Serializer):
    """Kullanıcı giriş serializer'ı"""
    
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})
    remember_me = serializers.BooleanField(default=False, required=False)

    def validate_username(self, value):
        return value.strip().lower()

    def validate(self, attrs):
        if not attrs.get('username') or not attrs.get('password'):
            raise serializers.ValidationError("Kullanıcı adı ve şifre gereklidir.")
        return attrs


class ChangePasswordSerializer(serializers.Serializer):
    """Şifre değiştirme serializer'ı"""
    
    old_password = serializers.CharField(write_only=True, style={'input_type': 'password'})
    new_password = serializers.CharField(write_only=True, min_length=8, style={'input_type': 'password'})
    new_password_confirm = serializers.CharField(write_only=True, style={'input_type': 'password'})

    def validate_new_password(self, value):
        try:
            validate_password(value)
        except ValidationError as e:
            raise serializers.ValidationError(list(e.messages))
        return value

    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({
                'new_password_confirm': 'Yeni şifreler eşleşmiyor.'
            })
        if attrs['old_password'] == attrs['new_password']:
            raise serializers.ValidationError({
                'new_password': 'Yeni şifre eski şifre ile aynı olamaz.'
            })
        return attrs


class ResetPasswordSerializer(serializers.Serializer):
    """Şifre sıfırlama serializer'ı"""
    
    username = serializers.CharField(max_length=150)
    new_password = serializers.CharField(write_only=True, min_length=8, style={'input_type': 'password'})
    new_password_confirm = serializers.CharField(write_only=True, style={'input_type': 'password'})

    def validate_new_password(self, value):
        try:
            validate_password(value)
        except ValidationError as e:
            raise serializers.ValidationError(list(e.messages))
        return value

    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({
                'new_password_confirm': 'Şifreler eşleşmiyor.'
            })
        return attrs


class UserProfileSerializer(serializers.ModelSerializer):
    """Kullanıcı profil bilgileri serializer'ı"""
    
    full_name = serializers.SerializerMethodField()
    member_since = serializers.SerializerMethodField()
    last_login_formatted = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 
                  'full_name', 'member_since', 'last_login_formatted', 'is_active']
        read_only_fields = ['id', 'username', 'is_active', 'member_since']

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip() or obj.username

    def get_member_since(self, obj):
        return obj.date_joined.strftime('%d/%m/%Y')

    def get_last_login_formatted(self, obj):
        if obj.last_login:
            return obj.last_login.strftime('%d/%m/%Y %H:%M')
        return "Hiç giriş yapmamış"

# ----------------- Ana Model Serializer'ları -----------------

class FrequencySerializer(serializers.ModelSerializer):
    """Frekans serializer'ı"""
    
    frequency_range = serializers.SerializerMethodField()
    popularity_level = serializers.SerializerMethodField()

    class Meta:
        model = Frequency
        fields = '__all__'

    def get_frequency_range(self, obj):
        return obj.frequency_range

    def get_popularity_level(self, obj):
        return obj.popularity_level


class DailyLogSerializer(serializers.ModelSerializer):
    """Günlük kayıt serializer'ı"""
    
    user_name = serializers.SerializerMethodField()
    date_formatted = serializers.SerializerMethodField()

    class Meta:
        model = DailyLog
        fields = '__all__'
        read_only_fields = ['user', 'date']

    def get_user_name(self, obj):
        return obj.user.username if obj.user else 'Anonim'

    def get_date_formatted(self, obj):
        if obj.date:
            return obj.date.strftime('%d/%m/%Y')
        return None


class SessionSerializer(serializers.ModelSerializer):
    """Dinleme oturumu serializer'ı"""
    
    user_name = serializers.SerializerMethodField()
    duration_formatted = serializers.SerializerMethodField()
    listened_at_formatted = serializers.SerializerMethodField()
    frequency_name = serializers.SerializerMethodField()

    class Meta:
        model = Session
        fields = '__all__'
        read_only_fields = ['user', 'listened_at']

    def get_user_name(self, obj):
        return obj.user.username if obj.user else 'Anonim'

    def get_duration_formatted(self, obj):
        return obj.duration_formatted

    def get_listened_at_formatted(self, obj):
        if obj.listened_at:
            return obj.listened_at.strftime('%d/%m/%Y %H:%M')
        return None

    def get_frequency_name(self, obj):
        return str(obj.frequency) if obj.frequency else None


class PDFReportSerializer(serializers.ModelSerializer):
    """PDF rapor serializer'ı"""
    
    user_name = serializers.SerializerMethodField()
    created_at_formatted = serializers.SerializerMethodField()
    file_size_formatted = serializers.SerializerMethodField()
    download_url = serializers.SerializerMethodField()

    class Meta:
        model = PDFReport
        fields = '__all__'
        read_only_fields = ['user', 'created_at']

    def get_user_name(self, obj):
        return obj.user.username if obj.user else 'Anonim'

    def get_created_at_formatted(self, obj):
        if obj.created_at:
            return obj.created_at.strftime('%d/%m/%Y %H:%M')
        return None

    def get_file_size_formatted(self, obj):
        return obj.file_size_formatted

    def get_download_url(self, obj):
        return obj.download_url

    def validate_file(self, value):
        if value:
            if value.size > 5 * 1024 * 1024:
                raise serializers.ValidationError("Dosya boyutu 5MB'dan büyük olamaz.")
            if not value.name.lower().endswith('.pdf'):
                raise serializers.ValidationError("Sadece PDF dosyaları kabul edilir.")
        return value

    def validate_title(self, value):
        if len(value.strip()) < 3:
            raise serializers.ValidationError("Rapor başlığı en az 3 karakter olmalıdır.")
        return value.strip()


class ChatbotLogSerializer(serializers.ModelSerializer):
    """Chatbot log serializer'ı"""
    
    user_name = serializers.SerializerMethodField()
    created_at_formatted = serializers.SerializerMethodField()
    message_preview = serializers.SerializerMethodField()
    response_length = serializers.SerializerMethodField()

    class Meta:
        model = ChatbotLog
        fields = '__all__'
        read_only_fields = ['user', 'created_at']

    def get_user_name(self, obj):
        return obj.user.username if obj.user else 'Anonim'

    def get_created_at_formatted(self, obj):
        if obj.created_at:
            return obj.created_at.strftime('%d/%m/%Y %H:%M:%S')
        return None

    def get_message_preview(self, obj):
        return obj.message_preview

    def get_response_length(self, obj):
        return obj.response_length

    def validate_user_message(self, value):
        if len(value.strip()) < 1:
            raise serializers.ValidationError("Mesaj boş olamaz.")
        if len(value) > 1000:
            raise serializers.ValidationError("Mesaj 1000 karakterden uzun olamaz.")
        return value.strip()

# ----------------- Dashboard & Statistics Serializers -----------------

class DashboardStatsSerializer(serializers.Serializer):
    surveys_count = serializers.IntegerField()
    sessions_count = serializers.IntegerField()
    reports_count = serializers.IntegerField()
    chatbot_logs_count = serializers.IntegerField()
    last_activity = serializers.DateTimeField(allow_null=True)
    member_since = serializers.DateTimeField()
    total_listening_time = serializers.IntegerField(default=0)
    most_used_frequency = serializers.CharField(allow_null=True, default=None)


class BulkActionSerializer(serializers.Serializer):
    action = serializers.ChoiceField(choices=['delete', 'archive', 'export'])
    item_ids = serializers.ListField(
        child=serializers.IntegerField(),
        min_length=1,
        max_length=100
    )

    def validate_item_ids(self, value):
        if not value:
            raise serializers.ValidationError("En az bir öğe seçmelisiniz.")
        if len(value) > 100:
            raise serializers.ValidationError("Aynı anda en fazla 100 öğe işleyebilirsiniz.")
        return value


class RecentActivitySerializer(serializers.Serializer):
    id = serializers.CharField()
    type = serializers.CharField()
    title = serializers.CharField()
    description = serializers.CharField()
    timestamp = serializers.DateTimeField()
    icon = serializers.CharField()
    color = serializers.CharField()
