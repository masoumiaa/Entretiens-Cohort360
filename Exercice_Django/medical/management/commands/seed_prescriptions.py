import random
from datetime import date, timedelta

from django.core.management.base import BaseCommand

from medical.models import Patient, Medication, Prescription


def random_date(start_year=2024, end_year=2025):
    start_dt = date(start_year, 1, 1)
    end_dt = date(end_year, 12, 31)
    days = (end_dt - start_dt).days
    return start_dt + timedelta(days=random.randint(0, days))


class Command(BaseCommand):
    help = "Seed the database with demo Prescriptions"

    def add_arguments(self, parser):
        parser.add_argument("--prescriptions", type=int, default=30)

    def handle(self, *args, **options):
        n_prescriptions = options["prescriptions"]

        # Vérifier qu'il existe des patients et médicaments
        patients = list(Patient.objects.all())
        medications = list(Medication.objects.all())

        if not patients:
            self.stdout.write(self.style.ERROR("Aucun patient trouvé. Exécutez d'abord: python manage.py seed_demo"))
            return

        if not medications:
            self.stdout.write(self.style.ERROR("Aucun médicament trouvé. Exécutez d'abord: python manage.py seed_demo"))
            return

        status_choices = [Prescription.STATUS_VALIDE, Prescription.STATUS_EN_ATTENTE, Prescription.STATUS_SUPPR]
        comments = [
            "Traitement standard",
            "À renouveler après consultation",
            "Allergie connue à surveiller",
            "Dosage réduit",
            "Prise avec repas",
            "À prendre le soir",
            "Interaction possible avec autres médicaments",
            "Consultation nécessaire avant renouvellement",
            "Prescription annulée",
            "En attente de résultats d'analyse",
            None,
            None,
        ]

        created_prescriptions = []
        for _ in range(n_prescriptions):
            patient = random.choice(patients)
            medication = random.choice(medications)
            start_dt = random_date()
            # end_date entre start_date et start_date + 90 jours
            end_dt = start_dt + timedelta(days=random.randint(7, 90))
            status = random.choices(
                status_choices,
                weights=[0.6, 0.3, 0.1]  # 60% valide, 30% en attente, 10% suppr
            )[0]
            comment = random.choice(comments)

            p = Prescription.objects.create(
                patient=patient,
                medication=medication,
                start_date=start_dt,
                end_date=end_dt,
                status=status,
                comment=comment,
            )
            created_prescriptions.append(p)

        self.stdout.write(self.style.SUCCESS(
            f"Created {len(created_prescriptions)} prescriptions."
        ))
