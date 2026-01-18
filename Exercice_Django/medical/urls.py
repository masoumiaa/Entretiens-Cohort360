from django.urls import path
from .views import PatientListView, MedicationListView, PrescriptionListCreateView, PrescriptionDetailView


urlpatterns = [
    path("Patient", PatientListView.as_view(), name="patient-list"),
    path("Medication", MedicationListView.as_view(), name="medication-list"),
    path("Prescription", PrescriptionListCreateView.as_view(), name="prescription-list"),
    path("Prescription/<int:pk>", PrescriptionDetailView.as_view(), name="prescription-detail"),
]
