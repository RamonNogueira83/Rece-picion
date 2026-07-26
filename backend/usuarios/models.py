# Create your models here.
from django.contrib.auth.models import AbstractUser
from django.db import models


class Usuario(AbstractUser):
    ROLE_CHOICES = [
        ("admin", "Administrador"),
        ("recepcao", "Recepção"),
        ("medico", "Dermatologista"),
    ]
    role = models.CharField(
        max_length=20, choices=ROLE_CHOICES, default="recepcao"
    )
