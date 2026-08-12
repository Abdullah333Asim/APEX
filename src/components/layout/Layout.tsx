import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { DiffractionField } from '../ui/DiffractionField';
import { Navbar } from './Navbar';
import { Toast } from '../ui/Toast';

export const Layout: React.FC = () => {
  const location = useLocation();

  return (
    <div className="relative min-h-screen flex flex-col bg-white text-[#14110f] selection:bg-[#C63A16] selection:text-white">
      {/* Background canvas diffraction field */}
      <DiffractionField />

      {/* Sticky Navigation Header */}
      <Navbar />

      {/* Main Content Viewport with Route Transitions */}
      <main className="relative z-10 flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="flex-1 flex flex-col"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Global Toast Notifications */}
      <Toast />

      {/* Footer (hidden on /bracket/play to keep elimination bracket clean) */}
      {location.pathname !== '/bracket/play' && (
        <footer className="relative z-10 border-t border-black/10 bg-white/50 backdrop-blur-sm py-8 text-center text-xs tracking-widest uppercase text-neutral-500 font-mono">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>APEX Automotive &copy; {new Date().getFullYear()}</div>
            <div className="flex items-center gap-6">
              <span>Precision Specs</span>
              <span className="text-[#C63A16]">&bull;</span>
              <span>Car Catalog & Elimination Bracket</span>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};
