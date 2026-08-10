import { create } from 'zustand';
import { getCarById } from '../data/carsData';

export interface GarageState {
  savedIds: string[];
  toastMessage: string | null;
  toastType: 'add' | 'remove' | 'clear' | null;

  toggleSave: (carId: string) => void;
  isSaved: (carId: string) => boolean;
  clearGarage: () => void;
  clearToast: () => void;
}

const STORAGE_KEY = 'apex_garage_saved_ids';

const loadSavedIds = (): string[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to load saved cars from localStorage', e);
    return [];
  }
};

const saveSavedIds = (ids: string[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch (e) {
    console.error('Failed to persist saved cars to localStorage', e);
  }
};

let toastTimeout: ReturnType<typeof setTimeout> | null = null;

export const useGarageStore = create<GarageState>()((set, get) => ({
  savedIds: loadSavedIds(),
  toastMessage: null,
  toastType: null,

  toggleSave: (carId: string) => {
    const current = get().savedIds;
    const exists = current.includes(carId);
    const updated = exists
      ? current.filter((id: string) => id !== carId)
      : [...current, carId];

    const car = getCarById(carId);
    const carName = car ? `${car.brand} ${car.model}` : 'Machine';

    saveSavedIds(updated);

    // Trigger toast notification
    if (toastTimeout) clearTimeout(toastTimeout);
    const msg = exists
      ? `Removed ${carName} from Garage`
      : `Saved ${carName} to Garage`;
    const type = exists ? 'remove' : 'add';

    set({
      savedIds: updated,
      toastMessage: msg,
      toastType: type,
    });

    toastTimeout = setTimeout(() => {
      set({ toastMessage: null, toastType: null });
    }, 2500);
  },

  isSaved: (carId: string) => {
    return get().savedIds.includes(carId);
  },

  clearGarage: () => {
    saveSavedIds([]);
    if (toastTimeout) clearTimeout(toastTimeout);

    set({
      savedIds: [],
      toastMessage: 'Cleared all machines from Garage',
      toastType: 'clear',
    });

    toastTimeout = setTimeout(() => {
      set({ toastMessage: null, toastType: null });
    }, 2500);
  },

  clearToast: () => {
    if (toastTimeout) clearTimeout(toastTimeout);
    set({ toastMessage: null, toastType: null });
  },
}));
