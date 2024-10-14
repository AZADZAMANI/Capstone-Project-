from django.contrib import admin
from .models import (
    HealthAppAppointment, HealthAppAvailabletime, HealthAppDoctor, HealthAppPatient
)

# Custom Admin classes for enhanced display
class HealthAppDoctorAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'max_patient_number', 'current_patient_number')
    search_fields = ('full_name',)

class HealthAppPatientAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'email', 'phone_number', 'gender')
    search_fields = ('full_name', 'email')
    list_filter = ('gender',)

class HealthAppAppointmentAdmin(admin.ModelAdmin):
    list_display = ('doctor', 'patient', 'available_time')
    list_filter = ('doctor', 'available_time')
    search_fields = ('doctor__full_name', 'patient__full_name')

class HealthAppAvailabletimeAdmin(admin.ModelAdmin):
    list_display = ('schedule_date', 'start_time', 'end_time', 'is_available', 'doctor')
    list_filter = ('schedule_date', 'is_available', 'doctor')
    search_fields = ('doctor__full_name',)

# Registering models with the admin site
admin.site.register(HealthAppDoctor, HealthAppDoctorAdmin)
admin.site.register(HealthAppPatient, HealthAppPatientAdmin)
admin.site.register(HealthAppAppointment, HealthAppAppointmentAdmin)
admin.site.register(HealthAppAvailabletime, HealthAppAvailabletimeAdmin)
