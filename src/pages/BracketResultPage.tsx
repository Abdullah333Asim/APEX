import React, { useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, Flame, RotateCcw, Zap, Gauge, DollarSign, Shield, Compass, Sparkles } from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';
import { useBracketStore } from '../store/useBracketStore';
import { useGarageStore } from '../store/useGarageStore';
import { allCars, getStatRanges } from '../data/carsData';
import { GlassButton } from '../components/ui/GlassButton';

export const BracketResultPage: React.FC = () => {
  const navigate = useNavigate();
  const { champion, winnersHistory, category, resetBracket } = useBracketStore();
  const { toggleSave, isSaved } = useGarageStore();

  // Compute Taste Profile 5-axis Radar Scores
  const tasteProfileData = useMemo(() => {
    if (!winnersHistory || winnersHistory.length === 0) {
      return [];
    }

    const bounds = getStatRanges(allCars);
    const n = winnersHistory.length;

    // Calculate Averages across all winning picks
    const avgHp = winnersHistory.reduce((acc, c) => acc + c.horsepower, 0) / n;
    const avgSpeed = winnersHistory.reduce((acc, c) => acc + c.topSpeedMph, 0) / n;
    const avgPrice = winnersHistory.reduce((acc, c) => acc + c.priceUsd, 0) / n;

    const allP2W = allCars.map((c) => c.horsepower / c.weightLbs);
    const minP2W = Math.min(...allP2W);
    const maxP2W = Math.max(...allP2W);
    const avgP2W = winnersHistory.reduce((acc, c) => acc + c.horsepower / c.weightLbs, 0) / n;

    const avgPrestige = winnersHistory.reduce((acc, c) => acc + (c.prestige ?? 5), 0) / n;

    // Normalization to 0-100 scale against full dataset
    const powerScore = Math.round(
      Math.min(100, Math.max(0, ((avgHp - bounds.minHp) / (bounds.maxHp - bounds.minHp)) * 100))
    );
    const speedScore = Math.round(
      Math.min(100, Math.max(0, ((avgSpeed - bounds.minSpeed) / (bounds.maxSpeed - bounds.minSpeed)) * 100))
    );
    const valueScore = Math.round(
      Math.min(100, Math.max(0, ((bounds.maxPrice - avgPrice) / (bounds.maxPrice - bounds.minPrice)) * 100))
    );
    const agilityScore = Math.round(
      Math.min(100, Math.max(0, ((avgP2W - minP2W) / (maxP2W - minP2W)) * 100))
    );
    const prestigeScore = Math.round(
      Math.min(100, Math.max(0, ((avgPrestige - 1) / 9) * 100))
    );

    return [
      { axis: 'Power', score: powerScore, raw: `${Math.round(avgHp)} HP` },
      { axis: 'Speed', score: speedScore, raw: `${Math.round(avgSpeed)} MPH` },
      { axis: 'Value', score: valueScore, raw: `$${Math.round(avgPrice).toLocaleString()}` },
      { axis: 'Agility', score: agilityScore, raw: `${(avgP2W * 2000).toFixed(1)} hp/ton` },
      { axis: 'Prestige', score: prestigeScore, raw: `${avgPrestige.toFixed(1)} / 10` },
    ];
  }, [winnersHistory]);

  const handleRunAnother = () => {
    resetBracket();
    navigate('/bracket');
  };

  if (!champion) {
    return (
      <div className="flex-1 max-w-7xl mx-auto px-4 py-16 flex flex-col items-center justify-center text-center">
        <div className="glass-panel p-12 rounded-sm max-w-md w-full">
          <Trophy className="w-12 h-12 text-[#C63A16] mx-auto mb-4" />
          <h2 className="text-2xl font-extrabold uppercase text-[#14110f] mb-2">
            No Champion Result Found
          </h2>
          <p className="text-xs text-neutral-600 mb-8">
            Complete a tournament bracket to generate your champion showcase and taste profile.
          </p>
          <GlassButton to="/bracket" variant="primary">
            Start a Bracket
          </GlassButton>
        </div>
      </div>
    );
  }

  const saved = isSaved(champion.id);

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex flex-col gap-10">
      {/* Header Section */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#C63A16]/10 border border-[#C63A16]/20 text-[11px] font-mono font-bold uppercase tracking-widest text-[#C63A16] mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>TOURNAMENT RESULTS COMPLETE</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold uppercase text-[#14110f] tracking-tight">
          Your Champion & Taste Profile
        </h1>
        <p className="text-xs sm:text-sm text-neutral-600 mt-2 font-normal">
          Derived from all 7 winning matchups in your {category?.toUpperCase()} division tournament.
        </p>
      </div>

      {/* Champion Hero Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-panel p-6 sm:p-10 rounded-sm border-2 border-[#C63A16] shadow-2xl relative overflow-hidden"
      >
        <div className="flex flex-col lg:flex-row gap-8 items-center">
          {/* Champion Image */}
          <div className="w-full lg:w-1/2 relative h-72 sm:h-96 rounded-sm overflow-hidden bg-neutral-100 shadow-inner">
            <img
              src={champion.image}
              alt={`${champion.brand} ${champion.model}`}
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

          {/* Champion Info & CTAs */}
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

            {/* Spec Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-6 p-4 bg-black/5 rounded-sm font-mono text-xs">
              <div>
                <span className="text-[10px] text-neutral-400 uppercase block">Horsepower</span>
                <span className="font-extrabold text-[#14110f] text-sm">{champion.horsepower} HP</span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 uppercase block">Top Speed</span>
                <span className="font-extrabold text-[#14110f] text-sm">{champion.topSpeedMph} MPH</span>
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

            {/* CTAs */}
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

      {/* Taste Profile Radar Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="glass-panel p-6 sm:p-10 rounded-sm border border-black/10 shadow-lg"
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-black/10">
          <div>
            <div className="text-xs font-mono font-bold tracking-widest text-[#C63A16] uppercase">
              5-AXIS RADAR
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#14110f] uppercase tracking-tight font-sans mt-0.5">
              Automotive Taste Profile
            </h3>
            <p className="text-xs text-neutral-500 font-mono mt-1">
              Mapped from your picks across all 7 head-to-head rounds.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mt-6">
          {/* Radar Chart Component */}
          <div className="lg:col-span-7 h-[360px] sm:h-[420px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={tasteProfileData}>
                <PolarGrid stroke="#e5e5e5" />
                <PolarAngleAxis
                  dataKey="axis"
                  tick={{ fill: '#14110f', fontSize: 13, fontWeight: 'bold', fontFamily: 'monospace' }}
                />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Radar
                  name="Taste Score"
                  dataKey="score"
                  stroke="#C63A16"
                  fill="#C63A16"
                  fillOpacity={0.45}
                  dot={{ r: 4, fill: '#C63A16' }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-[#14110f] text-white p-3 rounded text-xs font-mono shadow-xl border border-white/20">
                          <div className="font-bold text-[#C63A16] uppercase mb-1">{data.axis} Axis</div>
                          <div>Normalized Score: <strong className="text-white">{data.score} / 100</strong></div>
                          <div className="text-neutral-400 text-[10px] mt-1">Bracket Avg: {data.raw}</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Breakdown Score Cards */}
          <div className="lg:col-span-5 grid grid-cols-1 gap-3">
            {tasteProfileData.map((item) => (
              <div
                key={item.axis}
                className="p-3.5 bg-black/5 rounded-sm border border-black/5 flex items-center justify-between font-mono"
              >
                <div>
                  <div className="text-xs font-bold text-[#14110f] uppercase tracking-wider">
                    {item.axis} Axis
                  </div>
                  <div className="text-[11px] text-neutral-500">
                    Bracket Avg: {item.raw}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xl font-extrabold text-[#C63A16]">
                    {item.score}
                  </span>
                  <span className="text-[10px] text-neutral-400 font-normal"> / 100</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Winning Picks Roster */}
      <div className="glass-panel p-6 sm:p-8 rounded-sm border border-black/10">
        <h4 className="text-lg font-bold uppercase text-[#14110f] font-sans mb-4">
          Your Winning Picks ({winnersHistory.length})
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {winnersHistory.map((car, idx) => (
            <div
              key={`${car.id}-${idx}`}
              className="p-3 bg-white/70 rounded border border-black/10 flex items-center gap-3"
            >
              <div className="w-12 h-12 rounded overflow-hidden bg-neutral-100 flex-shrink-0">
                <img src={car.image} alt={car.model} className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-mono text-neutral-400 uppercase truncate">
                  Match {idx + 1} Winner
                </div>
                <div className="text-xs font-bold text-[#14110f] truncate font-sans">
                  {car.brand} {car.model}
                </div>
                <div className="text-[10px] font-mono text-[#C63A16]">
                  {car.horsepower} HP &bull; ${car.priceUsd.toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
