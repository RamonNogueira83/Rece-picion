from django.db import models


class Agendamento(models.Model):
    STATUS_CHOICES = [
        ("agendado", "Agendado"),
        ("confirmado", "Confirmado"),
        ("cancelado", "Cancelado"),
        ("realizado", "Realizado"),
    ]
    PAGAMENTO_CHOICES = [
        ("nao_aplicavel", "Não aplicável"),
        ("pendente", "Pendente"),
        ("pago", "Pago"),
    ]
    paciente = models.ForeignKey(
        "pacientes.Paciente", on_delete=models.CASCADE
    )
    data_hora = models.DateTimeField()
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default="agendado"
    )
    status_pagamento = models.CharField(
        max_length=20, choices=PAGAMENTO_CHOICES, default="nao_aplicavel"
    )
    valor = models.DecimalField(
        max_digits=8, decimal_places=2, null=True, blank=True
    )
