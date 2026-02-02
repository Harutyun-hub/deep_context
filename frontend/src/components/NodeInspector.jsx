import { X, ExternalLink, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';

export function NodeInspector({ node, onClose, isCollapsed, onToggleCollapse }) {
  if (!node && !isCollapsed) return null;

  if (isCollapsed) {
    return (
      <div className="fixed right-6 top-28 z-40">
        <button
          onClick={onToggleCollapse}
          className="w-10 h-10 bg-slate-950/40 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl flex items-center justify-center hover:bg-white/10 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-white/70" />
        </button>
      </div>
    );
  }

  if (!node) return null;

  const nodeLabel = node.label || node.name || node.id;
  const nodeType = node.group || 'Unknown';
  const connections = node.neighbors?.size || 0;

  return (
    <div className="fixed right-6 top-28 bottom-6 w-96 bg-slate-950/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col z-40 overflow-hidden">
      <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: node.color || '#a855f7' }}
          />
          <h2 className="text-white/90 font-semibold">{nodeLabel}</h2>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4 text-white/70" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
        
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/60 text-xs uppercase tracking-wider">Node Type</span>
            <span 
              className="px-2 py-0.5 rounded text-xs font-medium"
              style={{ 
                backgroundColor: nodeType === 'Brand' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(168, 85, 247, 0.2)',
                color: nodeType === 'Brand' ? '#3b82f6' : '#a855f7'
              }}
            >
              {nodeType}
            </span>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/60 text-xs uppercase tracking-wider">Connections</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-bold text-white">{connections}</div>
          <div className="text-white/40 text-xs mt-1">
            {nodeType === 'Brand' ? 'Connected topics' : 'Connected brands'}
          </div>
        </div>

        {nodeType === 'Topic' && (
          <div className="space-y-3">
            <div className="text-white/70 text-sm font-medium">Strategy Context</div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-white/80 text-sm leading-relaxed">
                This topic is connected to multiple brands in the competitive landscape.
                Node size reflects relative market importance based on ad volume.
              </p>
            </div>
          </div>
        )}

        {nodeType === 'Brand' && (
          <div className="space-y-3">
            <div className="text-white/70 text-sm font-medium">Brand Overview</div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-white/80 text-sm leading-relaxed">
                This brand is actively advertising across {connections} topics.
                Click on connected topic nodes to explore their advertising strategy.
              </p>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <div className="text-white/70 text-sm font-medium">Node Details</div>
          <div className="space-y-2">
            <div className="flex items-center justify-between px-3 py-2 bg-white/5 rounded-lg">
              <span className="text-white/60 text-xs">ID</span>
              <span className="text-white/80 text-xs font-mono truncate max-w-[200px]">{node.id}</span>
            </div>
            {node.radius && (
              <div className="flex items-center justify-between px-3 py-2 bg-white/5 rounded-lg">
                <span className="text-white/60 text-xs">Size (Volume)</span>
                <span className="text-white/80 text-xs">{node.radius}</span>
              </div>
            )}
          </div>
        </div>

        {nodeType === 'Topic' && (
          <div className="space-y-3">
            <div className="text-white/70 text-sm font-medium">Sentiment Distribution</div>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500/50" style={{ width: '35%' }} />
                </div>
                <span className="text-white/60 text-xs">35%</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500/50" style={{ width: '45%' }} />
                </div>
                <span className="text-white/60 text-xs">45%</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-gray-500" />
                <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-gray-500/50" style={{ width: '20%' }} />
                </div>
                <span className="text-white/60 text-xs">20%</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
