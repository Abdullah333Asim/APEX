import { Car } from '../types/car';
import rawCars from './cars.json';

// Cast imported raw json data to Car[]
export const allCars: Car[] = rawCars as Car[];

export const getCarById = (id: string): Car | undefined => {
  return allCars.find((car) => car.id === id);
};

export const getCarsByCategory = (category: 'normal' | 'luxury' | 'hyper' | 'f1' | 'all'): Car[] => {
  if (category === 'all') return allCars;
  return allCars.filter((car) => car.category === category);
};

export const getAvailableBrands = (cars: Car[] = allCars): string[] => {
  const brandsSet = new Set(cars.map((car) => car.brand));
  return Array.from(brandsSet).sort();
};

export interface StatRanges {
  minHp: number;
  maxHp: number;
  minPrice: number;
  maxPrice: number;
  minSpeed: number;
  maxSpeed: number;
  minYear: number;
  maxYear: number;
}

export const getStatRanges = (cars: Car[] = allCars): StatRanges => {
  if (cars.length === 0) {
    return { minHp: 0, maxHp: 2000, minPrice: 0, maxPrice: 5000000, minSpeed: 0, maxSpeed: 320, minYear: 2000, maxYear: 2026 };
  }

  const priceCars = cars.map((c) => c.priceUsd).filter((p): p is number => p !== null);

  return {
    minHp: Math.min(...cars.map((c) => c.horsepower)),
    maxHp: Math.max(...cars.map((c) => c.horsepower)),
    minPrice: priceCars.length > 0 ? Math.min(...priceCars) : 0,
    maxPrice: priceCars.length > 0 ? Math.max(...priceCars) : 0,
    minSpeed: Math.min(...cars.map((c) => c.topSpeedMph)),
    maxSpeed: Math.max(...cars.map((c) => c.topSpeedMph)),
    minYear: Math.min(...cars.map((c) => c.year)),
    maxYear: Math.max(...cars.map((c) => c.year)),
  };
};

export interface FilterParams {
  category?: 'all' | 'normal' | 'luxury' | 'hyper' | 'f1';
  search?: string;
  brand?: string;
  minHp?: number;
  maxHp?: number;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'horsepower' | 'price' | 'topSpeed' | 'year' | 'brand' | 'model';
  sortOrder?: 'asc' | 'desc';
}

const getCarSortValue = (car: Car, sortBy: string): number | string | null => {
  switch (sortBy) {
    case 'horsepower':
      return car.horsepower;
    case 'price':
      return car.priceUsd;
    case 'topSpeed':
      return car.topSpeedMph;
    case 'year':
      return car.year;
    case 'brand':
      return car.brand;
    case 'model':
      return car.model;
    default:
      return car.horsepower;
  }
};

export const filterCars = (params: FilterParams): Car[] => {
  const {
    category = 'all',
    search = '',
    brand = 'all',
    minHp,
    maxHp,
    minPrice,
    maxPrice,
    sortBy = 'horsepower',
    sortOrder = 'desc',
  } = params;

  let result = [...allCars];

  // Category filter
  if (category !== 'all') {
    result = result.filter((car) => car.category === category);
  }

  // Brand filter
  if (brand && brand !== 'all') {
    result = result.filter((car) => car.brand.toLowerCase() === brand.toLowerCase());
  }

  // Text Search filter (brand, model, or country)
  if (search.trim()) {
    const query = search.trim().toLowerCase();
    result = result.filter(
      (car) =>
        car.brand.toLowerCase().includes(query) ||
        car.model.toLowerCase().includes(query) ||
        `${car.brand} ${car.model}`.toLowerCase().includes(query) ||
        car.country.toLowerCase().includes(query)
    );
  }

  // Horsepower range
  if (minHp !== undefined) {
    result = result.filter((car) => car.horsepower >= minHp);
  }
  if (maxHp !== undefined) {
    result = result.filter((car) => car.horsepower <= maxHp);
  }

  // Price range
  if (minPrice !== undefined) {
    result = result.filter((car) => car.priceUsd !== null && car.priceUsd >= minPrice);
  }
  if (maxPrice !== undefined) {
    result = result.filter((car) => car.priceUsd !== null && car.priceUsd <= maxPrice);
  }

  // Sorting
  result.sort((a, b) => {
    const valA = getCarSortValue(a, sortBy);
    const valB = getCarSortValue(b, sortBy);

    if (valA === null || valB === null) {
      // Sort nulls (e.g. F1 cars without price) to the bottom regardless of sort order
      if (valA === null && valB === null) return 0;
      return valA === null ? 1 : -1;
    }

    if (typeof valA === 'string' && typeof valB === 'string') {
      return sortOrder === 'asc'
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    }

    const numA = valA as number;
    const numB = valB as number;

    return sortOrder === 'asc' ? numA - numB : numB - numA;
  });

  return result;
};

/**
 * Format prices:
 * - Below 1 million: show as 'k' (rounded to nearest integer, e.g. 250k)
 * - 1 million or above: show as 'm' to the nearest 3 decimal places (stripping redundant trailing zeros, e.g. 1.25m, 1.005m)
 */
export const formatCompactPrice = (value: number | null | undefined): string => {
  if (value === null || value === undefined) {
    return 'N/A';
  }
  if (value < 1000000) {
    return `${Math.round(value / 1000)}k`;
  }
  const millionVal = value / 1000000;
  return `${parseFloat(millionVal.toFixed(3))}m`;
};

