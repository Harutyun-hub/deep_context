import { Sparkles, Search } from 'lucide-react';

export function AIQueryBar() {
  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 w-full max-w-xl px-4 z-50">
      <div className="relative bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl">
        <div className="flex items-center gap-3 px-5 py-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-500/20">
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <input
            type="text"
            placeholder="Ask the graph... (e.g. 'Show me Urgent sentiment topics for Fast Bank')"
            className="flex-1 bg-transparent border-none outline-none text-white/90 placeholder:text-white/40 text-sm"
          />
          <button className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-500/30 hover:bg-purple-500/40 transition-colors">
            <Search className="w-4 h-4 text-purple-400" />
          </button>
        </div>
      </div>
    </div>
  );
}
