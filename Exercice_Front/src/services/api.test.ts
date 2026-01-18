import { describe, it, expect, beforeEach, vi } from 'vitest';
import axios from 'axios';
import { prescriptionAPI, patientAPI, medicationAPI } from './api';

// Mock axios
vi.mock('axios');
const mockedAxios = axios as any;

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('prescriptionAPI', () => {
    it('should list all prescriptions', async () => {
      const mockData = [
        { id: 1, patient: 1, medication: 1, start_date: '2024-01-01', status: 'valide' },
      ];
      mockedAxios.get.mockResolvedValue({ data: mockData });

      const result = await prescriptionAPI.list();

      expect(mockedAxios.get).toHaveBeenCalledWith('/Prescription/');
      expect(result).toEqual(mockData);
    });

    it('should list prescriptions with filters', async () => {
      const mockData = [
        { id: 1, patient: 1, medication: 1, start_date: '2024-01-01', status: 'valide' },
      ];
      mockedAxios.get.mockResolvedValue({ data: mockData });

      const filters = { patient: 1, status: 'valide' };
      const result = await prescriptionAPI.list(filters);

      expect(mockedAxios.get).toHaveBeenCalledWith('/Prescription/', { params: filters });
      expect(result).toEqual(mockData);
    });

    it('should create a prescription', async () => {
      const mockData = { id: 1, patient: 1, medication: 1, start_date: '2024-01-01', status: 'en_attente' };
      mockedAxios.post.mockResolvedValue({ data: mockData });

      const payload = { patient: 1, medication: 1, start_date: '2024-01-01', end_date: '2024-12-31', status: 'en_attente' };
      const result = await prescriptionAPI.create(payload);

      expect(mockedAxios.post).toHaveBeenCalledWith('/Prescription/', payload);
      expect(result).toEqual(mockData);
    });

    it('should get a specific prescription', async () => {
      const mockData = { id: 1, patient: 1, medication: 1, start_date: '2024-01-01', status: 'valide' };
      mockedAxios.get.mockResolvedValue({ data: mockData });

      const result = await prescriptionAPI.get(1);

      expect(mockedAxios.get).toHaveBeenCalledWith('/Prescription/1/');
      expect(result).toEqual(mockData);
    });

    it('should update a prescription with PUT', async () => {
      const mockData = { id: 1, patient: 1, medication: 1, start_date: '2024-01-01', status: 'valide' };
      mockedAxios.put.mockResolvedValue({ data: mockData });

      const payload = { patient: 1, medication: 1, start_date: '2024-01-01', end_date: '2024-12-31', status: 'valide' };
      const result = await prescriptionAPI.update(1, payload);

      expect(mockedAxios.put).toHaveBeenCalledWith('/Prescription/1/', payload);
      expect(result).toEqual(mockData);
    });

    it('should delete a prescription', async () => {
      mockedAxios.delete.mockResolvedValue({ status: 204 });

      await prescriptionAPI.delete(1);

      expect(mockedAxios.delete).toHaveBeenCalledWith('/Prescription/1/');
    });
  });

  describe('patientAPI', () => {
    it('should list all patients', async () => {
      const mockData = [
        { id: 1, first_name: 'John', last_name: 'Doe' },
        { id: 2, first_name: 'Jane', last_name: 'Smith' },
      ];
      mockedAxios.get.mockResolvedValue({ data: mockData });

      const result = await patientAPI.list();

      expect(mockedAxios.get).toHaveBeenCalledWith('/Patient/');
      expect(result).toEqual(mockData);
    });

    it('should get a specific patient', async () => {
      const mockData = { id: 1, first_name: 'John', last_name: 'Doe' };
      mockedAxios.get.mockResolvedValue({ data: mockData });

      const result = await patientAPI.get(1);

      expect(mockedAxios.get).toHaveBeenCalledWith('/Patient/1/');
      expect(result).toEqual(mockData);
    });

    it('should create a patient', async () => {
      const mockData = { id: 1, first_name: 'John', last_name: 'Doe' };
      mockedAxios.post.mockResolvedValue({ data: mockData });

      const payload = { first_name: 'John', last_name: 'Doe' };
      const result = await patientAPI.create(payload);

      expect(mockedAxios.post).toHaveBeenCalledWith('/Patient/', payload);
      expect(result).toEqual(mockData);
    });
  });

  describe('medicationAPI', () => {
    it('should list all medications', async () => {
      const mockData = [
        { id: 1, label: 'Aspirin' },
        { id: 2, label: 'Ibuprofen' },
      ];
      mockedAxios.get.mockResolvedValue({ data: mockData });

      const result = await medicationAPI.list();

      expect(mockedAxios.get).toHaveBeenCalledWith('/Medication/');
      expect(result).toEqual(mockData);
    });

    it('should get a specific medication', async () => {
      const mockData = { id: 1, label: 'Aspirin' };
      mockedAxios.get.mockResolvedValue({ data: mockData });

      const result = await medicationAPI.get(1);

      expect(mockedAxios.get).toHaveBeenCalledWith('/Medication/1/');
      expect(result).toEqual(mockData);
    });

    it('should create a medication', async () => {
      const mockData = { id: 1, label: 'Aspirin' };
      mockedAxios.post.mockResolvedValue({ data: mockData });

      const payload = { label: 'Aspirin' };
      const result = await medicationAPI.create(payload);

      expect(mockedAxios.post).toHaveBeenCalledWith('/Medication/', payload);
      expect(result).toEqual(mockData);
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors', async () => {
      const error = new Error('Network Error');
      mockedAxios.get.mockRejectedValue(error);

      try {
        await prescriptionAPI.list();
        expect(true).toBe(false); // Should not reach here
      } catch (err) {
        expect(err).toEqual(error);
      }
    });

    it('should handle 404 errors', async () => {
      const error = new Error('Not Found');
      mockedAxios.get.mockRejectedValue(error);

      try {
        await prescriptionAPI.get(999);
        expect(true).toBe(false); // Should not reach here
      } catch (err) {
        expect(err).toEqual(error);
      }
    });
  });
});
