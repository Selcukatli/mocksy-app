'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/stores/appStore';
import { useMockDataStore } from '@/stores/mockDataStore';
import {
  ArrowLeft,
  Search,
  Sparkles,
  Heart,
  Star,
  TrendingUp,
  ChevronRight,
  Plus,
  User,
  Edit3,
  Trash2,
  X,
} from 'lucide-react';
import Toast from '@/components/Toast';

const containerAnimation = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03
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
      stiffness: 400,
      damping: 25
    }
  }
};

// Gradient presets for custom vibe creation
const gradientPresets = [
  'from-purple-500 via-pink-500 to-rose-500',
  'from-blue-500 via-cyan-500 to-teal-500',
  'from-yellow-400 via-orange-400 to-red-400',
  'from-green-500 via-emerald-500 to-teal-500',
  'from-indigo-500 via-purple-500 to-pink-500',
  'from-gray-900 via-gray-800 to-black',
  'from-red-500 via-orange-500 to-yellow-500',
  'from-pink-200 via-purple-200 to-indigo-200',
];

export default function BrowseVibesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isCreatingVibe, setIsCreatingVibe] = useState(false);
  const [newVibeName, setNewVibeName] = useState('');
  const [newVibeDescription, setNewVibeDescription] = useState('');
  const [newVibeGradient, setNewVibeGradient] = useState('from-purple-500 via-pink-500 to-rose-500');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; isOpen: boolean }>({
    message: '',
    type: 'success',
    isOpen: false
  });

  // Store hooks
  const { vibes: mockVibes } = useMockDataStore();
  const {
    customVibes,
    favoriteVibes,
    toggleFavoriteVibe,
    isFavoriteVibe,
    createCustomVibe,
    deleteCustomVibe
  } = useAppStore();

  // Combine mock and custom vibes
  const allVibes = useMemo(() => {
    return [...mockVibes, ...customVibes];
  }, [mockVibes, customVibes]);

  const toggleFavorite = (vibeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const vibe = allVibes.find(v => v.id === vibeId);
    const isAdding = !isFavoriteVibe(vibeId);

    toggleFavoriteVibe(vibeId);

    setToast({
      message: isAdding ? `Added "${vibe?.name}" to favorites` : `Removed "${vibe?.name}" from favorites`,
      type: 'success',
      isOpen: true
    });
  };

  const handleCreateVibe = () => {
    if (newVibeName && newVibeDescription) {
      const newVibe = createCustomVibe({
        name: newVibeName,
        description: newVibeDescription,
        gradient: newVibeGradient,
        tags: [],
        isPopular: false,
      });

      setToast({
        message: `Created custom vibe "${newVibe.name}"`,
        type: 'success',
        isOpen: true
      });

      setNewVibeName('');
      setNewVibeDescription('');
      setNewVibeGradient('from-purple-500 via-pink-500 to-rose-500');
      setIsCreatingVibe(false);
    }
  };

  const handleDeleteVibe = (vibeId: string, vibeName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteCustomVibe(vibeId);
    setToast({
      message: `Deleted "${vibeName}"`,
      type: 'success',
      isOpen: true
    });
  };

  const categories = [
    {
      id: 'all',
      name: 'All Vibes',
      count: allVibes.length
    },
    {
      id: 'created',
      name: 'Created by Me',
      count: customVibes.length,
      icon: <User className="w-3 h-3" />
    },
    {
      id: 'favorited',
      name: 'Favorited',
      count: favoriteVibes.length,
      icon: <Heart className="w-3 h-3" />
    },
    {
      id: 'popular',
      name: 'Popular',
      count: allVibes.filter(v => v.isPopular).length,
      icon: <Star className="w-3 h-3" />
    },
  ];

  const filteredVibes = allVibes.filter(vibe => {
    const matchesSearch = vibe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          vibe.description.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesCategory = false;
    if (selectedCategory === 'all') {
      matchesCategory = true;
    } else if (selectedCategory === 'created') {
      matchesCategory = vibe.createdByUser === true;
    } else if (selectedCategory === 'favorited') {
      matchesCategory = isFavoriteVibe(vibe.id);
    } else if (selectedCategory === 'popular') {
      matchesCategory = vibe.isPopular === true;
    }

    return matchesSearch && matchesCategory;
  });

  const myVibes = allVibes.filter(v => v.createdByUser || isFavoriteVibe(v.id));

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      <Toast
        message={toast.message}
        type={toast.type}
        isOpen={toast.isOpen}
        onClose={() => setToast({ ...toast, isOpen: false })}
      />

      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          {/* Title Row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold">Browse Vibes</h1>
                <p className="text-sm text-muted-foreground">
                  Choose AI style templates to generate stunning app store screenshots
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsCreatingVibe(true)}
              className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Custom Vibe
            </button>
          </div>

          {/* Search and Filters Row */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search vibes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg bg-background focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
              />
            </div>

            <div className="flex items-center gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-full text-sm transition-all flex items-center gap-1.5 ${
                    selectedCategory === category.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted/50 hover:bg-muted'
                  }`}
                >
                  {category.icon}
                  {category.name}
                  <span className="ml-1 opacity-60">({category.count})</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">

        {/* Search Results */}
        {searchQuery ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-xl font-semibold mb-4">
              Search Results
              <span className="ml-2 text-sm text-muted-foreground">
                ({filteredVibes.length} {filteredVibes.length === 1 ? 'result' : 'results'})
              </span>
            </h2>
            <motion.div
              variants={containerAnimation}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            >
              {filteredVibes.length > 0 ? (
                <>
                  {/* Create Custom Vibe Card (show first even in search) */}
                  <motion.div
                    variants={itemAnimation}
                    onClick={() => setIsCreatingVibe(true)}
                    className="bg-card/50 border-2 border-dashed border-border rounded-xl p-6 cursor-pointer hover:border-muted-foreground/30 hover:bg-muted/20 transition-all duration-200 flex items-center justify-center min-h-[240px]"
                  >
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-xl bg-muted/50 flex items-center justify-center mx-auto mb-3">
                        <Plus className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <p className="font-medium">Create Custom Vibe</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Design your own style
                      </p>
                    </div>
                  </motion.div>

                  {filteredVibes.map((vibe) => (
                    <motion.div
                      key={vibe.id}
                      variants={itemAnimation}
                      whileHover={{ scale: 1.02 }}
                      className="group bg-card border rounded-xl overflow-hidden cursor-pointer hover:shadow-lg transition-all"
                    >
                      {/* Preview Banner */}
                      <div className={`h-32 bg-gradient-to-br ${vibe.gradient} relative`}>
                        <div className="absolute inset-0 flex items-center justify-center text-4xl">
                          <Sparkles className="w-10 h-10 text-white/50" />
                        </div>
                        {vibe.isPopular && (
                          <Star className="absolute top-3 left-3 w-5 h-5 text-yellow-400 fill-yellow-400" />
                        )}
                        {vibe.createdByUser && (
                          <span className="absolute top-3 left-3 px-2 py-1 bg-primary text-primary-foreground text-xs rounded-full">
                            MY VIBE
                          </span>
                        )}
                        {/* Actions */}
                        <div className="absolute top-3 right-3 flex gap-2">
                          <button
                            onClick={(e) => toggleFavorite(vibe.id, e)}
                            className={`w-8 h-8 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center transition-all hover:scale-110 ${
                              isFavoriteVibe(vibe.id) ? '' : 'opacity-0 group-hover:opacity-100'
                            }`}
                          >
                            <Heart className={cn(
                              "w-4 h-4",
                              isFavoriteVibe(vibe.id) ? "fill-red-500 text-red-500" : "text-muted-foreground"
                            )} />
                          </button>
                          {vibe.createdByUser && (
                            <button
                              onClick={(e) => handleDeleteVibe(vibe.id, vibe.name, e)}
                              className="w-8 h-8 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center transition-all hover:scale-110 opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <h3 className="font-semibold mb-1">{vibe.name}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{vibe.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-muted-foreground">
                            {vibe.createdByUser ? 'Custom' : 'System'}
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </>
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                    <Search className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No vibes found</h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Try adjusting your search or create a custom vibe with your own style
                  </p>
                  <button
                    onClick={() => setIsCreatingVibe(true)}
                    className="mt-6 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Create Custom Vibe
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        ) : (
          <>
        {/* My Vibes Carousel */}
        {myVibes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">My Vibes</h2>
                <span className="text-xs text-muted-foreground">
                  ({myVibes.filter(v => v.createdByUser).length} created, {myVibes.filter(v => isFavoriteVibe(v.id)).length} favorited)
                </span>
              </div>
            </div>

            <div className="relative">
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {myVibes.map((vibe) => (
                  <motion.div
                    key={vibe.id}
                    whileHover={{ scale: 1.02 }}
                    className="flex-shrink-0 w-64 bg-card border rounded-xl p-4 cursor-pointer hover:shadow-lg transition-all relative"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${vibe.gradient} flex items-center justify-center text-xl flex-shrink-0`}>
                        <Sparkles className="w-6 h-6 text-white/70" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <h3 className="font-semibold text-sm">
                            {vibe.name}
                          </h3>
                          {vibe.createdByUser && (
                            <Edit3 className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{vibe.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Popular Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Popular Right Now</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVibes
              .filter(v => v.isPopular)
              .slice(0, 3)
              .map((vibe) => (
                <motion.div
                  key={vibe.id}
                  whileHover={{ scale: 1.02 }}
                  className="bg-card border rounded-xl p-6 cursor-pointer hover:shadow-lg transition-all relative group"
                >
                  <button
                    onClick={(e) => toggleFavorite(vibe.id, e)}
                    className={`absolute top-3 right-3 p-1.5 bg-background/80 backdrop-blur-sm rounded-full transition-all hover:scale-110 z-10 ${
                      isFavoriteVibe(vibe.id) ? '' : 'opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    <Heart className={cn(
                      "w-4 h-4",
                      isFavoriteVibe(vibe.id) ? "fill-red-500 text-red-500" : "text-muted-foreground"
                    )} />
                  </button>
                  <div className="flex items-start gap-4">
                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${vibe.gradient} flex items-center justify-center text-2xl`}>
                      <Sparkles className="w-8 h-8 text-white/50" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">
                            {vibe.name}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">{vibe.description}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
          </div>
        </motion.div>

        {/* All Vibes Grid */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <h2 className="text-xl font-semibold mb-4">All Vibes</h2>
          <motion.div
            variants={containerAnimation}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            {/* Create Custom Vibe Card */}
            <motion.div
              variants={itemAnimation}
              onClick={() => setIsCreatingVibe(true)}
              className="bg-card/50 border-2 border-dashed border-border rounded-xl p-6 cursor-pointer hover:border-muted-foreground/30 hover:bg-muted/20 transition-all duration-200 flex items-center justify-center min-h-[240px]"
            >
              <div className="text-center">
                <div className="w-16 h-16 rounded-xl bg-muted/50 flex items-center justify-center mx-auto mb-3">
                  <Plus className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="font-medium">Create Custom Vibe</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Design your own style
                </p>
              </div>
            </motion.div>

            {filteredVibes.map((vibe) => (
              <motion.div
                key={vibe.id}
                variants={itemAnimation}
                whileHover={{ scale: 1.02 }}
                className="group bg-card border rounded-xl overflow-hidden cursor-pointer hover:shadow-lg transition-all"
              >
                {/* Preview Banner */}
                <div className={`h-32 bg-gradient-to-br ${vibe.gradient} relative`}>
                  <div className="absolute inset-0 flex items-center justify-center text-4xl">
                    <Sparkles className="w-10 h-10 text-white/50" />
                  </div>
                  {vibe.isPopular && (
                    <Star className="absolute top-3 left-3 w-5 h-5 text-yellow-400 fill-yellow-400" />
                  )}
                  {vibe.createdByUser && (
                    <span className="absolute top-3 left-3 px-2 py-1 bg-primary text-primary-foreground text-xs rounded-full">
                      MY VIBE
                    </span>
                  )}
                  {/* Actions */}
                  <div className="absolute top-3 right-3 flex gap-2">
                    <button
                      onClick={(e) => toggleFavorite(vibe.id, e)}
                      className={`w-8 h-8 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center transition-all hover:scale-110 ${
                        isFavoriteVibe(vibe.id) ? '' : 'opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      <Heart className={cn(
                        "w-4 h-4",
                        isFavoriteVibe(vibe.id) ? "fill-red-500 text-red-500" : "text-muted-foreground"
                      )} />
                    </button>
                    {vibe.createdByUser && (
                      <button
                        onClick={(e) => handleDeleteVibe(vibe.id, vibe.name, e)}
                        className="w-8 h-8 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center transition-all hover:scale-110 opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold mb-1">{vibe.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{vibe.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      {vibe.createdByUser ? 'Custom' : 'System'}
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
        </>
        )}
      </div>

      {/* Create Custom Vibe Modal */}
      <AnimatePresence>
        {isCreatingVibe && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setIsCreatingVibe(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-card border rounded-2xl shadow-2xl z-50 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Create Custom Vibe</h3>
                <button
                  onClick={() => setIsCreatingVibe(false)}
                  className="p-2 hover:bg-muted/50 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Name</label>
                  <input
                    type="text"
                    value={newVibeName}
                    onChange={(e) => setNewVibeName(e.target.value)}
                    placeholder="Enter vibe name"
                    className="w-full px-3 py-2 border rounded-lg bg-background focus:ring-1 focus:ring-primary focus:border-primary"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 block">Description</label>
                  <input
                    type="text"
                    value={newVibeDescription}
                    onChange={(e) => setNewVibeDescription(e.target.value)}
                    placeholder="Describe your vibe"
                    className="w-full px-3 py-2 border rounded-lg bg-background focus:ring-1 focus:ring-primary focus:border-primary"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Choose Gradient</label>
                  <div className="grid grid-cols-4 gap-2">
                    {gradientPresets.map((gradient, index) => (
                      <button
                        key={index}
                        onClick={() => setNewVibeGradient(gradient)}
                        className={cn(
                          "h-16 rounded-lg bg-gradient-to-br transition-all",
                          gradient,
                          newVibeGradient === gradient ? "ring-2 ring-primary ring-offset-2" : "hover:scale-105"
                        )}
                      />
                    ))}
                  </div>
                </div>

                <div className={cn(
                  "h-32 rounded-xl bg-gradient-to-br flex items-center justify-center",
                  newVibeGradient
                )}>
                  <span className="text-white font-bold text-lg drop-shadow-lg">Preview</span>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setIsCreatingVibe(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateVibe}
                  disabled={!newVibeName || !newVibeDescription}
                  className="flex-1 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Vibe
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}