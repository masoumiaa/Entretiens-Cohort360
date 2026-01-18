// Types pour l'API de gestion des prescriptions

export interface Patient {
  id: number;
  last_name: string;
  first_name: string;
  birth_date: string | null;
}

export interface Medication {
  id: number;
  code: string;
  label: string;
  status: 'actif' | 'suppr';
}

export interface Prescription {
  id: number;
  patient: number;
  medication: number;
  date_debut: string;
  date_fin: string;
  status: 'valide' | 'en_attente' | 'suppr';
  comment: string | null;
}

export interface PrescriptionDetail extends Prescription {
  patient_data?: Patient;
  medication_data?: Medication;
}

export interface PrescriptionFilters {
  patient?: number;
  medication?: number;
  status?: string;
  date_debut_from?: string;
  date_debut_to?: string;
  date_fin_from?: string;
  date_fin_to?: string;
}

export interface CreatePrescriptionPayload {
  patient: number;
  medication: number;
  date_debut: string;
  date_fin: string;
  status?: string;
  comment?: string;
}
