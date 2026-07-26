from django.db import models

from .validators import validar_cpf


class Paciente(models.Model):
    nome = models.CharField(max_length=150)
    cpf = models.CharField(
        max_length=11, unique=True, validators=[validar_cpf]
    )
    telefone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    data_nascimento = models.DateField(null=True, blank=True)
    endereco = models.CharField(max_length=255, blank=True)
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.nome
