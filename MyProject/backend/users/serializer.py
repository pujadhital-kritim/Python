#converts pyhon object into JSON

# React sends JSON → Serializer converts to Python → saved to database
# Database data → Serializer converts to JSON → sent to React
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password


User = get_user_model()

#register serializer used when a new user signs up
class RegisterSerializer(serializers.ModelSerializer):

    # write_only=True means this field is accepted but never shown in response
    password= serializers.CharField(write_only=True,validators=[validate_password])
    password2 = serializers.CharField(write_only=True)  #confirm password

    class Meta:
        model=User
        fields=['id','username','email','phone','password','password2']

       # validate() runs automatically — checks if passwords match
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return attrs
    

    # create() runs when serializer.save() is called
    def create(self, validated_data):
        validated_data.pop('password2')  # remove password2 before saving
        # create_user() hashes the password automatically it never store plain passwords
        user = User.objects.create_user(**validated_data)
        return user
    
# Used to show/edit user profile
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model  = User
        fields = ['id', 'username', 'email', 'phone', 'address']
        read_only_fields = ['email']  # email cannot be changed after register
