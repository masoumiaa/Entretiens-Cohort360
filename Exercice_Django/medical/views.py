from typing import Any

from django.db.models import QuerySet
from rest_framework.generics import ListAPIView, ListCreateAPIView, RetrieveUpdateDestroyAPIView

from .models import Patient, Medication, Prescription
from .serializers import PatientSerializer, MedicationSerializer, PrescriptionSerializer


class PatientListView(ListAPIView):
    """Endpoint en lecture seule pour lister les patients avec filtrage simple."""

    serializer_class = PatientSerializer

    def get_queryset(self) -> QuerySet[Patient]:
        qs = Patient.objects.all()
        params = self.request.query_params

        # Alias FR → champs
        nom = params.get("nom") or params.get("last_name")
        prenom = params.get("prenom") or params.get("first_name")
        date_naissance = params.get("date_naissance") or params.get("birth_date")

        if nom:
            qs = qs.filter(last_name__icontains=nom)
        if prenom:
            qs = qs.filter(first_name__icontains=prenom)
        if date_naissance:
            qs = qs.filter(birth_date=date_naissance)

        return qs


class MedicationListView(ListAPIView):
    """Endpoint en lecture seule pour lister les médicaments avec filtrage simple."""

    serializer_class = MedicationSerializer

    def get_queryset(self) -> QuerySet[Medication]:
        qs = Medication.objects.all()
        params = self.request.query_params

        code = params.get("code")
        label = params.get("label")
        status = params.get("status")

        if code:
            qs = qs.filter(code__icontains=code)
        if label:
            qs = qs.filter(label__icontains=label)
        if status:
            qs = qs.filter(status=status.lower())

        return qs

class PrescriptionListCreateView(ListCreateAPIView):
    """Endpoint pour lister et créer les prescriptions avec filtrage simple."""

    serializer_class = PrescriptionSerializer

    def get_queryset(self) -> QuerySet[Prescription]:
        qs = Prescription.objects.all()
        params = self.request.query_params

        patient_id = params.get("patient_id") or params.get("patient")
        medication_id = params.get("medication_id") or params.get("medication")
        status = params.get("status")
        date_debut_from = params.get("date_debut_from")
        date_debut_to = params.get("date_debut_to")
        date_fin_from = params.get("date_fin_from")
        date_fin_to = params.get("date_fin_to")

        if patient_id:
            qs = qs.filter(patient_id=patient_id)
        if medication_id:
            qs = qs.filter(medication_id=medication_id)
        if status:
            qs = qs.filter(status=status.lower())
        if date_debut_from:
            qs = qs.filter(start_date__gte=date_debut_from)
        if date_debut_to:
            qs = qs.filter(start_date__lte=date_debut_to)
        if date_fin_from:
            qs = qs.filter(end_date__gte=date_fin_from)
        if date_fin_to:
            qs = qs.filter(end_date__lte=date_fin_to)

        return qs


class PrescriptionDetailView(RetrieveUpdateDestroyAPIView):
    """Endpoint pour récupérer, mettre à jour et supprimer une prescription."""

    queryset = Prescription.objects.all()
    serializer_class = PrescriptionSerializer