import React, { useState, useEffect } from 'react';
import type { Prescription, Patient, Medication } from '../../types';
import { prescriptionAPI, patientAPI, medicationAPI } from '../../services/api';
import './PrescriptionList.css';

interface PrescriptionListProps {
  onRefresh?: boolean;
}

const PrescriptionList: React.FC<PrescriptionListProps> = ({ onRefresh = false }) => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [patients, setPatients] = useState<Map<number, Patient>>(new Map());
  const [medications, setMedications] = useState<Map<number, Medication>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtersExpanded, setFiltersExpanded] = useState(true);

  // Filtres
  const [filterPatient, setFilterPatient] = useState('');
  const [filterMedication, setFilterMedication] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Charger les patients
      const patientsList = await patientAPI.list();
      const patientsMap = new Map(patientsList.map(p => [p.id, p]));
      setPatients(patientsMap);

      // Charger les médicaments
      const medicationsList = await medicationAPI.list();
      const medicationsMap = new Map(medicationsList.map(m => [m.id, m]));
      setMedications(medicationsMap);

      // Charger les prescriptions avec filtres
      const filters: any = {};
      if (filterPatient) filters.patient = parseInt(filterPatient);
      if (filterMedication) filters.medication = parseInt(filterMedication);
      if (filterStatus) filters.status = filterStatus;
      if (filterDateFrom) filters.date_debut_from = filterDateFrom;
      if (filterDateTo) filters.date_debut_to = filterDateTo;

      const prescriptionsList = await prescriptionAPI.list(filters);
      setPrescriptions(prescriptionsList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [onRefresh]);

  const handleFilterChange = () => {
    loadData();
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette prescription?')) {
      try {
        await prescriptionAPI.delete(id);
        loadData();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
      }
    }
  };

  const getPatientName = (patientId: number) => {
    const patient = patients.get(patientId);
    return patient ? `${patient.first_name} ${patient.last_name}` : 'Inconnu';
  };

  const getMedicationName = (medicationId: number) => {
    const medication = medications.get(medicationId);
    return medication ? medication.label : 'Inconnu';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valide':
        return '#10b981';
      case 'en_attente':
        return '#f59e0b';
      case 'suppr':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  if (loading) {
    return <div className="loading">Chargement...</div>;
  }

  return (
    <div className="prescription-list">
      <h2>Prescriptions</h2>

      {error && <div className="error">{error}</div>}

      <div className="filters">
        <div className="filters-header">
          <h3>Filtres</h3>
          <button 
            className="toggle-filters-btn"
            onClick={() => setFiltersExpanded(!filtersExpanded)}
            aria-expanded={filtersExpanded}
          >
            {filtersExpanded ? '−' : '+'}
          </button>
        </div>
        {filtersExpanded && (
        <div className="filter-group">
          <label>
            Patient:
            <select value={filterPatient} onChange={(e) => setFilterPatient(e.target.value)}>
              <option value="">Tous</option>
              {Array.from(patients.values()).map(p => (
                <option key={p.id} value={p.id}>
                  {p.first_name} {p.last_name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Médicament:
            <select value={filterMedication} onChange={(e) => setFilterMedication(e.target.value)}>
              <option value="">Tous</option>
              {Array.from(medications.values()).map(m => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            Statut:
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="">Tous</option>
              <option value="valide">Valide</option>
              <option value="en_attente">En attente</option>
              <option value="suppr">Supprimée</option>
            </select>
          </label>

          <label>
            Date début (de):
            <input
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
            />
          </label>

          <label>
            Date début (à):
            <input
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
            />
          </label>

          <button onClick={handleFilterChange} className="btn-filter">
            Appliquer filtres
          </button>
          <button
            onClick={() => {
              setFilterPatient('');
              setFilterMedication('');
              setFilterStatus('');
              setFilterDateFrom('');
              setFilterDateTo('');
            }}
            className="btn-reset"
          >
            Réinitialiser
          </button>
        </div>
        )}
      </div>

      <div className="table-container">
        {prescriptions.length === 0 ? (
          <p>Aucune prescription trouvée.</p>
        ) : (
          <table className="prescriptions-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Patient</th>
                <th>Médicament</th>
                <th>Date début</th>
                <th>Date fin</th>
                <th>Statut</th>
                <th>Commentaire</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {prescriptions.map(prescription => (
                <tr key={prescription.id}>
                  <td>{prescription.id}</td>
                  <td>{getPatientName(prescription.patient)}</td>
                  <td>{getMedicationName(prescription.medication)}</td>
                  <td>{new Date(prescription.date_debut).toLocaleDateString('fr-FR')}</td>
                  <td>{new Date(prescription.date_fin).toLocaleDateString('fr-FR')}</td>
                  <td>
                    <span className="status-badge" style={{ backgroundColor: getStatusColor(prescription.status) }}>
                      {prescription.status}
                    </span>
                  </td>
                  <td>{prescription.comment || '-'}</td>
                  <td>
                    <button
                      onClick={() => handleDelete(prescription.id)}
                      className="btn-delete"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <p className="info-text">Total: {prescriptions.length} prescription(s)</p>
    </div>
  );
};

export default PrescriptionList;
