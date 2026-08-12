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

// ─── BracketNode ─────────────────────────────────────────────────────────────
interface BracketNodeProps {
  car: Car | null;
  isWinner?: boolean;
  isChampion?: boolean;
}

const BracketNode: React.FC<BracketNodeProps> = ({ car, isWinner = false, isChampion = false }) => {
  if (!car) {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1 rounded border border-dashed border-black/15 bg-white/40 opacity-40 w-full">
        <div className="h-5 w-5 rounded bg-neutral-100 flex-shrink-0" />
        <span className="text-[8px] font-mono text-neutral-400">TBD</span>
      </div>
    );
  }
  return (
    <Link
      to={`/car/${car.id}`}
      className={`flex items-center gap-1.5 px-2 py-1 rounded border transition-all hover:shadow-sm w-full ${
        isChampion
          ? 'border-[#C63A16] bg-[#C63A16]/5 ring-1 ring-[#C63A16]/20'
          : isWinner
          ? 'border-[#C63A16]/30 bg-white/90'
          : 'border-black/10 bg-white/50 opacity-40'
      }`}
    >
      <div className="h-5 w-5 rounded overflow-hidden bg-neutral-100 flex-shrink-0">
        <img src={car.image} alt={`${car.year} ${car.brand} ${car.model}`} className="w-full h-full object-cover" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[7px] font-mono text-neutral-400 truncate leading-tight">{car.brand}</div>
        <div className="text-[8px] font-bold text-[#14110f] truncate leading-tight">{car.model}</div>
      </div>
    </Link>
  );
};

// ─── Vertical Matchup Card ────────────────────────────────────────────────────
interface VMatchupProps {
  carA: Car | null;
  carB: Car | null;
  winner: Car | null;
  isChampion?: boolean;
}

const VMatchup: React.FC<VMatchupProps> = ({ carA, carB, winner, isChampion = false }) => (
  <div className={`flex flex-col rounded border bg-white/80 shadow-sm overflow-hidden ${
    isChampion ? 'border-[#C63A16] ring-1 ring-[#C63A16]/20' : 'border-black/10'
  }`}>
    <BracketNode car={carA} isWinner={winner?.id === carA?.id} isChampion={isChampion} />
    <div className="h-px bg-black/8 mx-1" />
    <BracketNode car={carB} isWinner={winner?.id === carB?.id} />
  </div>
);

// ─── Vertical Bracket Tree ────────────────────────────────────────────────────
interface BracketTreeProps {
  pool: Car[];
  winnersHistory: Car[];
  champion: Car | null;
}

const BracketTree: React.FC<BracketTreeProps> = ({ pool, winnersHistory, champion }) => {
  const r16Pairs: [Car, Car][] = [];
  for (let i = 0; i < 16; i += 2) {
    if (pool[i] && pool[i + 1]) r16Pairs.push([pool[i], pool[i + 1]]);
  }
  const r16Winners = winnersHistory.slice(0, 8);

  const qfPairs: [Car | null, Car | null][] = [];
  for (let i = 0; i < 8; i += 2) qfPairs.push([r16Winners[i] || null, r16Winners[i + 1] || null]);
  const qfWinners = winnersHistory.slice(8, 12);

  const sfPairs: [Car | null, Car | null][] = [];
  for (let i = 0; i < 4; i += 2) sfPairs.push([qfWinners[i] || null, qfWinners[i + 1] || null]);
  const sfWinners = winnersHistory.slice(12, 14);

  const finalPair: [Car | null, Car | null] = [sfWinners[0] || null, sfWinners[1] || null];

  // Layout constants (px)
  const CARD_W = 128;  // width of each matchup card
  const CARD_H = 42;   // height of each matchup card (2 nodes + divider)
  const GAP = 6;       // gap between sibling cards in a row
  const CONN_H = 28;   // vertical gap between rounds (used for connector lines)
  const LABEL_H = 20;  // round label height
  const ROW_H = CARD_H + LABEL_H; // total row height including label

  // 8 cards across at R16, each block = CARD_W + GAP, total width = 8*(CARD_W+GAP) - GAP
  const totalW = 8 * CARD_W + 7 * GAP;

  // Center x of the i-th card in a row of `count` evenly-distributed cards
  const cx = (index: number, count: number): number => {
    const blockW = totalW / count;
    return blockW * index + blockW / 2;
  };

  // Top y of the cards row for round index ri (0=R16, 1=QF, 2=SF, 3=Final)
  const rowCardTopY = (ri: number): number => ri * (ROW_H + CONN_H) + LABEL_H;
  const rowCardBotY = (ri: number): number => rowCardTopY(ri) + CARD_H;

  const svgH = 4 * (ROW_H + CONN_H) + LABEL_H + CARD_H + CONN_H + CARD_H + LABEL_H;

  // Build SVG connectors: for rounds 0→1, 1→2, 2→3
  const connectors: React.ReactNode[] = [];
  for (let ri = 0; ri < 3; ri++) {
    const childCount = [8, 4, 2, 1][ri];
    const parentCount = [8, 4, 2, 1][ri + 1];
    for (let pi = 0; pi < parentCount; pi++) {
      const c1 = cx(pi * 2, childCount);
      const c2 = cx(pi * 2 + 1, childCount);
      const px_ = cx(pi, parentCount);
      const topY = rowCardBotY(ri);
      const botY = rowCardTopY(ri + 1);
      const midY = topY + (botY - topY) / 2;
      connectors.push(
        <g key={`c-${ri}-${pi}`}>
          <line x1={c1} y1={topY} x2={c1} y2={midY} stroke="#C63A16" strokeWidth="2.5" strokeLinecap="round" />
          <line x1={c2} y1={topY} x2={c2} y2={midY} stroke="#C63A16" strokeWidth="2.5" strokeLinecap="round" />
          <line x1={c1} y1={midY} x2={c2} y2={midY} stroke="#C63A16" strokeWidth="2.5" strokeLinecap="round" />
          <line x1={px_} y1={midY} x2={px_} y2={botY} stroke="#C63A16" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      );
    }
  }
  // Final → Champion connector
  const champTopY = rowCardBotY(3);
  const champCardTopY = champTopY + CONN_H;
  connectors.push(
    <line key="c-champ" x1={cx(0, 1)} y1={champTopY} x2={cx(0, 1)} y2={champCardTopY} stroke="#C63A16" strokeWidth="2.5" strokeLinecap="round" />
  );

  const roundData = [
    {
      label: 'Round of 16', count: 8,
      cards: r16Pairs.map((p, i) => ({ carA: p[0], carB: p[1], winner: r16Winners[i] || null })),
    },
    {
      label: 'Quarterfinals', count: 4,
      cards: qfPairs.map((p, i) => ({ carA: p[0], carB: p[1], winner: qfWinners[i] || null })),
    },
    {
      label: 'Semifinals', count: 2,
      cards: sfPairs.map((p, i) => ({ carA: p[0], carB: p[1], winner: sfWinners[i] || null })),
    },
    {
      label: 'Grand Final', count: 1,
      cards: [{ carA: finalPair[0], carB: finalPair[1], winner: champion }],
    },
  ];

  return (
    <div className="w-full overflow-x-auto pb-4 flex justify-center">
      <style>{`
        .v-bracket-zoom {
          zoom: 0.31;
        }
        @media (min-width: 380px) {
          .v-bracket-zoom {
            zoom: 0.35;
          }
        }
        @media (min-width: 480px) {
          .v-bracket-zoom {
            zoom: 0.44;
          }
        }
        @media (min-width: 640px) {
          .v-bracket-zoom {
            zoom: 0.58;
          }
        }
        @media (min-width: 768px) {
          .v-bracket-zoom {
            zoom: 0.72;
          }
        }
        @media (min-width: 1024px) {
          .v-bracket-zoom {
            zoom: 0.88;
          }
        }
        @media (min-width: 1200px) {
          .v-bracket-zoom {
            zoom: 1;
          }
        }
      `}</style>
      <div className="v-bracket-zoom" style={{ width: `${totalW}px`, minWidth: `${totalW}px`, position: 'relative', margin: '0 auto' }}>

        {/* SVG connector overlay */}
        <svg
          width={totalW}
          height={svgH}
          style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: 1, overflow: 'visible' }}
        >
          {connectors}
        </svg>

        {/* Round rows */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          {roundData.map((round, ri) => {
            const blockW = totalW / round.count;
            return (
              <div key={round.label}>
                {/* Label */}
                <div style={{ display: 'flex', height: `${LABEL_H}px`, alignItems: 'center' }}>
                  <span
                    className="text-[9px] font-mono font-extrabold uppercase tracking-widest text-neutral-400"
                    style={{ paddingLeft: '2px' }}
                  >
                    {round.label}
                  </span>
                </div>
                {/* Cards */}
                <div style={{ display: 'flex', height: `${CARD_H}px`, gap: 0 }}>
                  {Array.from({ length: round.count }).map((_, i) => {
                    const card = round.cards[i];
                    return (
                      <div
                        key={i}
                        style={{
                          width: `${blockW}px`,
                          flexShrink: 0,
                          paddingLeft: `${GAP / 2}px`,
                          paddingRight: `${GAP / 2}px`,
                        }}
                      >
                        {card ? (
                          <VMatchup carA={card.carA} carB={card.carB} winner={card.winner} />
                        ) : (
                          <VMatchup carA={null} carB={null} winner={null} />
                        )}
                      </div>
                    );
                  })}
                </div>
                {/* Connector gap spacer */}
                {ri < 3 && <div style={{ height: `${CONN_H}px` }} />}
              </div>
            );
          })}

          {/* Champion row */}
          <div style={{ height: `${CONN_H}px` }} />
          <div style={{ height: `${LABEL_H}px`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="text-[9px] font-mono font-extrabold uppercase tracking-widest text-[#C63A16]">
              🏆 Champion
            </span>
          </div>
          <div style={{ display: 'flex', height: `${CARD_H}px`, justifyContent: 'center' }}>
            <div style={{ width: `${CARD_W}px` }}>
              {champion ? (
                <div className={`flex items-center gap-1.5 px-2 py-1 rounded border border-[#C63A16] bg-[#C63A16]/10 ring-1 ring-[#C63A16] w-full h-full shadow-md`}>
                  <div className="h-5 w-5 rounded overflow-hidden bg-neutral-100 flex-shrink-0 border border-[#C63A16]/30">
                    <img src={champion.image} alt={`${champion.year} ${champion.brand} ${champion.model}`} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1 leading-tight">
                    <div className="text-[7.5px] font-mono text-neutral-400 truncate uppercase tracking-wider">{champion.brand}</div>
                    <div className="text-[9px] font-extrabold text-[#14110f] truncate">{champion.model}</div>
                    <div className="text-[7.5px] font-mono font-extrabold text-[#C63A16] uppercase tracking-wider leading-tight">Champion</div>
                  </div>
                </div>
              ) : (
                <VMatchup carA={null} carB={null} winner={null} />
              )}
            </div>
          </div>
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
              {car.priceUsd !== null ? `$${car.priceUsd.toLocaleString()}` : 'MSRP: N/A'}
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
                <span className="font-extrabold text-[#14110f] text-sm">{car.zeroToSixtyS !== null ? `${car.zeroToSixtyS}s` : 'N/A'}</span>
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

    const priceCars = winnersHistory.filter((c) => c.priceUsd !== null);
    const avgPrice  = priceCars.length > 0 ? priceCars.reduce((acc, c) => acc + c.priceUsd!, 0) / priceCars.length : null;

    const allP2W = allCars.map((c) => c.horsepower / c.weightLbs);
    const minP2W = Math.min(...allP2W);
    const maxP2W = Math.max(...allP2W);
    const avgP2W = winnersHistory.reduce((acc, c) => acc + c.horsepower / c.weightLbs, 0) / n;

    const avgPrestige = winnersHistory.reduce((acc, c) => acc + (c.prestige ?? 5), 0) / n;

    const clamp = (v: number) => Math.round(Math.min(100, Math.max(0, v)));

    return [
      { axis: 'Power',   score: clamp(((avgHp    - bounds.minHp)    / (bounds.maxHp    - bounds.minHp))    * 100), raw: `${Math.round(avgHp)} HP` },
      { axis: 'Speed',   score: clamp(((avgSpeed - bounds.minSpeed) / (bounds.maxSpeed - bounds.minSpeed)) * 100), raw: `${Math.round(avgSpeed)} MPH / ${Math.round(avgSpeed * 1.60934)} KPH` },
      { axis: 'Value',   score: avgPrice !== null ? clamp(((bounds.maxPrice - avgPrice)  / (bounds.maxPrice - bounds.minPrice)) * 100) : 0, raw: avgPrice !== null ? `$${Math.round(avgPrice).toLocaleString()}` : 'N/A' },
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
              {champion.priceUsd !== null ? `$${champion.priceUsd.toLocaleString()}` : 'MSRP: N/A'}
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
                <span className="font-extrabold text-[#14110f] text-sm">{champion.zeroToSixtyS !== null ? `${champion.zeroToSixtyS}s` : 'N/A'}</span>
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
