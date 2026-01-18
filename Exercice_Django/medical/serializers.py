from rest_framework import serializers
from .models import Patient, Medication, Prescription


class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = ["id", "last_name", "first_name", "birth_date"]


class MedicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medication
        fields = ["id", "code", "label", "status"]


class PrescriptionSerializer(serializers.ModelSerializer):
    # Mapper les noms français aux champs du modèle
    date_debut = serializers.DateField(source='start_date')
    date_fin = serializers.DateField(source='end_date')
    
    class Meta:
        model = Prescription
        fields = ["id", "patient", "medication", "date_debut", "date_fin", "status", "comment"]
        
    def validate(self, data):
        """Valide que date_fin >= date_debut."""
        start_date = data.get("start_date")
        end_date = data.get("end_date")
        
        if end_date and start_date:
            if end_date < start_date:
                raise serializers.ValidationError(
                    "La date de fin doit être supérieure ou égale à la date de début."
                )
        return data
