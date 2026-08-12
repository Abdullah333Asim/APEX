import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, Zap, Crown, Flame, Shield, ArrowRight ,Battery} from 'lucide-react';
import { useBracketStore, BracketCategory } from '../store/useBracketStore';
import { GlassButton } from '../components/ui/GlassButton';
import { useDocumentHead } from '../hooks/useDocumentHead';

export const BracketSetupPage: React.FC = () => {
  const navigate = useNavigate();
  const { initializeBracket } = useBracketStore();
  useDocumentHead(
    'Start a Bracket — APEX',
    'Choose a division and pit 16 machines head-to-head in an elimination bracket to reveal your automotive taste profile.'
  );

  const handleStartDivision = (cat: BracketCategory) => {
    initializeBracket(cat);
    navigate('/bracket/play');
  };

  const divisions = [
    {
      id: 'normal' as BracketCategory,
      title: 'Normal Division',
      subtitle: 'Hot Hatches, Sports Coupes & Rally Icons',
      badge: '20 Machines',
      icon: <Zap className="w-6 h-6 text-[#14110f]" />,
      avgHp: '~320 HP',
      avgPrice: '$32k - $72k',
      examples: 'Toyota GR Supra, Civic Type R, Golf R, Mustang GT, WRX STI',
      description: 'Pure driver involvement, sharp chassis tuning, and accessible street performance.',
      image: '/public/cars/toyota-gr-supra-30-2024.jpg',
      accentBg: 'hover:border-[#14110f]',
    },
    {
      id: 'luxury' as BracketCategory,
      title: 'Luxury Division',
      subtitle: 'Supercars, GTs & High-Rev V8/V10 Coupes',
      badge: '30 Machines',
      icon: <Trophy className="w-6 h-6 text-[#C63A16]" />,
      avgHp: '~620 HP',
      avgPrice: '$85k - $340k',
      examples: 'Porsche 911 GT3 RS, BMW M5 CS, AMG GT, Audi R8, Lexus LFA',
      description: 'Uncompromising engineering, intoxicating soundtracks, and track-honed luxury.',
      image: '/public/cars/porsche-911-gt3-rs-2024.jpg',
      accentBg: 'hover:border-[#C63A16]',
      featured: true,
    },
    {
      id: 'hyper' as BracketCategory,
      title: 'Hyper Division',
      subtitle: 'Halo Megacars, Holy Trinity & V16 Weapons',
      badge: '22 Machines',
      icon: <Crown className="w-6 h-6 text-[#f0cf13]" />,
      avgHp: '~1,350 HP',
      avgPrice: '$1.0M - $4.1M',
      examples: 'Bugatti Chiron, Jesko Attack, Huayra BC, Rimac Nevera, Valkyrie',
      description: 'Physical boundaries shattered. Multi-million dollar aerodynamics, W16/V16 monsters, and hyper electrics.',
      image: '/public/cars/koenigsegg-jesko-attack-2023.jpg',
      accentBg: 'hover:border-[#14110f]',
    },
    {
      id: 'f1' as BracketCategory,
      title: 'Formula 1 Division',
      subtitle: 'V10 Screamers, Blown Diffusers & Hybrid Monsters',
      badge: '16 Machines',
      icon: <Battery className="w-6 h-6 text-[#58fe05]" />,
      avgHp: '~900 HP',
      avgPrice: '$12.0M - $18.0M',
      examples: 'Ferrari F2004, Mercedes W11, Brawn BGP 001, Red Bull RB19',
      description: 'The absolute pinnacle of motorsport engineering. Open-wheel monocoques, 15,000 RPM ceilings, and hyper-advanced aerodynamic downforce.',
      image: '/public/f1/renault-r25-2005.jpg',
      accentBg: 'hover:border-[#C63A16]',
    },
  ];

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex flex-col justify-between">
      {/* Header Section */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-black/5 border border-black/10 text-[11px] font-mono font-bold uppercase tracking-widest text-[#C63A16] mb-4"
        >
          <Flame className="w-3.5 h-3.5 fill-current" />
          <span>Tournament Mode</span>
        </motion.div>
        <h1 className="text-3xl sm:text-5xl font-extrabold uppercase text-[#14110f] tracking-tight">
          Select Your Division
        </h1>
        <p className="mt-3 text-sm sm:text-base text-neutral-600 font-normal leading-relaxed">
          Each tournament draws 16 random machines from your chosen category into a 4-round elimination bracket. Every pick shapes your final 5-axis automotive taste profile.
        </p>
      </div>

      {/* Division Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {divisions.map((division, idx) => (
          <motion.div
            key={division.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.15 }}
            onClick={() => handleStartDivision(division.id)}
            className={`glass-panel group relative rounded-sm overflow-hidden border border-black/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl cursor-pointer flex flex-col justify-between ${division.accentBg}`}
          >
            {/* Card Hero Image */}
            <div className="relative h-52 w-full overflow-hidden bg-neutral-100">
              <img
                src={division.image}
                alt={division.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-widest text-[#14110f] shadow">
                {division.badge}
              </div>

              {division.featured && (
                <div className="absolute top-4 right-4 bg-[#C63A16] text-white text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-1 rounded shadow">
                  Most Popular
                </div>
              )}

              <div className="absolute bottom-4 left-4 right-4 text-white">
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1.5 bg-white/20 backdrop-blur-md rounded text-white">
                    {division.icon}
                  </div>
                  <h3 className="text-2xl font-extrabold uppercase tracking-tight font-sans text-white">
                    {division.title}
                  </h3>
                </div>
                <p className="text-xs text-neutral-300 font-mono">
                  {division.subtitle}
                </p>
              </div>
            </div>

            {/* Content Details */}
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <p className="text-xs text-neutral-600 leading-relaxed mb-6 font-normal">
                  {division.description}
                </p>

                {/* Key Division Benchmarks */}
                <div className="grid grid-cols-2 gap-3 mb-6 p-3 bg-black/5 rounded-sm font-mono text-xs">
                  <div>
                    <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Average Power</span>
                    <span className="font-bold text-[#14110f]">{division.avgHp}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Price Bracket</span>
                    <span className="font-bold text-[#C63A16]">{division.avgPrice}</span>
                  </div>
                </div>

                {/* Sample Cars */}
                <div className="mb-6">
                  <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block mb-1">
                    Featured Division Roster
                  </span>
                  <span className="text-xs font-mono text-neutral-700 italic">
                    {division.examples}
                  </span>
                </div>
              </div>

              {/* Start CTA Button */}
              <GlassButton
                variant={division.featured ? 'primary' : 'secondary'}
                className="w-full text-xs py-3"
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Launch {division.title}
              </GlassButton>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Rules Footer Pill */}
      <div className="mt-12 text-center text-xs font-mono text-neutral-500 uppercase tracking-widest">
        16 Cars Draw &bull; Round of 16 (8) &bull; Quarterfinals (4) &bull; Semifinals (2) &bull; Final (1) &bull; Taste Profile Generated
      </div>
    </div>
  );
};
