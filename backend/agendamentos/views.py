from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets

from .models import Agendamento
from .serializers import AgendamentoSerializer


class AgendamentoViewSet(viewsets.ModelViewSet):
    queryset = Agendamento.objects.select_related("paciente").all()
    serializer_class = AgendamentoSerializer
