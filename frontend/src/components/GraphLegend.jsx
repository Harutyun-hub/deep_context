import { ChevronDown, ChevronUp, Info } from 'lucide-react';
import { useState } from 'react';

export function GraphLegend() {
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-950/60 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-40 overflow-hidden">
      <div 
        className="px-4 py-2.5 flex items-center gap-3 cursor-pointer hover:bg-white/5 transition-colors" 
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center gap-2">
          <span className="text-white/80 text-sm font-medium">Legend</span>
          <Info className="w-3 h-3 text-white/30" />
        </div>
        <button className="w-5 h-5 rounded bg-white/10 border border-white/10 flex items-center justify-center transition-colors">
          {isCollapsed ? (
            <ChevronUp className="w-3 h-3 text-white/60" />
          ) : (
            <ChevronDown className="w-3 h-3 text-white/60" />
          )}
        </button>
      </div>

      {!isCollapsed && (
        <div className="px-4 py-3 border-t border-white/10">
          <div className="flex gap-8">
            <div className="space-y-2">
              <div className="text-white/50 text-xs uppercase tracking-wider font-medium">Node Types</div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-white/70 text-xs">Brands</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500" />
                  <span className="text-white/70 text-xs">Topics</span>
                </div>
              </div>
            </div>

            <div className="w-px bg-white/10" />

            <div className="space-y-2">
              <div className="text-white/50 text-xs uppercase tracking-wider font-medium">Connection Volume</div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-px bg-white/30 rounded" />
                  <span className="text-white/50 text-xs">Low</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-0.5 bg-white/50 rounded" />
                  <span className="text-white/50 text-xs">Medium</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-1 bg-white/70 rounded" />
                  <span className="text-white/50 text-xs">High</span>
                </div>
              </div>
              <div className="pt-2">
                <p className="text-white/30 text-[10px] leading-relaxed max-w-[160px]">
                  Line thickness indicates frequency of mentions/interactions between nodes
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
