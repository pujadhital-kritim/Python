from rest_framework.decorators import api_view   #This converts normal Python function into: API endpoint 
from rest_framework.response import Response   # Used to send JSON back to React.
from django.contrib.auth.models import User    # Django already has built-in user system.This automatically gives: username,email,password
from django.contrib.auth import authenticate,login,logout  #Used during login.

from .serializer import UserSerializer
# register view 
@api_view(['POST'])
def registerUser(request):

    data= request.data

    first_name = data.get('first_name')
    last_name = data.get('last_name')
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    confirm_password = data.get('confirm_password')

    # empty validation
    if first_name == '' and   last_name == '':
        return Response({'error': 'First name and last name is required'})
    
    if username == '':
        return Response({'error': 'Username required'})

    if email == '':
        return Response({'error': 'Email required'})

    if password == '':
        return Response({'error': 'Password required'})
    
    #password validation
    if password != confirm_password:
        return Response({'error:' 'Password doesnot march'})
    
    #existing user validation
    if User.objects.filter(username==username).exists:
        return Response({'error':'Username already exists'})
    
     # Existing email validation
    if User.objects.filter(email=email).exists():
        return Response({'error': 'Email already exists'})

     # Create user
    user = User.objects.create_user(
        first_name=first_name,
        last_name=last_name,
        username=username,
        email=email,
        password=password
    )
    
    return Response(serializer.data)


#login view 



    


    

    




