import { create } from 'zustand';
import { Car } from '../types/car';
import { getCarsByCategory } from '../data/carsData';

export type BracketCategory = 'normal' | 'luxury' | 'hyper';
export type RoundName = 'quarterfinals' | 'semifinals' | 'final' | 'completed';

export interface BracketState {
  category: BracketCategory | null;
  pool: Car[];
  roundName: RoundName;
  currentMatchupIndex: number;
  roundMatchups: [Car, Car][];
  nextRoundWinners: Car[];
  winnersHistory: Car[];
  champion: Car | null;

  initializeBracket: (category: BracketCategory) => void;
  pickWinner: (carId: string) => void;
  resetBracket: () => void;
}

const shuffleArray = <T,>(arr: T[]): T[] => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const makePairs = (cars: Car[]): [Car, Car][] => {
  const pairs: [Car, Car][] = [];
  for (let i = 0; i < cars.length; i += 2) {
    if (cars[i] && cars[i + 1]) {
      pairs.push([cars[i], cars[i + 1]]);
    }
  }
  return pairs;
};

export const useBracketStore = create<BracketState>()((set, get) => ({
  category: null,
  pool: [],
  roundName: 'quarterfinals',
  currentMatchupIndex: 0,
  roundMatchups: [],
  nextRoundWinners: [],
  winnersHistory: [],
  champion: null,

  initializeBracket: (category: BracketCategory) => {
    const candidates = getCarsByCategory(category);
    const shuffled = shuffleArray(candidates);
    const pool = shuffled.slice(0, 8);
    const qfPairs = makePairs(pool);

    set({
      category,
      pool,
      roundName: 'quarterfinals',
      currentMatchupIndex: 0,
      roundMatchups: qfPairs,
      nextRoundWinners: [],
      winnersHistory: [],
      champion: null,
    });
  },

  pickWinner: (carId: string) => {
    const { roundMatchups, currentMatchupIndex, nextRoundWinners, winnersHistory, roundName } = get();
    
    if (roundMatchups.length === 0 || !roundMatchups[currentMatchupIndex]) return;

    const currentPair = roundMatchups[currentMatchupIndex];
    const winningCar = currentPair.find((c) => c.id === carId);

    if (!winningCar) return;

    const updatedHistory = [...winnersHistory, winningCar];
    const updatedNextWinners = [...nextRoundWinners, winningCar];

    // Check if more matchups remain in current round
    if (currentMatchupIndex < roundMatchups.length - 1) {
      set({
        winnersHistory: updatedHistory,
        nextRoundWinners: updatedNextWinners,
        currentMatchupIndex: currentMatchupIndex + 1,
      });
    } else {
      // Current round finished
      if (roundName === 'quarterfinals') {
        const sfPairs = makePairs(updatedNextWinners);
        set({
          winnersHistory: updatedHistory,
          nextRoundWinners: [],
          roundName: 'semifinals',
          currentMatchupIndex: 0,
          roundMatchups: sfPairs,
        });
      } else if (roundName === 'semifinals') {
        const finalPair = makePairs(updatedNextWinners);
        set({
          winnersHistory: updatedHistory,
          nextRoundWinners: [],
          roundName: 'final',
          currentMatchupIndex: 0,
          roundMatchups: finalPair,
        });
      } else if (roundName === 'final') {
        set({
          winnersHistory: updatedHistory,
          nextRoundWinners: [],
          roundName: 'completed',
          champion: winningCar,
        });
      }
    }
  },

  resetBracket: () => {
    set({
      category: null,
      pool: [],
      roundName: 'quarterfinals',
      currentMatchupIndex: 0,
      roundMatchups: [],
      nextRoundWinners: [],
      winnersHistory: [],
      champion: null,
    });
  },
}));
