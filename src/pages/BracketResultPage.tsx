import React, { useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, Flame, RotateCcw, Sparkles, Crown, Swords } from 'lucide-react';
import {
  ResponsiveContainer, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip,
} from 'recharts';
import { useBracketStore } from '../store/useBracketStore';
import { useGarageStore } from '../store/useGarageStore';
import { allCars, getStatRanges, getCarById } from '../data/carsData';
import { GlassButton } from '../components/ui/GlassButton';
import { Car } from '../types/car';
import { useDocumentHead } from '../hooks/useDocumentHead';
import { SITE_NAME } from '../constants/siteConfig';

// ─────────────────────────────────────────────────────────────────────────────
// Bracket Tree Component
// 16-car bracket: 8 R16 matchups → 4 QF → 2 SF → 1 Final → Champion
// winnersHistory[0..7]  = R16 winners  (8 picks)
// winnersHistory[8..11] = QF  winners  (4 picks)
// winnersHistory[12..13]= SF  winners  (2 picks)
// winnersHistory[14]    = Final winner (1 pick) = champion
// ─────────────────────────────────────────────────────────────────────────────

interface BracketNodeProps {
  car: Car | null;
  isChampion?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const BracketNode: React.FC<BracketNodeProps> = ({ car, isChampion = false, size = 'sm' }) => {
  const imgSize = size === 'lg' ? 'h-16 w-16' : size === 'md' ? 'h-12 w-12' : 'h-9 w-9';
  const textSize = size === 'lg' ? 'text-xs' : 'text-[9px]';

  if (!car) {
    return (
      <div className={`flex items-center gap-2 p-1.5 rounded border border-dashed border-black/15 bg-white/50 opacity-40 min-w-[130px]`}>
        <div className={`${imgSize} rounded bg-neutral-100 flex-shrink-0`} />
        <span className="text-[9px] font-mono text-neutral-400">TBD</span>
      </div>
    );
  }

  return (
    <Link
      to={`/car/${car.id}`}
      className={`flex items-center gap-2 p-1.5 rounded border transition-all hover:shadow-md min-w-[130px] ${
        isChampion
          ? 'border-[#C63A16] bg-[#C63A16]/5 shadow-md ring-1 ring-[#C63A16]/30'
          : 'border-black/10 bg-white/70 hover:border-[#C63A16]/40'
      }`}
    >
      <div className={`${imgSize} rounded overflow-hidden bg-neutral-100 flex-shrink-0`}>
        <img src={car.image} alt={`${car.year} ${car.brand} ${car.model}`} className="w-full h-full object-cover" />
      </div>
      <div className="min-w-0 flex-1">
        <div className={`${textSize} font-mono text-neutral-400 truncate`}>{car.brand}</div>
        <div className={`${textSize} font-bold text-[#14110f] truncate`}>{car.model}</div>
        {isChampion && (
          <div className="text-[8px] font-mono font-bold text-[#C63A16] uppercase tracking-wider mt-0.5">
            Champion
          </div>
        )}
      </div>
    </Link>
  );
};

interface MatchupProps {
  carA: Car | null;
  carB: Car | null;
  winner: Car | null;
  round: string;
}

const Matchup: React.FC<MatchupProps> = ({ carA, carB, winner, round }) => (
  <div className="flex flex-col gap-1 relative">
    <div className={`flex items-center gap-1.5 p-0.5 rounded-sm ${winner?.id === carA?.id ? 'opacity-100' : 'opacity-45'}`}>
      <BracketNode car={carA} />
    </div>
    <div className="h-px bg-black/10 mx-2" />
    <div className={`flex items-center gap-1.5 p-0.5 rounded-sm ${winner?.id === carB?.id ? 'opacity-100' : 'opacity-45'}`}>
      <BracketNode car={carB} />
    </div>
  </div>
);

interface BracketTreeProps {
  pool: Car[];
  winnersHistory: Car[];
  champion: Car | null;
}

const BracketTree: React.FC<BracketTreeProps> = ({ pool, winnersHistory, champion }) => {
  // Reconstruct bracket structure
  // pool[0..15] = 16 seeded cars
  // R16 matchups: pairs of pool cars
  const r16Pairs: [Car, Car][] = [];
  for (let i = 0; i < 16; i += 2) {
    if (pool[i] && pool[i + 1]) r16Pairs.push([pool[i], pool[i + 1]]);
  }

  // R16 winners = winnersHistory[0..7]
  const r16Winners = winnersHistory.slice(0, 8);

  // QF matchups: pairs of r16 winners
  const qfPairs: [Car, Car][] = [];
  for (let i = 0; i < r16Winners.length; i += 2) {
    if (r16Winners[i] && r16Winners[i + 1]) qfPairs.push([r16Winners[i], r16Winners[i + 1]]);
  }
  const qfWinners = winnersHistory.slice(8, 12);

  // SF matchups: pairs of qf winners
  const sfPairs: [Car, Car][] = [];
  for (let i = 0; i < qfWinners.length; i += 2) {
    if (qfWinners[i] && qfWinners[i + 1]) sfPairs.push([qfWinners[i], qfWinners[i + 1]]);
  }
  const sfWinners = winnersHistory.slice(12, 14);

  // Final
  const finalPair: [Car | null, Car | null] = [sfWinners[0] || null, sfWinners[1] || null];
  const finalWinner = champion;

  const roundLabel = (label: string) => (
    <div className="text-[9px] font-mono font-bold uppercase tracking-widest text-neutral-400 text-center mb-2 border-b border-black/10 pb-1">
      {label}
    </div>
  );

  return (
    <div className="w-full overflow-x-auto pb-4">
      <div className="flex gap-6 items-start justify-start min-w-max px-2 py-4">

        {/* ── Round of 16 (top half, left side) ─────────── */}
        <div className="flex flex-col gap-5">
          {roundLabel('Round of 16')}
          {r16Pairs.slice(0, 4).map((pair, i) => (
            <Matchup
              key={`r16-top-${i}`}
              carA={pair[0]}
              carB={pair[1]}
              winner={r16Winners[i] || null}
              round="r16"
            />
          ))}
        </div>

        {/* ── QF top half ─────────── */}
        <div className="flex flex-col gap-12 pt-7">
          {roundLabel('Quarterfinals')}
          {qfPairs.slice(0, 2).map((pair, i) => (
            <Matchup
              key={`qf-top-${i}`}
              carA={pair[0] || null}
              carB={pair[1] || null}
              winner={qfWinners[i] || null}
              round="qf"
            />
          ))}
        </div>

        {/* ── SF top half ─────────── */}
        <div className="flex flex-col gap-28 pt-14">
          {roundLabel('Semifinals')}
          {sfPairs.slice(0, 1).map((pair, i) => (
            <Matchup
              key={`sf-top-${i}`}
              carA={pair[0] || null}
              carB={pair[1] || null}
              winner={sfWinners[0] || null}
              round="sf"
            />
          ))}
        </div>

        {/* ── Grand Final ─────────── */}
        <div className="flex flex-col pt-28">
          {roundLabel('Grand Final')}
          <Matchup
            carA={finalPair[0]}
            carB={finalPair[1]}
            winner={finalWinner}
            round="final"
          />
        </div>

        {/* ── Champion ─────────── */}
        <div className="flex flex-col pt-28">
          {roundLabel('Champion')}
          <div className="flex flex-col items-center gap-2">
            <Crown className="w-5 h-5 text-[#C63A16]" />
            <BracketNode car={champion} isChampion size="md" />
          </div>
        </div>

        {/* ── SF bottom half ─────────── */}
        <div className="flex flex-col gap-28 pt-14" style={{ direction: 'rtl' }}>
          <div style={{ direction: 'ltr' }}>{roundLabel('Semifinals')}</div>
          {sfPairs.slice(1).map((pair, i) => (
            <Matchup
              key={`sf-bot-${i}`}
              carA={pair[0] || null}
              carB={pair[1] || null}
              winner={sfWinners[1] || null}
              round="sf"
            />
          ))}
          {sfPairs.length < 2 && (
            <Matchup carA={null} carB={null} winner={null} round="sf" />
          )}
        </div>

        {/* ── QF bottom half ─────────── */}
        <div className="flex flex-col gap-12 pt-7">
          {roundLabel('Quarterfinals')}
          {qfPairs.slice(2).map((pair, i) => (
            <Matchup
              key={`qf-bot-${i}`}
              carA={pair[0] || null}
              carB={pair[1] || null}
              winner={qfWinners[i + 2] || null}
              round="qf"
            />
          ))}
          {qfPairs.length < 4 && Array.from({ length: 2 - Math.max(0, qfPairs.length - 2) }).map((_, i) => (
            <Matchup key={`qf-bot-empty-${i}`} carA={null} carB={null} winner={null} round="qf" />
          ))}
        </div>

        {/* ── Round of 16 bottom half ─────────── */}
        <div className="flex flex-col gap-5">
          {roundLabel('Round of 16')}
          {r16Pairs.slice(4).map((pair, i) => (
            <Matchup
              key={`r16-bot-${i}`}
              carA={pair[0]}
              carB={pair[1]}
              winner={r16Winners[i + 4] || null}
              round="r16"
            />
          ))}
          {Array.from({ length: 4 - Math.max(0, r16Pairs.length - 4) }).map((_, i) => (
            <Matchup key={`r16-bot-empty-${i}`} carA={null} carB={null} winner={null} round="r16" />
          ))}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Champion Showcase — shown to people who follow a shared link cold (no bracket state in memory)
// ─────────────────────────────────────────────────────────────────────────────

const ChampionShowcase: React.FC<{ car: Car }> = ({ car }) => {
  const { toggleSave, isSaved } = useGarageStore();
  const saved = isSaved(car.id);

  useDocumentHead(
    `${car.brand} ${car.model} APEX Champion — ${SITE_NAME}`,
    `Someone crowned the ${car.year} ${car.brand} ${car.model} as their APEX bracket champion. Think you'd pick differently? Build your own bracket.`
  );

  return (
    <div className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full flex flex-col gap-8">
      {/* Eyebrow */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#C63A16]/10 border border-[#C63A16]/20 text-[11px] font-mono font-bold uppercase tracking-widest text-[#C63A16] mb-4">
          <Swords className="w-3.5 h-3.5" />
          <span>BRACKET CHAMPION</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold uppercase text-[#14110f] tracking-tight">
          Someone picked this machine.
        </h1>
        <p className="mt-3 text-sm text-neutral-600 max-w-xl mx-auto">
          The <strong>{car.year} {car.brand} {car.model}</strong> was crowned champion of an APEX bracket. Would you make the same pick?
        </p>
      </div>

      {/* Champion Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-6 sm:p-10 rounded-sm border-2 border-[#C63A16] shadow-2xl"
      >
        <div className="flex flex-col lg:flex-row gap-8 items-center">
          <div className="w-full lg:w-1/2 relative h-72 sm:h-96 rounded-sm overflow-hidden bg-neutral-100">
            <img
              src={car.image}
              alt={`${car.year} ${car.brand} ${car.model}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 bg-[#C63A16] text-white text-xs font-mono font-bold uppercase tracking-widest px-3 py-1.5 rounded shadow flex items-center gap-1.5">
              <Trophy className="w-4 h-4 fill-current" />
              <span>APEX CHAMPION</span>
            </div>
            <div className="absolute bottom-4 right-4 bg-black/85 text-white text-xs font-mono font-bold px-3 py-1.5 rounded backdrop-blur-md">
              ${car.priceUsd.toLocaleString()}
            </div>
          </div>
          <div className="w-full lg:w-1/2">
            <div className="text-xs font-mono font-bold tracking-widest text-[#C63A16] uppercase">
              {car.brand} &bull; {car.year} &bull; {car.country}
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-[#14110f] uppercase tracking-tight mt-1 font-sans">
              {car.model}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 mt-4 leading-relaxed">{car.blurb}</p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-6 p-4 bg-black/5 rounded-sm font-mono text-xs">
              <div>
                <span className="text-[10px] text-neutral-400 uppercase block">Horsepower</span>
                <span className="font-extrabold text-[#14110f] text-sm">{car.horsepower} HP</span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 uppercase block">Top Speed</span>
                <span className="font-extrabold text-[#14110f] text-sm whitespace-nowrap">{car.topSpeedMph} MPH / {Math.round(car.topSpeedMph * 1.60934)} KPH</span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 uppercase block">0-60 MPH</span>
                <span className="font-extrabold text-[#14110f] text-sm">{car.zeroToSixtyS}s</span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 uppercase block">Prestige</span>
                <span className="font-extrabold text-[#C63A16] text-sm">{car.prestige ?? 5} / 10</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <GlassButton to="/bracket" variant="primary" className="flex-1 text-xs py-3" icon={<Swords className="w-4 h-4 text-white" />}>
                Build Your Own Bracket
              </GlassButton>
              <GlassButton
                variant={saved ? 'secondary' : 'secondary'}
                onClick={() => toggleSave(car.id)}
                className="text-xs py-3"
                icon={<Flame className={`w-4 h-4 ${saved ? 'text-[#C63A16] fill-current' : ''}`} />}
              >
                {saved ? 'Saved in Garage' : 'Save to Garage'}
              </GlassButton>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Result Page
// ─────────────────────────────────────────────────────────────────────────────

export const BracketResultPage: React.FC = () => {
  const navigate = useNavigate();
  const { championId } = useParams<{ championId: string }>();
  const { champion, winnersHistory, category, pool, resetBracket } = useBracketStore();
  const { toggleSave, isSaved } = useGarageStore();

  // ── Cold-share path: URL has a championId but store has no bracket session ──
  const coldShareCar = useMemo(() => {
    if (!champion && championId) {
      return getCarById(championId) ?? null;
    }
    return null;
  }, [champion, championId]);

  const tasteProfileData = useMemo(() => {
    if (!winnersHistory || winnersHistory.length === 0) return [];

    const bounds = getStatRanges(allCars);
    const n = winnersHistory.length;

    const avgHp    = winnersHistory.reduce((acc, c) => acc + c.horsepower, 0) / n;
    const avgSpeed = winnersHistory.reduce((acc, c) => acc + c.topSpeedMph, 0) / n;
    const avgPrice = winnersHistory.reduce((acc, c) => acc + c.priceUsd, 0) / n;

    const allP2W = allCars.map((c) => c.horsepower / c.weightLbs);
    const minP2W = Math.min(...allP2W);
    const maxP2W = Math.max(...allP2W);
    const avgP2W = winnersHistory.reduce((acc, c) => acc + c.horsepower / c.weightLbs, 0) / n;

    const avgPrestige = winnersHistory.reduce((acc, c) => acc + (c.prestige ?? 5), 0) / n;

    const clamp = (v: number) => Math.round(Math.min(100, Math.max(0, v)));

    return [
      { axis: 'Power',   score: clamp(((avgHp    - bounds.minHp)    / (bounds.maxHp    - bounds.minHp))    * 100), raw: `${Math.round(avgHp)} HP` },
      { axis: 'Speed',   score: clamp(((avgSpeed - bounds.minSpeed) / (bounds.maxSpeed - bounds.minSpeed)) * 100), raw: `${Math.round(avgSpeed)} MPH / ${Math.round(avgSpeed * 1.60934)} KPH` },
      { axis: 'Value',   score: clamp(((bounds.maxPrice - avgPrice)  / (bounds.maxPrice - bounds.minPrice)) * 100), raw: `$${Math.round(avgPrice).toLocaleString()}` },
      { axis: 'Agility', score: clamp(((avgP2W   - minP2W)          / (maxP2W          - minP2W))          * 100), raw: `${(avgP2W * 2000).toFixed(1)} hp/ton` },
      { axis: 'Prestige',score: clamp(((avgPrestige - 1) / 9)       * 100),                                        raw: `${avgPrestige.toFixed(1)} / 10` },
    ];
  }, [winnersHistory]);

  const handleRunAnother = () => {
    resetBracket();
    navigate('/bracket');
  };

  // ── Cold-share path ─────────────────────────────────────────────────────────
  if (coldShareCar) {
    return <ChampionShowcase car={coldShareCar} />;
  }

  // ── No champion, no shared link — guide them to setup ──────────────────────
  if (!champion) {
    return (
      <div className="flex-1 max-w-7xl mx-auto px-4 py-16 flex flex-col items-center justify-center text-center">
        <div className="glass-panel p-12 rounded-sm max-w-md w-full">
          <Trophy className="w-12 h-12 text-[#C63A16] mx-auto mb-4" />
          <h2 className="text-2xl font-extrabold uppercase text-[#14110f] mb-2">
            No Champion Result Found
          </h2>
          <p className="text-xs text-neutral-600 mb-8">
            Complete a 16-car bracket to generate your champion and taste profile.
          </p>
          <GlassButton to="/bracket" variant="primary">
            Start a Bracket
          </GlassButton>
        </div>
      </div>
    );
  }

  const saved = isSaved(champion.id);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useDocumentHead(
    `${champion.brand} ${champion.model} — Your APEX Champion`,
    `You crowned the ${champion.year} ${champion.brand} ${champion.model} champion across ${winnersHistory.length} head-to-head picks. See your full taste profile.`
  );

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex flex-col gap-10">

      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#C63A16]/10 border border-[#C63A16]/20 text-[11px] font-mono font-bold uppercase tracking-widest text-[#C63A16] mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>TOURNAMENT COMPLETE — {winnersHistory.length} PICKS MADE</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold uppercase text-[#14110f] tracking-tight">
          Your Champion & Taste Profile
        </h1>
        <p className="text-xs sm:text-sm text-neutral-600 mt-2 font-normal">
          Derived from all {winnersHistory.length} winning matchups across your {category?.toUpperCase()} division tournament.
        </p>
      </div>

      {/* Champion Hero Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-panel p-6 sm:p-10 rounded-sm border-2 border-[#C63A16] shadow-2xl"
      >
        <div className="flex flex-col lg:flex-row gap-8 items-center">
          <div className="w-full lg:w-1/2 relative h-72 sm:h-96 rounded-sm overflow-hidden bg-neutral-100 shadow-inner">
            <img
              src={champion.image}
              alt={`${champion.year} ${champion.brand} ${champion.model}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 bg-[#C63A16] text-white text-xs font-mono font-bold uppercase tracking-widest px-3 py-1.5 rounded shadow flex items-center gap-1.5">
              <Trophy className="w-4 h-4 fill-current" />
              <span>DIVISION CHAMPION</span>
            </div>
            <div className="absolute bottom-4 right-4 bg-black/85 text-white text-xs font-mono font-bold px-3 py-1.5 rounded backdrop-blur-md">
              ${champion.priceUsd.toLocaleString()}
            </div>
          </div>

          <div className="w-full lg:w-1/2 flex flex-col justify-between h-full">
            <div>
              <div className="text-xs font-mono font-bold tracking-widest text-[#C63A16] uppercase">
                {champion.brand} &bull; {champion.year} &bull; {champion.country}
              </div>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-[#14110f] uppercase tracking-tight mt-1 font-sans">
                {champion.model}
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 mt-4 leading-relaxed">
                {champion.blurb}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-6 p-4 bg-black/5 rounded-sm font-mono text-xs">
              <div>
                <span className="text-[10px] text-neutral-400 uppercase block">Horsepower</span>
                <span className="font-extrabold text-[#14110f] text-sm">{champion.horsepower} HP</span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 uppercase block">Top Speed</span>
                <span className="font-extrabold text-[#14110f] text-sm">{champion.topSpeedMph} MPH / {Math.round(champion.topSpeedMph * 1.60934)} KPH</span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 uppercase block">0-60 MPH</span>
                <span className="font-extrabold text-[#14110f] text-sm">{champion.zeroToSixtyS}s</span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 uppercase block">Prestige</span>
                <span className="font-extrabold text-[#C63A16] text-sm">{champion.prestige ?? 5} / 10</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <GlassButton
                variant={saved ? 'secondary' : 'primary'}
                onClick={() => toggleSave(champion.id)}
                className="flex-1 text-xs py-3"
                icon={<Flame className={`w-4 h-4 ${saved ? 'text-[#C63A16] fill-current' : 'text-white'}`} />}
              >
                {saved ? 'Saved in Garage' : 'Save Champion to Garage'}
              </GlassButton>
              <GlassButton
                onClick={handleRunAnother}
                variant="secondary"
                className="text-xs py-3"
                icon={<RotateCcw className="w-4 h-4" />}
              >
                Run Another Bracket
              </GlassButton>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Tournament Bracket Tree ─────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="glass-panel p-6 sm:p-8 rounded-sm border border-black/10 shadow-lg"
      >
        <div className="pb-5 border-b border-black/10 mb-6">
          <div className="text-xs font-mono font-bold tracking-widest text-[#C63A16] uppercase">
            TOURNAMENT BRACKET
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-[#14110f] uppercase tracking-tight font-sans mt-0.5">
            Full Bracket Progression
          </h3>
          <p className="text-xs text-neutral-500 font-mono mt-1">
            Click any car to view its full technical spec sheet.
          </p>
        </div>

        <BracketTree pool={pool} winnersHistory={winnersHistory} champion={champion} />
      </motion.div>

      {/* ── Taste Profile Radar ─────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="glass-panel p-6 sm:p-10 rounded-sm border border-black/10 shadow-lg"
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-black/10">
          <div>
            <div className="text-xs font-mono font-bold tracking-widest text-[#C63A16] uppercase">5-AXIS RADAR</div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#14110f] uppercase tracking-tight font-sans mt-0.5">
              Automotive Taste Profile
            </h3>
            <p className="text-xs text-neutral-500 font-mono mt-1">
              Mapped from your picks across all {winnersHistory.length} head-to-head rounds.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mt-6">
          <div className="lg:col-span-7 h-[360px] sm:h-[420px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={tasteProfileData}>
                <PolarGrid stroke="#e5e5e5" />
                <PolarAngleAxis dataKey="axis" tick={{ fill: '#14110f', fontSize: 13, fontWeight: 'bold', fontFamily: 'monospace' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Radar name="Taste Score" dataKey="score" stroke="#C63A16" fill="#C63A16" fillOpacity={0.45} dot={{ r: 4, fill: '#C63A16' }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-[#14110f] text-white p-3 rounded text-xs font-mono shadow-xl border border-white/20">
                          <div className="font-bold text-[#C63A16] uppercase mb-1">{d.axis} Axis</div>
                          <div>Score: <strong>{d.score} / 100</strong></div>
                          <div className="text-neutral-400 text-[10px] mt-1">Bracket Avg: {d.raw}</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="lg:col-span-5 grid grid-cols-1 gap-3">
            {tasteProfileData.map((item) => (
              <div key={item.axis} className="p-3.5 bg-black/5 rounded-sm border border-black/5 flex items-center justify-between font-mono">
                <div>
                  <div className="text-xs font-bold text-[#14110f] uppercase tracking-wider">{item.axis}</div>
                  <div className="text-[11px] text-neutral-500">Avg: {item.raw}</div>
                </div>
                <div className="text-right">
                  <span className="text-xl font-extrabold text-[#C63A16]">{item.score}</span>
                  <span className="text-[10px] text-neutral-400 font-normal"> / 100</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Winning Picks Roster ─────────────────────────── */}
      <div className="glass-panel p-6 sm:p-8 rounded-sm border border-black/10">
        <h4 className="text-lg font-bold uppercase text-[#14110f] font-sans mb-4">
          All {winnersHistory.length} Winning Picks
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {winnersHistory.map((car, idx) => (
            <div key={`${car.id}-${idx}`} className="p-3 bg-white/70 rounded border border-black/10 flex items-center gap-3">
              <div className="w-12 h-12 rounded overflow-hidden bg-neutral-100 flex-shrink-0">
                <img src={car.image} alt={`${car.year} ${car.brand} ${car.model}`} className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-mono text-neutral-400 uppercase truncate">
                  {idx < 8 ? 'R16' : idx < 12 ? 'QF' : idx < 14 ? 'SF' : 'Final'} Pick
                </div>
                <div className="text-xs font-bold text-[#14110f] truncate font-sans">
                  {car.brand} {car.model}
                </div>
                <div className="text-[10px] font-mono text-[#C63A16]">
                  {car.horsepower} HP
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
