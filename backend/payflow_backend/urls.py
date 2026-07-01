from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.views.decorators.csrf import csrf_exempt
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model

User = get_user_model()


class PublicTokenObtainPairView(TokenObtainPairView):
    permission_classes = [AllowAny]
    authentication_classes = []
    
    def post(self, request, *args, **kwargs):
        # Allow clients to POST {"email":..., "password":...} and resolve to username
        data = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)
        if data.get('email') and not data.get('username'):
            try:
                user = User.objects.get(email=data.get('email'))
                data['username'] = user.username
            except User.DoesNotExist:
                pass

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data, status=status.HTTP_200_OK)


class PublicTokenRefreshView(TokenRefreshView):
    permission_classes = [AllowAny]
    authentication_classes = []


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/login/', csrf_exempt(PublicTokenObtainPairView.as_view()), name='token_obtain_pair'),
    path('api/auth/refresh/', csrf_exempt(PublicTokenRefreshView.as_view()), name='token_refresh'),
    path('api/auth/', include('rest_framework.urls')),
    path('api/users/', include('users.urls')),
    path('api/wallets/', include('wallets.urls')),
    path('api/transactions/', include('transactions.urls')),
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)