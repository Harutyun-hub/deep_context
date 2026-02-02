import { Sparkles, Search } from 'lucide-react';
import { Input } from '@/app/components/ui/input';

export function AIQueryBar() {
  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-50">
      <div className="relative bg-slate-950/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
        <div className="flex items-center gap-3 px-6 py-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30">
            <Sparkles className="w-5 h-5 text-purple-400" />
          </div>
          <input
            type="text"
            placeholder="Ask the graph... (e.g. 'Show me Urgent sentiment topics for Fast Bank')"
            className="flex-1 bg-transparent border-none outline-none text-white/90 placeholder:text-white/40 text-sm"
          />
          <button className="flex items-center justify-center w-9 h-9 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 transition-colors">
            <Search className="w-4 h-4 text-purple-400" />
          </button>
        </div>
      </div>
    </div>
  );
}
