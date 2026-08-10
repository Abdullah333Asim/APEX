import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Flame, ArrowLeft, Zap, Gauge, Cpu, Globe, Sparkles, Compass } from 'lucide-react';
import { getCarById } from '../data/carsData';
import { GlassButton } from '../components/ui/GlassButton';
import { useGarageStore } from '../store/useGarageStore';

export const CarDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const car = getCarById(id || '');
  const { toggleSave, isSaved } = useGarageStore();

  // 404 / Machine Not Found state
  if (!car) {
    return (
      <div className="flex-1 max-w-7xl mx-auto px-4 py-16 flex flex-col items-center justify-center text-center">
        <div className="glass-panel p-12 rounded-sm max-w-md w-full border border-black/10">
          <Compass className="w-12 h-12 text-[#C63A16] mx-auto mb-4" />
          <div className="text-xs font-mono font-bold tracking-widest text-[#C63A16] uppercase mb-1">
            404 Error
          </div>
          <h1 className="text-2xl font-extrabold uppercase text-[#14110f] mb-3">
            Machine Not Found
          </h1>
          <p className="text-xs text-neutral-600 mb-8 font-mono">
            No vehicle specifications exist in the database for ID <code className="text-[#C63A16] font-bold">"{id}"</code>.
          </p>
          <GlassButton to="/catalog" variant="primary" icon={<ArrowLeft className="w-4 h-4 text-white" />}>
            Return to Catalog
          </GlassButton>
        </div>
      </div>
    );
  }

  const saved = isSaved(car.id);

  // Power to weight ratio in HP per US ton (2,000 lbs)
  const powerToWeightRatio = ((car.horsepower / car.weightLbs) * 2000).toFixed(1);

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Top Navigation Bar */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          to="/catalog"
          className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-neutral-600 hover:text-[#14110f] transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-[#C63A16]" />
          <span>Back to Catalog</span>
        </Link>
        <span className="text-xs font-mono text-neutral-400">
          ID: {car.id}
        </span>
      </div>

      {/* Hero Header Section */}
      <div className="glass-panel rounded-sm p-6 sm:p-10 border border-black/10 shadow-lg">
        <div className="flex flex-col lg:flex-row gap-8 items-stretch">
          {/* Main Vehicle Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full lg:w-3/5 relative min-h-[320px] sm:min-h-[420px] rounded-sm overflow-hidden bg-neutral-100 group shadow-inner"
          >
            <img
              src={car.image}
              alt={`${car.brand} ${car.model}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            {/* Category Tag */}
            <div className="absolute top-4 left-4 bg-black/85 backdrop-blur-md text-white text-xs font-mono font-bold uppercase tracking-widest px-3.5 py-1.5 rounded shadow">
              {car.category} DIVISION
            </div>
            {/* Country Badge */}
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md text-[#14110f] text-xs font-mono font-bold uppercase tracking-widest px-3 py-1 rounded shadow flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#C63A16]" />
              <span>{car.country}</span>
            </div>
          </motion.div>

          {/* Title & Key Highlights */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="w-full lg:w-2/5 flex flex-col justify-between"
          >
            <div>
              <div className="text-xs font-mono font-bold tracking-[0.25em] text-neutral-500 uppercase">
                {car.brand} &bull; {car.year}
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold text-[#14110f] uppercase tracking-tight mt-1 font-sans leading-none">
                {car.model}
              </h1>

              {/* Price Banner */}
              <div className="mt-6 inline-flex items-baseline gap-2 px-4 py-2 rounded bg-black/5 border border-black/10">
                <span className="text-xs font-mono text-neutral-500 uppercase">Base MSRP</span>
                <span className="text-2xl font-extrabold text-[#C63A16] font-mono">
                  ${car.priceUsd.toLocaleString()}
                </span>
              </div>

              {/* Quick Specs Highlight Bar */}
              <div className="grid grid-cols-2 gap-3 mt-6 pt-6 border-t border-black/10 font-mono">
                <div className="p-3 bg-white/60 rounded border border-black/5">
                  <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Peak Horsepower</span>
                  <span className="text-xl font-extrabold text-[#14110f]">{car.horsepower} <span className="text-xs font-normal text-neutral-500">HP</span></span>
                </div>
                <div className="p-3 bg-white/60 rounded border border-black/5">
                  <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Top Speed</span>
                  <span className="text-xl font-extrabold text-[#14110f]">{car.topSpeedMph} <span className="text-xs font-normal text-neutral-500">MPH</span></span>
                </div>
                <div className="p-3 bg-white/60 rounded border border-black/5">
                  <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">0-60 MPH Acceleration</span>
                  <span className="text-xl font-extrabold text-[#14110f]">{car.zeroToSixtyS}s</span>
                </div>
                <div className="p-3 bg-white/60 rounded border border-black/5">
                  <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Power-To-Weight</span>
                  <span className="text-xl font-extrabold text-[#C63A16]">{powerToWeightRatio} <span className="text-xs font-normal text-neutral-500">hp/ton</span></span>
                </div>
              </div>
            </div>

            {/* Action CTAs */}
            <div className="mt-8 flex gap-4">
              <GlassButton
                variant={saved ? 'secondary' : 'primary'}
                onClick={() => toggleSave(car.id)}
                className="flex-1 text-xs py-3"
                icon={<Flame className={`w-4 h-4 ${saved ? 'text-[#C63A16] fill-current' : 'text-white'}`} />}
              >
                {saved ? 'Saved in Garage' : 'Add to Garage'}
              </GlassButton>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Technical Spec Sheet Breakdown */}
      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Section 1: Performance Metrics */}
        <div className="glass-panel p-6 rounded-sm border border-black/10">
          <div className="flex items-center gap-2 mb-6 pb-3 border-b border-black/10">
            <Zap className="w-5 h-5 text-[#C63A16]" />
            <h3 className="font-extrabold text-[#14110f] uppercase tracking-wide font-sans text-lg">
              Performance Dynamics
            </h3>
          </div>

          <ul className="space-y-4 font-mono text-xs">
            <li className="flex justify-between items-center py-1 border-b border-black/5">
              <span className="text-neutral-500 uppercase">Horsepower</span>
              <span className="font-bold text-[#14110f] text-sm">{car.horsepower} HP</span>
            </li>
            <li className="flex justify-between items-center py-1 border-b border-black/5">
              <span className="text-neutral-500 uppercase">Peak Torque</span>
              <span className="font-bold text-[#14110f] text-sm">{car.torqueLbFt} lb-ft</span>
            </li>
            <li className="flex justify-between items-center py-1 border-b border-black/5">
              <span className="text-neutral-500 uppercase">0–60 MPH Sprint</span>
              <span className="font-bold text-[#14110f] text-sm">{car.zeroToSixtyS} seconds</span>
            </li>
            <li className="flex justify-between items-center py-1 border-b border-black/5">
              <span className="text-neutral-500 uppercase">Top Speed</span>
              <span className="font-bold text-[#14110f] text-sm">{car.topSpeedMph} MPH</span>
            </li>
            <li className="flex justify-between items-center py-1">
              <span className="text-neutral-500 uppercase">Prestige Score</span>
              <span className="font-bold text-[#C63A16] text-sm">{car.prestige ?? 5} / 10</span>
            </li>
          </ul>
        </div>

        {/* Section 2: Engine & Transmission */}
        <div className="glass-panel p-6 rounded-sm border border-black/10">
          <div className="flex items-center gap-2 mb-6 pb-3 border-b border-black/10">
            <Cpu className="w-5 h-5 text-[#14110f]" />
            <h3 className="font-extrabold text-[#14110f] uppercase tracking-wide font-sans text-lg">
              Powertrain & Chassis
            </h3>
          </div>

          <ul className="space-y-4 font-mono text-xs">
            <li className="flex justify-between items-center py-1 border-b border-black/5">
              <span className="text-neutral-500 uppercase">Engine Type</span>
              <span className="font-bold text-[#14110f] text-right">{car.engine.type}</span>
            </li>
            <li className="flex justify-between items-center py-1 border-b border-black/5">
              <span className="text-neutral-500 uppercase">Displacement</span>
              <span className="font-bold text-[#14110f]">
                {car.engine.displacementL ? `${car.engine.displacementL} Liters` : 'Electric'}
              </span>
            </li>
            <li className="flex justify-between items-center py-1 border-b border-black/5">
              <span className="text-neutral-500 uppercase">Cylinders</span>
              <span className="font-bold text-[#14110f]">{car.engine.cylinders ?? 'N/A (EV)'}</span>
            </li>
            <li className="flex justify-between items-center py-1 border-b border-black/5">
              <span className="text-neutral-500 uppercase">Engine Layout</span>
              <span className="font-bold text-[#14110f]">{car.engine.layout}</span>
            </li>
            <li className="flex justify-between items-center py-1">
              <span className="text-neutral-500 uppercase">Transmission</span>
              <span className="font-bold text-[#14110f] text-right">{car.transmission}</span>
            </li>
          </ul>
        </div>

        {/* Section 3: Physical & Market Value */}
        <div className="glass-panel p-6 rounded-sm border border-black/10">
          <div className="flex items-center gap-2 mb-6 pb-3 border-b border-black/10">
            <Gauge className="w-5 h-5 text-[#14110f]" />
            <h3 className="font-extrabold text-[#14110f] uppercase tracking-wide font-sans text-lg">
              Dimensions & Value
            </h3>
          </div>

          <ul className="space-y-4 font-mono text-xs">
            <li className="flex justify-between items-center py-1 border-b border-black/5">
              <span className="text-neutral-500 uppercase">Curb Weight</span>
              <span className="font-bold text-[#14110f]">{car.weightLbs.toLocaleString()} lbs</span>
            </li>
            <li className="flex justify-between items-center py-1 border-b border-black/5">
              <span className="text-neutral-500 uppercase">Power-To-Weight</span>
              <span className="font-bold text-[#C63A16]">{powerToWeightRatio} hp/ton</span>
            </li>
            <li className="flex justify-between items-center py-1 border-b border-black/5">
              <span className="text-neutral-500 uppercase">Drivetrain</span>
              <span className="font-bold text-[#14110f]">{car.drivetrain}</span>
            </li>
            <li className="flex justify-between items-center py-1 border-b border-black/5">
              <span className="text-neutral-500 uppercase">Country</span>
              <span className="font-bold text-[#14110f]">{car.country}</span>
            </li>
            <li className="flex justify-between items-center py-1">
              <span className="text-neutral-500 uppercase">Base MSRP</span>
              <span className="font-bold text-[#C63A16]">${car.priceUsd.toLocaleString()}</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Engineering History & Blurb */}
      <div className="mt-8 glass-panel p-8 rounded-sm border border-black/10">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-[#C63A16]" />
          <h3 className="text-lg font-bold uppercase tracking-tight text-[#14110f] font-sans">
            Engineering & Legacy Overview
          </h3>
        </div>
        <p className="text-sm sm:text-base text-neutral-700 leading-relaxed font-normal">
          {car.blurb}
        </p>
      </div>
    </div>
  );
};
