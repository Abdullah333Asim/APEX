import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, Flame, Trash2, Zap, Gauge, DollarSign, Crown, ArrowRight, Compass } from 'lucide-react';
import { useGarageStore } from '../store/useGarageStore';
import { allCars, formatCompactPrice } from '../data/carsData';
import { GlassButton } from '../components/ui/GlassButton';
import { useDocumentHead } from '../hooks/useDocumentHead';

export const GaragePage: React.FC = () => {
  const { savedIds, toggleSave, clearGarage } = useGarageStore();
  useDocumentHead(
    'My Garage — APEX',
    'Your personally saved cars from the APEX catalog. Saved to your browser with no account required.'
  );

  // Match saved IDs to full Car objects from dataset
  const savedCars = useMemo(() => {
    return allCars.filter((car) => savedIds.includes(car.id));
  }, [savedIds]);

  // Aggregate Collection Metrics
  const metrics = useMemo(() => {
    if (savedCars.length === 0) return null;

    const priceCars = savedCars.map((c) => c.priceUsd).filter((p): p is number => typeof p === 'number');
    const totalValue = priceCars.reduce((sum, p) => sum + p, 0);

    const hpCars = savedCars.map((c) => c.horsepower).filter((h): h is number => typeof h === 'number');
    const avgHp = hpCars.length > 0 ? Math.round(hpCars.reduce((sum, h) => sum + h, 0) / hpCars.length) : 'N/A';

    const speedCars = savedCars.map((c) => c.topSpeedMph).filter((s): s is number => typeof s === 'number');
    const maxSpeed = speedCars.length > 0 ? Math.max(...speedCars) : 'N/A';

    // Find car with highest prestige
    const highestPrestigeCar = savedCars.reduce((prev, current) => {
      const pPrev = prev.prestige ?? 5;
      const pCurr = current.prestige ?? 5;
      return pCurr > pPrev ? current : prev;
    }, savedCars[0]);

    return {
      totalValue,
      avgHp,
      maxSpeed,
      highestPrestigeCar,
    };
  }, [savedCars]);

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex flex-col justify-between">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-black/10">
        <div>
          <div className="text-xs font-mono font-bold tracking-widest text-[#C63A16] uppercase">
            Personal Collection
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#14110f] uppercase tracking-tight mt-0.5 font-sans">
            My Garage
          </h1>
        </div>
        {savedCars.length > 0 && (
          <GlassButton
            onClick={clearGarage}
            variant="secondary"
            className="text-xs py-2 px-4"
            icon={<Trash2 className="w-4 h-4 text-[#C63A16]" />}
          >
            Clear All Saved ({savedCars.length})
          </GlassButton>
        )}
      </div>

      {savedCars.length === 0 ? (
        /* Empty State */
        <div className="my-auto py-20 flex flex-col items-center text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 rounded-full bg-black/5 flex items-center justify-center text-neutral-400 mb-6 shadow-inner"
          >
            <Bookmark className="w-10 h-10" />
          </motion.div>
          <h2 className="text-2xl sm:text-3xl font-extrabold uppercase text-[#14110f]">
            Your Garage is Empty
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 max-w-md mt-2 mb-8 font-normal leading-relaxed">
            Explore the 72-car machine database or complete an elimination bracket tournament to save your favorite vehicles to your local garage.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <GlassButton to="/catalog" variant="primary" icon={<Compass className="w-4 h-4 text-white" />}>
              Explore Machine Catalog
            </GlassButton>
            <GlassButton to="/bracket" variant="secondary" icon={<ArrowRight className="w-4 h-4" />}>
              Start a Bracket
            </GlassButton>
          </div>
        </div>
      ) : (
        /* Active Collection View */
        <div className="mt-8 flex flex-col gap-8">
          {/* Collection Aggregate Stats Bar */}
          {metrics && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel p-6 rounded-sm border border-black/10 shadow-md grid grid-cols-2 md:grid-cols-4 gap-6 font-mono"
            >
              <div>
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider block mb-1">Total Collection MSRP</span>
                <span className="text-xl sm:text-2xl font-extrabold text-[#C63A16]">
                  ${formatCompactPrice(metrics.totalValue)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider block mb-1">Average Power</span>
                <span className="text-xl sm:text-2xl font-extrabold text-[#14110f]">
                  {metrics.avgHp} <span className="text-xs font-normal text-neutral-500">HP</span>
                </span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider block mb-1">Top Speed Peak</span>
                <span className="text-xl sm:text-2xl font-extrabold text-[#14110f]">
                  {typeof metrics.maxSpeed === 'number' ? `${metrics.maxSpeed} MPH / ${Math.round(metrics.maxSpeed * 1.60934)} KPH` : 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider block mb-1">Crown Halo Machine</span>
                <span className="text-sm font-extrabold text-[#14110f] truncate block">
                  {metrics.highestPrestigeCar.brand} {metrics.highestPrestigeCar.model}
                </span>
              </div>
            </motion.div>
          )}

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {savedCars.map((car) => (
                <motion.div
                  key={car.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.25 }}
                  className="glass-panel group rounded-sm overflow-hidden flex flex-col justify-between border border-black/10 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl"
                >
                  {/* Vehicle Image */}
                  <div className="relative h-52 w-full overflow-hidden bg-neutral-100">
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
                      title="Remove from Garage"
                      className="absolute top-3 right-3 p-2 rounded-full bg-[#C63A16] text-white shadow-md hover:scale-110 transition-transform"
                    >
                      <Flame className="w-4 h-4 fill-current" />
                    </button>
                  </div>

                  {/* Body Info & Stats */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="text-[11px] font-mono uppercase tracking-widest text-neutral-500">
                        {car.brand} &bull; {car.year} &bull; {car.country}
                      </div>
                      <h3 className="text-xl font-extrabold text-[#14110f] uppercase tracking-tight mt-0.5 font-sans">
                        {car.model}
                      </h3>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 my-4 pt-3 border-t border-black/10 font-mono text-xs">
                      <div>
                        <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Power</span>
                        <span className="font-bold text-[#14110f]">
                          {typeof car.horsepower === 'number' ? `${car.horsepower} HP` : 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Top Speed</span>
                        <span className="font-bold text-[#14110f] text-[11px] sm:text-xs whitespace-nowrap tracking-tight block">
                          {typeof car.topSpeedMph === 'number' ? `${car.topSpeedMph} MPH / ${Math.round(car.topSpeedMph * 1.60934)} KPH` : 'N/A'}
                        </span>
                      </div>
                      {car.category === 'f1' ? (
                        <>
                          <div>
                            <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Engine Type</span>
                            <span className="font-bold text-[#14110f] truncate block" title={car.engine.type}>{car.engine.type}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Weight</span>
                            <span className="font-bold text-[#C63A16] text-[11px] sm:text-xs block tracking-tighter truncate">
                              {typeof car.weightLbs === 'number' ? `${car.weightLbs.toLocaleString()} lbs / ${Math.round(car.weightLbs * 0.45359237)} kg` : 'N/A'}
                            </span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">0–60 MPH</span>
                            <span className="font-bold text-[#14110f]">
                              {typeof car.zeroToSixtyS === 'number' ? `${car.zeroToSixtyS}s` : 'N/A'}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Price</span>
                            <span className="font-bold text-[#C63A16]">
                              {typeof car.priceUsd === 'number' ? `$${car.priceUsd.toLocaleString()}` : 'N/A'}
                            </span>
                          </div>
                        </>
                      )}
                    </div>

                    <GlassButton to={`/car/${car.id}`} variant="secondary" className="w-full text-xs py-2.5">
                      View Full Specification Sheet
                    </GlassButton>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
};
