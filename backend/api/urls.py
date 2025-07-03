from django.urls import path
from .views import *

urlpatterns = [
    # ==================== Kullanıcı İşlemleri ====================
    path('register/', RegisterView.as_view(), name='register'),                    # Kayıt ol
    path('activate-account/', ActivateAccountView.as_view(), name='activate-account'), # Mail aktivasyonu

    # ==================== Auth ====================
    path('login/', LoginView.as_view(), name='login'),                         # Giriş yap

    # ==================== Şifre İşlemleri ====================
    path('change-password/', ChangePasswordView.as_view(), name='change-password'), # Şifre değiştir
    path('reset-password/', ResetPasswordView.as_view(), name='reset-password'),    # Şifremi unuttum / sıfırla

    # ==================== Frequency ====================
    path('frequencies/', FrequencyListView.as_view(), name='frequency-list'),
    path('frequencies/<int:pk>/stream/', FrequencyStreamView.as_view(), name='frequency-stream'),
    path('frequencies/<int:pk>/play/', FrequencyPlayView.as_view(), name='frequency-play'),
    path('frequencies/<int:pk>/upload/', FrequencyUploadView.as_view(), name='frequency-upload'),

    # ==================== DailyLog ====================
    path('dailylogs/', DailyLogListCreateView.as_view(), name='dailylog-list-create'),
    path('dailylogs/<int:pk>/', DailyLogDetailView.as_view(), name='dailylog-detail'),

    # ==================== Session ====================
    path('sessions/', SessionListCreateView.as_view(), name='session-list-create'),
    path('sessions/<int:pk>/', SessionDetailView.as_view(), name='session-detail'),
    path('sessions/<int:pk>/update-duration/', SessionUpdateDurationView.as_view(), name='session-update-duration'),

    # ==================== PDF Report ====================
    path('pdfreports/', PDFReportListCreateView.as_view(), name='pdfreport-list-create'),
    path('pdfreports/<int:pk>/', PDFReportDetailView.as_view(), name='pdfreport-detail'),

    # ==================== Chatbot Log ====================
    path('chatbotlogs/', ChatbotLogListCreateView.as_view(), name='chatbotlog-list-create'),
    path('chatbotlogs/<int:pk>/', ChatbotLogDetailView.as_view(), name='chatbotlog-detail'),

    # ==================== Dashboard ====================
    path('profile/', UserProfileView.as_view(), name='user-profile'),          # Kullanıcı profili
    path('dashboard-stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    
    # ==================== Advanced Analytics ====================
    path('analytics/', AdvancedAnalyticsView.as_view(), name='advanced-analytics'),
    path('health-insights/', HealthInsightsView.as_view(), name='health-insights'),
]
