import { ChevronDown, ChevronUp, Info } from 'lucide-react';
import { useState } from 'react';

export function GraphLegend() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-950/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-40 overflow-hidden">
      {/* Header */}
      <div 
        className="px-5 py-3 border-b border-white/10 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors" 
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center gap-2">
          <div className="text-white/90 text-sm font-medium">Legend</div>
          <Info className="w-3.5 h-3.5 text-white/40" />
        </div>
        <button className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-colors">
          {isCollapsed ? (
            <ChevronUp className="w-3 h-3 text-white/70" />
          ) : (
            <ChevronDown className="w-3 h-3 text-white/70" />
          )}
        </button>
      </div>

      {/* Content */}
      {!isCollapsed && (
        <div className="px-5 py-4">
          <div className="flex gap-8">
            {/* Node Types Column */}
            <div className="space-y-3">
              <div className="text-white/60 text-xs uppercase tracking-wider font-medium">Node Types</div>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-blue-400 shadow-lg shadow-blue-500/30" />
                  <span className="text-white/80 text-xs">Brands</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-purple-500 border-2 border-purple-400 shadow-lg shadow-purple-500/30" />
                  <span className="text-white/80 text-xs">Topics</span>
                </div>
              </div>
            </div>

            {/* Vertical Divider */}
            <div className="w-px bg-white/10" />

            {/* Connection Volume Column */}
            <div className="space-y-3">
              <div className="text-white/60 text-xs uppercase tracking-wider font-medium">Connection Volume</div>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-0.5 bg-white/20 rounded" />
                  <span className="text-white/60 text-xs">Low</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-1 bg-white/40 rounded" />
                  <span className="text-white/60 text-xs">Medium</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-1.5 bg-white/60 rounded" />
                  <span className="text-white/60 text-xs">High</span>
                </div>
              </div>
              <div className="pt-2 border-t border-white/10">
                <p className="text-white/40 text-[10px] leading-relaxed max-w-[180px]">
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
