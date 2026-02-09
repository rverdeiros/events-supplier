import { create } from 'zustand';
import { Review } from '@/types';

interface ReviewState {
  reviews: Review[];
  pendingReviews: Review[];
  total: number;
  page: number;
  pageSize: number;
  isLoading: boolean;
  setReviews: (reviews: Review[], total: number) => void;
  setPendingReviews: (reviews: Review[]) => void;
  addReview: (review: Review) => void;
  updateReview: (id: number, review: Partial<Review>) => void;
  removeReview: (id: number) => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export const useReviewStore = create<ReviewState>((set) => ({
  reviews: [],
  pendingReviews: [],
  total: 0,
  page: 1,
  pageSize: 10,
  isLoading: false,
  setReviews: (reviews, total) => set({ reviews, total }),
  setPendingReviews: (pendingReviews) => set({ pendingReviews }),
  addReview: (review) =>
    set((state) => ({
      reviews: [...state.reviews, review],
      total: state.total + 1,
    })),
  updateReview: (id, updatedReview) =>
    set((state) => ({
      reviews: state.reviews.map((r) => (r.id === id ? { ...r, ...updatedReview } : r)),
      pendingReviews: state.pendingReviews.map((r) => (r.id === id ? { ...r, ...updatedReview } : r)),
    })),
  removeReview: (id) =>
    set((state) => ({
      reviews: state.reviews.filter((r) => r.id !== id),
      pendingReviews: state.pendingReviews.filter((r) => r.id !== id),
      total: Math.max(0, state.total - 1),
    })),
  setPage: (page) => set({ page }),
  setPageSize: (pageSize) => set({ pageSize, page: 1 }),
  setLoading: (isLoading) => set({ isLoading }),
  reset: () =>
    set({
      reviews: [],
      pendingReviews: [],
      total: 0,
      page: 1,
      pageSize: 10,
      isLoading: false,
    }),
}));

