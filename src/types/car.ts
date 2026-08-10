export interface CarEngine {
  type: string;
  displacementL: number | null;
  cylinders: number | null;
  layout: string;
}

export interface Car {
  id: string;
  brand: string;
  model: string;
  year: number;
  category: "normal" | "luxury" | "hyper";
  image: string;
  engine: CarEngine;
  horsepower: number;
  torqueLbFt: number;
  topSpeedMph: number;
  zeroToSixtyS: number;
  priceUsd: number;
  weightLbs: number;
  drivetrain: string;
  transmission: string;
  country: string;
  blurb: string;
  prestige?: number; // 1-10 hand-curated prestige score for taste profile axis
}
