import { create } from 'zustand';
import { Category } from '@/types';

interface CategoryState {
  categories: Category[];
  isLoading: boolean;
  setCategories: (categories: Category[]) => void;
  setLoading: (loading: boolean) => void;
  getActiveCategories: () => Category[];
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  isLoading: false,
  setCategories: (categories) => set({ categories }),
  setLoading: (isLoading) => set({ isLoading }),
  getActiveCategories: () => {
    return get().categories.filter((cat) => cat.active);
  },
}));

