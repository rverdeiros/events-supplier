import { create } from 'zustand';
import { Supplier, SupplierFilters } from '@/types';

interface SupplierState {
  suppliers: Supplier[];
  selectedSupplier: Supplier | null;
  filters: SupplierFilters;
  total: number;
  page: number;
  pageSize: number;
  isLoading: boolean;
  setSuppliers: (suppliers: Supplier[], total: number) => void;
  setSelectedSupplier: (supplier: Supplier | null) => void;
  setFilters: (filters: Partial<SupplierFilters>) => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setLoading: (loading: boolean) => void;
  resetFilters: () => void;
}

const defaultFilters: SupplierFilters = {
  page: 1,
  page_size: 10,
};

export const useSupplierStore = create<SupplierState>((set) => ({
  suppliers: [],
  selectedSupplier: null,
  filters: defaultFilters,
  total: 0,
  page: 1,
  pageSize: 10,
  isLoading: false,
  setSuppliers: (suppliers, total) => set({ suppliers, total }),
  setSelectedSupplier: (supplier) => set({ selectedSupplier: supplier }),
  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
      page: 1, // Reset to first page when filters change
    })),
  setPage: (page) => set({ page }),
  setPageSize: (pageSize) => set({ pageSize, page: 1 }),
  setLoading: (isLoading) => set({ isLoading }),
  resetFilters: () => set({ filters: defaultFilters, page: 1 }),
}));

