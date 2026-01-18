import axios from 'axios';
import type {
  Patient,
  Medication,
  Prescription,
  PrescriptionFilters,
  CreatePrescriptionPayload,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Prescriptions
export const prescriptionAPI = {
  list: async (filters?: PrescriptionFilters): Promise<Prescription[]> => {
    const params = new URLSearchParams();
    if (filters?.patient) params.append('patient', filters.patient.toString());
    if (filters?.medication) params.append('medication', filters.medication.toString());
    if (filters?.status) params.append('status', filters.status);
    if (filters?.date_debut_from) params.append('date_debut_from', filters.date_debut_from);
    if (filters?.date_debut_to) params.append('date_debut_to', filters.date_debut_to);
    if (filters?.date_fin_from) params.append('date_fin_from', filters.date_fin_from);
    if (filters?.date_fin_to) params.append('date_fin_to', filters.date_fin_to);

    const response = await apiClient.get<Prescription[]>('/Prescription', {
      params: Object.fromEntries(params),
    });
    return response.data;
  },

  create: async (payload: CreatePrescriptionPayload): Promise<Prescription> => {
    const response = await apiClient.post<Prescription>('/Prescription', payload);
    return response.data;
  },

  get: async (id: number): Promise<Prescription> => {
    const response = await apiClient.get<Prescription>(`/Prescription/${id}`);
    return response.data;
  },

  update: async (id: number, payload: Partial<CreatePrescriptionPayload>): Promise<Prescription> => {
    const response = await apiClient.patch<Prescription>(`/Prescription/${id}`, payload);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/Prescription/${id}`);
  },
};

// Patients
export const patientAPI = {
  list: async (): Promise<Patient[]> => {
    const response = await apiClient.get<Patient[]>('/Patient');
    return response.data;
  },

  get: async (id: number): Promise<Patient> => {
    const response = await apiClient.get<Patient>(`/Patient/${id}`);
    return response.data;
  },
};

// Medications
export const medicationAPI = {
  list: async (): Promise<Medication[]> => {
    const response = await apiClient.get<Medication[]>('/Medication');
    return response.data;
  },

  get: async (id: number): Promise<Medication> => {
    const response = await apiClient.get<Medication>(`/Medication/${id}`);
    return response.data;
  },
};

export default apiClient;
