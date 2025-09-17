'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Upload,
  Download,
  Trash2,
  Edit3,
  Copy,
  Eye,
  MoreVertical,
  Check,
  Image as ImageIcon,
  Search,
  Grid3x3,
  List,
} from 'lucide-react';

interface PageProps {
  params: Promise<{
    'app-id': string;
  }>;
}

interface SourceImage {
  id: string;
  name: string;
  url?: string;
  size: string;
  uploadedAt: Date;
  dimensions: string;
}

const containerAnimation = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.02
    }
  }
};

const itemAnimation = {
  hidden: { opacity: 0, scale: 0.95 },
  show: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 500,
      damping: 30
    }
  }
};

export default function SourceImagesPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const appId = resolvedParams['app-id'];
  const router = useRouter();

  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'date'>('date');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data for source images - set to empty to show zero state
  // You can uncomment the array below to see the images
  const sourceImages: SourceImage[] = [];
  /*
  const sourceImages: SourceImage[] = [
    { id: '1', name: 'Home Screen', size: '2.4 MB', dimensions: '1290x2796', uploadedAt: new Date() },
    { id: '2', name: 'Dashboard', size: '1.8 MB', dimensions: '1290x2796', uploadedAt: new Date() },
    { id: '3', name: 'Profile', size: '2.1 MB', dimensions: '1290x2796', uploadedAt: new Date() },
    { id: '4', name: 'Settings', size: '1.5 MB', dimensions: '1290x2796', uploadedAt: new Date() },
    { id: '5', name: 'Onboarding 1', size: '2.8 MB', dimensions: '1290x2796', uploadedAt: new Date() },
    { id: '6', name: 'Onboarding 2', size: '2.7 MB', dimensions: '1290x2796', uploadedAt: new Date() },
    { id: '7', name: 'Feature Detail', size: '2.2 MB', dimensions: '1290x2796', uploadedAt: new Date() },
    { id: '8', name: 'Search Results', size: '1.9 MB', dimensions: '1290x2796', uploadedAt: new Date() },
    { id: '9', name: 'Cart', size: '2.0 MB', dimensions: '1290x2796', uploadedAt: new Date() },
    { id: '10', name: 'Checkout', size: '2.3 MB', dimensions: '1290x2796', uploadedAt: new Date() },
    { id: '11', name: 'Success', size: '1.7 MB', dimensions: '1290x2796', uploadedAt: new Date() },
    { id: '12', name: 'Error State', size: '1.4 MB', dimensions: '1290x2796', uploadedAt: new Date() },
  ];
  */

  const toggleImageSelection = (id: string) => {
    const newSelection = new Set(selectedImages);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedImages(newSelection);
  };

  const selectAll = () => {
    setSelectedImages(new Set(sourceImages.map(img => img.id)));
  };

  const clearSelection = () => {
    setSelectedImages(new Set());
  };

  const filteredImages = sourceImages.filter(img =>
    img.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedImages = [...filteredImages].sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    } else {
      return b.uploadedAt.getTime() - a.uploadedAt.getTime();
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      <div className="h-screen flex flex-col">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="px-6 py-4 border-b bg-card/50"
        >
          <div className="flex items-center gap-4">
            {/* Left section with title */}
            <button
              onClick={() => router.push(`/app/${appId}`)}
              className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="min-w-0">
              <h1 className="text-2xl font-bold">Source Images</h1>
              <p className="text-sm text-muted-foreground">
                {sortedImages.length} images • {selectedImages.size} selected
              </p>
            </div>

            {/* Search Bar - expandable */}
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search images..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg bg-background focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
              />
            </div>

            {/* Right section with controls */}
            <div className="flex items-center gap-2">
              {/* View Mode Toggle */}
              <div className="flex items-center border rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded transition-colors ${
                    viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted/50'
                  }`}
                >
                  <Grid3x3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded transition-colors ${
                    viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted/50'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'date')}
                className="px-3 py-1.5 border rounded-lg bg-background text-sm focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
              >
                <option value="date">Latest First</option>
                <option value="name">Name (A-Z)</option>
              </select>

              <button className="px-4 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors flex items-center gap-2 text-sm whitespace-nowrap">
                <Upload className="w-4 h-4" />
                Upload Images
              </button>
            </div>
          </div>

          {/* Selection Bar - shows when items are selected */}
          {selectedImages.size > 0 && (
            <div className="flex items-center gap-2 mt-3 px-4 py-2 bg-primary/10 border border-primary/20 rounded-lg">
              <span className="text-sm font-medium">{selectedImages.size} selected</span>
              <button
                onClick={clearSelection}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Clear
              </button>
              <button
                onClick={selectAll}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Select all
              </button>
              <div className="w-px h-4 bg-border mx-2" />
              <button className="p-1 hover:bg-background/50 rounded transition-colors">
                <Download className="w-4 h-4" />
              </button>
              <button className="p-1 hover:bg-background/50 rounded transition-colors">
                <Copy className="w-4 h-4" />
              </button>
              <button className="p-1 hover:bg-red-500/20 text-red-600 rounded transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {sortedImages.length === 0 ? (
            // Zero State
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center min-h-[500px] text-center"
            >
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <ImageIcon className="w-12 h-12 text-primary" />
              </div>

              <h2 className="text-2xl font-bold mb-3">Upload Screenshots from Your App</h2>
              <p className="text-muted-foreground max-w-md mb-8">
                We&apos;ll use these screenshots to generate stunning App Store Screenshots with AI.
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-sm">
                  <Check className="w-4 h-4 text-primary" />
                  <span>Drag and drop multiple files</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Check className="w-4 h-4 text-primary" />
                  <span>Organize and manage screenshots</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Check className="w-4 h-4 text-primary" />
                  <span>Transform with AI vibes</span>
                </div>
              </div>

              <button className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload Screenshots
              </button>

              <p className="text-xs text-muted-foreground mt-4">
                Supports PNG, JPG, JPEG, and WebP formats
              </p>
            </motion.div>
          ) : viewMode === 'grid' ? (
            <motion.div
              variants={containerAnimation}
              initial="hidden"
              animate="show"
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4"
            >
              {sortedImages.map((image) => (
                <motion.div
                  key={image.id}
                  variants={itemAnimation}
                  className="group relative"
                >
                  <div
                    onClick={() => toggleImageSelection(image.id)}
                    className={`relative aspect-[9/16] bg-card border rounded-xl overflow-hidden cursor-pointer transition-all duration-200 ${
                      selectedImages.has(image.id)
                        ? 'ring-2 ring-primary ring-offset-2'
                        : 'hover:shadow-lg hover:scale-[1.02]'
                    }`}
                  >
                    {/* Checkbox */}
                    <div
                      className={`absolute top-3 left-3 w-6 h-6 rounded-md border-2 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center transition-all duration-200 ${
                        selectedImages.has(image.id)
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      {selectedImages.has(image.id) && (
                        <Check className="w-3.5 h-3.5" />
                      )}
                    </div>

                    {/* Image Preview */}
                    <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-muted-foreground/30" />
                    </div>

                    {/* Hover Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/50 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <p className="text-white font-medium truncate mb-1">{image.name}</p>
                      <p className="text-white/70 text-sm">{image.dimensions}</p>
                      <div className="flex gap-2 mt-3">
                        <button className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors">
                          <Eye className="w-5 h-5 text-white" />
                        </button>
                        <button className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors">
                          <Edit3 className="w-5 h-5 text-white" />
                        </button>
                        <button className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors">
                          <Download className="w-5 h-5 text-white" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            // List View
            <div className="space-y-2">
              {sortedImages.map((image) => (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-4 p-3 bg-card border rounded-lg hover:bg-muted/30 transition-colors"
                >
                  <button
                    onClick={() => toggleImageSelection(image.id)}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      selectedImages.has(image.id)
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border hover:border-muted-foreground'
                    }`}
                  >
                    {selectedImages.has(image.id) && (
                      <Check className="w-3 h-3" />
                    )}
                  </button>

                  <div className="w-10 h-16 rounded-md bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center flex-shrink-0">
                    <ImageIcon className="w-5 h-5 text-muted-foreground/30" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{image.name}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span>{image.dimensions}</span>
                      <span>•</span>
                      <span>{image.size}</span>
                      <span>•</span>
                      <span>{image.uploadedAt.toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button className="p-1.5 hover:bg-muted/50 rounded-md transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 hover:bg-muted/50 rounded-md transition-colors">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 hover:bg-muted/50 rounded-md transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 hover:bg-muted/50 rounded-md transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}