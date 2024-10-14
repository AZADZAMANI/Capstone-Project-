from django.db import models

class HealthAppDoctor(models.Model):
    id = models.BigAutoField(primary_key=True)
    full_name = models.CharField(max_length=100)
    max_patient_number = models.IntegerField()
    current_patient_number = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'health_app_doctor'


class HealthAppPatient(models.Model):
    id = models.BigAutoField(primary_key=True)
    full_name = models.CharField(max_length=100)
    birth_date = models.DateField()
    phone_number = models.CharField(max_length=15)
    email = models.EmailField(unique=True, max_length=254)  # Use EmailField for validation
    gender = models.CharField(max_length=10)
    password_hash = models.CharField(max_length=255)
    doctor = models.ForeignKey(HealthAppDoctor, models.SET_NULL, blank=True, null=True)  # Use SET_NULL if doctor is optional

    class Meta:
        managed = False
        db_table = 'health_app_patient'


class HealthAppAvailabletime(models.Model):
    id = models.BigAutoField(primary_key=True)
    schedule_date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_available = models.BooleanField()
    doctor = models.ForeignKey(HealthAppDoctor, models.CASCADE)

    class Meta:
        managed = False
        db_table = 'health_app_availabletime'


class HealthAppAppointment(models.Model):
    id = models.BigAutoField(primary_key=True)
    available_time = models.ForeignKey(HealthAppAvailabletime, models.CASCADE)
    doctor = models.ForeignKey(HealthAppDoctor, models.CASCADE)
    patient = models.ForeignKey(HealthAppPatient, models.CASCADE)

    class Meta:
        managed = False
        db_table = 'health_app_appointment'
