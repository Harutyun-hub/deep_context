import { ZoomIn, ZoomOut, Maximize2, RotateCcw } from 'lucide-react';

export function FloatingControls() {
  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-40">
      <div className="bg-slate-950/40 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-2">
        <button className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-colors group">
          <ZoomIn className="w-4 h-4 text-white/70 group-hover:text-white" />
        </button>
      </div>
      <div className="bg-slate-950/40 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-2">
        <button className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-colors group">
          <ZoomOut className="w-4 h-4 text-white/70 group-hover:text-white" />
        </button>
      </div>
      <div className="bg-slate-950/40 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-2">
        <button className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-colors group">
          <Maximize2 className="w-4 h-4 text-white/70 group-hover:text-white" />
        </button>
      </div>
      <div className="bg-slate-950/40 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-2">
        <button className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-colors group">
          <RotateCcw className="w-4 h-4 text-white/70 group-hover:text-white" />
        </button>
      </div>
    </div>
  );
}
