import { X, ExternalLink, TrendingUp } from 'lucide-react';

interface NodeInspectorProps {
  node?: any;
  onClose: () => void;
}

const SAMPLE_ADS = [
  {
    id: 1,
    text: "Special student rate: 2% annual interest for high achievers. Limited time offer!",
    source: "Facebook Ad - Dec 15, 2024"
  },
  {
    id: 2,
    text: "Subsidized loans for students with GPA > 3.0. Apply now and save thousands.",
    source: "Instagram Sponsored - Dec 12, 2024"
  },
  {
    id: 3,
    text: "Fast Bank: Your education partner. 2% rate for qualified students, no hidden fees.",
    source: "Google Ads - Dec 10, 2024"
  }
];

export function NodeInspector({ node, onClose }: NodeInspectorProps) {
  if (!node) return null;

  return (
    <div className="fixed right-6 top-28 bottom-6 w-96 bg-slate-950/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col z-40 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-purple-400" />
          <h2 className="text-white/90 font-semibold">{node.name}</h2>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4 text-white/70" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
        
        {/* Ad Volume Metric */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/60 text-xs uppercase tracking-wider">Ad Volume</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-bold text-white">45</div>
          <div className="text-white/40 text-xs mt-1">Ads in last 7 days</div>
        </div>

        {/* Strategy Context */}
        <div className="space-y-3">
          <div className="text-white/70 text-sm font-medium">Strategy Context</div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-white/80 text-sm leading-relaxed">
              Subsidized 2% annual rate available for students with GPA {">"} 3.0. 
              This offer targets high-performing students with competitive rates, 
              emphasizing academic achievement as a qualification criterion.
            </p>
          </div>
        </div>

        {/* Evidence Section */}
        <div className="space-y-3">
          <div className="text-white/70 text-sm font-medium">Evidence</div>
          <div className="space-y-3">
            {SAMPLE_ADS.map((ad) => (
              <div
                key={ad.id}
                className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors group"
              >
                <p className="text-white/80 text-sm leading-relaxed mb-3">
                  "{ad.text}"
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-white/40 text-xs">{ad.source}</span>
                  <button className="flex items-center gap-1 text-purple-400 text-xs hover:text-purple-300 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>View Source</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Related Brands */}
        <div className="space-y-3">
          <div className="text-white/70 text-sm font-medium">Related Brands</div>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1.5 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs">
              Fast Bank
            </span>
            <span className="px-3 py-1.5 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs">
              Ameriabank
            </span>
          </div>
        </div>

        {/* Sentiment Distribution */}
        <div className="space-y-3">
          <div className="text-white/70 text-sm font-medium">Sentiment Distribution</div>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-red-500/50" style={{ width: '65%' }} />
              </div>
              <span className="text-white/60 text-xs">65%</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500/50" style={{ width: '25%' }} />
              </div>
              <span className="text-white/60 text-xs">25%</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-gray-500" />
              <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gray-500/50" style={{ width: '10%' }} />
              </div>
              <span className="text-white/60 text-xs">10%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
