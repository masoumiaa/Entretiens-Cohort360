import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PrescriptionForm from './PrescriptionForm';
import * as apiService from '../../services/api';

vi.mock('../../services/api', () => ({
  prescriptionAPI: { create: vi.fn() },
  patientAPI: { list: vi.fn() },
  medicationAPI: { list: vi.fn() },
}));

describe('PrescriptionForm Component', () => {
  const mockPatients = [
    { id: 1, first_name: 'John', last_name: 'Doe' },
    { id: 2, first_name: 'Jane', last_name: 'Smith' },
  ];

  const mockMedications = [
    { id: 1, label: 'Aspirin' },
    { id: 2, label: 'Ibuprofen' },
  ];

  const mockOnSubmitSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (apiService.patientAPI.list as any).mockResolvedValue(mockPatients);
    (apiService.medicationAPI.list as any).mockResolvedValue(mockMedications);
  });

  it('should render the form with title', async () => {
    render(<PrescriptionForm onSubmitSuccess={mockOnSubmitSuccess} />);
    await waitFor(() => {
      const heading = screen.getByRole('heading');
      expect(heading).toBeInTheDocument();
    });
  });

  it('should load patients and medications', async () => {
    render(<PrescriptionForm onSubmitSuccess={mockOnSubmitSuccess} />);
    await waitFor(() => {
      expect(screen.getByText('Aspirin')).toBeInTheDocument();
    });
  });

  it('should have all form fields', async () => {
    render(<PrescriptionForm onSubmitSuccess={mockOnSubmitSuccess} />);
    await waitFor(() => {
      expect(screen.getByLabelText('Patient *')).toBeInTheDocument();
      expect(screen.getByLabelText('Médicament *')).toBeInTheDocument();
      expect(screen.getByLabelText('Date de début *')).toBeInTheDocument();
      expect(screen.getByLabelText('Date de fin *')).toBeInTheDocument();
    });
  });

  it('should handle form submission', async () => {
    (apiService.prescriptionAPI.create as any).mockResolvedValue({
      id: 1,
      patient: 1,
      medication: 1,
      start_date: '2024-01-01',
      end_date: '2024-12-31',
      status: 'en_attente',
    });

    render(<PrescriptionForm onSubmitSuccess={mockOnSubmitSuccess} />);

    await waitFor(() => {
      expect(screen.getByText('Aspirin')).toBeInTheDocument();
    });

    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: '1' } });
    fireEvent.change(selects[1], { target: { value: '1' } });

    const submitBtn = screen.getByRole('button', { name: /Créer/ });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(apiService.prescriptionAPI.create).toHaveBeenCalled();
    });
  });

  it('should display error on load failure', async () => {
    (apiService.patientAPI.list as any).mockRejectedValue(new Error('Load failed'));
    render(<PrescriptionForm />);
    await waitFor(() => {
      expect(screen.getByText('Load failed')).toBeInTheDocument();
    });
  });

  it('should display error on submit failure', async () => {
    (apiService.prescriptionAPI.create as any).mockRejectedValue(
      new Error('Submit failed')
    );

    render(<PrescriptionForm onSubmitSuccess={mockOnSubmitSuccess} />);

    await waitFor(() => {
      expect(screen.getByText('Aspirin')).toBeInTheDocument();
    });

    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: '1' } });
    fireEvent.change(selects[1], { target: { value: '1' } });

    const submitBtn = screen.getByRole('button', { name: /Créer/ });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Submit failed')).toBeInTheDocument();
    });
  });
});
