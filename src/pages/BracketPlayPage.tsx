import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Flame, Swords, CheckCircle2 } from 'lucide-react';
import { useBracketStore } from '../store/useBracketStore';
import { GlassButton } from '../components/ui/GlassButton';
import { Car } from '../types/car';
import { useDocumentHead } from '../hooks/useDocumentHead';

// Total matches for 16 cars = 8 + 4 + 2 + 1 = 15
const TOTAL_MATCHES = 15;

export const BracketPlayPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    roundName,
    currentMatchupIndex,
    roundMatchups,
    winnersHistory,
    champion,
    pickWinner,
    category,
  } = useBracketStore();

  const [animatingWinnerId, setAnimatingWinnerId] = useState<string | null>(null);
  useDocumentHead(
    'Tournament in Progress — APEX',
    'An elimination bracket is underway. Pick your favourite machine in each head-to-head matchup.'
  );

  useEffect(() => {
    if (roundName === 'completed' && champion) {
      navigate(`/bracket/result/${champion.id}`);
    }
  }, [roundName, champion, navigate]);

  if (!category || roundMatchups.length === 0 || !roundMatchups[currentMatchupIndex]) {
    return (
      <div className="flex-1 max-w-7xl mx-auto px-4 py-16 flex flex-col items-center justify-center text-center">
        <div className="glass-panel p-12 rounded-sm max-w-md w-full">
          <Trophy className="w-12 h-12 text-[#C63A16] mx-auto mb-4" />
          <h2 className="text-2xl font-extrabold uppercase text-[#14110f] mb-2">
            No Active Bracket
          </h2>
          <p className="text-xs text-neutral-600 mb-8">
            Please select a division to launch a 16-car elimination tournament.
          </p>
          <GlassButton to="/bracket" variant="primary">
            Select a Division
          </GlassButton>
        </div>
      </div>
    );
  }

  const currentPair = roundMatchups[currentMatchupIndex];
  const [carA, carB] = currentPair;

  // Round labels & global match step
  const roundConfig: Record<string, { label: string; matchesInRound: number; startStep: number }> = {
    'round-of-16':  { label: 'Round of 16',     matchesInRound: 8, startStep: 1  },
    'quarterfinals':{ label: 'Quarterfinals',    matchesInRound: 4, startStep: 9  },
    'semifinals':   { label: 'Semifinals',       matchesInRound: 2, startStep: 13 },
    'final':        { label: 'The Grand Final',  matchesInRound: 1, startStep: 15 },
  };

  const cfg = roundConfig[roundName] || roundConfig['round-of-16'];
  const globalStep = cfg.startStep + currentMatchupIndex;
  const roundTitle = roundName === 'final'
    ? cfg.label
    : `${cfg.label} — Match ${currentMatchupIndex + 1} of ${cfg.matchesInRound}`;

  const handlePick = (winningCarId: string) => {
    if (animatingWinnerId) return;
    setAnimatingWinnerId(winningCarId);
    setTimeout(() => {
      pickWinner(winningCarId);
      setAnimatingWinnerId(null);
    }, 500);
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex flex-col justify-between">
      {/* Header Progress Bar */}
      <div className="flex flex-col items-center text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-black/5 border border-black/10 text-[11px] font-mono font-bold uppercase tracking-widest text-[#C63A16] mb-3">
          <Swords className="w-3.5 h-3.5" />
          <span>{category?.toUpperCase()} DIVISION — 16-CAR TOURNAMENT</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold uppercase text-[#14110f] tracking-tight">
          {roundTitle}
        </h1>

        {/* Progress Tracker Dots — 15 total */}
        <div className="flex items-center gap-1.5 mt-4 flex-wrap justify-center">
          {Array.from({ length: TOTAL_MATCHES }).map((_, idx) => {
            const isCompleted = idx < winnersHistory.length;
            const isCurrent   = idx === winnersHistory.length;
            return (
              <div
                key={idx}
                className={`h-2 rounded-full transition-all duration-300 ${
                  isCompleted
                    ? 'w-5 bg-[#C63A16]'
                    : isCurrent
                    ? 'w-7 bg-[#14110f] animate-pulse'
                    : 'w-2 bg-black/15'
                }`}
                title={`Match ${idx + 1}`}
              />
            );
          })}
        </div>
        <span className="text-[10px] font-mono text-neutral-400 mt-2 uppercase tracking-widest">
          Match {globalStep} of {TOTAL_MATCHES} &bull; Tap a car to advance
        </span>
      </div>

      {/* Head-to-Head Split View */}
      <div className="relative my-auto py-4">
        {/* VS Badge Floating Center */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 hidden md:flex w-14 h-14 rounded-full bg-[#14110f] text-white border-2 border-white shadow-2xl items-center justify-center font-extrabold font-mono text-lg tracking-widest">
          VS
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${roundName}-${currentMatchupIndex}`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10"
          >
            <CompetitorCard
              car={carA}
              isWinner={animatingWinnerId === carA.id}
              isLoser={animatingWinnerId === carB.id}
              onSelect={() => handlePick(carA.id)}
              disabled={!!animatingWinnerId}
              align="left"
            />
            <CompetitorCard
              car={carB}
              isWinner={animatingWinnerId === carB.id}
              isLoser={animatingWinnerId === carA.id}
              onSelect={() => handlePick(carB.id)}
              disabled={!!animatingWinnerId}
              align="right"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Hint */}
      <div className="mt-8 text-center text-xs font-mono text-neutral-400 uppercase tracking-widest">
        Compare Horsepower, Top Speed &amp; MSRP &bull; Winner Advances to Next Round
      </div>
    </div>
  );
};

interface CompetitorCardProps {
  car: Car;
  isWinner: boolean;
  isLoser: boolean;
  onSelect: () => void;
  disabled: boolean;
  align: 'left' | 'right';
}

const CompetitorCard: React.FC<CompetitorCardProps> = ({
  car,
  isWinner,
  isLoser,
  onSelect,
  disabled,
  align,
}) => {
  return (
    <motion.div
      animate={{
        scale: isWinner ? 1.03 : 1,
        opacity: isLoser ? 0.2 : 1,
        x: isLoser ? (align === 'left' ? -60 : 60) : 0,
      }}
      transition={{ duration: 0.4 }}
      onClick={onSelect}
      className={`glass-panel group relative rounded-sm overflow-hidden border transition-all duration-300 cursor-pointer flex flex-col justify-between ${
        isWinner
          ? 'border-[#C63A16] shadow-2xl ring-2 ring-[#C63A16]/50 bg-white'
          : 'border-black/10 hover:border-black/30 hover:shadow-xl'
      } ${disabled ? 'pointer-events-none' : ''}`}
    >
      {isWinner && (
        <div className="absolute top-4 left-4 z-30 bg-[#C63A16] text-white text-xs font-mono font-bold uppercase tracking-widest px-3 py-1.5 rounded shadow flex items-center gap-1.5 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>ADVANCING WINNER</span>
        </div>
      )}

      <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-neutral-100">
        <img
          src={car.image}
          alt={`${car.year} ${car.brand} ${car.model}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-4 right-4 bg-black/85 backdrop-blur-md px-3 py-1 rounded text-[10px] font-mono font-bold tracking-widest uppercase text-white">
          {car.country}
        </div>
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded text-xs font-mono font-extrabold text-[#C63A16]">
          ${car.priceUsd.toLocaleString()}
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <div className="text-xs font-mono uppercase tracking-widest text-neutral-500">
            {car.brand} &bull; {car.year}
          </div>
          <h3 className="text-2xl font-extrabold text-[#14110f] uppercase tracking-tight mt-0.5 font-sans">
            {car.model}
          </h3>
          <p className="text-xs text-neutral-600 mt-2 font-normal line-clamp-2">
            {car.blurb}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 my-5 pt-4 border-t border-black/10 font-mono text-xs">
          <div className="p-2.5 bg-black/5 rounded">
            <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Horsepower</span>
            <span className="text-lg font-extrabold text-[#14110f]">{car.horsepower} <span className="text-xs font-normal text-neutral-500">HP</span></span>
          </div>
          <div className="p-2.5 bg-black/5 rounded">
            <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Top Speed</span>
            <span className="text-lg font-extrabold text-[#14110f]">{car.topSpeedMph} MPH / {Math.round(car.topSpeedMph * 1.60934)} KPH</span>
          </div>
          <div className="p-2.5 bg-black/5 rounded">
            <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">0–60 MPH</span>
            <span className="text-lg font-extrabold text-[#14110f]">{car.zeroToSixtyS}s</span>
          </div>
          <div className="p-2.5 bg-black/5 rounded">
            <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Engine Type</span>
            <span className="text-xs font-bold text-[#14110f] truncate block">{car.engine.type}</span>
          </div>
        </div>

        <GlassButton
          variant={isWinner ? 'primary' : 'secondary'}
          className="w-full text-xs py-3"
          icon={<Flame className="w-4 h-4 text-[#C63A16]" />}
        >
          Select {car.model}
        </GlassButton>
      </div>
    </motion.div>
  );
};
