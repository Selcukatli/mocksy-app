'use client';

import { use, useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Plus,
  Download,
  Settings,
  Wand2,
  Languages,
  Smartphone,
  Check,
  MoreVertical,
  Trash2,
  Edit3,
  Copy,
  Eye,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';

interface PageProps {
  params: Promise<{
    'app-id': string;
  }>;
}

interface Screenshot {
  id: string;
  name: string;
  url?: string;
}

export default function AppDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const appId = resolvedParams['app-id'];

  const [selectedScreenshots, setSelectedScreenshots] = useState<Set<string>>(new Set());
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Mock screenshots data
  const screenshots: Screenshot[] = [
    { id: '1', name: 'Home Screen' },
    { id: '2', name: 'Features' },
    { id: '3', name: 'Settings' },
    { id: '4', name: 'Profile' },
    { id: '5', name: 'Dashboard' },
    { id: '6', name: 'Analytics' },
  ];

  const toggleSelection = (id: string) => {
    const newSelection = new Set(selectedScreenshots);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedScreenshots(newSelection);
  };

  const selectAll = () => {
    setSelectedScreenshots(new Set(screenshots.map(s => s.id)));
  };

  const clearSelection = () => {
    setSelectedScreenshots(new Set());
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-4xl font-bold">App {appId}</h1>
            <div className="flex gap-2">
              <button className="px-4 py-2 rounded-lg border hover:bg-secondary transition-colors">
                <Settings className="w-4 h-4" />
              </button>
              <button className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export All
              </button>
            </div>
          </div>
          <p className="text-muted-foreground">Edit and manage your app screenshots</p>
        </div>

        {/* Selection Bar */}
        {selectedScreenshots.size > 0 && (
          <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-between animate-in slide-in-from-top-2">
            <div className="flex items-center gap-4">
              <span className="font-medium">{selectedScreenshots.size} selected</span>
              <button
                onClick={clearSelection}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Clear selection
              </button>
              <button
                onClick={selectAll}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Select all
              </button>
            </div>
            <div className="flex gap-2">
              <button className="p-2 hover:bg-background/50 rounded-lg transition-colors">
                <Edit3 className="w-4 h-4" />
              </button>
              <button className="p-2 hover:bg-background/50 rounded-lg transition-colors">
                <Copy className="w-4 h-4" />
              </button>
              <button className="p-2 hover:bg-background/50 rounded-lg transition-colors">
                <Download className="w-4 h-4" />
              </button>
              <button className="p-2 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Screenshots Grid */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card rounded-xl border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Screenshots</h2>
                <button className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Screenshot
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {screenshots.map((screenshot) => (
                  <div
                    key={screenshot.id}
                    className="relative group"
                    onMouseEnter={() => setHoveredId(screenshot.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    <div
                      onClick={() => toggleSelection(screenshot.id)}
                      className={cn(
                        "relative aspect-[9/16] bg-gradient-to-br from-secondary to-secondary/50 rounded-xl overflow-hidden cursor-pointer transition-all duration-200",
                        selectedScreenshots.has(screenshot.id) && "outline outline-2 outline-primary/50 outline-offset-2",
                        hoveredId === screenshot.id && "scale-[1.02] shadow-lg"
                      )}
                    >
                      {/* Selection Checkbox */}
                      <div
                        className={cn(
                          "absolute top-2 left-2 w-6 h-6 rounded-md border-2 bg-background/80 backdrop-blur-sm transition-all duration-200 flex items-center justify-center",
                          selectedScreenshots.has(screenshot.id)
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border",
                          (hoveredId === screenshot.id || selectedScreenshots.has(screenshot.id))
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      >
                        {selectedScreenshots.has(screenshot.id) && (
                          <Check className="w-3.5 h-3.5" />
                        )}
                      </div>

                      {/* Screenshot Preview */}
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-12 h-12 text-muted-foreground/30" />
                      </div>

                      {/* Hover Actions */}
                      <div className={cn(
                        "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 transition-opacity duration-200",
                        hoveredId === screenshot.id ? "opacity-100" : "opacity-0"
                      )}>
                        <p className="text-white text-sm font-medium mb-1">{screenshot.name}</p>
                        <div className="flex gap-1">
                          <button className="p-1.5 rounded-md bg-white/20 hover:bg-white/30 transition-colors">
                            <Eye className="w-3.5 h-3.5 text-white" />
                          </button>
                          <button className="p-1.5 rounded-md bg-white/20 hover:bg-white/30 transition-colors">
                            <Edit3 className="w-3.5 h-3.5 text-white" />
                          </button>
                          <button className="p-1.5 rounded-md bg-white/20 hover:bg-white/30 transition-colors">
                            <MoreVertical className="w-3.5 h-3.5 text-white" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Add New Screenshot Placeholder */}
                <div className="relative aspect-[9/16] border-2 border-dashed border-border rounded-xl flex items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-secondary/50 transition-all duration-200 group">
                  <div className="text-center">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground group-hover:text-primary transition-colors" />
                    <p className="text-sm text-muted-foreground">Add Screenshot</p>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Tools */}
            <div className="bg-card rounded-xl border p-6">
              <h2 className="text-xl font-semibold mb-4">AI Tools</h2>
              <div className="grid grid-cols-2 gap-3">
                <button className="p-4 border rounded-lg hover:bg-secondary hover:border-primary/50 transition-all duration-200 flex items-center gap-3 group">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-500/10 flex items-center justify-center group-hover:from-purple-500/30 group-hover:to-purple-500/20 transition-colors">
                    <Wand2 className="w-5 h-5 text-purple-500" />
                  </div>
                  <span className="font-medium">Generate</span>
                </button>
                <button className="p-4 border rounded-lg hover:bg-secondary hover:border-primary/50 transition-all duration-200 flex items-center gap-3 group">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-500/10 flex items-center justify-center group-hover:from-blue-500/30 group-hover:to-blue-500/20 transition-colors">
                    <Edit3 className="w-5 h-5 text-blue-500" />
                  </div>
                  <span className="font-medium">Edit</span>
                </button>
                <button className="p-4 border rounded-lg hover:bg-secondary hover:border-primary/50 transition-all duration-200 flex items-center gap-3 group">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500/20 to-green-500/10 flex items-center justify-center group-hover:from-green-500/30 group-hover:to-green-500/20 transition-colors">
                    <Languages className="w-5 h-5 text-green-500" />
                  </div>
                  <span className="font-medium">Translate</span>
                </button>
                <button className="p-4 border rounded-lg hover:bg-secondary hover:border-primary/50 transition-all duration-200 flex items-center gap-3 group">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500/20 to-pink-500/10 flex items-center justify-center group-hover:from-pink-500/30 group-hover:to-pink-500/20 transition-colors">
                    <Smartphone className="w-5 h-5 text-pink-500" />
                  </div>
                  <span className="font-medium">Frames</span>
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <div className="bg-card rounded-xl border p-6">
              <h2 className="text-xl font-semibold mb-4">App Details</h2>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Platform</dt>
                  <dd className="text-sm mt-1">iOS & Android</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Screenshots</dt>
                  <dd className="text-sm mt-1">{screenshots.length} screenshots</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Languages</dt>
                  <dd className="text-sm mt-1">English, Spanish, French</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Last Modified</dt>
                  <dd className="text-sm mt-1">2 hours ago</dd>
                </div>
              </dl>
            </div>

            <div className="bg-card rounded-xl border p-6">
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <button className="w-full px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors text-left">
                  Export Selected
                </button>
                <button className="w-full px-4 py-2 border hover:bg-secondary rounded-lg transition-colors text-left">
                  Duplicate App
                </button>
                <button className="w-full px-4 py-2 border hover:bg-secondary rounded-lg transition-colors text-left">
                  App Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}