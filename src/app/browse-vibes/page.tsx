'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
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
} from 'lucide-react';
import Toast from '@/components/Toast';

interface Vibe {
  id: string;
  name: string;
  description: string;
  gradient: string;
  category: string;
  icon: string;
  usageCount: number;
  isPopular?: boolean;
  isNew?: boolean;
  isFavorited?: boolean;
  isCreatedByMe?: boolean;
}

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

export default function BrowseVibesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; isOpen: boolean }>({
    message: '',
    type: 'success',
    isOpen: false
  });

  // Load favorites from localStorage on mount
  useEffect(() => {
    const storedFavorites = localStorage.getItem('mocksy-favorite-vibes');
    if (storedFavorites) {
      setFavorites(new Set(JSON.parse(storedFavorites)));
    }
  }, []);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('mocksy-favorite-vibes', JSON.stringify(Array.from(favorites)));
  }, [favorites]);

  const toggleFavorite = (vibeId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    const vibe = vibes.find(v => v.id === vibeId);
    const isAdding = !favorites.has(vibeId);

    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(vibeId)) {
        newFavorites.delete(vibeId);
      } else {
        newFavorites.add(vibeId);
      }
      return newFavorites;
    });

    // Show toast notification
    setToast({
      message: isAdding ? `Added "${vibe?.name}" to favorites` : `Removed "${vibe?.name}" from favorites`,
      type: 'success',
      isOpen: true
    });
  };

  const categories = [
    { id: 'all', name: 'All Vibes', count: 24 },
    { id: 'created', name: 'Created by Me', count: 3, icon: <User className="w-3 h-3" /> },
    { id: 'favorited', name: 'Favorited', count: 5, icon: <Heart className="w-3 h-3" /> },
    { id: 'popular', name: 'Popular', count: 8, icon: <Star className="w-3 h-3" /> },
  ];

  const vibes: Vibe[] = [
    {
      id: '1',
      name: 'Snap Style',
      description: 'Bold, playful, social media ready',
      gradient: 'from-blue-500 to-cyan-500',
      category: 'trendy',
      icon: '✨',
      usageCount: 1234,
      isPopular: true,
      isFavorited: false,
    },
    {
      id: '2',
      name: 'Watercolor Zen',
      description: 'Soft, calming, wellness focused',
      gradient: 'from-purple-500 to-pink-500',
      category: 'minimal',
      icon: '🎨',
      usageCount: 890,
      isFavorited: false,
    },
    {
      id: '3',
      name: 'GenZ Medley',
      description: 'Vibrant, trendy, meme-worthy',
      gradient: 'from-yellow-500 to-orange-500',
      category: 'trendy',
      icon: '⚡',
      usageCount: 2103,
      isPopular: true,
    },
    {
      id: '4',
      name: 'Corporate Pro',
      description: 'Clean, professional, trustworthy',
      gradient: 'from-gray-700 to-gray-900',
      category: 'professional',
      icon: '🏢',
      usageCount: 567,
    },
    {
      id: '5',
      name: 'Nature Flow',
      description: 'Organic, earthy, sustainable',
      gradient: 'from-green-500 to-emerald-600',
      category: 'minimal',
      icon: '🌿',
      usageCount: 432,
      isNew: true,
    },
    {
      id: '6',
      name: 'Tech Futura',
      description: 'Futuristic, innovative, cutting-edge',
      gradient: 'from-indigo-600 to-purple-700',
      category: 'professional',
      icon: '🚀',
      usageCount: 789,
    },
    {
      id: '7',
      name: 'Love Story',
      description: 'Romantic, emotional, heartfelt',
      gradient: 'from-red-500 to-pink-600',
      category: 'playful',
      icon: '💖',
      usageCount: 345,
      isNew: true,
      isFavorited: false,
    },
    {
      id: '8',
      name: 'Retro Wave',
      description: '80s inspired, neon, nostalgic',
      gradient: 'from-purple-600 to-blue-600',
      category: 'trendy',
      icon: '🌅',
      usageCount: 1567,
      isPopular: true,
    },
    {
      id: '9',
      name: 'Candy Pop',
      description: 'Sweet, colorful, fun',
      gradient: 'from-pink-400 to-purple-400',
      category: 'playful',
      icon: '🍭',
      usageCount: 234,
    },
    {
      id: '10',
      name: 'Dark Mode',
      description: 'Sleek, modern, sophisticated',
      gradient: 'from-slate-800 to-slate-950',
      category: 'minimal',
      icon: '🌙',
      usageCount: 987,
    },
    {
      id: '11',
      name: 'Ocean Breeze',
      description: 'Fresh, calming, aquatic',
      gradient: 'from-blue-400 to-teal-500',
      category: 'minimal',
      icon: '🌊',
      usageCount: 456,
    },
    {
      id: '12',
      name: 'Sunset Glow',
      description: 'Warm, inviting, beautiful',
      gradient: 'from-orange-400 to-red-500',
      category: 'playful',
      icon: '🌅',
      usageCount: 678,
    },
    {
      id: '13',
      name: 'My Custom Theme',
      description: 'Personal branding style',
      gradient: 'from-teal-500 to-blue-600',
      category: 'professional',
      icon: '🎯',
      usageCount: 45,
      isCreatedByMe: true,
      isFavorited: false,
    },
    {
      id: '14',
      name: 'Client Project',
      description: 'Custom design for client',
      gradient: 'from-rose-500 to-purple-600',
      category: 'professional',
      icon: '💼',
      usageCount: 12,
      isCreatedByMe: true,
    },
    {
      id: '15',
      name: 'Test Theme',
      description: 'Experimental gradient style',
      gradient: 'from-amber-500 to-yellow-600',
      category: 'minimal',
      icon: '🔬',
      usageCount: 3,
      isCreatedByMe: true,
    },
  ];

  // Update vibes with current favorite status
  const vibesWithFavorites = vibes.map(vibe => ({
    ...vibe,
    isFavorited: favorites.has(vibe.id)
  }));

  const filteredVibes = vibesWithFavorites.filter(vibe => {
    const matchesSearch = vibe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          vibe.description.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesCategory = false;
    if (selectedCategory === 'all') {
      matchesCategory = true;
    } else if (selectedCategory === 'created') {
      matchesCategory = vibe.isCreatedByMe === true;
    } else if (selectedCategory === 'favorited') {
      matchesCategory = vibe.isFavorited === true;
    } else if (selectedCategory === 'popular') {
      matchesCategory = vibe.isPopular === true;
    } else {
      matchesCategory = vibe.category === selectedCategory;
    }

    return matchesSearch && matchesCategory;
  });

  const myVibes = vibesWithFavorites.filter(v => v.isCreatedByMe || v.isFavorited);

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
            <button className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors flex items-center gap-2">
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
                          {vibe.icon}
                        </div>
                        {vibe.isNew && (
                          <span className="absolute top-3 left-3 px-2 py-1 bg-green-500 text-white text-xs rounded-full">
                            NEW
                          </span>
                        )}
                        {vibe.isPopular && (
                          <Star className="absolute top-3 left-12 w-5 h-5 text-yellow-400 fill-yellow-400" />
                        )}
                        {/* Favorite Button */}
                        <button
                          onClick={(e) => toggleFavorite(vibe.id, e)}
                          className={`absolute top-3 right-3 w-8 h-8 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center transition-all hover:scale-110 ${
                            vibe.isFavorited ? '' : 'opacity-0 group-hover:opacity-100'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${
                            vibe.isFavorited ? 'text-red-500 fill-red-500' : 'text-muted-foreground'
                          }`} />
                        </button>
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <h3 className="font-semibold mb-1">{vibe.name}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{vibe.description}</p>

                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            {vibe.usageCount.toLocaleString()} uses
                          </span>
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
                  <button className="mt-6 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors flex items-center gap-2">
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
                  ({myVibes.filter(v => v.isCreatedByMe).length} created, {myVibes.filter(v => v.isFavorited).length} favorited)
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
                        {vibe.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <h3 className="font-semibold text-sm">
                            {vibe.name}
                          </h3>
                          {vibe.isCreatedByMe && (
                            <Edit3 className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{vibe.description}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            {vibe.usageCount} uses
                          </span>
                        </div>
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
                      vibe.isFavorited ? '' : 'opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${
                      vibe.isFavorited ? 'text-red-500 fill-red-500' : 'text-muted-foreground'
                    }`} />
                  </button>
                  <div className="flex items-start gap-4">
                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${vibe.gradient} flex items-center justify-center text-2xl`}>
                      {vibe.icon}
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
                      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          {vibe.usageCount.toLocaleString()} uses
                        </span>
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
                    {vibe.icon}
                  </div>
                  {vibe.isNew && (
                    <span className="absolute top-3 left-3 px-2 py-1 bg-green-500 text-white text-xs rounded-full">
                      NEW
                    </span>
                  )}
                  {vibe.isPopular && (
                    <Star className="absolute top-3 left-12 w-5 h-5 text-yellow-400 fill-yellow-400" />
                  )}
                  {/* Favorite Button */}
                  <button
                    onClick={(e) => toggleFavorite(vibe.id, e)}
                    className={`absolute top-3 right-3 w-8 h-8 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center transition-all hover:scale-110 ${
                      vibe.isFavorited ? '' : 'opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${
                      vibe.isFavorited ? 'text-red-500 fill-red-500' : 'text-muted-foreground'
                    }`} />
                  </button>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold mb-1">{vibe.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{vibe.description}</p>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      {vibe.usageCount.toLocaleString()} uses
                    </span>
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
    </div>
  );
}