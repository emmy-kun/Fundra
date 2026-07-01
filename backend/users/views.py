from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from django.utils import timezone
from datetime import timedelta
import random
from django.core.mail import send_mail

from users.serializers import UserSerializer, UserCreateSerializer
from users.models import VerificationCode

User = get_user_model()


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        return UserSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [AllowAny()]
        return super().get_permissions()

    def get_object(self):
        """Allow users to get their own profile without specifying ID."""
        if self.request.user and self.request.user.is_authenticated:
            return self.request.user
        return super().get_object()

    def list(self, request, *args, **kwargs):
        """List only sellers."""
        queryset = User.objects.filter(role=User.Role.SELLER)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get', 'patch'], permission_classes=[IsAuthenticated])
    def me(self, request):
        """Get or update current authenticated user profile."""
        if request.method == 'GET':
            serializer = self.get_serializer(request.user)
            return Response(serializer.data)

        # PATCH: update current user
        serializer = self.get_serializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def check_username(self, request):
        username = request.query_params.get('username')
        if not username:
            return Response({'available': False, 'message': 'username query param required'}, status=status.HTTP_400_BAD_REQUEST)
        exists = User.objects.filter(username=username).exists()
        return Response({'available': not exists})

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def send_verification(self, request):
        """Send a verification code to email or phone."""
        vtype = request.data.get('type')  # 'email' or 'phone'
        if vtype not in ('email', 'phone'):
            return Response({'error': 'type must be email or phone'}, status=status.HTTP_400_BAD_REQUEST)

        user = request.user
        code = f"{random.randint(100000, 999999)}"
        expires = timezone.now() + timedelta(minutes=10)
        VerificationCode.objects.create(user=user, code=code, vtype=vtype, expires_at=expires)

        # Send via email for email type (development: console)
        if vtype == 'email' and user.email:
            try:
                send_mail(
                    'Your verification code',
                    f'Your verification code is {code}',
                    None,
                    [user.email],
                    fail_silently=True,
                )
            except Exception:
                pass

        # For phone we would normally integrate SMS; return code in response for dev
        return Response({'message': f'Verification code sent to {vtype}', 'code': code})

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def verify_otp(self, request):
        vtype = request.data.get('type')
        code = request.data.get('code')
        if vtype not in ('email', 'phone') or not code:
            return Response({'error': 'type and code required'}, status=status.HTTP_400_BAD_REQUEST)

        now = timezone.now()
        vc = VerificationCode.objects.filter(user=request.user, vtype=vtype, code=code, expires_at__gt=now).first()
        if not vc:
            return Response({'error': 'Invalid or expired code'}, status=status.HTTP_400_BAD_REQUEST)

        if vtype == 'email':
            request.user.is_email_verified = True
        else:
            request.user.is_phone_verified = True

        request.user.save()
        vc.delete()
        return Response({'message': f'{vtype} verified'})

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def forgot_password(self, request):
        email = request.data.get('email')
        if not email:
            return Response(
                {'error': 'Email is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = User.objects.filter(email=email).first()
        if user:
            code = f"{random.randint(100000, 999999)}"
            expires = timezone.now() + timedelta(minutes=10)
            VerificationCode.objects.create(
                user=user,
                code=code,
                vtype='password_reset',
                expires_at=expires,
            )

            if user.email:
                try:
                    send_mail(
                        'Fundra Password Reset Code',
                        f'Your password reset code is {code}',
                        None,
                        [user.email],
                        fail_silently=True,
                    )
                except Exception:
                    pass

        return Response(
            {
                'message': 'If an account exists for that email, a password reset code has been sent.',
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def reset_password(self, request):
        email = request.data.get('email')
        code = request.data.get('code')
        new_password = request.data.get('new_password')
        new_password_confirm = request.data.get('new_password_confirm')

        if not email or not code or not new_password or not new_password_confirm:
            return Response(
                {'error': 'email, code, new_password, and new_password_confirm are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if new_password != new_password_confirm:
            return Response(
                {'error': 'Passwords do not match'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = User.objects.filter(email=email).first()
        if not user:
            return Response({'error': 'Invalid email or reset code.'}, status=status.HTTP_400_BAD_REQUEST)

        now = timezone.now()
        verification = VerificationCode.objects.filter(
            user=user,
            vtype='password_reset',
            code=code,
            expires_at__gt=now,
        ).first()

        if not verification:
            return Response({'error': 'Invalid or expired reset code.'}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        verification.delete()
        return Response({'message': 'Password has been reset successfully.'}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def change_password(self, request):
        """Change user password."""
        user = request.user
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')
        new_password_confirm = request.data.get('new_password_confirm')

        if not old_password or not new_password or not new_password_confirm:
            return Response(
                {'error': 'old_password, new_password, and new_password_confirm are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not user.check_password(old_password):
            return Response(
                {'error': 'Old password is incorrect'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if new_password != new_password_confirm:
            return Response(
                {'error': 'Passwords do not match'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.set_password(new_password)
        user.save()
        return Response({'message': 'Password changed successfully'}, status=status.HTTP_200_OK)
