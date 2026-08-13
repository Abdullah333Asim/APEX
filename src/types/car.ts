export interface CarEngine {
  type: string;
  displacementL: number | "N/A" | null;
  cylinders: number | "N/A" | null;
  layout: string;
}

export interface Car {
  id: string;
  brand: string;
  model: string;
  year: number;
  category: "normal" | "luxury" | "hyper" | "f1";
  image: string;
  engine: CarEngine;
  horsepower: number | "N/A";
  torqueLbFt: number | "N/A" | null;
  topSpeedMph: number | "N/A";
  zeroToSixtyS: number | "N/A" | null;
  priceUsd: number | "N/A" | null;
  weightLbs: number | "N/A";
  drivetrain: string;
  transmission: string;
  country: string;
  blurb: string;
  prestige?: number; // 1-10 hand-curated prestige score for taste profile axis
}
