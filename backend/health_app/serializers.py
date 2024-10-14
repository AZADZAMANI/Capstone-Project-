from rest_framework import serializers
from .models import HealthAppPatient

class HealthAppPatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = HealthAppPatient
        fields = ['full_name', 'birth_date', 'phone_number', 'email', 'gender', 'password_hash', 'doctor']
