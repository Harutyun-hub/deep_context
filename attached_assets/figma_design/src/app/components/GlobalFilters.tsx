import { Calendar, ChevronDown } from 'lucide-react';
import { Checkbox } from '@/app/components/ui/checkbox';
import { Switch } from '@/app/components/ui/switch';
import { Slider } from '@/app/components/ui/slider';
import { useState } from 'react';

const BRANDS = [
  { name: 'Fast Bank', count: 840 },
  { name: 'Ameriabank', count: 623 },
  { name: 'ID Bank', count: 512 },
  { name: 'VTB Armenia', count: 387 },
];

const SENTIMENTS = [
  { name: 'Negative', color: 'bg-red-500' },
  { name: 'Positive', color: 'bg-emerald-500' },
  { name: 'Neutral', color: 'bg-gray-500' },
];

const TACTICS = ['Scarcity', 'Authority', 'Social Proof'];

const TOPIC_CATEGORIES = [
  'Service Quality',
  'Interest Rates',
  'App Stability',
  'Customer Support',
  'Security Features',
];

const TIMEFRAMES = ['Last 24h', 'Last 7 Days', 'Last Month', 'Custom'];

export function GlobalFilters() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('Last 7 Days');
  const [selectedBrands, setSelectedBrands] = useState<string[]>(['Fast Bank', 'Ameriabank']);
  const [selectedSentiments, setSelectedSentiments] = useState<string[]>(['Negative']);
  const [selectedTactics, setSelectedTactics] = useState<string[]>(['Scarcity']);
  const [selectedTopics, setSelectedTopics] = useState<string[]>(['Service Quality', 'Interest Rates']);
  const [showCustomDate, setShowCustomDate] = useState(false);
  const [connectionStrength, setConnectionStrength] = useState([50]);

  const handleTimeframeClick = (timeframe: string) => {
    setSelectedTimeframe(timeframe);
    if (timeframe === 'Custom') {
      setShowCustomDate(true);
    } else {
      setShowCustomDate(false);
    }
  };

  return (
    <div className="fixed left-6 top-28 bottom-6 w-80 bg-slate-950/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col z-40 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/10">
        <h2 className="text-white/90 font-semibold">Global Filters</h2>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
        
        {/* Timeframe Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-white/70 text-sm">
            <Calendar className="w-4 h-4" />
            <span>Timeframe</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {TIMEFRAMES.map((timeframe) => (
              <button
                key={timeframe}
                onClick={() => handleTimeframeClick(timeframe)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  selectedTimeframe === timeframe
                    ? 'bg-purple-500/30 border border-purple-500/50 text-purple-300 shadow-lg shadow-purple-500/20'
                    : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10'
                }`}
              >
                {timeframe}
              </button>
            ))}
          </div>
          {showCustomDate && (
            <div className="mt-2">
              <input
                type="date"
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/80 hover:bg-white/10"
              />
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-px bg-white/10" />

        {/* Brand Source Section */}
        <div className="space-y-3">
          <div className="text-white/70 text-sm font-medium">Brand Source</div>
          <div className="space-y-2">
            {BRANDS.map((brand) => (
              <label
                key={brand.name}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 cursor-pointer transition-colors group"
              >
                <Checkbox
                  checked={selectedBrands.includes(brand.name)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedBrands([...selectedBrands, brand.name]);
                    } else {
                      setSelectedBrands(selectedBrands.filter(b => b !== brand.name));
                    }
                  }}
                  className="border-white/30 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
                />
                <span className="flex-1 text-white/80 text-sm group-hover:text-white">{brand.name}</span>
                <span className="text-white/40 text-xs">({brand.count})</span>
              </label>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/10" />

        {/* Connection Strength Section - MOVED HERE */}
        <div className="space-y-3">
          <div className="text-white/70 text-sm font-medium">Connection Strength</div>
          <div className="px-3 py-3 rounded-lg bg-white/5 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/40 text-xs">Low</span>
              <span className="text-purple-400 text-xs font-medium">{connectionStrength[0]}%</span>
              <span className="text-white/40 text-xs">High</span>
            </div>
            <Slider
              value={connectionStrength}
              onValueChange={setConnectionStrength}
              max={100}
              step={1}
              className="w-full"
            />
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/10" />

        {/* Sentiment Filter Section */}
        <div className="space-y-3">
          <div className="text-white/70 text-sm font-medium">Sentiment Filter</div>
          <div className="space-y-2">
            {SENTIMENTS.map((sentiment) => (
              <label
                key={sentiment.name}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${sentiment.color}`} />
                  <span className="text-white/80 text-sm">{sentiment.name}</span>
                </div>
                <Switch
                  checked={selectedSentiments.includes(sentiment.name)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedSentiments([...selectedSentiments, sentiment.name]);
                    } else {
                      setSelectedSentiments(selectedSentiments.filter(s => s !== sentiment.name));
                    }
                  }}
                  className="data-[state=checked]:bg-purple-500"
                />
              </label>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/10" />

        {/* Marketing Tactic Section */}
        <div className="space-y-3">
          <div className="text-white/70 text-sm font-medium">Marketing Tactic</div>
          <div className="flex flex-wrap gap-2">
            {TACTICS.map((tactic) => (
              <button
                key={tactic}
                onClick={() => {
                  if (selectedTactics.includes(tactic)) {
                    setSelectedTactics(selectedTactics.filter(t => t !== tactic));
                  } else {
                    setSelectedTactics([...selectedTactics, tactic]);
                  }
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selectedTactics.includes(tactic)
                    ? 'bg-purple-500/30 border border-purple-500/50 text-purple-300'
                    : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10'
                }`}
              >
                {tactic}
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/10" />

        {/* Topic Category Section */}
        <div className="space-y-3">
          <div className="text-white/70 text-sm font-medium">Topic Category</div>
          <div className="space-y-2">
            {TOPIC_CATEGORIES.map((topic) => (
              <label
                key={topic}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 cursor-pointer transition-colors group"
              >
                <Checkbox
                  checked={selectedTopics.includes(topic)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedTopics([...selectedTopics, topic]);
                    } else {
                      setSelectedTopics(selectedTopics.filter(t => t !== topic));
                    }
                  }}
                  className="border-white/30 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
                />
                <span className="flex-1 text-white/80 text-sm group-hover:text-white">{topic}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-white/10 flex gap-2">
        <button className="flex-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/70 text-sm hover:bg-white/10 transition-colors">
          Reset
        </button>
        <button className="flex-1 px-4 py-2 rounded-lg bg-purple-500 text-white text-sm font-medium hover:bg-purple-600 transition-colors">
          Apply
        </button>
      </div>
    </div>
  );
}