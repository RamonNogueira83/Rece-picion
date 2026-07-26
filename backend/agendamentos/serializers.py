from rest_framework import serializers

from .models import Agendamento


class AgendamentoSerializer(serializers.ModelSerializer):
    paciente_nome = serializers.CharField(
        source="paciente.nome", read_only=True
    )

    class Meta:
        model = Agendamento
        fields = "__all__"
