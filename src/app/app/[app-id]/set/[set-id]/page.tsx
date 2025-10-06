'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMockDataStore } from '@/stores/mockDataStore';
import { motion } from 'framer-motion';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@convex/_generated/api';
import { Id } from '@convex/_generated/dataModel';
import {
  Download,
  Plus,
  Trash2,
  Image as ImageIcon,
  Grid3x3,
  List,
  Check,
  Eye,
  Edit2,
  Edit3,
  Palette,
  Languages,
  MoreVertical,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';

interface PageProps {
  params: Promise<{
    'app-id': string;
    'set-id': string;
  }>;
}


export default function SetPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const appId = resolvedParams['app-id'];
  const setId = resolvedParams['set-id'];
  const router = useRouter();

  // Convex mutations
  const createSetMutation = useMutation(api.screenshotSets.createSet);
  const updateSetMutation = useMutation(api.screenshotSets.updateSet);
  const deleteSetMutation = useMutation(api.screenshotSets.deleteSet);

  // Store hooks
  const { themes } = useMockDataStore();

  // Local UI state
  const [isEditingName, setIsEditingName] = useState(false);
  const [selectedScreenshots, setSelectedScreenshots] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Get current app and set data from Convex
  const convexApp = useQuery(api.apps.getApp, { appId: appId as Id<"apps"> });
  const convexSet = useQuery(
    api.screenshotSets.getSet,
    setId !== 'new' ? { setId: setId as Id<"screenshotSets"> } : "skip"
  );
  const screenshots = useQuery(
    api.screenshots.getScreenshotsForSet,
    convexSet ? { setId: convexSet._id } : "skip"
  ) || [];

  const [setName, setSetName] = useState('');
  const [creatingSet, setCreatingSet] = useState(false);
  const isNewSet = setId === 'new';

  // Check if app exists
  useEffect(() => {
    if (convexApp === null) {
      router.push('/home');
    }
  }, [convexApp, router]);

  // Check if set exists
  useEffect(() => {
    if (!isNewSet && convexSet === null && setId !== 'new') {
      router.push(`/app/${appId}`);
    }
  }, [convexSet, isNewSet, setId, appId, router]);

  // Initialize set name
  useEffect(() => {
    if (convexSet) {
      setSetName(convexSet.name);
    }
  }, [convexSet]);

  // Create new set
  useEffect(() => {
    async function createNewSet() {
      if (isNewSet && convexApp && !creatingSet) {
        setCreatingSet(true);
        try {
          const newSetId = await createSetMutation({
            appId: appId as Id<"apps">,
            name: 'Untitled Set',
            deviceType: 'iPhone 15 Pro',
          });
          setIsEditingName(true);
          // Replace URL with actual set ID
          router.replace(`/app/${appId}/set/${newSetId}`);
        } catch {
          router.push(`/app/${appId}`);
        }
      }
    }
    createNewSet();
  }, [isNewSet, convexApp, creatingSet, appId, createSetMutation, router]);

  // Close dropdown menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-dropdown-menu]')) {
        setShowMoreMenu(false);
      }
    };

    if (showMoreMenu) {
      setTimeout(() => {
        document.addEventListener('click', handleClickOutside);
      }, 0);
      return () => {
        document.removeEventListener('click', handleClickOutside);
      };
    }
  }, [showMoreMenu]);


  // Create placeholder slots for the UI
  type SlotType = typeof screenshots[0] | {
    _id: string;
    _creationTime: number;
    setId: Id<"screenshotSets">;
    appId: Id<"apps">;
    createdBy: Id<"profiles">;
    slotNumber: number;
    title?: string;
    subtitle?: string;
    imageUrl?: string;
    imageStorageId?: Id<"_storage">;
    themeId?: string;
    layoutId?: string;
    isEmpty: boolean;
    createdAt: number;
    updatedAt: number;
    isPlaceholder: boolean;
  };

  const allSlots: SlotType[] = [];
  for (let i = 1; i <= 10; i++) {
    const existingScreenshot = screenshots.find(s => s.slotNumber === i);
    if (existingScreenshot) {
      allSlots.push(existingScreenshot);
    } else {
      // Create a placeholder object for empty slots
      allSlots.push({
        _id: `placeholder-${i}`,
        _creationTime: Date.now(),
        setId: convexSet?._id || ('' as Id<"screenshotSets">),
        appId: convexSet?.appId || ('' as Id<"apps">),
        createdBy: convexSet?.createdBy || ('' as Id<"profiles">),
        slotNumber: i,
        isEmpty: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isPlaceholder: true,
      });
    }
  }


  const handleSlotClick = (slot: typeof allSlots[0]) => {
    if (convexSet) {
      // Navigate to the screenshot route
      if ('isPlaceholder' in slot && slot.isPlaceholder) {
        // For new slots, use the new route structure
        router.push(`/app/${appId}/set/${setId}/screenshot/new/${slot.slotNumber}`);
      } else {
        // For existing screenshots, use their ID
        router.push(`/app/${appId}/set/${setId}/screenshot/${slot._id}`);
      }
    }
  };

  const handleDeleteSet = async () => {
    if (!convexSet) return;

    try {
      await deleteSetMutation({ setId: convexSet._id });
      router.push(`/app/${appId}`);
    } catch {
    }
  };

  const toggleScreenshotSelection = (id: string) => {
    const newSelection = new Set(selectedScreenshots);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedScreenshots(newSelection);
  };

  const selectAll = () => {
    // Only select real screenshots, not placeholders
    setSelectedScreenshots(new Set(screenshots.filter(s => !s.isEmpty).map(s => s._id)));
  };

  const clearSelection = () => {
    setSelectedScreenshots(new Set());
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      <div className="h-screen flex flex-col">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <PageHeader
            className="px-6 py-4 bg-card/50"
            backHref={`/app/${appId}`}
            backLabel="Back to app"
            icon={
              convexApp
                ? convexApp.iconUrl
                  ? // eslint-disable-next-line @next/next/no-img-element
                    <img src={convexApp.iconUrl} alt={convexApp.name} className="w-full h-full object-cover" />
                  : (
                    <span className="text-lg font-bold text-primary">
                      {convexApp.name.charAt(0).toUpperCase()}
                    </span>
                  )
                : null
            }
            iconContainerClassName="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0"
            title={
              <>
                {isEditingName ? (
                  <motion.div
                    initial={{ opacity: 0.8 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="text"
                      value={setName}
                      onChange={(e) => setSetName(e.target.value)}
                      className="px-3 py-1.5 text-2xl font-bold bg-background border-2 border-primary/30 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                      autoFocus
                      onBlur={async () => {
                        setIsEditingName(false);
                        if (convexSet && setName !== convexSet.name) {
                          try {
                            await updateSetMutation({
                              setId: convexSet._id,
                              name: setName,
                            });
                          } catch {
                            setSetName(convexSet.name); // Revert on error
                          }
                        }
                      }}
                      onKeyDown={async (e) => {
                        if (e.key === 'Enter') {
                          setIsEditingName(false);
                          if (convexSet && setName !== convexSet.name) {
                            try {
                              await updateSetMutation({
                                setId: convexSet._id,
                                name: setName,
                              });
                            } catch {
                                setSetName(convexSet.name); // Revert on error
                            }
                          }
                        } else if (e.key === 'Escape') {
                          setIsEditingName(false);
                          setSetName(convexSet?.name || '');
                        }
                      }}
                    />
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setIsEditingName(false)}
                      className="p-1.5 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                    >
                      <Check className="w-4 h-4" />
                    </motion.button>
                    <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground animate-in fade-in slide-in-from-left-2">
                      <span className="px-2 py-0.5 bg-muted/30 rounded">Enter</span>
                      <span className="px-2 py-0.5 bg-muted/30 rounded">Esc</span>
                    </div>
                  </motion.div>
                ) : (
                  <>
                    <h1 className="text-2xl font-bold relative">
                      {setName}
                      <motion.div
                        className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary/20 origin-left"
                        initial={{ scaleX: 0 }}
                        whileHover={{ scaleX: 1 }}
                        transition={{ duration: 0.2 }}
                      />
                    </h1>
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 15 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setIsEditingName(true)}
                      className="p-1.5 hover:bg-primary/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Edit2 className="w-4 h-4 text-primary/60" />
                    </motion.button>
                  </>
                )}
                <span className="text-sm text-muted-foreground">
                  {screenshots.filter(s => !s.isEmpty).length} of 10 filled
                </span>
              </>
            }
            titleClassName="flex items-center gap-3 group"
            actions={(
              <>
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

                <button className="px-4 py-1.5 border rounded-lg hover:bg-muted/50 transition-colors flex items-center gap-2 text-sm">
                  <Palette className="w-4 h-4" />
                  Change Vibe
                </button>

                <button className="px-4 py-1.5 border rounded-lg hover:bg-muted/50 transition-colors flex items-center gap-2 text-sm">
                  <Languages className="w-4 h-4" />
                  Translate
                </button>

                <button className="px-4 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors flex items-center gap-2 text-sm">
                  <Download className="w-4 h-4" />
                  Export All
                </button>

                <div className="relative" data-dropdown-menu>
                  <button
                    onClick={() => setShowMoreMenu(!showMoreMenu)}
                    className="p-2 hover:bg-muted/50 rounded-lg transition-colors"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {showMoreMenu && (
                    <div className="absolute right-0 top-full mt-1 w-48 bg-popover border rounded-lg shadow-lg z-50">
                      <button
                        onClick={() => {
                          setShowMoreMenu(false);
                          setShowDeleteConfirm(true);
                        }}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-muted/50 transition-colors flex items-center gap-2 text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Set
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
            actionsClassName="flex items-center gap-2"
          />
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {viewMode === 'grid' ? (
            // Grid View - Show numbered slots
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">App Store Screenshots</h3>
                <p className="text-sm text-muted-foreground">
                  {screenshots.filter(s => !s.isEmpty).length} of 10 slots filled
                </p>
              </div>

              {/* Selection Bar - shows when items are selected */}
              {selectedScreenshots.size > 0 && (
                <div className="flex items-center justify-between -mt-2 mb-4 px-4 py-3 bg-primary/10 border border-primary/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{selectedScreenshots.size} selected</span>
                    <button
                      onClick={clearSelection}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-0.5 hover:bg-background/50 rounded"
                    >
                      Clear
                    </button>
                    <button
                      onClick={selectAll}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-0.5 hover:bg-background/50 rounded"
                    >
                      Select all
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1.5 hover:bg-background/50 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium">
                      <Palette className="w-4 h-4" />
                      Change Vibe
                    </button>
                    <button className="px-3 py-1.5 hover:bg-background/50 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium">
                      <Languages className="w-4 h-4" />
                      Translate
                    </button>
                    <button className="px-3 py-1.5 hover:bg-background/50 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium">
                      <Download className="w-4 h-4" />
                      Export
                    </button>
                    <div className="w-px h-5 bg-border mx-1" />
                    <button className="px-3 py-1.5 hover:bg-red-500/10 dark:hover:bg-red-500/20 text-red-500 dark:text-red-400 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium">
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {allSlots.map((screenshot) => (
                  <motion.div
                    key={screenshot._id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="group relative"
                  >
                    {screenshot.isEmpty ? (
                      // Empty Slot
                      <div
                        onClick={() => handleSlotClick(screenshot)}
                        className="relative aspect-[9/16] bg-card/50 border-2 border-dashed border-border rounded-xl overflow-hidden cursor-pointer hover:border-primary/50 hover:bg-muted/20 transition-all duration-200"
                      >
                        {/* Slot Number */}
                        <div className="absolute top-3 left-3 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm border flex items-center justify-center">
                          <span className="text-sm font-medium">{screenshot.slotNumber}</span>
                        </div>

                        {/* Empty State Content */}
                        <div className="w-full h-full flex flex-col items-center justify-center p-4">
                          <Plus className="w-8 h-8 text-muted-foreground/50 mb-2" />
                          <p className="text-sm text-muted-foreground text-center">
                            Add Screenshot
                          </p>
                        </div>
                      </div>
                    ) : (
                      // Filled Slot
                      <div
                        onClick={() => handleSlotClick(screenshot)}
                        className={`relative aspect-[9/16] bg-card border-2 rounded-xl overflow-hidden cursor-pointer transition-all duration-200 ${
                          selectedScreenshots.has(screenshot._id)
                            ? 'border-primary shadow-lg'
                            : 'border-border hover:border-primary/50 hover:shadow-lg'
                        }`}
                      >
                        {/* Slot Number */}
                        <div className="absolute top-3 left-3 w-8 h-8 rounded-full bg-background/90 backdrop-blur-sm border z-10 flex items-center justify-center">
                          <span className="text-sm font-semibold">{screenshot.slotNumber}</span>
                        </div>

                        {/* Checkbox */}
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleScreenshotSelection(screenshot._id);
                          }}
                          className={`absolute top-3 right-3 w-6 h-6 rounded-md border-2 backdrop-blur-sm z-10 flex items-center justify-center transition-all duration-200 ${
                            selectedScreenshots.has(screenshot._id)
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-gray-400 dark:border-gray-500 bg-white/90 dark:bg-gray-800/90 opacity-0 group-hover:opacity-100 hover:border-primary dark:hover:border-primary'
                          }`}
                        >
                          {selectedScreenshots.has(screenshot._id) && (
                            <Check className="w-3.5 h-3.5" />
                          )}
                        </div>

                        {/* Image Preview */}
                        <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                          <ImageIcon className="w-12 h-12 text-muted-foreground/30" />
                        </div>

                        {/* Hover Overlay - Only show when nothing is selected */}
                        {selectedScreenshots.size === 0 && (
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-3 p-4">
                            <div className="text-center">
                              <p className="text-white font-semibold text-sm mb-1">{screenshot.title}</p>
                              <p className="text-white/80 text-xs">{screenshot.subtitle}</p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                }}
                                className="px-3 py-2 rounded-lg bg-white text-black hover:bg-white/90 transition-colors flex items-center gap-1.5 text-sm font-medium"
                              >
                                <Eye className="w-4 h-4" />
                                View
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSlotClick(screenshot);
                                }}
                                className="px-3 py-2 rounded-lg bg-white text-black hover:bg-white/90 transition-colors flex items-center gap-1.5 text-sm font-medium"
                              >
                                <Edit3 className="w-4 h-4" />
                                Revise
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                }}
                                className="px-3 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors flex items-center gap-1.5 text-sm font-medium"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Badges */}
                        {screenshot.themeId && (
                          <div className="absolute bottom-3 left-3 flex gap-1">
                            <span className="px-2 py-0.5 bg-purple-500/90 backdrop-blur-sm text-white text-xs rounded-full">
                              {themes.find(t => t.id === screenshot.themeId)?.name}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Title below card */}
                    {!screenshot.isEmpty && (
                      <div className="mt-2">
                        <p className="text-sm font-medium truncate">{screenshot.title || `Screenshot ${screenshot.slotNumber}`}</p>
                        <p className="text-xs text-muted-foreground truncate">{convexSet?.deviceType || 'No device'}</p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          ) : (
            // List View
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">App Store Screenshots</h3>
                <p className="text-sm text-muted-foreground">
                  {screenshots.filter(s => !s.isEmpty).length} of 10 slots filled
                </p>
              </div>

              {/* Selection Bar - shows when items are selected */}
              {selectedScreenshots.size > 0 && (
                <div className="flex items-center justify-between mb-4 px-4 py-3 bg-primary/10 border border-primary/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{selectedScreenshots.size} selected</span>
                    <button
                      onClick={clearSelection}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-0.5 hover:bg-background/50 rounded"
                    >
                      Clear
                    </button>
                    <button
                      onClick={selectAll}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-0.5 hover:bg-background/50 rounded"
                    >
                      Select all
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1.5 hover:bg-background/50 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium">
                      <Palette className="w-4 h-4" />
                      Change Vibe
                    </button>
                    <button className="px-3 py-1.5 hover:bg-background/50 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium">
                      <Languages className="w-4 h-4" />
                      Translate
                    </button>
                    <button className="px-3 py-1.5 hover:bg-background/50 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium">
                      <Download className="w-4 h-4" />
                      Export
                    </button>
                    <div className="w-px h-5 bg-border mx-1" />
                    <button className="px-3 py-1.5 hover:bg-red-500/10 dark:hover:bg-red-500/20 text-red-500 dark:text-red-400 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium">
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              )}

              {allSlots.map((screenshot) => (
                <motion.div
                  key={screenshot._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={() => handleSlotClick(screenshot)}
                  className={`flex items-center gap-4 p-3 bg-card border rounded-lg cursor-pointer transition-colors ${
                    screenshot.isEmpty ? 'border-dashed hover:bg-muted/20' : 'hover:bg-muted/30'
                  }`}
                >
                  {/* Slot Number */}
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold">{screenshot.slotNumber}</span>
                  </div>

                  {!screenshot.isEmpty && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleScreenshotSelection(screenshot._id);
                      }}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        selectedScreenshots.has(screenshot._id)
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border hover:border-muted-foreground'
                      }`}
                    >
                      {selectedScreenshots.has(screenshot._id) && (
                        <Check className="w-3 h-3" />
                      )}
                    </button>
                  )}

                  <div className="w-10 h-16 rounded-md bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center flex-shrink-0">
                    {screenshot.isEmpty ? (
                      <Plus className="w-5 h-5 text-muted-foreground/50" />
                    ) : (
                      <ImageIcon className="w-5 h-5 text-muted-foreground/30" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    {screenshot.isEmpty ? (
                      <div>
                        <p className="font-medium text-muted-foreground">Empty Slot</p>
                        <p className="text-xs text-muted-foreground mt-1">Click to add a screenshot</p>
                      </div>
                    ) : (
                      <>
                        <p className="font-medium">{screenshot.title || `Screenshot ${screenshot.slotNumber}`}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                          {convexSet?.deviceType && <span>{convexSet.deviceType}</span>}
                          {screenshot.themeId && (
                            <>
                              <span>•</span>
                              <span>{themes.find(t => t.id === screenshot.themeId)?.name}</span>
                            </>
                          )}
                          {convexSet?.language && (
                            <>
                              <span>•</span>
                              <span>{convexSet.language}</span>
                            </>
                          )}
                          {screenshot.subtitle && (
                            <>
                              <span>•</span>
                              <span>{screenshot.subtitle}</span>
                            </>
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  {!screenshot.isEmpty && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        className="p-1.5 hover:bg-muted/50 rounded-md transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        className="p-1.5 hover:bg-muted/50 rounded-md transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        className="p-1.5 hover:bg-muted/50 rounded-md transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <>
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50" onClick={() => setShowDeleteConfirm(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-background border rounded-lg shadow-2xl z-50 p-6">
            <h3 className="text-lg font-semibold mb-2">Delete Screenshot Set?</h3>
            <p className="text-muted-foreground mb-6">
              {screenshots.filter(s => !s.isEmpty).length > 0
                ? `This will permanently delete this set and all ${screenshots.filter(s => !s.isEmpty).length} screenshots. This action cannot be undone.`
                : 'This will permanently delete this empty set. This action cannot be undone.'
              }
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 hover:bg-muted rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSet}
                className="px-4 py-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-lg transition-colors"
              >
                Delete Set
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
