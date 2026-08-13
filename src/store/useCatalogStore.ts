import { create } from 'zustand';

export type CatalogCategory = 'all' | 'normal' | 'luxury' | 'hyper' | 'f1';
export type SortOption = 'horsepower' | 'price' | 'topSpeed' | 'year';
export type SortOrder = 'asc' | 'desc';

export interface CatalogFilterState {
  category: CatalogCategory;
  search: string;
  selectedBrand: string;
  minHp: number | null;
  maxHp: number | null;
  minPrice: number | null;
  maxPrice: number | null;
  sortBy: SortOption;
  sortOrder: SortOrder;

  setCategory: (category: CatalogCategory) => void;
  setSearch: (search: string) => void;
  setSelectedBrand: (brand: string) => void;
  setMinHp: (hp: number | null) => void;
  setMaxHp: (hp: number | null) => void;
  setMinPrice: (price: number | null) => void;
  setMaxPrice: (price: number | null) => void;
  setSortBy: (sortBy: SortOption) => void;
  setSortOrder: (order: SortOrder) => void;
  resetFilters: (defaults: { minHp: number; maxHp: number; minPrice: number; maxPrice: number }) => void;
}

export const useCatalogStore = create<CatalogFilterState>((set) => ({
  category: 'all',
  search: '',
  selectedBrand: 'all',
  minHp: null,
  maxHp: null,
  minPrice: null,
  maxPrice: null,
  sortBy: 'horsepower',
  sortOrder: 'desc',

  setCategory: (category) => set({ category }),
  setSearch: (search) => set({ search }),
  setSelectedBrand: (selectedBrand) => set({ selectedBrand }),
  setMinHp: (minHp) => set({ minHp }),
  setMaxHp: (maxHp) => set({ maxHp }),
  setMinPrice: (minPrice) => set({ minPrice }),
  setMaxPrice: (maxPrice) => set({ maxPrice }),
  setSortBy: (sortBy) => set({ sortBy }),
  setSortOrder: (sortOrder) => set({ sortOrder }),

  resetFilters: (defaults) => set({
    category: 'all',
    search: '',
    selectedBrand: 'all',
    minHp: defaults.minHp,
    maxHp: defaults.maxHp,
    minPrice: defaults.minPrice,
    maxPrice: defaults.maxPrice,
    sortBy: 'horsepower',
    sortOrder: 'desc',
  }),
}));
