import React, { useState, useEffect } from 'react';
import type { Patient, Medication, CreatePrescriptionPayload } from '../../types';
import { patientAPI, medicationAPI, prescriptionAPI } from '../../services/api';
import './PrescriptionForm.css';

interface PrescriptionFormProps {
  onSubmitSuccess?: () => void;
}

const PrescriptionForm: React.FC<PrescriptionFormProps> = ({ onSubmitSuccess }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<CreatePrescriptionPayload>({
    patient: 0,
    medication: 0,
    date_debut: '',
    date_fin: '',
    status: 'en_attente',
    comment: '',
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [patientsList, medicationsList] = await Promise.all([
          patientAPI.list(),
          medicationAPI.list(),
        ]);
        setPatients(patientsList);
        setMedications(medicationsList);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'patient' || name === 'medication' ? parseInt(value) : value,
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.patient) {
      setError('Veuillez sélectionner un patient');
      return false;
    }
    if (!formData.medication) {
      setError('Veuillez sélectionner un médicament');
      return false;
    }
    if (!formData.date_debut) {
      setError('Veuillez entrer une date de début');
      return false;
    }
    if (!formData.date_fin) {
      setError('Veuillez entrer une date de fin');
      return false;
    }
    if (new Date(formData.date_fin) < new Date(formData.date_debut)) {
      setError('La date de fin doit être supérieure ou égale à la date de début');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      await prescriptionAPI.create(formData);
      setSuccess(true);
      setFormData({
        patient: 0,
        medication: 0,
        date_debut: '',
        date_fin: '',
        status: 'en_attente',
        comment: '',
      });
      onSubmitSuccess?.();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création de la prescription');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading">Chargement du formulaire...</div>;
  }

  return (
    <div className="prescription-form">
      <h2>Créer une nouvelle prescription</h2>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">Prescription créée avec succès!</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="patient">Patient *</label>
          <select
            id="patient"
            name="patient"
            value={formData.patient}
            onChange={handleInputChange}
            required
          >
            <option value="">-- Sélectionner un patient --</option>
            {patients.map(patient => (
              <option key={patient.id} value={patient.id}>
                {patient.first_name} {patient.last_name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="medication">Médicament *</label>
          <select
            id="medication"
            name="medication"
            value={formData.medication}
            onChange={handleInputChange}
            required
          >
            <option value="">-- Sélectionner un médicament --</option>
            {medications.map(medication => (
              <option key={medication.id} value={medication.id}>
                {medication.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="date_debut">Date de début *</label>
            <input
              id="date_debut"
              type="date"
              name="date_debut"
              value={formData.date_debut}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="date_fin">Date de fin *</label>
            <input
              id="date_fin"
              type="date"
              name="date_fin"
              value={formData.date_fin}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="status">Statut</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleInputChange}
          >
            <option value="en_attente">En attente</option>
            <option value="valide">Valide</option>
            <option value="suppr">Supprimée</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="comment">Commentaire</label>
          <textarea
            id="comment"
            name="comment"
            value={formData.comment || ''}
            onChange={handleInputChange}
            rows={4}
            placeholder="Entrez un commentaire (optionnel)"
          />
        </div>

        <button type="submit" disabled={submitting} className="btn-submit">
          {submitting ? 'Création en cours...' : 'Créer la prescription'}
        </button>
      </form>
    </div>
  );
};

export default PrescriptionForm;
