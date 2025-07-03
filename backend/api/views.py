# Django imports
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.contrib.sites.shortcuts import get_current_site
from django.urls import reverse
from django.core.mail import send_mail
from django.conf import settings
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.cache import cache
from django.db import transaction, models
import logging

# DRF imports
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, serializers
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.throttling import UserRateThrottle, AnonRateThrottle
from rest_framework.generics import ListAPIView, ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.pagination import PageNumberPagination

# Local imports
from .models import Frequency, DailyLog, Session, PDFReport, ChatbotLog
from .serializers import (
    FrequencySerializer, DailyLogSerializer, SessionSerializer,
    PDFReportSerializer, ChatbotLogSerializer,
    RegisterSerializer, LoginSerializer, ChangePasswordSerializer, ResetPasswordSerializer,
    UserProfileSerializer, DashboardStatsSerializer
)

# Standard library imports
import threading
import uuid
from datetime import datetime, timedelta
import os

# Logger setup
logger = logging.getLogger(__name__)

# =====================================================
#               Utilities & Pagination
# =====================================================

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class CustomThrottle(UserRateThrottle):
    scope = 'user'

class LoginThrottle(AnonRateThrottle):
    scope = 'login'
    rate = '5/min'  # 5 login attempts per minute

# =====================================================
#               Kullanıcı Yönetimi ve E-posta
# =====================================================

class EmailThread(threading.Thread):
    """E-posta işlemlerini ayrı bir thread'de çalıştırmak için yardımcı sınıf."""
    def __init__(self, subject, message, from_email, recipient_list):
        self.subject = subject
        self.message = message
        self.from_email = from_email
        self.recipient_list = recipient_list
        threading.Thread.__init__(self)
    
    def run(self):
        try:
            send_mail(self.subject, self.message, self.from_email, self.recipient_list)
            logger.info(f"Email sent successfully to {self.recipient_list}")
        except Exception as e:
            logger.error(f"Failed to send email: {str(e)}")

def generate_activation_token(user):
    """Güvenli aktivasyon token'ı oluşturur."""
    token_data = {
        'user_id': user.pk,
        'timestamp': datetime.now().timestamp(),
        'uuid': str(uuid.uuid4())
    }
    refresh = RefreshToken.for_user(user)
    refresh['token_data'] = token_data
    return str(refresh.access_token)

def send_activation_email(user, request):
    """Kullanıcıya aktivasyon maili gönderir."""
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = generate_activation_token(user)
    
    # Cache token for validation
    cache_key = f"activation_token_{user.pk}"
    cache.set(cache_key, token, timeout=3600)  # 1 hour expiry
    
    # Frontend URL'ini kullan (Next.js app)
    frontend_domain = getattr(settings, 'FRONTEND_DOMAIN', 'http://localhost:3000')
    activation_url = f"{frontend_domain}/activate?uid={uid}&token={token}"
    
    subject = 'HealtWave Hesap Aktivasyonu'
    message = (
        f"Merhaba {user.username},\n\n"
        f"HealtWave'e hoş geldiniz! Hesabınızı aktifleştirmek için aşağıdaki linke tıklayın:\n\n"
        f"{activation_url}\n\n"
        f"⚠️ Bu link 1 saat geçerlidir.\n\n"
        f"Eğer bu kayıt işlemini siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.\n\n"
        f"Sağlıklı günler dileriz!\n"
        f"HealtWave Ekibi"
    )
    
    EmailThread(subject, message, settings.DEFAULT_FROM_EMAIL, [user.email]).start()
    logger.info(f"Activation email queued for user: {user.username} with frontend URL: {activation_url}")

def get_tokens_for_user(user):
    """Kullanıcı için JWT token'ları oluşturur."""
    refresh = RefreshToken.for_user(user)
    
    # Add custom claims
    refresh['username'] = user.username
    refresh['email'] = user.email
    refresh['last_login'] = user.last_login.isoformat() if user.last_login else None
    
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
        'expires_in': settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds()
    }

# =====================================================
#           Auth - Register / Activate / Login
# =====================================================

class RegisterView(APIView):
    throttle_classes = [AnonRateThrottle]
    
    def post(self, request):
        logger.info(f"Registration attempt with data: {request.data}")
        
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            try:
                with transaction.atomic():
                    # Check if user already exists
                    username = serializer.validated_data['username']
                    email = serializer.validated_data.get('email')
                    
                    logger.info(f"Attempting to create user: {username} with email: {email}")
                    
                    if User.objects.filter(username=username).exists():
                        logger.warning(f"Username already exists: {username}")
                        return Response(
                            {"error": "Bu kullanıcı adı zaten kullanılıyor."},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                    
                    if email and User.objects.filter(email=email).exists():
                        logger.warning(f"Email already exists: {email}")
                        return Response(
                            {"error": "Bu e-posta adresi zaten kullanılıyor."},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                    
                    user = serializer.save()
                    user.is_active = False
                    user.save()
                    
                    send_activation_email(user, request)
                    logger.info(f"New user registered: {user.username}")
                    
                    return Response(
                        {
                            "message": "Kayıt başarılı! Hesabınızı aktifleştirmek için e-posta adresinize gönderilen linke tıklayın.",
                            "user_id": user.id
                        },
                        status=status.HTTP_201_CREATED
                    )
            except Exception as e:
                logger.error(f"Registration error: {str(e)}")
                return Response(
                    {"error": "Kayıt sırasında bir hata oluştu."},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        else:
            logger.warning(f"Registration validation failed: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ActivateAccountView(APIView):
    def get(self, request):
        uid = request.GET.get('uid')
        token = request.GET.get('token')
        
        logger.info(f"Activation attempt - UID: {uid}, Token length: {len(token) if token else 0}")
        
        if not uid or not token:
            logger.warning("Missing activation parameters")
            return Response(
                {"error": "Eksik parametreler. UID ve token gereklidir."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Decode UID
            try:
                user_id = force_str(urlsafe_base64_decode(uid))
                logger.info(f"Decoded user_id: {user_id}")
            except Exception as e:
                logger.error(f"UID decode error: {str(e)}")
                return Response(
                    {"error": "Geçersiz UID formatı."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get user
            try:
                user = User.objects.get(pk=user_id)
                logger.info(f"Found user: {user.username}, is_active: {user.is_active}")
            except User.DoesNotExist:
                logger.error(f"User not found with ID: {user_id}")
                return Response(
                    {"error": "Kullanıcı bulunamadı."},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Check cached token
            cache_key = f"activation_token_{user.pk}"
            cached_token = cache.get(cache_key)
            logger.info(f"Cache key: {cache_key}, cached_token exists: {cached_token is not None}")
            
            if not cached_token:
                logger.error("No cached token found")
                return Response(
                    {"error": "Aktivasyon linki süresi dolmuş veya geçersiz."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if cached_token != token:
                logger.error("Token mismatch")
                return Response(
                    {"error": "Geçersiz aktivasyon token'ı."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if not user.is_active:
                user.is_active = True
                user.save()
                
                # Clear the token from cache
                cache.delete(cache_key)
                
                logger.info(f"Account activated successfully: {user.username}")
                return Response({"message": "Hesabınız başarıyla aktifleştirildi!"})
            else:
                logger.info(f"Account already active: {user.username}")
                return Response({"message": "Hesap zaten aktif!"})
                
        except Exception as e:
            logger.error(f"Unexpected activation error: {str(e)}")
            return Response(
                {"error": f"Aktivasyon sırasında bir hata oluştu: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class LoginView(APIView):
    throttle_classes = [LoginThrottle]
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            username = serializer.validated_data['username']
            password = serializer.validated_data['password']
            
            # Check for brute force attempts
            cache_key = f"login_attempts_{request.META.get('REMOTE_ADDR', 'unknown')}"
            attempts = cache.get(cache_key, 0)
            
            if attempts >= 5:
                return Response(
                    {"error": "Çok fazla başarısız giriş denemesi. Lütfen 15 dakika sonra tekrar deneyin."},
                    status=status.HTTP_429_TOO_MANY_REQUESTS
                )
            
            user = authenticate(username=username, password=password)
            
            if user:
                if not user.is_active:
                    return Response(
                        {"error": "Hesabınız aktif değil. Lütfen e-posta adresinize gönderilen aktivasyon linkine tıklayın."},
                        status=status.HTTP_401_UNAUTHORIZED
                    )
                
                # Clear failed attempts on successful login
                cache.delete(cache_key)
                
                # Update last login
                user.last_login = datetime.now()
                user.save(update_fields=['last_login'])
                
                tokens = get_tokens_for_user(user)
                logger.info(f"Successful login: {user.username}")
                
                return Response({
                    "message": "Giriş başarılı",
                    "tokens": tokens,
                    "user": {
                        "id": user.id,
                        "username": user.username,
                        "email": user.email,
                        "last_login": user.last_login.isoformat() if user.last_login else None
                    }
                })
            else:
                # Increment failed attempts
                cache.set(cache_key, attempts + 1, timeout=900)  # 15 minutes
                logger.warning(f"Failed login attempt for username: {username}")
                
                return Response(
                    {"error": "Geçersiz bilgiler"},
                    status=status.HTTP_401_UNAUTHORIZED
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]
    
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            old_password = serializer.validated_data['old_password']
            new_password = serializer.validated_data['new_password']
            
            if not user.check_password(old_password):
                logger.warning(f"Wrong old password attempt for user: {user.username}")
                return Response(
                    {"error": "Mevcut şifre yanlış!"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            try:
                user.set_password(new_password)
                user.save()
                
                # Log the password change
                logger.info(f"Password changed for user: {user.username}")
                
                return Response({
                    "message": "Şifre başarıyla değiştirildi.",
                    "timestamp": datetime.now().isoformat()
                })
            except Exception as e:
                logger.error(f"Password change error for user {user.username}: {str(e)}")
                return Response(
                    {"error": "Şifre değiştirilirken bir hata oluştu."},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ResetPasswordView(APIView):
    throttle_classes = [AnonRateThrottle]
    
    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        if serializer.is_valid():
            username = serializer.validated_data['username']
            new_password = serializer.validated_data['new_password']
            
            try:
                user = User.objects.get(username=username)
                
                # Şifreyi değiştir
                user.set_password(new_password)
                user.save()
                
                # E-posta gönder
                subject = 'HealtWave Şifre Sıfırlama'
                message = (
                    f"Merhaba {user.username},\n\n"
                    f"Şifreniz başarıyla sıfırlandı.\n"
                    f"Eğer bu işlemi siz yapmadıysanız lütfen bizimle iletişime geçin.\n\n"
                    f"Teşekkürler,\nHealtWave Ekibi"
                )
                from_email = settings.DEFAULT_FROM_EMAIL
                recipient_list = [user.email]
                
                # EmailThread sınıfını kullan
                EmailThread(subject, message, from_email, recipient_list).start()
                logger.info(f"Password reset email sent to user: {user.username}")
                
                return Response({
                    "message": "Şifre başarıyla sıfırlandı ve bilgilendirme e-postası gönderildi.",
                    "timestamp": datetime.now().isoformat()
                })
            
            except User.DoesNotExist:
                logger.warning(f"Password reset attempt for non-existent user: {username}")
                return Response(
                    {"error": "Kullanıcı bulunamadı."},
                    status=status.HTTP_404_NOT_FOUND
                )
            except Exception as e:
                logger.error(f"Password reset error: {str(e)}")
                return Response(
                    {"error": "Şifre sıfırlama sırasında bir hata oluştu."},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# =====================================================
#                Ana Model API'leri
# =====================================================

# --------- Frequency ---------
class FrequencyListView(ListAPIView):
    queryset = Frequency.objects.all()
    serializer_class = FrequencySerializer
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        queryset = super().get_queryset()
        # Add caching
        cache_key = "frequency_list"
        cached_data = cache.get(cache_key)
        if cached_data is None:
            cache.set(cache_key, queryset, timeout=3600)  # 1 hour
        return queryset


class FrequencyStreamView(APIView):
    """
    Frekans ses dosyasını stream eder
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request, pk):
        try:
            frequency = Frequency.objects.get(pk=pk, is_active=True)
            
            if not frequency.has_audio:
                return Response({
                    'error': 'Bu frekans için ses dosyası bulunamadı'
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Kullanım sayısını artır
            frequency.increment_usage()
            
            return Response({
                'frequency_id': frequency.id,
                'name': frequency.name,
                'frequency_hz': frequency.frequency_hz,
                'category': frequency.category,
                'audio_source': frequency.audio_source,
                'audio_type': 'file' if frequency.audio_file else 'url',
                'description': frequency.description
            })
            
        except Frequency.DoesNotExist:
            return Response({
                'error': 'Frekans bulunamadı'
            }, status=status.HTTP_404_NOT_FOUND)


class FrequencyPlayView(APIView):
    """
    Frekans oynatma session'ı başlatır
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request, pk):
        try:
            frequency = Frequency.objects.get(pk=pk, is_active=True)
            
            if not frequency.has_audio:
                return Response({
                    'error': 'Bu frekans için ses dosyası bulunamadı'
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Yeni session oluştur
            session = Session.objects.create(
                user=request.user,
                frequency=frequency,
                duration_seconds=0,  # Başlangıçta 0, sonra update edilecek
                completed=False
            )
            
            return Response({
                'session_id': session.id,
                'frequency_id': frequency.id,
                'name': frequency.name,
                'frequency_hz': frequency.frequency_hz,
                'category': frequency.category,
                'audio_source': frequency.audio_source,
                'audio_type': 'file' if frequency.audio_file else 'url',
                'description': frequency.description,
                'started_at': session.listened_at
            }, status=status.HTTP_201_CREATED)
            
        except Frequency.DoesNotExist:
            return Response({
                'error': 'Frekans bulunamadı'
            }, status=status.HTTP_404_NOT_FOUND)

# --------- DailyLog ---------
class DailyLogListCreateView(ListCreateAPIView):
    serializer_class = DailyLogSerializer
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        queryset = DailyLog.objects.filter(user=self.request.user).select_related('user')
        
        # Add filtering by date
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        
        if start_date:
            queryset = queryset.filter(date__gte=start_date)
        if end_date:
            queryset = queryset.filter(date__lte=end_date)
            
        return queryset.order_by('-date')

    def perform_create(self, serializer):
        try:
            # Aynı tarih için kayıt var mı kontrol et
            today = datetime.now().date()
            existing_log = DailyLog.objects.filter(user=self.request.user, date=today).first()
            
            if existing_log:
                # Bugün için zaten bir kayıt varsa hata döndür
                logger.warning(f"User {self.request.user.username} attempted to create multiple DailyLogs for {today}")
                raise serializers.ValidationError({
                    "date": f"Bugün ({today.strftime('%d/%m/%Y')}) için zaten bir günlük kaydınız bulunuyor. "
                           f"Bunun yerine mevcut kaydı güncelleyebilirsiniz."
                })
            
            daily_log = serializer.save(user=self.request.user)
            logger.info(f"DailyLog created by user {self.request.user.username}: {daily_log.id}")
        except serializers.ValidationError:
            raise
        except Exception as e:
            logger.error(f"DailyLog creation error: {str(e)}")
            raise

class DailyLogDetailView(RetrieveUpdateDestroyAPIView):
    serializer_class = DailyLogSerializer
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]
    
    def get_queryset(self):
        return DailyLog.objects.filter(user=self.request.user).select_related('user')
    
    def perform_update(self, serializer):
        logger.info(f"DailyLog updated by user {self.request.user.username}: {serializer.instance.id}")
        serializer.save()
    
    def perform_destroy(self, instance):
        logger.info(f"DailyLog deleted by user {self.request.user.username}: {instance.id}")
        instance.delete()

# --------- Session ---------
class SessionListCreateView(ListCreateAPIView):
    serializer_class = SessionSerializer
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        queryset = Session.objects.filter(user=self.request.user).select_related('user')
        
        # Add filtering
        session_type = self.request.query_params.get('type')
        if session_type:
            queryset = queryset.filter(session_type=session_type)
            
        return queryset.order_by('-listened_at')
    
    def perform_create(self, serializer):
        try:
            session = serializer.save(user=self.request.user)
            logger.info(f"Session created by user {self.request.user.username}: {session.id}")
        except Exception as e:
            logger.error(f"Session creation error: {str(e)}")
            raise

class SessionDetailView(RetrieveUpdateDestroyAPIView):
    serializer_class = SessionSerializer
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]
    
    def get_queryset(self):
        return Session.objects.filter(user=self.request.user).select_related('user')

class SessionUpdateDurationView(APIView):
    """
    Session süresini ve tamamlanma durumunu günceller
    """
    permission_classes = [IsAuthenticated]
    
    def patch(self, request, pk):
        try:
            session = Session.objects.get(pk=pk, user=request.user)
            
            duration_seconds = request.data.get('duration_seconds')
            completed = request.data.get('completed', False)
            rating = request.data.get('rating')
            
            if duration_seconds is not None:
                session.duration_seconds = duration_seconds
            
            session.completed = completed
            
            if rating is not None and 1 <= rating <= 5:
                session.rating = rating
            
            session.save()
            
            return Response({
                'session_id': session.id,
                'duration_seconds': session.duration_seconds,
                'duration_minutes': session.duration_minutes,
                'completed': session.completed,
                'rating': session.rating,
                'message': 'Session başarıyla güncellendi'
            })
            
        except Session.DoesNotExist:
            return Response({
                'error': 'Session bulunamadı'
            }, status=status.HTTP_404_NOT_FOUND)
        except ValueError as e:
            return Response({
                'error': 'Geçersiz veri formatı'
            }, status=status.HTTP_400_BAD_REQUEST)

# --------- PDFReport ---------
class PDFReportListCreateView(ListCreateAPIView):
    serializer_class = PDFReportSerializer
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        return PDFReport.objects.filter(user=self.request.user).select_related('user').order_by('-created_at')
    
    def perform_create(self, serializer):
        try:
            report = serializer.save(user=self.request.user)
            logger.info(f"PDF Report created by user {self.request.user.username}: {report.id}")
        except Exception as e:
            logger.error(f"PDF Report creation error: {str(e)}")
            raise

class PDFReportDetailView(RetrieveUpdateDestroyAPIView):
    serializer_class = PDFReportSerializer
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]
    
    def get_queryset(self):
        return PDFReport.objects.filter(user=self.request.user).select_related('user')

# --------- ChatbotLog ---------
class ChatbotLogListCreateView(ListCreateAPIView):
    serializer_class = ChatbotLogSerializer
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        queryset = ChatbotLog.objects.filter(user=self.request.user).select_related('user')
        
        # Add search functionality
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(user_message__icontains=search)
            
        return queryset.order_by('-created_at')
    
    def perform_create(self, serializer):
        try:
            log = serializer.save(user=self.request.user)
            logger.info(f"Chatbot log created by user {self.request.user.username}: {log.id}")
        except Exception as e:
            logger.error(f"Chatbot log creation error: {str(e)}")
            raise

class ChatbotLogDetailView(RetrieveUpdateDestroyAPIView):
    serializer_class = ChatbotLogSerializer
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]
    
    def get_queryset(self):
        return ChatbotLog.objects.filter(user=self.request.user).select_related('user')

# =====================================================
#                  Dashboard & Statistics
# =====================================================

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Kullanıcı profil bilgilerini döndürür"""
        try:
            serializer = UserProfileSerializer(request.user)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Profile fetch error for user {request.user.username}: {str(e)}")
            return Response(
                {"error": "Profil bilgileri yüklenirken bir hata oluştu."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def put(self, request):
        """Kullanıcı profil bilgilerini günceller"""
        try:
            serializer = UserProfileSerializer(request.user, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                logger.info(f"Profile updated for user: {request.user.username}")
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Profile update error for user {request.user.username}: {str(e)}")
            return Response(
                {"error": "Profil güncellenirken bir hata oluştu."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Dashboard istatistiklerini döndürür"""
        try:
            user = request.user
            
            # Get total listening time
            total_listening_time = Session.objects.filter(user=user).aggregate(
                total=models.Sum('duration_seconds')
            )['total'] or 0
            
            # Get most used frequency
            most_used_frequency = None
            if Session.objects.filter(user=user).exists():
                frequency_usage = Session.objects.filter(user=user).values('frequency__name').annotate(
                    count=models.Count('frequency')
                ).order_by('-count').first()
                if frequency_usage:
                    most_used_frequency = frequency_usage['frequency__name']
            
            stats = {
                'surveys_count': DailyLog.objects.filter(user=user).count(),
                'sessions_count': Session.objects.filter(user=user).count(),
                'reports_count': PDFReport.objects.filter(user=user).count(),
                'chatbot_logs_count': ChatbotLog.objects.filter(user=user).count(),
                'last_activity': user.last_login,
                'member_since': user.date_joined,
                'total_listening_time': total_listening_time,
                'most_used_frequency': most_used_frequency,
            }
            
            serializer = DashboardStatsSerializer(stats)
            return Response(serializer.data)
            
        except Exception as e:
            logger.error(f"Dashboard stats error for user {user.username}: {str(e)}")
            return Response(
                {"error": "İstatistikler yüklenirken bir hata oluştu."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

# =====================================================
#           Gelişmiş API Views ve Analytics
# =====================================================

class AdvancedAnalyticsView(APIView):
    """Gelişmiş analitik veriler için endpoint"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            user = request.user
            period = request.query_params.get('period', 'month')  # week, month, year
            
            # Tarih aralığını belirle
            end_date = datetime.now()
            if period == 'week':
                start_date = end_date - timedelta(days=7)
            elif period == 'month':
                start_date = end_date - timedelta(days=30)
            elif period == 'year':
                start_date = end_date - timedelta(days=365)
            else:
                start_date = end_date - timedelta(days=30)
            
            # Survey analitiği
            daily_logs = DailyLog.objects.filter(
                user=user, 
                created_at__gte=start_date,
                created_at__lte=end_date
            )
            
            # Session analitiği
            sessions = Session.objects.filter(
                user=user,
                listened_at__gte=start_date,
                listened_at__lte=end_date
            )
            
            analytics_data = {
                'period': period,
                'date_range': {
                    'start': start_date.isoformat(),
                    'end': end_date.isoformat()
                },
                'stress_trend': self._calculate_stress_trend(daily_logs),
                'sleep_pattern': self._calculate_sleep_pattern(daily_logs),
                'session_effectiveness': self._calculate_session_effectiveness(sessions),
                'weekly_stats': self._calculate_weekly_stats(user, start_date, end_date),
                'recommendations': self._generate_recommendations(daily_logs, sessions)
            }
            
            return Response(analytics_data)
            
        except Exception as e:
            logger.error(f"Analytics error for user {request.user.username}: {str(e)}")
            return Response(
                {"error": "Analitik veriler yüklenirken bir hata oluştu."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def _calculate_stress_trend(self, daily_logs):
        """Stres trend analizi"""
        if not daily_logs.exists():
            return None
            
        stress_data = []
        for daily_log in daily_logs.order_by('created_at'):
            stress_data.append({
                'date': daily_log.created_at.date().isoformat(),
                'stress_level': daily_log.stress,
                'overall_score': daily_log.overall_wellness_score
            })
        
        avg_stress = sum(s['stress_level'] for s in stress_data) / len(stress_data)
        
        return {
            'average_stress': round(avg_stress, 1),
            'trend': 'improving' if stress_data[-1]['stress_level'] < stress_data[0]['stress_level'] else 'stable',
            'data_points': stress_data
        }
    
    def _calculate_sleep_pattern(self, daily_logs):
        """Uyku pattern analizi"""
        if not daily_logs.exists():
            return None
            
        sleep_data = []
        total_sleep = 0
        
        for daily_log in daily_logs.order_by('created_at'):
            sleep_data.append({
                'date': daily_log.created_at.date().isoformat(),
                'duration': daily_log.sleep_duration,
                'quality': daily_log.sleep_quality,
                'restfulness': daily_log.restfulness
            })
            total_sleep += daily_log.sleep_duration
        
        avg_sleep = total_sleep / len(sleep_data)
        
        return {
            'average_duration': round(avg_sleep, 1),
            'quality_distribution': self._get_sleep_quality_distribution(sleep_data),
            'pattern': 'consistent' if max(s['duration'] for s in sleep_data) - min(s['duration'] for s in sleep_data) < 2 else 'irregular',
            'data_points': sleep_data
        }
    
    def _get_sleep_quality_distribution(self, sleep_data):
        """Uyku kalitesi dağılımı"""
        quality_counts = {}
        for data in sleep_data:
            quality = data['quality']
            quality_counts[quality] = quality_counts.get(quality, 0) + 1
        return quality_counts
    
    def _calculate_session_effectiveness(self, sessions):
        """Session etkinlik analizi"""
        if not sessions.exists():
            return None
            
        total_sessions = sessions.count()
        completed_sessions = sessions.filter(completed=True).count()
        avg_duration = sessions.aggregate(avg=models.Avg('duration_seconds'))['avg'] or 0
        avg_rating = sessions.filter(rating__isnull=False).aggregate(avg=models.Avg('rating'))['avg'] or 0
        
        # Frekans kullanım analizi
        frequency_usage = sessions.values('frequency__name').annotate(
            count=models.Count('frequency'),
            avg_rating=models.Avg('rating'),
            total_duration=models.Sum('duration_seconds')
        ).order_by('-count')
        
        return {
            'completion_rate': round((completed_sessions / total_sessions) * 100, 1) if total_sessions > 0 else 0,
            'average_duration': round(avg_duration / 60, 1),  # dakika cinsinden
            'average_rating': round(avg_rating, 1),
            'most_used_frequencies': list(frequency_usage[:5]),
            'effectiveness_score': self._calculate_effectiveness_score(completed_sessions, total_sessions, avg_rating)
        }
    
    def _calculate_effectiveness_score(self, completed, total, avg_rating):
        """Etkinlik skoru hesapla"""
        if total == 0:
            return 0
        completion_score = (completed / total) * 50
        rating_score = (avg_rating / 5) * 50 if avg_rating else 0
        return round(completion_score + rating_score, 1)
    
    def _calculate_weekly_stats(self, user, start_date, end_date):
        """Haftalık istatistikler"""
        weeks = []
        current_date = start_date
        
        while current_date <= end_date:
            week_end = min(current_date + timedelta(days=7), end_date)
            
            week_daily_logs = DailyLog.objects.filter(
                user=user,
                created_at__gte=current_date,
                created_at__lt=week_end
            )
            
            week_sessions = Session.objects.filter(
                user=user,
                listened_at__gte=current_date,
                listened_at__lt=week_end
            )
            
            weeks.append({
                'week_start': current_date.isoformat(),
                'surveys_count': week_daily_logs.count(),
                'sessions_count': week_sessions.count(),
                'avg_stress': week_daily_logs.aggregate(avg=models.Avg('stress'))['avg'] or 0,
                'total_listening_time': week_sessions.aggregate(sum=models.Sum('duration_seconds'))['sum'] or 0
            })
            
            current_date = week_end
        
        return weeks
    
    def _generate_recommendations(self, daily_logs, sessions):
        """Kişiselleştirilmiş öneriler"""
        recommendations = []
        
        if daily_logs.exists():
            avg_stress = daily_logs.aggregate(avg=models.Avg('stress'))['avg']
            avg_sleep = daily_logs.aggregate(avg=models.Avg('sleep_duration'))['avg']
            
            if avg_stress and avg_stress > 7:
                recommendations.append({
                    'type': 'stress_management',
                    'priority': 'high',
                    'message': 'Stres seviyeniz yüksek. Alpha frekansları (8-13 Hz) ile günlük 15-20 dakika dinleme seansı önerilir.'
                })
            
            if avg_sleep and avg_sleep < 7:
                recommendations.append({
                    'type': 'sleep_improvement',
                    'priority': 'medium',
                    'message': 'Uyku sürenizi artırmaya çalışın. Delta frekansları (0.5-4 Hz) yatmadan önce dinlemeyi deneyin.'
                })
        
        if sessions.exists():
            completion_rate = sessions.filter(completed=True).count() / sessions.count()
            if completion_rate < 0.7:
                recommendations.append({
                    'type': 'session_completion',
                    'priority': 'medium',
                    'message': 'Dinleme seanslarınızı tamamlama oranınızı artırmaya çalışın. Daha kısa seanslarla başlayabilirsiniz.'
                })
        
        return recommendations

class HealthInsightsView(APIView):
    """Sağlık öngörüleri ve öneriler"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            user = request.user
            
            # Son 30 günün verilerini al
            thirty_days_ago = datetime.now() - timedelta(days=30)
            recent_daily_logs = DailyLog.objects.filter(
                user=user,
                created_at__gte=thirty_days_ago
            ).order_by('created_at')
            
            recent_sessions = Session.objects.filter(
                user=user,
                listened_at__gte=thirty_days_ago
            ).order_by('listened_at')
            
            insights = {
                'health_score': self._calculate_health_score(recent_daily_logs),
                'progress_indicators': self._calculate_progress(recent_daily_logs),
                'wellness_trends': self._analyze_wellness_trends(recent_daily_logs),
                'session_insights': self._analyze_session_patterns(recent_sessions),
                'personalized_tips': self._generate_personalized_tips(recent_daily_logs, recent_sessions),
                'achievement_badges': self._calculate_achievements(user),
                'next_goals': self._suggest_next_goals(recent_daily_logs, recent_sessions)
            }
            
            return Response(insights)
            
        except Exception as e:
            logger.error(f"Health insights error for user {request.user.username}: {str(e)}")
            return Response(
                {"error": "Sağlık öngörüleri yüklenirken bir hata oluştu."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def _calculate_health_score(self, daily_logs):
        """Genel sağlık skoru"""
        if not daily_logs.exists():
            return 0
            
        total_score = sum(daily_log.overall_wellness_score for daily_log in daily_logs)
        avg_score = total_score / daily_logs.count()
        
        return {
            'current_score': round(avg_score, 1),
            'max_score': 10,
            'category': self._get_health_category(avg_score),
            'improvement_potential': round(10 - avg_score, 1)
        }
    
    def _get_health_category(self, score):
        """Sağlık kategorisi belirleme"""
        if score >= 8:
            return {'name': 'Mükemmel', 'color': 'green'}
        elif score >= 6:
            return {'name': 'İyi', 'color': 'blue'}
        elif score >= 4:
            return {'name': 'Orta', 'color': 'yellow'}
        else:
            return {'name': 'Geliştirilmeli', 'color': 'red'}
    
    def _calculate_progress(self, daily_logs):
        """İlerleme göstergeleri"""
        if daily_logs.count() < 7:
            return None
            
        # İlk hafta vs son hafta karşılaştırması
        first_week = daily_logs[:7]
        last_week = daily_logs[max(0, daily_logs.count() - 7):]
        
        first_week_avg = sum(s.overall_wellness_score for s in first_week) / len(first_week)
        last_week_avg = sum(s.overall_wellness_score for s in last_week) / len(last_week)
        
        progress = last_week_avg - first_week_avg
        
        return {
            'overall_progress': round(progress, 1),
            'progress_percentage': round((progress / 10) * 100, 1),
            'trend': 'improving' if progress > 0.5 else 'declining' if progress < -0.5 else 'stable'
        }
    
    def _analyze_wellness_trends(self, daily_logs):
        """Wellness trend analizi"""
        trends = {}
        
        if daily_logs.exists():
            # Stres trendi
            stress_values = [s.stress for s in daily_logs]
            trends['stress'] = self._calculate_trend(stress_values, reverse=True)
            
            # Uyku trendi
            sleep_values = [s.sleep_duration for s in daily_logs]
            trends['sleep'] = self._calculate_trend(sleep_values)
            
            # Odaklanma trendi
            focus_values = [s.focus for s in daily_logs]
            trends['focus'] = self._calculate_trend(focus_values)
            
            # Dinlenme trendi
            rest_values = [s.restfulness for s in daily_logs]
            trends['restfulness'] = self._calculate_trend(rest_values)
        
        return trends
    
    def _calculate_trend(self, values, reverse=False):
        """Trend hesaplama"""
        if len(values) < 3:
            return {'direction': 'insufficient_data', 'strength': 0}
            
        # Basit trend analizi - ilk yarı vs ikinci yarı
        mid_point = len(values) // 2
        first_half_avg = sum(values[:mid_point]) / mid_point
        second_half_avg = sum(values[mid_point:]) / (len(values) - mid_point)
        
        change = second_half_avg - first_half_avg
        if reverse:
            change = -change
            
        if abs(change) < 0.3:
            direction = 'stable'
        elif change > 0:
            direction = 'improving'
        else:
            direction = 'declining'
            
        strength = min(abs(change) * 10, 10)  # 0-10 arası güç
        
        return {
            'direction': direction,
            'strength': round(strength, 1),
            'change_value': round(change, 2)
        }
    
    def _analyze_session_patterns(self, sessions):
        """Session pattern analizi"""
        if not sessions.exists():
            return None
            
        # Günlük kullanım paterni
        daily_usage = {}
        for session in sessions:
            day = session.listened_at.strftime('%A')
            daily_usage[day] = daily_usage.get(day, 0) + 1
        
        # En aktif gün
        most_active_day = max(daily_usage, key=daily_usage.get) if daily_usage else None
        
        # Ortalama session süresi
        avg_duration = sessions.aggregate(avg=models.Avg('duration_seconds'))['avg'] or 0
        
        return {
            'total_sessions': sessions.count(),
            'average_duration': round(avg_duration / 60, 1),  # dakika
            'most_active_day': most_active_day,
            'daily_distribution': daily_usage,
            'consistency_score': self._calculate_consistency_score(sessions)
        }
    
    def _calculate_consistency_score(self, sessions):
        """Tutarlılık skoru"""
        if sessions.count() < 7:
            return 0
            
        # Son 7 gün içinde kaç gün kullanım var
        last_week = datetime.now() - timedelta(days=7)
        recent_sessions = sessions.filter(listened_at__gte=last_week)
        
        unique_days = len(set(s.listened_at.date() for s in recent_sessions))
        consistency = (unique_days / 7) * 100
        
        return round(consistency, 1)
    
    def _generate_personalized_tips(self, daily_logs, sessions):
        """Kişiselleştirilmiş ipuçları"""
        tips = []
        
        if daily_logs.exists():
            latest_daily_log = daily_logs.last()
            
            # Stres bazlı ipuçları
            if latest_daily_log.stress >= 7:
                tips.append({
                    'category': 'stress',
                    'tip': 'Stres seviyeniz yüksek. Günde 2 kez 10 dakikalık Alpha dalgası (8-13 Hz) dinleme seansı yapın.',
                    'frequency_recommendation': 'Alpha (8-13 Hz)'
                })
            
            # Uyku bazlı ipuçları
            if latest_daily_log.sleep_duration < 7:
                tips.append({
                    'category': 'sleep',
                    'tip': 'Uyku süreniz ideal değil. Yatmadan 30 dakika önce Delta frekansları (0.5-4 Hz) dinleyin.',
                    'frequency_recommendation': 'Delta (0.5-4 Hz)'
                })
            
            # Odaklanma bazlı ipuçları
            if latest_daily_log.focus <= 5:
                tips.append({
                    'category': 'focus',
                    'tip': 'Odaklanma için çalışmadan önce 15 dakika Beta frekansları (13-30 Hz) dinleyin.',
                    'frequency_recommendation': 'Beta (13-30 Hz)'
                })
        
        # Session bazlı ipuçları
        if sessions.exists():
            completion_rate = sessions.filter(completed=True).count() / sessions.count()
            if completion_rate < 0.7:
                tips.append({
                    'category': 'completion',
                    'tip': 'Seansları tamamlama oranınız düşük. 5-10 dakikalık kısa seanslarla başlayın.',
                    'frequency_recommendation': None
                })
        
        return tips
    
    def _calculate_achievements(self, user):
        """Başarım rozetleri"""
        achievements = []
        
        # Toplam survey sayısı
        total_daily_logs = DailyLog.objects.filter(user=user).count()
        if total_daily_logs >= 7:
            achievements.append({
                'name': 'Haftalık Takipçi',
                'description': '7 gün üst üste anket doldurdunuz',
                'icon': '📊',
                'earned_at': 'recent'
            })
        
        if total_daily_logs >= 30:
            achievements.append({
                'name': 'Aylık Kahraman',
                'description': '30 anket tamamladınız',
                'icon': '🏆',
                'earned_at': 'recent'
            })
        
        # Toplam session süresi
        total_duration = Session.objects.filter(user=user).aggregate(
            total=models.Sum('duration_seconds')
        )['total'] or 0
        
        if total_duration >= 3600:  # 1 saat
            achievements.append({
                'name': 'Meditasyon Ustası',
                'description': '1 saat toplam dinleme süresi',
                'icon': '🧘',
                'earned_at': 'recent'
            })
        
        # Consistency badge
        recent_sessions = Session.objects.filter(
            user=user,
            listened_at__gte=datetime.now() - timedelta(days=7)
        )
        unique_days = len(set(s.listened_at.date() for s in recent_sessions))
        
        if unique_days >= 5:
            achievements.append({
                'name': 'Tutarlı Kullanıcı',
                'description': 'Haftada 5 gün kullanım',
                'icon': '⭐',
                'earned_at': 'recent'
            })
        
        return achievements
    
    def _suggest_next_goals(self, daily_logs, sessions):
        """Sonraki hedefler"""
        goals = []
        
        # Survey hedefleri
        daily_log_count = daily_logs.count()
        if daily_log_count < 7:
            goals.append({
                'category': 'tracking',
                'title': 'Günlük Takip',
                'description': f'Hedef: 7 anket (Şu an: {daily_log_count})',
                'progress': (daily_log_count / 7) * 100,
                'target_value': 7,
                'current_value': daily_log_count
            })
        
        # Session hedefleri
        session_count = sessions.count()
        if session_count < 10:
            goals.append({
                'category': 'listening',
                'title': 'Dinleme Seansları',
                'description': f'Hedef: 10 seans (Şu an: {session_count})',
                'progress': (session_count / 10) * 100,
                'target_value': 10,
                'current_value': session_count
            })
        
        # Consistency hedefi
        if sessions.exists():
            consistency = self._calculate_consistency_score(sessions)
            if consistency < 80:
                goals.append({
                    'category': 'consistency',
                    'title': 'Tutarlılık',
                    'description': f'Hedef: %80 tutarlılık (Şu an: %{consistency:.0f})',
                    'progress': consistency,
                    'target_value': 80,
                    'current_value': consistency
                })
        
        return goals

class FrequencyUploadView(APIView):
    """
    Admin kullanıcılar için frekans dosyası yükleme endpoint'i
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request, pk):
        try:
            frequency = Frequency.objects.get(pk=pk)
            
            # Sadece admin kullanıcılar dosya yükleyebilir
            if not request.user.is_staff:
                return Response({
                    'error': 'Bu işlem için admin yetkisi gereklidir'
                }, status=status.HTTP_403_FORBIDDEN)
            
            audio_file = request.FILES.get('audio_file')
            if not audio_file:
                return Response({
                    'error': 'Ses dosyası gereklidir'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Dosya formatını kontrol et
            allowed_extensions = ['.mp3', '.wav', '.m4a']
            file_extension = os.path.splitext(audio_file.name)[1].lower()
            
            if file_extension not in allowed_extensions:
                return Response({
                    'error': f'Desteklenmeyen dosya formatı. İzin verilen formatlar: {", ".join(allowed_extensions)}'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Dosya boyutunu kontrol et (10MB limit)
            if audio_file.size > 10 * 1024 * 1024:  # 10MB
                return Response({
                    'error': 'Dosya boyutu 10MB\'dan büyük olamaz'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Eski dosyayı sil (varsa)
            if frequency.audio_file:
                try:
                    frequency.audio_file.delete(save=False)
                except:
                    pass
            
            # Yeni dosyayı kaydet
            frequency.audio_file = audio_file
            frequency.audio_url = ''  # URL'yi temizle
            frequency.save()
            
            logger.info(f"Audio file uploaded for frequency {frequency.id} by user {request.user.username}")
            
            return Response({
                'message': 'Ses dosyası başarıyla yüklendi',
                'frequency_id': frequency.id,
                'audio_source': frequency.audio_source,
                'file_size_mb': round(audio_file.size / (1024 * 1024), 2),
                'filename': audio_file.name
            }, status=status.HTTP_201_CREATED)
            
        except Frequency.DoesNotExist:
            return Response({
                'error': 'Frekans bulunamadı'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"File upload error: {str(e)}")
            return Response({
                'error': f'Dosya yükleme hatası: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
