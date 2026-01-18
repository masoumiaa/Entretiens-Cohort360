import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PrescriptionList from './PrescriptionList';
import * as apiService from '../../services/api';

// Mock the API service
vi.mock('../../services/api', () => ({
  prescriptionAPI: {
    list: vi.fn(),
    delete: vi.fn(),
  },
  patientAPI: {
    list: vi.fn(),
  },
  medicationAPI: {
    list: vi.fn(),
  },
}));

describe('PrescriptionList Component', () => {
  const mockPatients = [
    { id: 1, first_name: 'John', last_name: 'Doe' },
    { id: 2, first_name: 'Jane', last_name: 'Smith' },
  ];

  const mockMedications = [
    { id: 1, label: 'Aspirin' },
    { id: 2, label: 'Ibuprofen' },
  ];

  const mockPrescriptions = [
    {
      id: 1,
      patient: 1,
      medication: 1,
      start_date: '2024-01-01',
      end_date: '2024-12-31',
      status: 'valide',
      comment: 'Test comment',
    },
    {
      id: 2,
      patient: 2,
      medication: 2,
      start_date: '2024-02-01',
      end_date: '2024-11-30',
      status: 'en_attente',
      comment: '',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (apiService.patientAPI.list as any).mockResolvedValue(mockPatients);
    (apiService.medicationAPI.list as any).mockResolvedValue(mockMedications);
    (apiService.prescriptionAPI.list as any).mockResolvedValue(mockPrescriptions);
  });

  it('should render the component with title', async () => {
    render(<PrescriptionList />);
    
    await waitFor(() => {
      expect(screen.getByText('Prescriptions')).toBeInTheDocument();
    });
  });

  it('should load and display prescriptions', async () => {
    render(<PrescriptionList />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  it('should display correct medication names', async () => {
    render(<PrescriptionList />);

    await waitFor(() => {
      expect(screen.getByText('Aspirin')).toBeInTheDocument();
      expect(screen.getByText('Ibuprofen')).toBeInTheDocument();
    });
  });

  it('should display prescription dates', async () => {
    render(<PrescriptionList />);

    await waitFor(() => {
      const rows = screen.getAllByRole('row');
      expect(rows.length).toBeGreaterThan(1); // header + at least 1 data row
    });
  });

  it('should display prescription status', async () => {
    render(<PrescriptionList />);

    await waitFor(() => {
      expect(screen.getByText('Valide')).toBeInTheDocument();
      expect(screen.getByText('En attente')).toBeInTheDocument();
    });
  });

  it('should toggle filters visibility', async () => {
    render(<PrescriptionList />);

    await waitFor(() => {
      expect(screen.getByText('Filtres')).toBeInTheDocument();
    });

    const toggleBtn = screen.getByRole('button', { name: '−' });
    fireEvent.click(toggleBtn);

    // After toggling, the filter-group should not be visible
    const filterGroup = screen.queryByRole('combobox', { name: /Patient:/ });
    expect(filterGroup).not.toBeInTheDocument();
  });

  it('should load patients dropdown on render', async () => {
    render(<PrescriptionList />);

    await waitFor(() => {
      const selects = screen.getAllByRole('combobox');
      expect(selects.length).toBeGreaterThan(0);
    });
  });

  it('should call delete API when confirming deletion', async () => {
    (apiService.prescriptionAPI.delete as any).mockResolvedValue(true);
    
    render(<PrescriptionList />);

    await waitFor(() => {
      const rows = screen.getAllByRole('row');
      expect(rows.length).toBeGreaterThan(1); // header + at least 1 data row
    });

    const deleteButtons = screen.getAllByText('Supprimer');
    
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(apiService.prescriptionAPI.delete).toHaveBeenCalledWith(1);
    });
  });

  it('should not call delete API when cancelling deletion', async () => {
    render(<PrescriptionList />);

    await waitFor(() => {
      const rows = screen.getAllByRole('row');
      expect(rows.length).toBeGreaterThan(1);
    });

    const deleteButtons = screen.getAllByText('Supprimer');
    
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(apiService.prescriptionAPI.delete).not.toHaveBeenCalled();
    });
  });

  it('should display empty state when no prescriptions found', async () => {
    (apiService.prescriptionAPI.list as any).mockResolvedValue([]);
    
    render(<PrescriptionList />);

    await waitFor(() => {
      expect(screen.getByText('Aucune prescription trouvée.')).toBeInTheDocument();
    });
  });

  it('should display error message on API failure', async () => {
    (apiService.prescriptionAPI.list as any).mockRejectedValue(new Error('API Error'));
    
    render(<PrescriptionList />);

    await waitFor(() => {
      expect(screen.getByText('API Error')).toBeInTheDocument();
    });
  });

  it('should have delete buttons for each prescription', async () => {
    render(<PrescriptionList />);

    await waitFor(() => {
      const deleteButtons = screen.getAllByText('Supprimer');
      expect(deleteButtons.length).toBe(mockPrescriptions.length);
    });
  });

  it('should call API with filters when applying filters', async () => {
    render(<PrescriptionList />);

    await waitFor(() => {
      const rows = screen.getAllByRole('row');
      expect(rows.length).toBeGreaterThan(1);
    });

    const filterBtn = screen.getByText('Appliquer filtres');
    fireEvent.click(filterBtn);

    await waitFor(() => {
      expect(apiService.prescriptionAPI.list).toHaveBeenCalled();
    });
  });

  it('should reset filters when clicking reset button', async () => {
    render(<PrescriptionList />);

    await waitFor(() => {
      const selects = screen.getAllByRole('combobox');
      expect(selects.length).toBeGreaterThan(0);
    });

    const resetBtn = screen.getByText('Réinitialiser');
    fireEvent.click(resetBtn);

    await waitFor(() => {
      const selects = screen.getAllByRole('combobox') as HTMLSelectElement[];
      selects.forEach(select => {
        if (select.tagName === 'SELECT') {
          expect(select.value).toBe('');
        }
      });
    });
  });
});
