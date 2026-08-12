import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Flame, Swords, CheckCircle2, Info, X } from 'lucide-react';
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
  const [selectedSpecsCar, setSelectedSpecsCar] = useState<Car | null>(null);

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
          Match {globalStep} of {TOTAL_MATCHES} &bull; Tap "Select" on a car to advance
        </span>
      </div>

      {/* Head-to-Head Split View */}
      <div className="relative my-auto py-4">
        {/* VS Badge Floating Center (visible on both mobile and desktop) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex w-12 h-12 md:w-16 md:h-16 rounded-full bg-[#14110f] text-white border-2 border-[#C63A16] shadow-2xl shadow-[#C63A16]/30 items-center justify-center font-extrabold font-mono text-sm md:text-xl tracking-widest ring-4 ring-white pointer-events-none">
          VS
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${roundName}-${currentMatchupIndex}`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-6 lg:gap-10"
          >
            <CompetitorCard
              car={carA}
              isWinner={animatingWinnerId === carA.id}
              isLoser={animatingWinnerId === carB.id}
              onSelect={() => handlePick(carA.id)}
              onOpenSpecs={() => setSelectedSpecsCar(carA)}
              disabled={!!animatingWinnerId}
              align="left"
            />
            <CompetitorCard
              car={carB}
              isWinner={animatingWinnerId === carB.id}
              isLoser={animatingWinnerId === carA.id}
              onSelect={() => handlePick(carB.id)}
              onOpenSpecs={() => setSelectedSpecsCar(carB)}
              disabled={!!animatingWinnerId}
              align="right"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Hint */}
      <div className="mt-8 text-center text-xs font-mono text-neutral-400 uppercase tracking-widest">
        Click "View Specs" to inspect full stats &bull; Click "Select" to advance machine
      </div>

      {/* Car Full Specs Popup Modal */}
      <AnimatePresence>
        {selectedSpecsCar && (
          <CarSpecsModal
            car={selectedSpecsCar}
            onClose={() => setSelectedSpecsCar(null)}
            onSelectCar={(id) => handlePick(id)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

interface CompetitorCardProps {
  car: Car;
  isWinner: boolean;
  isLoser: boolean;
  onSelect: () => void;
  onOpenSpecs: () => void;
  disabled: boolean;
  align: 'left' | 'right';
}

const CompetitorCard: React.FC<CompetitorCardProps> = ({
  car,
  isWinner,
  isLoser,
  onSelect,
  onOpenSpecs,
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
      onClick={onOpenSpecs}
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

        {/* View Specs Overlay Button */}
        {!isWinner && (
          <div className="absolute top-4 left-4 z-20 px-3 py-1.5 rounded bg-black/80 text-white backdrop-blur-md text-xs font-mono font-bold flex items-center gap-1.5 shadow border border-white/20">
            <Info className="w-3.5 h-3.5 text-[#C63A16]" />
            <span>Tap Card for Full Specs</span>
          </div>
        )}

        <div className="absolute top-4 right-4 bg-black/85 backdrop-blur-md px-3 py-1 rounded text-[10px] font-mono font-bold tracking-widest uppercase text-white">
          {car.country}
        </div>
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded text-xs font-mono font-extrabold text-[#C63A16]">
          {car.priceUsd !== null ? `$${car.priceUsd.toLocaleString()}` : 'MSRP: N/A'}
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <div className="text-xs font-mono uppercase tracking-widest text-neutral-500">
              {car.brand} &bull; {car.year}
            </div>
            <span className="text-[11px] font-mono font-bold text-[#C63A16] flex items-center gap-1">
              <Info className="w-3 h-3" />
              <span>Full Specs</span>
            </span>
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
          {car.category === 'f1' ? (
            <>
              <div className="p-2.5 bg-black/5 rounded">
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Engine Type</span>
                <span className="text-xs font-bold text-[#14110f] truncate block" title={car.engine.type}>{car.engine.type}</span>
              </div>
              <div className="p-2.5 bg-black/5 rounded">
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Weight</span>
                <span className="text-xs font-bold text-[#C63A16] block tracking-tighter truncate">
                  {car.weightLbs.toLocaleString()} lbs / {Math.round(car.weightLbs * 0.45359237)} kg
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="p-2.5 bg-black/5 rounded">
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">0–60 MPH</span>
                <span className="text-lg font-extrabold text-[#14110f]">{car.zeroToSixtyS !== null ? `${car.zeroToSixtyS}s` : 'N/A'}</span>
              </div>
              <div className="p-2.5 bg-black/5 rounded">
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Engine Type</span>
                <span className="text-xs font-bold text-[#14110f] truncate block" title={car.engine.type}>{car.engine.type}</span>
              </div>
            </>
          )}
        </div>

        {/* Selection ONLY happens when clicking this button */}
        <GlassButton
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
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

// ─── Car Specs Modal Popup ──────────────────────────────────────────────────
interface CarSpecsModalProps {
  car: Car | null;
  onClose: () => void;
  onSelectCar: (carId: string) => void;
}

const CarSpecsModal: React.FC<CarSpecsModalProps> = ({ car, onClose, onSelectCar }) => {
  useEffect(() => {
    if (car) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [car]);

  if (!car) return null;

  const powerToWeightRatio = car.horsepower && car.weightLbs
    ? ((car.horsepower / car.weightLbs) * 2000).toFixed(1)
    : 'N/A';

  const categoryLabel = car.category === 'f1'
    ? 'FORMULA 1 DIVISION'
    : car.category === 'hyper'
    ? 'HYPERCAR DIVISION'
    : car.category === 'luxury'
    ? 'LUXURY DIVISION'
    : 'TUNER / SPORT DIVISION';

  return (
    <div className="fixed inset-0 z-[100] bg-[#f7f5f2] overflow-y-auto flex flex-col text-[#14110f]">
      {/* Header Bar — covers site navbar completely */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-black/10 shadow-sm px-4 sm:px-8 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#C63A16]/10 text-[#C63A16] flex items-center justify-center">
              <Info className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#C63A16]">
                FULL SPECIFICATION SHEET
              </div>
              <h2 className="text-base sm:text-lg font-extrabold uppercase tracking-tight text-[#14110f]">
                {car.year} {car.brand} {car.model}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/5 hover:bg-black/10 text-neutral-800 text-xs font-mono font-bold transition-colors border border-black/10"
          >
            <span>Close</span>
            <X className="w-4 h-4 text-[#C63A16]" />
          </button>
        </div>
      </div>

      {/* Main Spec Content Container */}
      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8 w-full flex-1 space-y-8">
        {/* Top Hero Section */}
        <div className="bg-white rounded-sm border border-black/10 shadow-sm p-6 sm:p-8 flex flex-col md:flex-row gap-8 items-start">
          <div className="relative h-64 sm:h-80 w-full md:w-1/2 rounded-sm overflow-hidden bg-neutral-100 border border-black/10 flex-shrink-0">
            <img
              src={car.image}
              alt={`${car.year} ${car.brand} ${car.model}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3 bg-[#C63A16] text-white px-3 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-widest shadow">
              {categoryLabel}
            </div>
            <div className="absolute top-3 right-3 bg-black/85 text-white backdrop-blur-md px-3 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-widest shadow">
              {car.country}
            </div>
            <div className="absolute bottom-3 left-3 bg-white/95 text-[#C63A16] backdrop-blur-md px-3 py-1.5 rounded text-xs font-mono font-extrabold shadow">
              {car.priceUsd !== null ? `MSRP $${car.priceUsd.toLocaleString()}` : 'MSRP: N/A (Race Spec)'}
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-between h-full">
            <div>
              <div className="text-xs font-mono font-bold uppercase tracking-widest text-[#C63A16]">
                {car.brand} &bull; {car.year} &bull; {car.country}
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold uppercase text-[#14110f] tracking-tight font-sans mt-1">
                {car.model}
              </h1>
              <p className="text-sm text-neutral-600 mt-4 leading-relaxed font-normal">
                {car.blurb}
              </p>
            </div>

            <div className="mt-6 pt-6 border-t border-black/10 flex flex-wrap gap-4">
              <div className="flex-1 min-w-[140px] p-3 bg-[#f7f5f2] rounded border border-black/5">
                <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider block">Peak Output</span>
                <span className="text-xl font-extrabold text-[#14110f] font-mono">{car.horsepower} HP</span>
              </div>
              <div className="flex-1 min-w-[140px] p-3 bg-[#f7f5f2] rounded border border-black/5">
                <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider block">Top Velocity</span>
                <span className="text-xl font-extrabold text-[#14110f] font-mono">{car.topSpeedMph} MPH</span>
              </div>
            </div>
          </div>
        </div>

        {/* All Available Specs Matrix */}
        <div>
          <div className="text-xs font-mono font-extrabold uppercase tracking-widest text-[#C63A16] mb-3 flex items-center gap-2">
            <span>COMPLETE TECHNICAL DATA MATRIX</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 font-mono text-xs">
            {/* Spec Card 1: Power */}
            <div className="bg-white p-4 rounded-sm border border-black/10 shadow-sm">
              <span className="text-[10px] text-neutral-400 uppercase tracking-wider block font-bold">Horsepower Rating</span>
              <span className="text-2xl font-extrabold text-[#14110f] mt-1 block">{car.horsepower} <span className="text-xs font-normal text-neutral-500">HP</span></span>
              <span className="text-[11px] text-neutral-500 mt-1 block">Total engine power output</span>
            </div>

            {/* Spec Card 2: Top Speed */}
            <div className="bg-white p-4 rounded-sm border border-black/10 shadow-sm">
              <span className="text-[10px] text-neutral-400 uppercase tracking-wider block font-bold">Top Speed</span>
              <span className="text-2xl font-extrabold text-[#14110f] mt-1 block">{car.topSpeedMph} <span className="text-xs font-normal text-neutral-500">MPH</span></span>
              <span className="text-[11px] text-[#C63A16] font-bold mt-1 block">{Math.round(car.topSpeedMph * 1.60934)} KPH</span>
            </div>

            {/* Spec Card 3: Acceleration / 0-60 */}
            <div className="bg-white p-4 rounded-sm border border-black/10 shadow-sm">
              <span className="text-[10px] text-neutral-400 uppercase tracking-wider block font-bold">0–60 MPH Sprint</span>
              <span className="text-2xl font-extrabold text-[#14110f] mt-1 block">
                {car.zeroToSixtyS !== null ? `${car.zeroToSixtyS}s` : 'N/A'}
              </span>
              <span className="text-[11px] text-neutral-500 mt-1 block">Standing launch time</span>
            </div>

            {/* Spec Card 4: Torque */}
            <div className="bg-white p-4 rounded-sm border border-black/10 shadow-sm">
              <span className="text-[10px] text-neutral-400 uppercase tracking-wider block font-bold">Peak Torque</span>
              <span className="text-2xl font-extrabold text-[#14110f] mt-1 block">
                {car.torqueLbFt !== null ? `${car.torqueLbFt} lb-ft` : 'N/A'}
              </span>
              <span className="text-[11px] text-neutral-500 mt-1 block">Rotational engine force</span>
            </div>

            {/* Spec Card 5: Curb Weight */}
            <div className="bg-white p-4 rounded-sm border border-black/10 shadow-sm">
              <span className="text-[10px] text-neutral-400 uppercase tracking-wider block font-bold">Curb Weight</span>
              <span className="text-2xl font-extrabold text-[#14110f] mt-1 block">{car.weightLbs.toLocaleString()} <span className="text-xs font-normal text-neutral-500">lbs</span></span>
              <span className="text-[11px] text-[#C63A16] font-bold mt-1 block">{Math.round(car.weightLbs * 0.45359237).toLocaleString()} kg</span>
            </div>

            {/* Spec Card 6: Power to Weight */}
            <div className="bg-white p-4 rounded-sm border border-black/10 shadow-sm">
              <span className="text-[10px] text-neutral-400 uppercase tracking-wider block font-bold">Power-to-Weight Ratio</span>
              <span className="text-2xl font-extrabold text-[#14110f] mt-1 block">{powerToWeightRatio} <span className="text-xs font-normal text-neutral-500">HP/ton</span></span>
              <span className="text-[11px] text-neutral-500 mt-1 block">HP per 2,000 lbs vehicle mass</span>
            </div>

            {/* Spec Card 7: Engine Layout */}
            <div className="bg-white p-4 rounded-sm border border-black/10 shadow-sm col-span-1 sm:col-span-2 lg:col-span-1">
              <span className="text-[10px] text-neutral-400 uppercase tracking-wider block font-bold">Engine Configuration</span>
              <span className="text-base font-extrabold text-[#14110f] mt-1 block truncate" title={car.engine.type}>{car.engine.type}</span>
              <span className="text-[11px] text-neutral-500 mt-1 block">Powerplant architecture</span>
            </div>

            {/* Spec Card 8: Engine Displacement & Cylinders */}
            <div className="bg-white p-4 rounded-sm border border-black/10 shadow-sm">
              <span className="text-[10px] text-neutral-400 uppercase tracking-wider block font-bold">Displacement & Cylinders</span>
              <span className="text-base font-extrabold text-[#14110f] mt-1 block">
                {car.engine.displacementL ? `${car.engine.displacementL} Liters` : 'N/A'} ({car.engine.cylinders} Cyl)
              </span>
              <span className="text-[11px] text-neutral-500 mt-1 block">Engine capacity & cylinder count</span>
            </div>

            {/* Spec Card 9: Price & Division */}
            <div className="bg-white p-4 rounded-sm border border-black/10 shadow-sm">
              <span className="text-[10px] text-neutral-400 uppercase tracking-wider block font-bold">Original MSRP & Division</span>
              <span className="text-base font-extrabold text-[#C63A16] mt-1 block">
                {car.priceUsd !== null ? `$${car.priceUsd.toLocaleString()}` : 'N/A (Race Spec)'}
              </span>
              <span className="text-[11px] text-neutral-500 mt-1 block">{categoryLabel}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Action Footer */}
      <div className="sticky bottom-0 z-30 bg-white/90 backdrop-blur-md border-t border-black/10 px-4 sm:px-8 py-4 shadow-lg">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="text-xs font-mono text-neutral-500 hidden sm:block">
            Reviewing <strong className="text-[#14110f]">{car.year} {car.brand} {car.model}</strong>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <GlassButton
              onClick={onClose}
              variant="secondary"
              className="flex-1 sm:flex-initial text-xs py-3 px-6"
            >
              Close Spec Sheet
            </GlassButton>
            <GlassButton
              onClick={() => {
                onClose();
                onSelectCar(car.id);
              }}
              variant="primary"
              className="flex-1 sm:flex-initial text-xs py-3 px-8"
              icon={<Flame className="w-4 h-4 text-[#C63A16]" />}
            >
              Select {car.model} as Winner
            </GlassButton>
          </div>
        </div>
      </div>
    </div>
  );
};
