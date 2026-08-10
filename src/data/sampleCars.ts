import type { Car } from '../types/car';

export const SAMPLE_CARS: Car[] = [
  {
    id: 'porsche-911-gt3-rs-2024',
    brand: 'Porsche',
    model: '911 GT3 RS',
    year: 2024,
    category: 'luxury',
    image: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?q=80&w=1200&auto=format&fit=crop',
    engine: {
      type: 'Naturally Aspirated Flat-6',
      displacementL: 4.0,
      cylinders: 6,
      layout: 'Rear-Engine'
    },
    horsepower: 518,
    torqueLbFt: 342,
    topSpeedMph: 184,
    zeroToSixtyS: 3.0,
    priceUsd: 241300,
    weightLbs: 3268,
    drivetrain: 'RWD',
    transmission: '7-Speed PDK Automatic',
    country: 'Germany',
    blurb: 'The ultimate track-focused road car featuring active aerodynamics, drag reduction system (DRS), and a high-revving 9,000 RPM naturally aspirated flat-six.',
    prestige: 9
  },
  {
    id: 'bugatti-chiron-super-sport-2022',
    brand: 'Bugatti',
    model: 'Chiron Super Sport',
    year: 2022,
    category: 'hyper',
    image: 'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?q=80&w=1200&auto=format&fit=crop',
    engine: {
      type: 'Quad-Turbo W16',
      displacementL: 8.0,
      cylinders: 16,
      layout: 'Mid-Engine'
    },
    horsepower: 1578,
    torqueLbFt: 1180,
    topSpeedMph: 273,
    zeroToSixtyS: 2.2,
    priceUsd: 3800000,
    weightLbs: 4398,
    drivetrain: 'AWD',
    transmission: '7-Speed Dual-Clutch',
    country: 'France',
    blurb: 'An engineering masterpiece delivering unparalleled hypercar velocity and luxury, pushing mechanical limits past 270 mph with quad-turbo W16 dominance.',
    prestige: 10
  },
  {
    id: 'toyota-gr-supra-30-2024',
    brand: 'Toyota',
    model: 'GR Supra 3.0',
    year: 2024,
    category: 'normal',
    image: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?q=80&w=1200&auto=format&fit=crop',
    engine: {
      type: 'Turbocharged Inline-6',
      displacementL: 3.0,
      cylinders: 6,
      layout: 'Front-Engine'
    },
    horsepower: 382,
    torqueLbFt: 368,
    topSpeedMph: 155,
    zeroToSixtyS: 3.9,
    priceUsd: 54500,
    weightLbs: 3400,
    drivetrain: 'RWD',
    transmission: '6-Speed Manual',
    country: 'Japan',
    blurb: 'Pure sports car DNA tuned by TOYOTA GAZOO Racing, combining telepathic steering precision with a punchy turbocharged inline-6 drivetrain.',
    prestige: 6
  },
  {
    id: 'bmw-m5-cs-2022',
    brand: 'BMW',
    model: 'M5 CS',
    year: 2022,
    category: 'luxury',
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=1200&auto=format&fit=crop',
    engine: {
      type: 'Twin-Turbo V8',
      displacementL: 4.4,
      cylinders: 8,
      layout: 'Front-Engine'
    },
    horsepower: 627,
    torqueLbFt: 553,
    topSpeedMph: 190,
    zeroToSixtyS: 2.9,
    priceUsd: 142000,
    weightLbs: 4114,
    drivetrain: 'M xDrive AWD',
    transmission: '8-Speed M Steptronic',
    country: 'Germany',
    blurb: 'The most powerful production BMW M car of its era, combining track-honed carbon fiber bucket seating with supercar-slaying acceleration in a 4-door sedan.',
    prestige: 8
  }
];
