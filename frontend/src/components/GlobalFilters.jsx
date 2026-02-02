import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Checkbox } from './ui/Checkbox';
import { Switch } from './ui/Switch';
import { Slider } from './ui/Slider';

const SENTIMENTS = [
  { name: 'Negative', color: 'bg-red-500' },
  { name: 'Positive', color: 'bg-emerald-500' },
  { name: 'Neutral', color: 'bg-gray-500' },
];

const TIMEFRAMES = ['Last 24h', 'Last 7 Days', 'Last Month', 'Custom'];

export function GlobalFilters({ 
  brands = [],
  topics = [],
  filters,
  onFilterChange,
  isCollapsed,
  onToggleCollapse
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
      selectedTopics: [],
      connectionThreshold: 0
    });
  };

  if (isCollapsed) {
    return (
      <div className="fixed left-6 top-28 z-40">
        <button
          onClick={onToggleCollapse}
          className="w-10 h-10 bg-slate-950/40 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl flex items-center justify-center hover:bg-white/10 transition-colors"
        >
          <ChevronRight className="w-4 h-4 text-white/70" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed left-6 top-28 bottom-6 w-80 bg-slate-950/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col z-40 overflow-hidden">
      <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
        <h2 className="text-white/90 font-semibold">Global Filters</h2>
        <button
          onClick={onToggleCollapse}
          className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-colors"
        >
          <ChevronLeft className="w-3 h-3 text-white/70" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
        
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
                  filters.selectedTimeframe === timeframe
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

        <div className="h-px bg-white/10" />

        <div className="space-y-3">
          <div className="text-white/70 text-sm font-medium">Brand Source</div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {brands.map((brand) => (
              <label
                key={brand.name}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 cursor-pointer transition-colors group"
              >
                <Checkbox
                  checked={filters.selectedBrands.includes(brand.name)}
                  onCheckedChange={() => handleBrandToggle(brand.name)}
                />
                <span className="flex-1 text-white/80 text-sm group-hover:text-white">{brand.name}</span>
                <span className="text-white/40 text-xs">({brand.count})</span>
              </label>
            ))}
            {brands.length === 0 && (
              <div className="text-white/40 text-xs text-center py-2">Loading brands...</div>
            )}
          </div>
        </div>

        <div className="h-px bg-white/10" />

        <div className="space-y-3">
          <div className="text-white/70 text-sm font-medium">Connection Strength</div>
          <div className="px-3 py-3 rounded-lg bg-white/5 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/40 text-xs">Low</span>
              <span className="text-purple-400 text-xs font-medium">{filters.connectionThreshold}%</span>
              <span className="text-white/40 text-xs">High</span>
            </div>
            <Slider
              value={[filters.connectionThreshold]}
              onValueChange={handleConnectionStrengthChange}
              max={100}
              step={1}
            />
          </div>
        </div>

        <div className="h-px bg-white/10" />

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
                  checked={filters.selectedSentiments.includes(sentiment.name)}
                  onCheckedChange={() => handleSentimentToggle(sentiment.name)}
                />
              </label>
            ))}
          </div>
        </div>

        <div className="h-px bg-white/10" />

        <div className="space-y-3">
          <div className="text-white/70 text-sm font-medium">Topic Category</div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {topics.slice(0, 10).map((topic) => (
              <label
                key={topic}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 cursor-pointer transition-colors group"
              >
                <Checkbox
                  checked={filters.selectedTopics.includes(topic)}
                  onCheckedChange={() => handleTopicToggle(topic)}
                />
                <span className="flex-1 text-white/80 text-sm group-hover:text-white">{topic}</span>
              </label>
            ))}
            {topics.length === 0 && (
              <div className="text-white/40 text-xs text-center py-2">Loading topics...</div>
            )}
          </div>
        </div>
      </div>

      <div className="px-6 py-4 border-t border-white/10 flex gap-2">
        <button 
          onClick={handleReset}
          className="flex-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/70 text-sm hover:bg-white/10 transition-colors"
        >
          Reset
        </button>
        <button className="flex-1 px-4 py-2 rounded-lg bg-purple-500 text-white text-sm font-medium hover:bg-purple-600 transition-colors">
          Apply
        </button>
      </div>
    </div>
  );
}
