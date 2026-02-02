import { Pencil, Settings, Trash2 } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';

interface SettingsPanelProps {
  selectedNode?: any;
  onClose?: () => void;
}

export function SettingsPanel({ selectedNode, onClose }: SettingsPanelProps) {
  return (
    <div className="fixed left-6 top-6 bottom-6 w-72 bg-gradient-to-b from-[#1a1a2e]/95 to-[#16213e]/95 backdrop-blur-md rounded-xl border border-white/10 shadow-2xl flex flex-col z-50">
      {/* Header Tabs */}
      <div className="border-b border-white/10">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="w-full bg-transparent p-2 gap-1">
            <TabsTrigger 
              value="general" 
              className="flex-1 text-xs text-white/60 data-[state=active]:bg-white/10 data-[state=active]:text-white rounded"
            >
              General
            </TabsTrigger>
            <TabsTrigger 
              value="node" 
              className="flex-1 text-xs text-white/60 data-[state=active]:bg-white/10 data-[state=active]:text-white rounded"
            >
              Node
            </TabsTrigger>
            <TabsTrigger 
              value="link" 
              className="flex-1 text-xs text-white/60 data-[state=active]:bg-white/10 data-[state=active]:text-white rounded"
            >
              Link
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Selected Node Section */}
        {selectedNode ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white/90">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedNode.color }} />
              <span className="flex-1">{selectedNode.name}</span>
              <button className="text-white/50 hover:text-white/80">
                <Pencil className="w-3 h-3" />
              </button>
              <button className="text-white/50 hover:text-white/80">
                <Settings className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="text-xs text-white/50">Company</div>
              <div className="flex items-center justify-between bg-white/5 rounded px-3 py-2">
                <span className="text-white/70 text-sm">{selectedNode.name}</span>
                <div className="flex gap-2">
                  <button className="text-white/50 hover:text-white/80">
                    <Pencil className="w-3 h-3" />
                  </button>
                  <button className="text-white/50 hover:text-white/80">
                    <Settings className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs text-white/50">Description</div>
              <div className="flex items-start justify-between bg-white/5 rounded px-3 py-2">
                <p className="text-white/70 text-xs leading-relaxed">
                  Node in the knowledge graph representing a key entity
                </p>
                <div className="flex gap-2 mt-0.5">
                  <button className="text-white/50 hover:text-white/80">
                    <Pencil className="w-3 h-3" />
                  </button>
                  <button className="text-white/50 hover:text-white/80">
                    <Settings className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs text-white/50">Date</div>
              <div className="flex items-center justify-between bg-white/5 rounded px-3 py-2">
                <span className="text-white/70 text-sm">22-06-2023</span>
                <div className="flex gap-2">
                  <button className="text-white/50 hover:text-white/80">
                    <Pencil className="w-3 h-3" />
                  </button>
                  <button className="text-white/50 hover:text-white/80">
                    <Settings className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs text-white/50">Relationships</div>
              <div className="flex items-center justify-between bg-white/5 rounded px-3 py-2">
                <span className="text-white/70 text-sm">50 relationships</span>
                <div className="flex gap-2">
                  <button className="text-white/50 hover:text-white/80">
                    <Pencil className="w-3 h-3" />
                  </button>
                  <button className="text-white/50 hover:text-white/80">
                    <Settings className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            <button className="w-full text-left text-sm text-emerald-400/80 hover:text-emerald-400 flex items-center gap-2 mt-3">
              + New properties
            </button>

            <div className="pt-3 border-t border-white/10">
              <div className="text-xs text-white/50 mb-2 flex items-center gap-2">
                <Settings className="w-3 h-3" />
                Display styles
              </div>
              <Select defaultValue="shape1">
                <SelectTrigger className="w-full bg-white/5 border-white/10 text-white/70 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a2e] border-white/10">
                  <SelectItem value="shape1">Shape style</SelectItem>
                  <SelectItem value="shape2">Circle</SelectItem>
                  <SelectItem value="shape3">Square</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex gap-2 mt-3">
                <button className="flex-1 flex items-center justify-center gap-2 text-xs text-white/70 bg-white/5 hover:bg-white/10 rounded px-3 py-2">
                  <div className="w-3 h-3 bg-purple-500 rounded" />
                  Color shape
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 text-xs text-white/70 bg-white/5 hover:bg-white/10 rounded px-3 py-2">
                  <div className="w-3 h-3 bg-gray-600 rounded" />
                  Shape
                </button>
              </div>

              <div className="flex gap-2 mt-2">
                <button className="flex items-center gap-2 text-xs text-white/70 bg-white/5 hover:bg-white/10 rounded px-3 py-2">
                  ⚠️ Label's text color
                </button>
                <button className="flex items-center gap-2 text-xs text-white/70 bg-white/5 hover:bg-white/10 rounded px-3 py-2">
                  📝 Label's fill
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-white/50 text-sm text-center py-8">
            Select a node to view properties
          </div>
        )}

        {/* Additional node entry */}
        <div className="pt-3 border-t border-white/10">
          <div className="flex items-center gap-2 text-white/90 mb-3">
            <div className="w-3 h-3 rounded-full bg-purple-500" />
            <span className="flex-1 text-sm">Jenny Wilson</span>
            <button className="text-white/50 hover:text-white/80">
              <Pencil className="w-3 h-3" />
              </button>
            <button className="text-white/50 hover:text-white/80">
              <Settings className="w-3 h-3" />
            </button>
          </div>
        </div>

        <button className="w-full text-left text-sm text-emerald-400/80 hover:text-emerald-400 flex items-center gap-2">
          + New category
        </button>
      </div>

      {/* Footer Buttons */}
      <div className="border-t border-white/10 p-4 flex gap-2">
        <Button 
          variant="outline" 
          className="flex-1 bg-transparent border-white/20 text-white/70 hover:bg-white/10 hover:text-white"
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button 
          className="flex-1 bg-emerald-500/90 hover:bg-emerald-500 text-white"
        >
          Save changes
        </Button>
      </div>
    </div>
  );
}
