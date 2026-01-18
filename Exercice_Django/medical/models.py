from django.db import models
from django.core.exceptions import ValidationError


class Patient(models.Model):
    """Représente un patient."""

    last_name = models.CharField(max_length=150)
    first_name = models.CharField(max_length=150)
    birth_date = models.DateField(null=True, blank=True)

    class Meta:
        ordering = ["last_name", "first_name", "id"]

    def __str__(self) -> str:  # pragma: no cover - simple repr
        return f"{self.last_name} {self.first_name}"


class Medication(models.Model):
    """Représente un médicament."""

    STATUS_ACTIF = "actif"
    STATUS_SUPPR = "suppr"
    STATUS_CHOICES = (
        (STATUS_ACTIF, "actif"),
        (STATUS_SUPPR, "suppr"),
    )

    code = models.CharField(max_length=64, unique=True)
    label = models.CharField(max_length=255)
    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default=STATUS_ACTIF)

    class Meta:
        ordering = ["code"]

    def __str__(self) -> str:  # pragma: no cover - simple repr
        return f"{self.code} - {self.label} ({self.status})"


class Prescription(models.Model):
    """Représente une prescription médicamenteuse pour un patient."""

    STATUS_VALIDE = "valide"
    STATUS_EN_ATTENTE = "en_attente"
    STATUS_SUPPR = "suppr"
    STATUS_CHOICES = (
        (STATUS_VALIDE, "valide"),
        (STATUS_EN_ATTENTE, "en_attente"),
        (STATUS_SUPPR, "suppr"),
    )

    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name="prescriptions")
    medication = models.ForeignKey(Medication, on_delete=models.CASCADE, related_name="prescriptions")
    start_date = models.DateField()
    end_date = models.DateField()
    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default=STATUS_EN_ATTENTE)
    comment = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ["-start_date", "id"]

    def __str__(self) -> str:  # pragma: no cover - simple repr
        return f"Prescription {self.id} - {self.patient} ({self.medication.code})"

    def clean(self):
        """Valide que end_date >= start_date."""
        if self.end_date < self.start_date:
            raise ValidationError(
                {"end_date": "La date de fin doit être supérieure ou égale à la date de début."}
            )
