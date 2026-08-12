import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, RotateCcw, Flame, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { allCars, filterCars, getAvailableBrands, getStatRanges, FilterParams, formatCompactPrice } from '../data/carsData';
import { GlassButton } from '../components/ui/GlassButton';
import { useGarageStore } from '../store/useGarageStore';
import { useDocumentHead } from '../hooks/useDocumentHead';

export const CatalogPage: React.FC = () => {
  const { isSaved, toggleSave } = useGarageStore();
  useDocumentHead(
    'Full Car Catalog — APEX',
    `Browse and filter ${allCars.length} sports cars, supercars, and hypercars by power, speed, price, and more.`
  );

  // Compute stat bounds across full dataset
  const bounds = useMemo(() => getStatRanges(allCars), []);
  const availableBrands = useMemo(() => getAvailableBrands(allCars), []);

  // Filter State
  const [category, setCategory] = useState<'all' | 'normal' | 'luxury' | 'hyper' | 'f1'>('all');
  const [search, setSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [minHp, setMinHp] = useState<number>(bounds.minHp);
  const [maxHp, setMaxHp] = useState<number>(bounds.maxHp);
  const [minPrice, setMinPrice] = useState<number>(bounds.minPrice);
  const [maxPrice, setMaxPrice] = useState<number>(bounds.maxPrice);
  const [sortBy, setSortBy] = useState<'horsepower' | 'price' | 'topSpeed' | 'year'>('horsepower');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filtered dataset
  const filteredCars = useMemo(() => {
    const params: FilterParams = {
      category,
      search,
      brand: selectedBrand,
      minHp: minHp > bounds.minHp ? minHp : undefined,
      maxHp: maxHp < bounds.maxHp ? maxHp : undefined,
      minPrice: minPrice > bounds.minPrice ? minPrice : undefined,
      maxPrice: maxPrice < bounds.maxPrice ? maxPrice : undefined,
      sortBy,
      sortOrder,
    };
    return filterCars(params);
  }, [category, search, selectedBrand, minHp, maxHp, minPrice, maxPrice, sortBy, sortOrder, bounds]);

  // Counts per category
  const categoryCounts = useMemo(() => {
    return {
      all: allCars.length,
      normal: allCars.filter((c) => c.category === 'normal').length,
      luxury: allCars.filter((c) => c.category === 'luxury').length,
      hyper: allCars.filter((c) => c.category === 'hyper').length,
      f1: allCars.filter((c) => c.category === 'f1').length,
    };
  }, []);

  const handleResetFilters = () => {
    setCategory('all');
    setSearch('');
    setSelectedBrand('all');
    setMinHp(bounds.minHp);
    setMaxHp(bounds.maxHp);
    setMinPrice(bounds.minPrice);
    setMaxPrice(bounds.maxPrice);
    setSortBy('horsepower');
    setSortOrder('desc');
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-black/10">
        <div>
          <div className="text-xs font-mono font-bold tracking-widest text-[#C63A16] uppercase">
            AUTOMOTIVE CATALOG
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#14110f] uppercase tracking-tight mt-0.5">
            Car Catalog
          </h1>
        </div>
        <div className="text-xs font-mono text-neutral-500 flex items-center gap-2">
          <span>Showing <strong className="text-[#14110f] font-bold">{filteredCars.length}</strong> of {allCars.length} Cars</span>
        </div>
      </div>

      {/* Filter & Control Bar */}
      <div className="mt-8 flex flex-col gap-6">
        {/* Top Row: Category Tabs + Search Input */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Category Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-black/5 rounded-sm overflow-x-auto">
            {(['all', 'normal', 'luxury', 'hyper', 'f1'] as const).map((cat) => {
              const active = category === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-2 rounded-sm text-xs font-mono font-bold uppercase tracking-wider transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
                    active
                      ? 'bg-[#14110f] text-white shadow-sm'
                      : 'text-neutral-600 hover:text-[#14110f] hover:bg-black/5'
                  }`}
                >
                  <span>{cat}</span>
                  <span
                    className={`px-1.5 py-0.2 text-[10px] rounded ${
                      active ? 'bg-[#C63A16] text-white' : 'bg-black/10 text-neutral-600'
                    }`}
                  >
                    {categoryCounts[cat]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by brand, model, or country..."
              className="w-full pl-10 pr-4 py-2.5 bg-white/80 border border-black/15 rounded-sm text-xs font-mono placeholder:text-neutral-400 focus:outline-none focus:border-[#14110f] focus:ring-1 focus:ring-[#14110f] shadow-sm transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-neutral-400 hover:text-[#14110f]"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Secondary Filter Controls Panel */}
        <div className="glass-panel p-5 rounded-sm border border-black/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Brand Filter */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-500">
              Brand / Manufacturer
            </label>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full bg-white border border-black/15 rounded-sm px-3 py-2 text-xs font-mono text-[#14110f] focus:outline-none focus:border-[#14110f]"
            >
              <option value="all">All Brands ({availableBrands.length})</option>
              {availableBrands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Horsepower Range */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-500">
              <span>Horsepower (HP)</span>
              <span className="text-[#C63A16]">{minHp} - {maxHp} HP</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={bounds.minHp}
                max={bounds.maxHp}
                value={maxHp}
                onChange={(e) => setMaxHp(Number(e.target.value))}
                className="w-full accent-[#C63A16] cursor-pointer"
              />
            </div>
          </div>

          {/* Price Range */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-500">
              <span>Price Limit</span>
              <span className="text-[#C63A16]">Max ${formatCompactPrice(maxPrice)}</span>
            </div>
            <input
              type="range"
              min={bounds.minPrice}
              max={bounds.maxPrice}
              step={25000}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-[#C63A16] cursor-pointer"
            />
          </div>

          {/* Sort Control */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1">
              <ArrowUpDown className="w-3 h-3" />
              <span>Sort Cars By</span>
            </label>
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full bg-white border border-black/15 rounded-sm px-3 py-2 text-xs font-mono text-[#14110f] focus:outline-none focus:border-[#14110f]"
              >
                <option value="horsepower">Horsepower</option>
                <option value="price">Price (MSRP)</option>
                <option value="topSpeed">Top Speed</option>
                <option value="year">Model Year</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                title={`Sort ${sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
                className="px-3 py-2 bg-white border border-black/15 rounded-sm text-xs font-mono font-bold hover:bg-black/5"
              >
                {sortOrder.toUpperCase()}
              </button>
            </div>
          </div>
        </div>

        {/* Reset Filters Bar */}
        {(search || selectedBrand !== 'all' || category !== 'all' || maxHp < bounds.maxHp || maxPrice < bounds.maxPrice) && (
          <div className="flex items-center justify-between px-4 py-2 bg-black/5 rounded-sm text-xs font-mono">
            <span className="text-neutral-600">Active filters applied</span>
            <button
              onClick={handleResetFilters}
              className="text-[#C63A16] hover:underline font-bold flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset All Filters</span>
            </button>
          </div>
        )}
      </div>

      {/* Grid Section */}
      {filteredCars.length === 0 ? (
        <div className="my-16 p-12 glass-panel rounded-sm text-center flex flex-col items-center justify-center">
          <SlidersHorizontal className="w-12 h-12 text-neutral-300 mb-4" />
          <h3 className="text-xl font-bold uppercase text-[#14110f]">
            No Cars Match Your Search Criteria
          </h3>
          <p className="text-xs text-neutral-600 max-w-md mt-2 mb-6 font-normal">
            Try adjusting your search terms, horsepower limits, or brand filters to browse available cars.
          </p>
          <GlassButton onClick={handleResetFilters} variant="primary" icon={<RotateCcw className="w-4 h-4 text-white" />}>
            Reset Filters
          </GlassButton>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredCars.map((car) => {
              const saved = isSaved(car.id);
              return (
                <motion.div
                  key={car.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="glass-panel group rounded-sm overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl border border-black/10"
                >
                  {/* Image Header */}
                  <div className="relative h-48 w-full overflow-hidden bg-neutral-100">
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

                  {/* Body Specs */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="text-[11px] font-mono uppercase tracking-widest text-neutral-500">
                        {car.brand} &bull; {car.year} &bull; {car.country}
                      </div>
                      <h3 className="text-lg font-extrabold text-[#14110f] tracking-tight mt-0.5 font-sans leading-tight">
                        {car.model}
                      </h3>
                    </div>

                    {/* Stat Matrix */}
                    <div className="grid grid-cols-2 gap-2.5 my-4 pt-3 border-t border-black/5 font-mono text-xs">
                      <div>
                        <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Power</span>
                        <span className="font-bold text-[#14110f]">{car.horsepower} HP</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Top Speed</span>
                        <span className="font-bold text-[#14110f] text-[11px] sm:text-xs whitespace-nowrap tracking-tight block">{car.topSpeedMph} MPH / {Math.round(car.topSpeedMph * 1.60934)} KPH</span>
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
                              {car.weightLbs.toLocaleString()} lbs / {Math.round(car.weightLbs * 0.45359237)} kg
                            </span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">0-60 MPH</span>
                            <span className="font-bold text-[#14110f]">{car.zeroToSixtyS !== null ? `${car.zeroToSixtyS}s` : 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Price</span>
                            <span className="font-bold text-[#C63A16]">{car.priceUsd !== null ? `$${car.priceUsd.toLocaleString()}` : 'N/A'}</span>
                          </div>
                        </>
                      )}
                    </div>

                    <GlassButton to={`/car/${car.id}`} variant="secondary" className="w-full text-xs py-2.5">
                      Full Specs
                    </GlassButton>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
