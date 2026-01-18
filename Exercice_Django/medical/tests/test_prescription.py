from datetime import date, timedelta

from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient

from medical.models import Patient, Medication, Prescription


class PrescriptionModelTests(TestCase):
    """Tests du modèle Prescription."""

    def setUp(self):
        self.patient = Patient.objects.create(
            last_name="Martin", first_name="Jeanne", birth_date="1992-03-10"
        )
        self.medication = Medication.objects.create(
            code="PARA500", label="Paracétamol 500mg", status=Medication.STATUS_ACTIF
        )

    def test_prescription_creation(self):
        """Teste la création d'une prescription."""
        prescription = Prescription.objects.create(
            patient=self.patient,
            medication=self.medication,
            start_date="2025-01-01",
            end_date="2025-01-31",
            status=Prescription.STATUS_VALIDE,
            comment="Test prescription",
        )
        self.assertIsNotNone(prescription.id)
        self.assertEqual(prescription.status, Prescription.STATUS_VALIDE)
        self.assertEqual(prescription.patient, self.patient)
        self.assertEqual(prescription.medication, self.medication)

    def test_prescription_default_status(self):
        """Teste que le statut par défaut est 'en_attente'."""
        prescription = Prescription.objects.create(
            patient=self.patient,
            medication=self.medication,
            start_date="2025-01-01",
            end_date="2025-01-31",
        )
        self.assertEqual(prescription.status, Prescription.STATUS_EN_ATTENTE)

    def test_prescription_comment_nullable(self):
        """Teste que le commentaire peut être null."""
        prescription = Prescription.objects.create(
            patient=self.patient,
            medication=self.medication,
            start_date="2025-01-01",
            end_date="2025-01-31",
            comment=None,
        )
        self.assertIsNone(prescription.comment)

    def test_prescription_validation_end_date_before_start_date(self):
        """Teste que end_date < start_date lève une ValidationError."""
        prescription = Prescription(
            patient=self.patient,
            medication=self.medication,
            start_date="2025-01-31",
            end_date="2025-01-01",
        )
        from django.core.exceptions import ValidationError
        with self.assertRaises(ValidationError):
            prescription.full_clean()

    def test_prescription_validation_end_date_equals_start_date(self):
        """Teste que end_date == start_date est valide."""
        prescription = Prescription.objects.create(
            patient=self.patient,
            medication=self.medication,
            start_date="2025-01-01",
            end_date="2025-01-01",
        )
        self.assertEqual(prescription.start_date, prescription.end_date)

    def test_prescription_str_representation(self):
        """Teste la représentation string du modèle."""
        prescription = Prescription.objects.create(
            patient=self.patient,
            medication=self.medication,
            start_date="2025-01-01",
            end_date="2025-01-31",
        )
        str_repr = str(prescription)
        self.assertIn("Prescription", str_repr)
        self.assertIn(str(prescription.id), str_repr)


class PrescriptionAPIListTests(TestCase):
    """Tests de l'endpoint GET /Prescription."""

    def setUp(self):
        self.client = APIClient()

        # Créer des patients
        self.patient1 = Patient.objects.create(
            last_name="Martin", first_name="Jeanne", birth_date="1992-03-10"
        )
        self.patient2 = Patient.objects.create(
            last_name="Durand", first_name="Jean", birth_date="1980-05-20"
        )

        # Créer des médicaments
        self.med1 = Medication.objects.create(
            code="PARA500", label="Paracétamol 500mg", status=Medication.STATUS_ACTIF
        )
        self.med2 = Medication.objects.create(
            code="IBU200", label="Ibuprofène 200mg", status=Medication.STATUS_ACTIF
        )

        # Créer des prescriptions
        Prescription.objects.create(
            patient=self.patient1,
            medication=self.med1,
            start_date="2025-01-01",
            end_date="2025-01-31",
            status=Prescription.STATUS_VALIDE,
        )
        Prescription.objects.create(
            patient=self.patient1,
            medication=self.med2,
            start_date="2025-02-01",
            end_date="2025-02-28",
            status=Prescription.STATUS_EN_ATTENTE,
        )
        Prescription.objects.create(
            patient=self.patient2,
            medication=self.med1,
            start_date="2025-03-01",
            end_date="2025-03-31",
            status=Prescription.STATUS_VALIDE,
        )
        Prescription.objects.create(
            patient=self.patient2,
            medication=self.med2,
            start_date="2025-04-01",
            end_date="2025-04-30",
            status=Prescription.STATUS_SUPPR,
        )

    def test_prescription_list(self):
        """Teste la récupération de la liste complète des prescriptions."""
        url = reverse("prescription-list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertGreaterEqual(len(data), 4)

    def test_prescription_filter_by_patient(self):
        """Teste le filtrage par patient."""
        url = reverse("prescription-list")
        response = self.client.get(url, {"patient": self.patient1.id})
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data), 2)
        self.assertTrue(all(p["patient"] == self.patient1.id for p in data))

    def test_prescription_filter_by_medication(self):
        """Teste le filtrage par médicament."""
        url = reverse("prescription-list")
        response = self.client.get(url, {"medication": self.med1.id})
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data), 2)
        self.assertTrue(all(p["medication"] == self.med1.id for p in data))

    def test_prescription_filter_by_status(self):
        """Teste le filtrage par statut."""
        url = reverse("prescription-list")
        response = self.client.get(url, {"status": "valide"})
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data), 2)
        self.assertTrue(all(p["status"] == "valide" for p in data))

    def test_prescription_filter_by_start_date_from(self):
        """Teste le filtrage par date de début minimale."""
        url = reverse("prescription-list")
        response = self.client.get(url, {"date_debut_from": "2025-02-01"})
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(all(p["date_debut"] >= "2025-02-01" for p in data))

    def test_prescription_filter_by_start_date_to(self):
        """Teste le filtrage par date de début maximale."""
        url = reverse("prescription-list")
        response = self.client.get(url, {"date_debut_to": "2025-02-28"})
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(all(p["date_debut"] <= "2025-02-28" for p in data))

    def test_prescription_filter_by_end_date_from(self):
        """Teste le filtrage par date de fin minimale."""
        url = reverse("prescription-list")
        response = self.client.get(url, {"date_fin_from": "2025-03-31"})
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(all(p["date_fin"] >= "2025-03-31" for p in data))

    def test_prescription_filter_by_end_date_to(self):
        """Teste le filtrage par date de fin maximale."""
        url = reverse("prescription-list")
        response = self.client.get(url, {"date_fin_to": "2025-01-31"})
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(all(p["date_fin"] <= "2025-01-31" for p in data))

    def test_prescription_filter_combined(self):
        """Teste la combinaison de plusieurs filtres."""
        url = reverse("prescription-list")
        response = self.client.get(url, {
            "patient": self.patient1.id,
            "status": "valide",
        })
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["patient"], self.patient1.id)
        self.assertEqual(data[0]["status"], "valide")


class PrescriptionAPICreateTests(TestCase):
    """Tests de l'endpoint POST /Prescription."""

    def setUp(self):
        self.client = APIClient()
        self.patient = Patient.objects.create(
            last_name="Martin", first_name="Jeanne", birth_date="1992-03-10"
        )
        self.medication = Medication.objects.create(
            code="PARA500", label="Paracétamol 500mg", status=Medication.STATUS_ACTIF
        )

    def test_prescription_create(self):
        """Teste la création d'une prescription via POST."""
        url = reverse("prescription-list")
        payload = {
            "patient": self.patient.id,
            "medication": self.medication.id,
            "date_debut": "2025-01-01",
            "date_fin": "2025-01-31",
            "status": "valide",
            "comment": "Test comment",
        }
        response = self.client.post(url, payload, format="json")
        self.assertEqual(response.status_code, 201)
        data = response.json()
        self.assertEqual(data["patient"], self.patient.id)
        self.assertEqual(data["medication"], self.medication.id)
        self.assertEqual(data["status"], "valide")

    def test_prescription_create_minimal(self):
        """Teste la création avec les champs obligatoires uniquement."""
        url = reverse("prescription-list")
        payload = {
            "patient": self.patient.id,
            "medication": self.medication.id,
            "date_debut": "2025-01-01",
            "date_fin": "2025-01-31",
        }
        response = self.client.post(url, payload, format="json")
        self.assertEqual(response.status_code, 201)
        data = response.json()
        self.assertEqual(data["status"], "en_attente")
        self.assertIsNone(data["comment"])

    def test_prescription_create_invalid_dates(self):
        """Teste la création avec end_date < start_date."""
        url = reverse("prescription-list")
        payload = {
            "patient": self.patient.id,
            "medication": self.medication.id,
            "date_debut": "2025-01-31",
            "date_fin": "2025-01-01",
        }
        response = self.client.post(url, payload, format="json")
        self.assertEqual(response.status_code, 400)

    def test_prescription_create_missing_patient(self):
        """Teste la création sans patient."""
        url = reverse("prescription-list")
        payload = {
            "medication": self.medication.id,
            "date_debut": "2025-01-01",
            "date_fin": "2025-01-31",
        }
        response = self.client.post(url, payload, format="json")
        self.assertEqual(response.status_code, 400)

    def test_prescription_create_missing_medication(self):
        """Teste la création sans médicament."""
        url = reverse("prescription-list")
        payload = {
            "patient": self.patient.id,
            "date_debut": "2025-01-01",
            "date_fin": "2025-01-31",
        }
        response = self.client.post(url, payload, format="json")
        self.assertEqual(response.status_code, 400)


class PrescriptionAPIUpdateTests(TestCase):
    """Tests des endpoints PUT/PATCH /Prescription/<id>."""

    def setUp(self):
        self.client = APIClient()
        self.patient1 = Patient.objects.create(
            last_name="Martin", first_name="Jeanne", birth_date="1992-03-10"
        )
        self.patient2 = Patient.objects.create(
            last_name="Durand", first_name="Jean", birth_date="1980-05-20"
        )
        self.medication1 = Medication.objects.create(
            code="PARA500", label="Paracétamol 500mg", status=Medication.STATUS_ACTIF
        )
        self.medication2 = Medication.objects.create(
            code="IBU200", label="Ibuprofène 200mg", status=Medication.STATUS_ACTIF
        )
        self.prescription = Prescription.objects.create(
            patient=self.patient1,
            medication=self.medication1,
            start_date="2025-01-01",
            end_date="2025-01-31",
            status=Prescription.STATUS_VALIDE,
            comment="Original comment",
        )

    def test_prescription_update_put(self):
        """Teste la mise à jour complète via PUT."""
        url = reverse("prescription-detail", kwargs={"pk": self.prescription.id})
        payload = {
            "patient": self.patient2.id,
            "medication": self.medication2.id,
            "date_debut": "2025-02-01",
            "date_fin": "2025-02-28",
            "status": "en_attente",
            "comment": "Updated comment",
        }
        response = self.client.put(url, payload, format="json")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["patient"], self.patient2.id)
        self.assertEqual(data["medication"], self.medication2.id)
        self.assertEqual(data["status"], "en_attente")
        self.assertEqual(data["comment"], "Updated comment")

    def test_prescription_update_patch(self):
        """Teste la mise à jour partielle via PATCH."""
        url = reverse("prescription-detail", kwargs={"pk": self.prescription.id})
        payload = {
            "status": "suppr",
            "comment": "Prescription cancelled",
        }
        response = self.client.patch(url, payload, format="json")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "suppr")
        self.assertEqual(data["comment"], "Prescription cancelled")
        # Vérifier que les autres champs n'ont pas changé
        self.assertEqual(data["patient"], self.patient1.id)
        self.assertEqual(data["medication"], self.medication1.id)

    def test_prescription_update_invalid_dates(self):
        """Teste la mise à jour avec des dates invalides."""
        url = reverse("prescription-detail", kwargs={"pk": self.prescription.id})
        payload = {
            "date_debut": "2025-02-28",
            "date_fin": "2025-02-01",
        }
        response = self.client.patch(url, payload, format="json")
        self.assertEqual(response.status_code, 400)


class PrescriptionAPIDeleteTests(TestCase):
    """Tests de l'endpoint DELETE /Prescription/<id>."""

    def setUp(self):
        self.client = APIClient()
        self.patient = Patient.objects.create(
            last_name="Martin", first_name="Jeanne", birth_date="1992-03-10"
        )
        self.medication = Medication.objects.create(
            code="PARA500", label="Paracétamol 500mg", status=Medication.STATUS_ACTIF
        )
        self.prescription = Prescription.objects.create(
            patient=self.patient,
            medication=self.medication,
            start_date="2025-01-01",
            end_date="2025-01-31",
        )

    def test_prescription_delete(self):
        """Teste la suppression d'une prescription."""
        url = reverse("prescription-detail", kwargs={"pk": self.prescription.id})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, 204)
        # Vérifier que la prescription a bien été supprimée
        self.assertFalse(Prescription.objects.filter(id=self.prescription.id).exists())

    def test_prescription_delete_nonexistent(self):
        """Teste la suppression d'une prescription inexistante."""
        url = reverse("prescription-detail", kwargs={"pk": 9999})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, 404)
