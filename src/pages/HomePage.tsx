import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Compass, Flame, Zap, Bookmark } from 'lucide-react';
import { GlassButton } from '../components/ui/GlassButton';
import { allCars } from '../data/carsData';
import { useGarageStore } from '../store/useGarageStore';
import { useDocumentHead } from '../hooks/useDocumentHead';

export const HomePage: React.FC = () => {
  const { toggleSave, isSaved } = useGarageStore();
  useDocumentHead(
    'APEX — Find Your Ultimate Machine',
    'Put the world\'s best sports cars, supercars, and hypercars head-to-head in elimination brackets to discover your exact taste profile.'
  );

  // Select 4 showcase cars representing normal, luxury, hyper
  const featuredCars = [
    allCars.find((c) => c.id === 'lexus-lfa-2012') || allCars[0],
    allCars.find((c) => c.id === 'ferrari-laferrari-2015') || allCars[1],
    allCars.find((c) => c.id === 'dodge-challenger-srt-hellcat-2023') || allCars[2],
    allCars.find((c) => c.id === 'mclaren-mp4-4-1988') || allCars[3],
  ];

  return (
    <div className="flex-1 flex flex-col justify-between py-12 lg:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      {/* Hero Section */}
      <section className="flex flex-col items-center text-center my-auto py-8 lg:py-12">


        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-[#14110f] tracking-tight uppercase max-w-4xl leading-[1.05]"
        >
          EXPLORE SPECS.{' '}<span className="text-[#C63A16] underline decoration-2 underline-offset-8">MAP YOUR TASTE.</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-base sm:text-xl text-neutral-600 max-w-2xl font-normal leading-relaxed"
        >
          Dive into detailed technical specs across sports cars, supercars, and hypercars—or put them head-to-head in elimination brackets to reveal your ideal machine.
        </motion.p>

        {/* Action CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row gap-5 justify-center items-center w-full max-w-md"
        >
          <GlassButton
            to="/bracket"
            variant="primary"
            className="w-full sm:w-auto"
            icon={<Trophy className="w-5 h-5 text-[#f7f5f2]" />}
          >
            Start a Bracket
          </GlassButton>
          <GlassButton
            to="/catalog"
            variant="secondary"
            className="w-full sm:w-auto"
            icon={<Compass className="w-5 h-5" />}
          >
            Explore Catalog
          </GlassButton>
        </motion.div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="mt-16 pt-12 border-t border-black/10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-mono font-bold tracking-[0.2em] text-[#C63A16] uppercase">
              Curated Dataset
            </div>
            <h2 className="text-2xl font-bold text-[#14110f] tracking-tight uppercase mt-1">
              Featured Machines
            </h2>
          </div>
          <span className="text-xs font-mono text-neutral-500">
            {allCars.length} Verified Models Across 4 Divisions
          </span>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredCars.map((car, idx) => {
            const saved = isSaved(car.id);
            return (
              <motion.div
                key={car.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 + idx * 0.1 }}
                className="glass-panel group rounded-sm overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl border border-black/10"
              >
                {/* Car Image Container */}
                <div className="relative h-44 w-full overflow-hidden bg-neutral-100">
                  <img
                    src={car.image}
                    alt={`${car.year} ${car.brand} ${car.model}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded text-[10px] font-mono font-bold tracking-widest uppercase text-white">
                    {car.category}
                  </div>
                  <button
                    onClick={() => toggleSave(car.id)}
                    title={saved ? 'Remove from Garage' : 'Save to Garage'}
                    className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all duration-200 ${
                      saved
                        ? 'bg-[#C63A16] text-white shadow-md'
                        : 'bg-white/80 text-neutral-700 hover:text-[#C63A16]'
                    }`}
                  >
                    <Flame className="w-4 h-4 fill-current" />
                  </button>
                </div>

                {/* Specs Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="text-[11px] font-mono uppercase tracking-widest text-neutral-500">
                      {car.brand} &bull; {car.year}
                    </div>
                    <h3 className="text-lg font-extrabold text-[#14110f] tracking-tight mt-0.5 font-sans">
                      {car.model}
                    </h3>
                  </div>

                  {/* Spec Grid */}
                  <div className="grid grid-cols-2 gap-3 my-4 pt-3 border-t border-black/5 font-mono text-xs">
                    <div>
                      <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">
                        Power
                      </span>
                      <span className="font-bold text-[#14110f] text-sm">
                        {typeof car.horsepower === 'number' ? `${car.horsepower} HP` : 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">
                        Top Speed
                      </span>
                      <span className="font-bold text-[#14110f] text-[11px] sm:text-xs whitespace-nowrap tracking-tight block">
                        {typeof car.topSpeedMph === 'number' ? `${car.topSpeedMph} MPH / ${Math.round(car.topSpeedMph * 1.60934)} KPH` : 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">
                        0-60 MPH
                      </span>
                      <span className="font-bold text-[#14110f] text-sm">
                        {typeof car.zeroToSixtyS === 'number' ? `${car.zeroToSixtyS}s` : 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">
                        MSRP
                      </span>
                      <span className="font-bold text-[#C63A16] text-sm">
                        {car.priceUsd !== null ? `$${car.priceUsd.toLocaleString()}` : 'N/A'}
                      </span>
                    </div>
                  </div>

                  <GlassButton
                    to={`/car/${car.id}`}
                    variant="secondary"
                    className="w-full py-2.5 text-[11px]"
                  >
                    View Specs
                  </GlassButton>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 border-t border-black/10">
        <div className="glass-panel p-6 rounded-sm">
          <div className="flex items-center gap-3.5 mb-4">
            <div className="w-10 h-10 rounded bg-[#C63A16]/10 text-[#C63A16] flex items-center justify-center shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold uppercase text-[#14110f] tracking-wide font-sans leading-none">
              HEAD-TO-HEAD BRACKETS
            </h4>
          </div>
          <p className="text-xs text-neutral-600 leading-relaxed font-normal">
            16 machines enter. Pick your favorites round-by-round until 1 champion remains.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-sm">
          <div className="flex items-center gap-3.5 mb-4">
            <div className="w-10 h-10 rounded bg-black/5 text-[#14110f] flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold uppercase text-[#14110f] tracking-wide font-sans leading-none">
              YOUR TASTE PROFILE
            </h4>
          </div>
          <p className="text-xs text-neutral-600 leading-relaxed font-normal">
            Map what you actually value in a machine—from raw power to agile handling.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-sm">
          <div className="flex items-center gap-3.5 mb-4">
            <div className="w-10 h-10 rounded bg-black/5 text-[#14110f] flex items-center justify-center shrink-0">
              <Bookmark className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold uppercase text-[#14110f] tracking-wide font-sans leading-none">
              YOUR GARAGE
            </h4>
          </div>
          <p className="text-xs text-neutral-600 leading-relaxed font-normal">
            Save your favorite builds directly to your browser. No account required.
          </p>
        </div>
      </section>
    </div>
  );
};
