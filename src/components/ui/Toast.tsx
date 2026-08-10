import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, X, Check, Trash2 } from 'lucide-react';
import { useGarageStore } from '../../store/useGarageStore';

export const Toast: React.FC = () => {
  const { toastMessage, toastType, clearToast } = useGarageStore();

  return (
    <AnimatePresence>
      {toastMessage && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-sm bg-[#14110f] text-white border border-white/20 shadow-2xl backdrop-blur-md font-mono text-xs max-w-md"
        >
          <div
            className={`w-7 h-7 rounded flex items-center justify-center font-bold ${
              toastType === 'add'
                ? 'bg-[#C63A16] text-white'
                : toastType === 'remove'
                ? 'bg-white/10 text-neutral-300'
                : 'bg-red-500/20 text-red-400'
            }`}
          >
            {toastType === 'add' ? (
              <Flame className="w-4 h-4 fill-current animate-pulse" />
            ) : toastType === 'remove' ? (
              <Check className="w-4 h-4 text-white" />
            ) : (
              <Trash2 className="w-4 h-4 text-red-400" />
            )}
          </div>

          <span className="flex-1 font-medium">{toastMessage}</span>

          <button
            onClick={clearToast}
            className="p-1 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
