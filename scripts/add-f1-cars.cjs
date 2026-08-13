const fs = require('fs');
const path = require('path');

const CARS_JSON_PATH = path.resolve(__dirname, '../src/data/cars.json');
const BASE_PLACEHOLDER_PATH = path.resolve(__dirname, '../public/base-placeholder.jpg');
const F1_DIR = path.resolve(__dirname, '../public/f1');

if (!fs.existsSync(F1_DIR)) fs.mkdirSync(F1_DIR, { recursive: true });

const newF1Cars = [
  {
    id: "mclaren-mp4-4-1988",
    brand: "McLaren",
    model: "MP4/4",
    year: 1988,
    category: "f1",
    image: "/f1/mclaren-mp4-4-1988.jpg",
    engine: { type: "1.5L V6 Twin-Turbo (Honda RA168E)", displacementL: 1.5, cylinders: 6, layout: "Mid-Engine V6" },
    horsepower: 650,
    torqueLbFt: "N/A",
    topSpeedMph: 207,
    zeroToSixtyS: "N/A",
    priceUsd: "N/A",
    weightLbs: 1190,
    drivetrain: "RWD",
    transmission: "6-Speed Manual",
    country: "UK",
    blurb: "One of the most dominant F1 cars ever built, winning 15 of 16 races in 1988 with Ayrton Senna and Alain Prost.",
    prestige: 10
  },
  {
    id: "williams-fw14b-1992",
    brand: "Williams",
    model: "FW14B",
    year: 1992,
    category: "f1",
    image: "/f1/williams-fw14b-1992.jpg",
    engine: { type: "3.5L Naturally Aspirated V10 (Renault RS3C)", displacementL: 3.5, cylinders: 10, layout: "Mid-Engine V10" },
    horsepower: 750,
    torqueLbFt: "N/A",
    topSpeedMph: 205,
    zeroToSixtyS: "N/A",
    priceUsd: "N/A",
    weightLbs: 1113,
    drivetrain: "RWD",
    transmission: "6-Speed Semi-Automatic",
    country: "UK",
    blurb: "Technological masterpiece equipped with active suspension, traction control, and blown diffuser driven by Nigel Mansell.",
    prestige: 10
  },
  {
    id: "mclaren-mp4-13-1998",
    brand: "McLaren",
    model: "MP4/13",
    year: 1998,
    category: "f1",
    image: "/f1/mclaren-mp4-13-1998.jpg",
    engine: { type: "3.0L Naturally Aspirated V10 (Mercedes FO110G)", displacementL: 3.0, cylinders: 10, layout: "Mid-Engine V10" },
    horsepower: 780,
    torqueLbFt: "N/A",
    topSpeedMph: 219,
    zeroToSixtyS: "N/A",
    priceUsd: "N/A",
    weightLbs: 1323,
    drivetrain: "RWD",
    transmission: "6-Speed Sequential",
    country: "UK",
    blurb: "Adrian Newey designed world-championship winning car that carried Mika Häkkinen to his first F1 title.",
    prestige: 10
  },
  {
    id: "ferrari-f310b-1997",
    brand: "Ferrari",
    model: "F310B",
    year: 1997,
    category: "f1",
    image: "/f1/ferrari-f310b-1997.jpg",
    engine: { type: "3.0L Naturally Aspirated V10 (Tipo 046/2)", displacementL: 3.0, cylinders: 10, layout: "Mid-Engine V10" },
    horsepower: 750,
    torqueLbFt: "N/A",
    topSpeedMph: 215,
    zeroToSixtyS: "N/A",
    priceUsd: "N/A",
    weightLbs: 1323,
    drivetrain: "RWD",
    transmission: "7-Speed Sequential Semi-Automatic",
    country: "Italy",
    blurb: "High-nosed Ferrari V10 monster driven by Michael Schumacher in an intense championship showdown.",
    prestige: 9
  },
  {
    id: "williams-fw18-1996",
    brand: "Williams",
    model: "FW18",
    year: 1996,
    category: "f1",
    image: "/f1/williams-fw18-1996.jpg",
    engine: { type: "3.0L Naturally Aspirated V10 (Renault RS8)", displacementL: 3.0, cylinders: 10, layout: "Mid-Engine V10" },
    horsepower: 750,
    torqueLbFt: "N/A",
    topSpeedMph: 214,
    zeroToSixtyS: "N/A",
    priceUsd: "N/A",
    weightLbs: 1312,
    drivetrain: "RWD",
    transmission: "6-Speed Semi-Automatic",
    country: "UK",
    blurb: "Dominant 12-win chassis that propelled Damon Hill to the 1996 Drivers' World Championship.",
    prestige: 9
  },
  {
    id: "benetton-b195-1995",
    brand: "Benetton",
    model: "B195",
    year: 1995,
    category: "f1",
    image: "/f1/benetton-b195-1995.jpg",
    engine: { type: "3.0L Naturally Aspirated V10 (Renault RS7)", displacementL: 3.0, cylinders: 10, layout: "Mid-Engine V10" },
    horsepower: 750,
    torqueLbFt: "N/A",
    topSpeedMph: 212,
    zeroToSixtyS: "N/A",
    priceUsd: "N/A",
    weightLbs: 1312,
    drivetrain: "RWD",
    transmission: "6-Speed Semi-Automatic",
    country: "UK",
    blurb: "Rory Byrne designed chassis with Renault V10 power that claimed both Drivers' and Constructors' titles.",
    prestige: 9
  },
  {
    id: "ferrari-sf71h-2018",
    brand: "Ferrari",
    model: "SF71H",
    year: 2018,
    category: "f1",
    image: "/f1/ferrari-sf71h-2018.jpg",
    engine: { type: "1.6L V6 Turbo Hybrid (Ferrari 063)", displacementL: 1.6, cylinders: 6, layout: "Mid-Engine V6 Hybrid" },
    horsepower: 990,
    torqueLbFt: "N/A",
    topSpeedMph: 223,
    zeroToSixtyS: "N/A",
    priceUsd: "N/A",
    weightLbs: 1616,
    drivetrain: "RWD",
    transmission: "8-Speed Seamless-Shift Semi-Automatic",
    country: "Italy",
    blurb: "Long-wheelbase Ferrari hybrid rocket piloted by Sebastian Vettel and Kimi Räikkönen to 6 victories.",
    prestige: 9
  },
  {
    id: "lotus-79-1978",
    brand: "Lotus",
    model: "79",
    year: 1978,
    category: "f1",
    image: "/f1/lotus-79-1978.jpg",
    engine: { type: "3.0L Naturally Aspirated V8 (Ford Cosworth DFV)", displacementL: 3.0, cylinders: 8, layout: "Mid-Engine V8" },
    horsepower: 475,
    torqueLbFt: "N/A",
    topSpeedMph: 180,
    zeroToSixtyS: "N/A",
    priceUsd: "N/A",
    weightLbs: 1265,
    drivetrain: "RWD",
    transmission: "5-Speed Manual",
    country: "UK",
    blurb: "Colin Chapman's ground-effect aerodynamic marvel dubbed the 'Black Beauty', driven by Mario Andretti.",
    prestige: 10
  },
  {
    id: "mclaren-mp4-27-2012",
    brand: "McLaren",
    model: "MP4-27",
    year: 2012,
    category: "f1",
    image: "/f1/mclaren-mp4-27-2012.jpg",
    engine: { type: "2.4L Naturally Aspirated V8 (Mercedes FO 108Z)", displacementL: 2.4, cylinders: 8, layout: "Mid-Engine V8" },
    horsepower: 750,
    torqueLbFt: "N/A",
    topSpeedMph: 215,
    zeroToSixtyS: "N/A",
    priceUsd: "N/A",
    weightLbs: 1411,
    drivetrain: "RWD",
    transmission: "7-Speed Seamless-Shift Semi-Automatic",
    country: "UK",
    blurb: "High-revving 18,000 RPM V8 contender driven by World Champions Lewis Hamilton and Jenson Button.",
    prestige: 9
  },
  {
    id: "mercedes-w07-2016",
    brand: "Mercedes-AMG",
    model: "F1 W07 Hybrid",
    year: 2016,
    category: "f1",
    image: "/f1/mercedes-w07-2016.jpg",
    engine: { type: "1.6L V6 Turbo Hybrid (Mercedes PU106C)", displacementL: 1.6, cylinders: 6, layout: "Mid-Engine V6 Hybrid" },
    horsepower: 950,
    torqueLbFt: "N/A",
    topSpeedMph: 225,
    zeroToSixtyS: "N/A",
    priceUsd: "N/A",
    weightLbs: 1548,
    drivetrain: "RWD",
    transmission: "8-Speed Seamless-Shift Semi-Automatic",
    country: "Germany",
    blurb: "Record-setting silver arrow that won 19 out of 21 Grand Prix races in Nico Rosberg's championship season.",
    prestige: 10
  },
  {
    id: "redbull-rb7-2011",
    brand: "Red Bull Racing",
    model: "RB7",
    year: 2011,
    category: "f1",
    image: "/f1/redbull-rb7-2011.jpg",
    engine: { type: "2.4L Naturally Aspirated V8 (Renault RS27-2011)", displacementL: 2.4, cylinders: 8, layout: "Mid-Engine V8" },
    horsepower: 750,
    torqueLbFt: "N/A",
    topSpeedMph: 211,
    zeroToSixtyS: "N/A",
    priceUsd: "N/A",
    weightLbs: 1411,
    drivetrain: "RWD",
    transmission: "7-Speed Semi-Automatic",
    country: "Austria",
    blurb: "Blown-diffuser aerodynamic masterpiece that powered Sebastian Vettel to 12 pole positions and 11 wins.",
    prestige: 10
  },
  {
    id: "ferrari-sf90-2019",
    brand: "Ferrari",
    model: "SF90 F1",
    year: 2019,
    category: "f1",
    image: "/f1/ferrari-sf90-2019.jpg",
    engine: { type: "1.6L V6 Turbo Hybrid (Ferrari 064)", displacementL: 1.6, cylinders: 6, layout: "Mid-Engine V6 Hybrid" },
    horsepower: 1000,
    torqueLbFt: "N/A",
    topSpeedMph: 224,
    zeroToSixtyS: "N/A",
    priceUsd: "N/A",
    weightLbs: 1638,
    drivetrain: "RWD",
    transmission: "8-Speed Semi-Automatic",
    country: "Italy",
    blurb: "Straight-line speed monster that took Charles Leclerc to emotional victories at Spa and Monza.",
    prestige: 9
  },
  {
    id: "williams-fw25-2003",
    brand: "Williams",
    model: "FW25",
    year: 2003,
    category: "f1",
    image: "/f1/williams-fw25-2003.jpg",
    engine: { type: "3.0L Naturally Aspirated V10 (BMW P83)", displacementL: 3.0, cylinders: 10, layout: "Mid-Engine V10" },
    horsepower: 900,
    torqueLbFt: "N/A",
    topSpeedMph: 223,
    zeroToSixtyS: "N/A",
    priceUsd: "N/A",
    weightLbs: 1323,
    drivetrain: "RWD",
    transmission: "7-Speed Semi-Automatic",
    country: "UK",
    blurb: "Powered by BMW's screamer 19,200 RPM V10 engine, driven by Juan Pablo Montoya and Ralf Schumacher.",
    prestige: 9
  },
  {
    id: "ferrari-f1-75-2022",
    brand: "Ferrari",
    model: "F1-75",
    year: 2022,
    category: "f1",
    image: "/f1/ferrari-f1-75-2022.jpg",
    engine: { type: "1.6L V6 Turbo Hybrid (Ferrari 066/7)", displacementL: 1.6, cylinders: 6, layout: "Mid-Engine V6 Hybrid" },
    horsepower: 1020,
    torqueLbFt: "N/A",
    topSpeedMph: 218,
    zeroToSixtyS: "N/A",
    priceUsd: "N/A",
    weightLbs: 1753,
    drivetrain: "RWD",
    transmission: "8-Speed Semi-Automatic",
    country: "Italy",
    blurb: "Distinctive 'bathtub' sidepod ground-effect challenger driven by Charles Leclerc and Carlos Sainz.",
    prestige: 9
  }
];

// Load existing cars
const rawData = fs.readFileSync(CARS_JSON_PATH, 'utf8');
const cars = JSON.parse(rawData);

const existingIds = new Set(cars.map(c => c.id));
let addedCount = 0;
let f1PlaceholderCount = 0;

for (const car of newF1Cars) {
  if (existingIds.has(car.id)) {
    console.log(`Skipping existing ID: ${car.id}`);
    continue;
  }

  cars.push(car);
  existingIds.add(car.id);
  addedCount++;

  // Copy base placeholder file to public/f1/{id}.jpg
  const destPath = path.resolve(__dirname, '../public' + car.image);
  fs.copyFileSync(BASE_PLACEHOLDER_PATH, destPath);
  f1PlaceholderCount++;
}

fs.writeFileSync(CARS_JSON_PATH, JSON.stringify(cars, null, 2), 'utf8');

console.log(`Successfully added ${addedCount} new F1 cars!`);
console.log(`Created ${f1PlaceholderCount} placeholder files in public/f1/`);
console.log(`Total cars dataset size is now: ${cars.length}`);
