import { ZoomIn, ZoomOut, Maximize2, RotateCcw } from 'lucide-react';

export function FloatingControls({ onZoomIn, onZoomOut, onFit, onReset }) {
  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-40">
      <div className="bg-slate-950/60 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-1.5 flex flex-col gap-1.5">
        <button 
          onClick={onZoomIn}
          className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center transition-colors group"
        >
          <ZoomIn className="w-4 h-4 text-white/50 group-hover:text-white/80" />
        </button>
        <button 
          onClick={onZoomOut}
          className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center transition-colors group"
        >
          <ZoomOut className="w-4 h-4 text-white/50 group-hover:text-white/80" />
        </button>
        <button 
          onClick={onFit}
          className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center transition-colors group"
        >
          <Maximize2 className="w-4 h-4 text-white/50 group-hover:text-white/80" />
        </button>
        <button 
          onClick={onReset}
          className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center transition-colors group"
        >
          <RotateCcw className="w-4 h-4 text-white/50 group-hover:text-white/80" />
        </button>
      </div>
    </div>
  );
}
