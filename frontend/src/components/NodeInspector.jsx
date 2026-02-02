import { X, TrendingUp } from 'lucide-react';

const SAMPLE_ADS = [
  {
    id: 1,
    text: "Special student rate: 2% annual interest for high achievers. Limited time offer!",
    source: "Facebook Ad",
    date: "Dec 15, 2024"
  },
  {
    id: 2,
    text: "Subsidized loans for students with GPA > 3.0. Apply now and save thousands.",
    source: "Instagram Sponsored",
    date: "Dec 12, 2024"
  }
];

export function NodeInspector({ node, onClose }) {
  if (!node) return null;

  const nodeLabel = node.label || node.name || node.id;
  const nodeType = node.group || 'Topic';

  return (
    <div className="fixed right-6 top-24 bottom-6 w-72 bg-slate-950/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col z-40 overflow-hidden">
      <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div 
            className="w-2.5 h-2.5 rounded-full" 
            style={{ backgroundColor: nodeType === 'Brand' ? '#3b82f6' : '#a855f7' }}
          />
          <h2 className="text-white font-semibold text-sm">{nodeLabel}</h2>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-colors"
        >
          <X className="w-3.5 h-3.5 text-white/60" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-white/50 text-xs uppercase tracking-wider">AD VOLUME</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-3xl font-bold text-white">45</div>
          <div className="text-white/40 text-xs mt-0.5">Ads in last 7 days</div>
        </div>

        <div className="space-y-2">
          <div className="text-white/60 text-xs font-medium">Strategy Context</div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-white/70 text-sm leading-relaxed">
              Subsidized 2% annual rate available for students with GPA {">"} 3.0. 
              This offer targets high-performing students with competitive rates, 
              emphasizing academic achievement as a qualification criterion.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-white/60 text-xs font-medium">Evidence</div>
          <div className="space-y-3">
            {SAMPLE_ADS.map((ad) => (
              <div
                key={ad.id}
                className="bg-white/5 border border-white/10 rounded-xl p-4"
              >
                <p className="text-white/70 text-sm leading-relaxed mb-3">
                  "{ad.text}"
                </p>
                <div className="text-xs">
                  <span className="text-orange-400">{ad.source}</span>
                  <span className="text-orange-400"> - {ad.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
