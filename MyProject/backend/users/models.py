# Database Structure

from django.db import models
from django.contrib.auth.models import AbstractUser

# AbstractUser already has: username, password, first_name, last_name, is_active etc.
# We just add neccessary fields 

class User(AbstractUser):
    email= models.EmailField(unique=True)  # no two users can have same email
    phone= models.CharField(max_length=15,blank=True)  #blank true(optional)
    address = models.TextField(blank=True)


# should use email to login not username
    USERNAME_FIELD='email'
    REQUIRED_FIELDS=['username']


def __str__(self):
        return self.email  

