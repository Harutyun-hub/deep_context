import { Calendar } from 'lucide-react';
import { Checkbox } from './ui/Checkbox';
import { Switch } from './ui/Switch';
import { Slider } from './ui/Slider';

const SENTIMENTS = [
  { name: 'Positive', color: 'bg-emerald-500' },
  { name: 'Neutral', color: 'bg-amber-500' },
];

const TACTICS = ['Scarcity', 'Authority', 'Social Proof'];

const TOPIC_CATEGORIES = [
  'Service Quality',
  'Interest Rates',
  'App Stability',
  'Customer Support',
];

const TIMEFRAMES = ['Last 24h', 'Last 7 Days', 'Last Month', 'Custom'];

export function GlobalFilters({ 
  brands = [],
  topics = [],
  filters,
  onFilterChange
}) {
  const showCustomDate = filters.selectedTimeframe === 'Custom';

  const handleTimeframeClick = (timeframe) => {
    onFilterChange({ ...filters, selectedTimeframe: timeframe });
  };

  const handleBrandToggle = (brandName) => {
    const newBrands = filters.selectedBrands.includes(brandName)
      ? filters.selectedBrands.filter(b => b !== brandName)
      : [...filters.selectedBrands, brandName];
    onFilterChange({ ...filters, selectedBrands: newBrands });
  };

  const handleSentimentToggle = (sentiment) => {
    const newSentiments = filters.selectedSentiments.includes(sentiment)
      ? filters.selectedSentiments.filter(s => s !== sentiment)
      : [...filters.selectedSentiments, sentiment];
    onFilterChange({ ...filters, selectedSentiments: newSentiments });
  };

  const handleTacticToggle = (tactic) => {
    const newTactics = filters.selectedTactics?.includes(tactic)
      ? filters.selectedTactics.filter(t => t !== tactic)
      : [...(filters.selectedTactics || []), tactic];
    onFilterChange({ ...filters, selectedTactics: newTactics });
  };

  const handleTopicToggle = (topic) => {
    const newTopics = filters.selectedTopics.includes(topic)
      ? filters.selectedTopics.filter(t => t !== topic)
      : [...filters.selectedTopics, topic];
    onFilterChange({ ...filters, selectedTopics: newTopics });
  };

  const handleConnectionStrengthChange = (value) => {
    onFilterChange({ ...filters, connectionThreshold: value[0] });
  };

  const handleReset = () => {
    onFilterChange({
      selectedTimeframe: 'Last 7 Days',
      selectedBrands: [],
      selectedSentiments: [],
      selectedTactics: [],
      selectedTopics: [],
      connectionThreshold: 50
    });
  };

  return (
    <div className="fixed left-6 top-24 bottom-6 w-56 bg-slate-950/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col z-40 overflow-hidden">
      <div className="px-5 py-4 border-b border-white/10">
        <h2 className="text-white font-semibold text-base">Global Filters</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-white/60 text-xs font-medium">
            <Calendar className="w-3.5 h-3.5" />
            <span>Timeframe</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {TIMEFRAMES.map((timeframe) => (
              <button
                key={timeframe}
                onClick={() => handleTimeframeClick(timeframe)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  filters.selectedTimeframe === timeframe
                    ? 'bg-purple-500/40 border border-purple-400/50 text-white'
                    : 'bg-white/5 border border-white/10 text-white/50 hover:bg-white/10 hover:text-white/70'
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
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 text-xs"
              />
            </div>
          )}
        </div>

        <div className="h-px bg-white/5" />

        <div className="space-y-3">
          <div className="text-white/60 text-xs font-medium">Brand Source</div>
          <div className="space-y-1.5">
            {brands.slice(0, 4).map((brand) => (
              <label
                key={brand.name}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors group"
              >
                <Checkbox
                  checked={filters.selectedBrands.includes(brand.name)}
                  onCheckedChange={() => handleBrandToggle(brand.name)}
                />
                <span className="flex-1 text-white/80 text-sm">{brand.name}</span>
                <span className="text-white/30 text-xs">({brand.count})</span>
              </label>
            ))}
            {brands.length === 0 && (
              <div className="text-white/30 text-xs text-center py-2">Loading brands...</div>
            )}
          </div>
        </div>

        <div className="h-px bg-white/5" />

        <div className="space-y-3">
          <div className="text-white/60 text-xs font-medium">Connection Strength</div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-white/40 text-xs">Low</span>
              <span className="text-purple-400 text-xs font-medium">{filters.connectionThreshold}%</span>
              <span className="text-white/40 text-xs">High</span>
            </div>
            <Slider
              value={[filters.connectionThreshold]}
              onValueChange={handleConnectionStrengthChange}
              max={100}
              step={1}
              className="w-full"
            />
          </div>
        </div>

        <div className="h-px bg-white/5" />

        <div className="space-y-3">
          {SENTIMENTS.map((sentiment) => (
            <label
              key={sentiment.name}
              className="flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${sentiment.color}`} />
                <span className="text-white/80 text-sm">{sentiment.name}</span>
              </div>
              <Switch
                checked={filters.selectedSentiments.includes(sentiment.name)}
                onCheckedChange={() => handleSentimentToggle(sentiment.name)}
              />
            </label>
          ))}
        </div>

        <div className="h-px bg-white/5" />

        <div className="space-y-3">
          <div className="text-white/60 text-xs font-medium">Marketing Tactic</div>
          <div className="flex flex-wrap gap-2">
            {TACTICS.map((tactic) => (
              <button
                key={tactic}
                onClick={() => handleTacticToggle(tactic)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  filters.selectedTactics?.includes(tactic)
                    ? 'bg-purple-500/40 border border-purple-400/50 text-white'
                    : 'bg-white/5 border border-white/10 text-white/50 hover:bg-white/10'
                }`}
              >
                {tactic}
              </button>
            ))}
          </div>
        </div>

        <div className="h-px bg-white/5" />

        <div className="space-y-3">
          <div className="text-white/60 text-xs font-medium">Topic Category</div>
          <div className="space-y-1.5">
            {TOPIC_CATEGORIES.map((topic) => (
              <label
                key={topic}
                className="flex items-center gap-3 px-1 py-1.5 cursor-pointer transition-colors group"
              >
                <Checkbox
                  checked={filters.selectedTopics.includes(topic)}
                  onCheckedChange={() => handleTopicToggle(topic)}
                />
                <span className="flex-1 text-white/80 text-sm">{topic}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="px-5 py-4 border-t border-white/10 flex gap-2">
        <button 
          onClick={handleReset}
          className="flex-1 px-4 py-2.5 rounded-lg bg-transparent border border-white/10 text-white/60 text-sm hover:bg-white/5 hover:text-white/80 transition-colors"
        >
          Reset
        </button>
        <button className="flex-1 px-4 py-2.5 rounded-lg bg-purple-500 text-white text-sm font-medium hover:bg-purple-600 transition-colors">
          Apply
        </button>
      </div>
    </div>
  );
}
