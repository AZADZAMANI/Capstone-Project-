from django.urls import path
from .views import register_patient

urlpatterns = [
    path('api/register/', register_patient, name='register-patient'),
]
