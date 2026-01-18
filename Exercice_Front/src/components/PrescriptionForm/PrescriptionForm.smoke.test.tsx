import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PrescriptionForm from './PrescriptionForm';
import * as apiService from '../../services/api';

vi.mock('../../services/api', () => ({
  prescriptionAPI: { create: vi.fn() },
  patientAPI: { list: vi.fn() },
  medicationAPI: { list: vi.fn() },
}));

describe('PrescriptionForm Smoke Tests', () => {
  const mockPatients = [
    { id: 1, first_name: 'John', last_name: 'Doe' },
  ];
  const mockMedications = [
    { id: 1, label: 'Aspirin' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (apiService.patientAPI.list as any).mockResolvedValue(mockPatients);
    (apiService.medicationAPI.list as any).mockResolvedValue(mockMedications);
  });

  it('should render form', async () => {
    render(<PrescriptionForm onSubmitSuccess={() => {}} />);
    await waitFor(() => {
      expect(screen.getByText('Aspirin')).toBeInTheDocument();
    });
  });

  it('should load data on mount', async () => {
    render(<PrescriptionForm />);
    await waitFor(() => {
      expect(apiService.patientAPI.list).toHaveBeenCalled();
      expect(apiService.medicationAPI.list).toHaveBeenCalled();
    });
  });

  it('should display error on load failure', async () => {
    (apiService.patientAPI.list as any).mockRejectedValue(new Error('Load failed'));
    render(<PrescriptionForm />);
    await waitFor(() => {
      expect(screen.getByText('Load failed')).toBeInTheDocument();
    });
  });
});
