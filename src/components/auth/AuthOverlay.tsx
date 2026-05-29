import { motion } from 'motion/react';
import { X, LogIn, ShieldCheck } from 'lucide-react';

interface AuthOverlayProps {
  onClose: () => void;
  onSignIn: () => void;
  error?: string | null;
}

export function AuthOverlay({ onClose, onSignIn, error }: AuthOverlayProps) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-xl z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white w-full max-w-sm rounded-[3rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] relative border border-slate-200/50"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 text-slate-300 hover:text-slate-900 transition-all p-2 hover:bg-slate-50 rounded-2xl"
        >
          <X size={24} />
        </button>

        <div className="p-10 text-center pt-20">
          <div className="w-24 h-24 bg-blue-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-white shadow-2xl shadow-blue-600/30">
            <ShieldCheck size={48} strokeWidth={1.5} />
          </div>
          
          <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Access TheNetFace</h2>
          <p className="text-slate-500 text-sm mb-12 leading-relaxed px-6 font-medium">
            Join the elite hybrid social network. Secure environment optimized for architects.
          </p>

          <div className="space-y-5">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-red-50 text-red-600 px-5 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest border border-red-100"
              >
                {error}
              </motion.div>
            )}
            
            <button
              id="signin-btn-overlay"
              onClick={onSignIn}
              className="w-full bg-slate-900 text-white font-bold py-5 rounded-[1.5rem] flex items-center justify-center gap-4 hover:bg-black transition-all shadow-2xl shadow-slate-900/20 active:scale-95"
            >
              <LogIn size={20} />
              Continue with Google
            </button>
            <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] pt-6 font-black leading-none text-center">
              Verified Gateway Protocol
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
