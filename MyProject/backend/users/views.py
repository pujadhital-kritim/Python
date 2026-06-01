from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from .serializer import RegisterSerializer,UserSerializer

User=get_user_model()
# register view 
class RegisterView (APIView):
    permission_classes =[AllowAny]  #no login needed

  

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.save()

            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            access = refresh.access_token

            return Response({
                "message": "Account created successfully!",
                "user": UserSerializer(user).data,
                "access_token": str(access),
                "refresh_token": str(refresh),
            }, status=status.HTTP_201_CREATED)

        #  only runs when validation fails
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    permission_classes = [AllowAny]  

    def post(self, request):
        email    = request.data.get('email')
        password = request.data.get('password')

        # Check if email exists
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {"error": "No account found with this email."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if password is correct
        if not user.check_password(password):
            return Response(
                {"error": "Wrong password."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Password correct  generate tokens
        refresh = RefreshToken.for_user(user)
        access  = refresh.access_token

        return Response({
            "message":       "Login successful!",
            "user":          UserSerializer(user).data,
            "access_token":  str(access),
            "refresh_token": str(refresh),
        })

class LogoutView(APIView):
    permission_classes = [IsAuthenticated] # must be logged in

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh_token")
            token = RefreshToken(refresh_token)
            token.blacklist()  # adds token to blacklist so it cannot be used again
            return Response({"message": "Logged out successfully."})
        except Exception:
            return Response({"error": "Something went wrong."}, status=400)
        

# profile view
class ProfileView(APIView):
    permission_classes = [IsAuthenticated]  

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    #  update profile
    def put(self, request):
        # partial=True means you can update just one field, not all
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "message": "Profile updated!",
                "user": serializer.data
            })
        return Response(serializer.errors, status=400)

  
