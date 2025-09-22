'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/stores/appStore';
import { useMockDataStore } from '@/stores/mockDataStore';
import { useEditorStore } from '@/stores/editorStore';
import { motion } from 'framer-motion';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../../../convex/_generated/api';
import { Id } from '../../../../../../convex/_generated/dataModel';
import {
  ArrowLeft,
  Download,
  Plus,
  Trash2,
  Image as ImageIcon,
  Sparkles,
  ChevronRight,
  Upload,
  Search,
  Grid3x3,
  List,
  Check,
  X,
  Eye,
  Edit2,
  Edit3,
  Palette,
  Languages,
  FolderOpen,
  Layout,
  MoreVertical,
} from 'lucide-react';

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
  const createScreenshotMutation = useMutation(api.screenshots.createScreenshot);
  // const updateScreenshotMutation = useMutation(api.screenshots.updateScreenshot);
  const clearScreenshotMutation = useMutation(api.screenshots.clearScreenshot);

  // Store hooks (still using some local store functions)
  const {
    updateScreenshot
  } = useAppStore();

  const { themes, layouts } = useMockDataStore();

  const {
    activeScreenshotId,
    isReviseOpen,
    isSourceImagePanelOpen,
    isThemePanelOpen,
    isLayoutPanelOpen,
    selectedThemeId,
    setActiveSlot,
    closeRevisePanel,
    openSourceImagePanel,
    closeSourceImagePanel,
    openThemePanel,
    closeThemePanel,
    openLayoutPanel,
    closeLayoutPanel,
    updateTempScreenshot,
    selectTheme,
    selectLayout,
  } = useEditorStore();

  // Local UI state
  const [isEditingName, setIsEditingName] = useState(false);
  const [selectedScreenshots, setSelectedScreenshots] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [headerText, setHeaderText] = useState('');
  const [subtitleText, setSubtitleText] = useState('');
  const [showSubtitle, setShowSubtitle] = useState(false);

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
      console.log('App does not exist, redirecting to home...');
      router.push('/home');
    }
  }, [convexApp, router]);

  // Check if set exists
  useEffect(() => {
    if (!isNewSet && convexSet === null && setId !== 'new') {
      console.log('Set does not exist, redirecting to app page...');
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
        console.log('Creating new set...');
        try {
          const newSetId = await createSetMutation({
            appId: appId as Id<"apps">,
            name: 'Untitled Set',
            deviceType: 'iPhone 15 Pro',
          });
          setIsEditingName(true);
          // Replace URL with actual set ID
          router.replace(`/app/${appId}/set/${newSetId}`);
        } catch (error) {
          console.error('Failed to create set:', error);
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

  // Debug logging
  console.log('Convex Set:', convexSet);
  console.log('Screenshots array:', screenshots);
  console.log('Screenshots length:', screenshots.length);

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

  const selectedSlot = activeScreenshotId ?
    allSlots.find(s => s._id === activeScreenshotId) || null :
    null;

  const handleSlotClick = async (slot: typeof allSlots[0]) => {
    if (convexSet) {
      // If it's a placeholder, create a new screenshot first
      if ('isPlaceholder' in slot && slot.isPlaceholder) {
        try {
          const newScreenshotId = await createScreenshotMutation({
            setId: convexSet._id,
            slotNumber: slot.slotNumber,
          });
          setActiveSlot(convexSet._id, newScreenshotId, slot.slotNumber);
          setHeaderText('');
          setSubtitleText('');
          setShowSubtitle(false);
          updateTempScreenshot({ title: '', subtitle: '' });
        } catch (error) {
          console.error('Failed to create screenshot:', error);
        }
      } else {
        setActiveSlot(convexSet._id, slot._id, slot.slotNumber);
        setHeaderText(slot.title || '');
        setSubtitleText(slot.subtitle || '');
        setShowSubtitle(!!slot.subtitle);
        updateTempScreenshot({ title: slot.title, subtitle: slot.subtitle });
      }
    }
  };

  const handleDeleteSet = async () => {
    if (!convexSet) return;

    try {
      await deleteSetMutation({ setId: convexSet._id });
      router.push(`/app/${appId}`);
    } catch (error) {
      console.error('Failed to delete set:', error);
    }
  };

  const handleClearSlot = async () => {
    if (selectedSlot && !('isPlaceholder' in selectedSlot)) {
      try {
        await clearScreenshotMutation({
          screenshotId: selectedSlot._id as Id<"screenshots">
        });
        setShowClearConfirm(false);
        closeRevisePanel();
      } catch (error) {
        console.error('Failed to clear screenshot:', error);
      }
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
          className="px-6 py-4 border-b bg-card/50"
        >
          <div className="flex items-center justify-between">
            {/* Left section with title */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push(`/app/${appId}`)}
                className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              {/* App Icon */}
              {convexApp && (
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {convexApp.iconUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={convexApp.iconUrl}
                      alt={convexApp.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-lg font-bold text-primary">
                      {convexApp.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              )}

              <div className="flex items-center gap-2 group">
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
                          } catch (error) {
                            console.error('Failed to update set name:', error);
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
                            } catch (error) {
                              console.error('Failed to update set name:', error);
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
              </div>
              <span className="text-sm text-muted-foreground">
                {screenshots.filter(s => !s.isEmpty).length} of 10 filled
              </span>
            </div>

            {/* Right section with actions */}
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

              {/* More Options Menu */}
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
            </div>
          </div>

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

      {/* Side Panel / Sheet */}
      {/*AnimatePresence removed for faster transitions*/}
        {isReviseOpen && selectedSlot && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
              onClick={closeRevisePanel}
            />

            {/* Side Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-full max-w-5xl bg-background border-l shadow-2xl z-50 flex flex-col"
            >
              {/* Panel Header */}
              <div className="bg-background border-b px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <span className="font-semibold">{selectedSlot.slotNumber}</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">
                      {selectedSlot.isEmpty ? 'Add Screenshot' : 'Revise Screenshot'}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Slot {selectedSlot.slotNumber} of 10
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!selectedSlot.isEmpty && (
                    <button
                      onClick={() => setShowClearConfirm(true)}
                      className="px-3 py-1.5 text-sm text-muted-foreground hover:text-red-600 transition-colors flex items-center gap-1.5"
                    >
                      <Trash2 className="w-4 h-4" />
                      Clear
                    </button>
                  )}
                  <button
                    onClick={closeRevisePanel}
                    className="p-2 hover:bg-muted/50 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Two Column Layout */}
              <div className="flex-1 flex overflow-hidden">
                {/* Left Column - Options */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 border-r">
                  {selectedSlot.isEmpty ? (
                    // Empty Slot Actions
                    <div className="space-y-3">
                      <div className="grid gap-3">
                        {/* Pick Screenshot from App */}
                        <button
                          onClick={openSourceImagePanel}
                          className="w-full p-4 bg-card border rounded-xl hover:bg-muted/30 hover:border-primary/50 transition-all text-left group"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                              <FolderOpen className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium mb-0.5">Pick Screenshot from Your App</p>
                              <p className="text-sm text-muted-foreground">
                                Choose from your uploaded screenshots
                              </p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors mt-2" />
                          </div>
                        </button>

                        {/* Generate with Theme */}
                        <button
                          onClick={openThemePanel}
                          className="w-full p-4 bg-card border rounded-xl hover:bg-muted/30 hover:border-primary/50 transition-all text-left group"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center group-hover:from-purple-500/30 group-hover:to-pink-500/30 transition-colors">
                              <Sparkles className="w-5 h-5 text-purple-600" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium mb-0.5">Generate with Theme</p>
                              <p className="text-sm text-muted-foreground">
                                Create new screenshot using a theme
                              </p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors mt-2" />
                          </div>
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Filled Slot Actions
                    <>
                      {/* Header Copy Section */}
                      <div className="space-y-3">
                        <h3 className="font-medium text-sm text-muted-foreground">Content</h3>

                        {/* Header Input */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Header</label>
                          <input
                            type="text"
                            value={headerText}
                            onChange={(e) => setHeaderText(e.target.value)}
                            placeholder="Enter header text"
                            className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
                          />
                        </div>

                        {/* Subtitle Input - Conditional */}
                        {showSubtitle ? (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="text-sm font-medium">Subtitle</label>
                              <button
                                onClick={() => {
                                  setShowSubtitle(false);
                                  setSubtitleText('');
                                }}
                                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                              >
                                Remove
                              </button>
                            </div>
                            <input
                              type="text"
                              value={subtitleText}
                              onChange={(e) => setSubtitleText(e.target.value)}
                              placeholder="Enter subtitle text"
                              className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
                            />
                          </div>
                        ) : (
                          <button
                            onClick={() => setShowSubtitle(true)}
                            className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" />
                            Add subtitle
                          </button>
                        )}
                      </div>

                      {/* Screenshot Actions */}
                      <div className="space-y-3 pt-6 border-t">
                        <h3 className="font-medium text-sm text-muted-foreground">Visuals</h3>
                        <div className="grid gap-3">
                          {/* Replace Screenshot */}
                          <button
                            onClick={openSourceImagePanel}
                            className="w-full p-4 bg-card border rounded-xl hover:bg-muted/30 hover:border-primary/50 transition-all text-left group"
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                <FolderOpen className="w-5 h-5 text-primary" />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium mb-0.5">Replace Screenshot</p>
                                <p className="text-sm text-muted-foreground">
                                  Choose from your uploaded screenshots
                                </p>
                              </div>
                              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors mt-2" />
                            </div>
                          </button>

                          {/* Pick/Change Theme */}
                          <button
                            onClick={openThemePanel}
                            className="w-full p-4 bg-card border rounded-xl hover:bg-muted/30 hover:border-primary/50 transition-all text-left group"
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center group-hover:from-purple-500/30 group-hover:to-pink-500/30 transition-colors">
                                <Sparkles className="w-5 h-5 text-purple-600" />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium mb-0.5">
                                  {selectedThemeId ? themes.find(t => t.id === selectedThemeId)?.name : 'Pick Theme'}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {selectedThemeId ? 'Change the theme' : 'Choose a visual theme'}
                                </p>
                              </div>
                              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors mt-2" />
                            </div>
                          </button>

                          {/* Change Layout */}
                          <button
                            onClick={openLayoutPanel}
                            className="w-full p-4 bg-card border rounded-xl hover:bg-muted/30 hover:border-primary/50 transition-all text-left group"
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                                <Layout className="w-5 h-5 text-green-600" />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium mb-0.5">Change Layout</p>
                                <p className="text-sm text-muted-foreground">
                                  Adjust text and device placement
                                </p>
                              </div>
                              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors mt-2" />
                            </div>
                          </button>
                        </div>
                      </div>

                      {/* Additional Actions */}
                      <div className="space-y-3 pt-6 border-t">
                        <h3 className="font-medium text-sm text-muted-foreground">Actions</h3>
                        <div className="grid gap-2">
                          <button className="px-4 py-2 border rounded-lg hover:bg-muted/50 transition-colors flex items-center gap-2 text-sm justify-start">
                            <Palette className="w-4 h-4" />
                            Change Vibe
                          </button>
                          <button className="px-4 py-2 border rounded-lg hover:bg-muted/50 transition-colors flex items-center gap-2 text-sm justify-start">
                            <Languages className="w-4 h-4" />
                            Translate
                          </button>
                          <button className="px-4 py-2 border rounded-lg hover:bg-muted/50 transition-colors flex items-center gap-2 text-sm justify-start">
                            <Download className="w-4 h-4" />
                            Export This Screenshot
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                </div>

                {/* Right Column - Preview */}
                <div className="w-[400px] bg-muted/30 p-6 overflow-y-auto">
                  <div className="space-y-4">
                    <h3 className="font-medium text-sm text-muted-foreground">
                      Preview
                    </h3>

                    {selectedSlot.isEmpty ? (
                      // Empty Slot Preview
                      <div className="bg-card/50 border-2 border-dashed rounded-xl p-6">
                        <div className="aspect-[9/16] bg-muted/20 rounded-lg flex flex-col items-center justify-center">
                          <Plus className="w-12 h-12 text-muted-foreground/50 mb-3" />
                          <p className="text-muted-foreground text-sm">Empty Slot</p>
                          <p className="text-muted-foreground/60 text-xs mt-1">
                            Add a screenshot to this position
                          </p>
                        </div>
                      </div>
                    ) : (
                      // Filled Slot Preview
                      <div className="bg-card border rounded-xl overflow-hidden">
                        <div className={`aspect-[9/16] flex items-center justify-center relative ${
                          selectedSlot.themeId ?
                            `bg-gradient-to-br ${themes.find(t => t.id === selectedSlot.themeId)?.gradient || 'from-muted to-muted/50'}` :
                            'bg-gradient-to-br from-muted to-muted/50'
                        }`}>
                          {/* Show contextual content based on whether there's an actual screenshot */}
                          {selectedSlot.imageUrl ? (
                            // If there's an actual image, we'd show it here
                            <ImageIcon className="w-20 h-20 text-muted-foreground/30" />
                          ) : (
                            // Theme preview placeholder
                            <div className="w-full h-full flex flex-col items-center justify-center p-6">
                              <div className="w-32 h-56 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 mb-4" />
                              <p className="text-sm text-muted-foreground/60">Theme Preview</p>
                            </div>
                          )}
                        </div>
                        <div className="p-4 space-y-3">
                          <div>
                            <p className="font-medium">{selectedSlot.title || `Screenshot ${selectedSlot.slotNumber}`}</p>
                            {selectedSlot.subtitle && (
                              <p className="text-sm text-muted-foreground">{selectedSlot.subtitle}</p>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {selectedSlot.themeId && (
                              <span className="px-2 py-1 bg-purple-500/10 text-purple-600 text-xs rounded-full">
                                {themes.find(t => t.id === selectedSlot.themeId)?.name}
                              </span>
                            )}
                            {convexSet?.language && (
                              <span className="px-2 py-1 bg-blue-500/10 text-blue-600 text-xs rounded-full">
                                {convexSet.language}
                              </span>
                            )}
                            {convexSet?.deviceType && (
                              <span className="px-2 py-1 bg-green-500/10 text-green-600 text-xs rounded-full">
                                {convexSet.deviceType}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Device Frame Info */}
                    <div className="bg-card/50 border rounded-lg p-4 space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">Requirements</p>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Device</span>
                          <span>iPhone 15 Pro</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Dimensions</span>
                          <span>1290 × 2796 px</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Aspect Ratio</span>
                          <span>9:19.5</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      {/*AnimatePresence end*/}

      {/* Clear Confirmation Dialog */}
      {/*AnimatePresence removed for faster transitions*/}
        {showClearConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
              onClick={() => setShowClearConfirm(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-card border rounded-xl shadow-2xl z-[61] p-6"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-1">Clear Screenshot?</h3>
                  <p className="text-sm text-muted-foreground">
                    This will remove the screenshot from slot {selectedSlot?.slotNumber}. You can add a new screenshot to this slot later.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="px-4 py-2 text-sm hover:bg-muted/50 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearSlot}
                  className="px-4 py-2 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                >
                  Clear Screenshot
                </button>
              </div>
            </motion.div>
          </>
        )}
      {/*AnimatePresence end*/}

      {/* Delete Set Confirmation Dialog */}
      {/*AnimatePresence removed for faster transitions*/}
        {showDeleteConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
              onClick={() => setShowDeleteConfirm(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-card border rounded-xl shadow-2xl z-[61] p-6"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-destructive/10 rounded-lg">
                  <Trash2 className="w-6 h-6 text-destructive" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">Delete Set?</h3>
                  <p className="text-sm text-muted-foreground mb-1">
                    Are you sure you want to delete &ldquo;{setName}&rdquo;?
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {screenshots.filter(s => !s.isEmpty).length > 0
                      ? `This will permanently delete all ${screenshots.filter(s => !s.isEmpty).length} screenshots in this set.`
                      : 'This will permanently delete this set.'}
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-sm hover:bg-muted/50 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleDeleteSet();
                    setShowDeleteConfirm(false);
                  }}
                  className="px-4 py-2 text-sm bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-lg transition-colors"
                >
                  Delete Set
                </button>
              </div>
            </motion.div>
          </>
        )}
      {/*AnimatePresence end*/}

      {/* Source Images Stacked Panel */}
      {/*AnimatePresence removed for faster transitions*/}
        {isSourceImagePanelOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[70]"
              onClick={closeSourceImagePanel}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-full max-w-4xl bg-background border-l shadow-2xl z-[71] flex flex-col"
            >
              {/* Panel Header */}
              <div className="bg-background border-b px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Select Screenshot</h2>
                  <p className="text-sm text-muted-foreground">
                    Choose a screenshot for slot {selectedSlot?.slotNumber}
                  </p>
                </div>
                <button
                  onClick={closeSourceImagePanel}
                  className="p-2 hover:bg-muted/50 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search Bar */}
              <div className="px-6 py-3 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search screenshots..."
                    className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg bg-background focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
                  />
                </div>
              </div>

              {/* Images Grid */}
              <div className="flex-1 overflow-y-auto p-6">
                {/* Zero State */}
                <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <ImageIcon className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No Screenshots Yet</h3>
                  <p className="text-muted-foreground max-w-sm mb-6">
                    Upload screenshots from your app to get started
                  </p>
                  <button
                    onClick={() => {
                      // Would trigger file upload
                      console.log('Upload source images');
                    }}
                    className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Screenshots
                  </button>
                </div>

                {/* When images are available, show grid */}
                {/* <div className="grid grid-cols-3 gap-4">
                  {sourceImages.map((image) => (
                    <button
                      key={image.id}
                      onClick={() => {
                        // Select this image for the slot
                        console.log('Selected image:', image.id, 'for slot:', selectedSlot?.slotNumber);
                        closeSourceImagePanel();
                      }}
                      className="group relative aspect-[9/16] bg-card border rounded-lg overflow-hidden hover:border-primary hover:shadow-lg transition-all"
                    >
                      <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                        <ImageIcon className="w-12 h-12 text-muted-foreground/30" />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
                        <p className="text-white text-sm font-medium truncate">{image.name}</p>
                      </div>
                      <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Check className="w-8 h-8 text-primary" />
                      </div>
                    </button>
                  ))}
                </div> */}
              </div>

              {/* Footer Actions */}
              <div className="border-t px-6 py-4 flex items-center justify-between">
                <button
                  onClick={closeSourceImagePanel}
                  className="px-4 py-2 text-sm hover:bg-muted/50 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    router.push(`/app/${appId}/app-screens`);
                  }}
                  className="px-4 py-2 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors"
                >
                  Manage All Images
                </button>
              </div>
            </motion.div>
          </>
        )}
      {/*AnimatePresence end*/}

      {/* Theme Selection Panel */}
      {/*AnimatePresence removed for faster transitions*/}
        {isThemePanelOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[72]"
              onClick={closeThemePanel}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-full max-w-3xl bg-background border-l shadow-2xl z-[73] flex flex-col"
            >
              {/* Panel Header */}
              <div className="bg-background border-b px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Choose Theme</h2>
                  <p className="text-sm text-muted-foreground">
                    Select a visual style for your screenshot
                  </p>
                </div>
                <button
                  onClick={closeThemePanel}
                  className="p-2 hover:bg-muted/50 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Themes Grid */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {themes.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => {
                        selectTheme(theme.id);
                        if (selectedSlot) {
                          updateScreenshot(selectedSlot._id, { themeId: theme.id });
                        }
                        closeThemePanel();
                      }}
                      className={`group relative aspect-[9/16] rounded-xl overflow-hidden border-2 transition-all ${
                        selectedThemeId === theme.id
                          ? 'border-primary shadow-lg scale-[0.98]'
                          : 'border-border hover:border-primary/50 hover:shadow-lg'
                      }`}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} opacity-20`} />
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                        <div className="w-20 h-32 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30 mb-3" />
                        <p className="font-medium text-sm mb-1">{theme.name}</p>
                        <p className="text-xs text-muted-foreground">{theme.description}</p>
                      </div>
                      {selectedThemeId === theme.id && (
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      {/*AnimatePresence end*/}

      {/* Layout Selection Panel */}
      {/*AnimatePresence removed for faster transitions*/}
        {isLayoutPanelOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[74]"
              onClick={closeLayoutPanel}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-full max-w-3xl bg-background border-l shadow-2xl z-[75] flex flex-col"
            >
              {/* Panel Header */}
              <div className="bg-background border-b px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Choose Layout</h2>
                  <p className="text-sm text-muted-foreground">
                    Select how text and device are positioned
                  </p>
                </div>
                <button
                  onClick={closeLayoutPanel}
                  className="p-2 hover:bg-muted/50 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Layout Options */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-2 gap-4">
                  {layouts.map((layout) => (
                    <button
                      key={layout.id}
                      onClick={() => {
                        selectLayout(layout.id);
                        if (selectedSlot) {
                          updateScreenshot(selectedSlot._id, { layoutId: layout.id });
                        }
                        closeLayoutPanel();
                      }}
                      className="group p-6 bg-card border rounded-xl hover:bg-muted/30 hover:border-primary/50 transition-all"
                    >
                      <div className="text-3xl mb-3 font-mono text-center text-muted-foreground">
                        {layout.icon}
                      </div>
                      <p className="font-medium text-sm mb-1">{layout.name}</p>
                      <p className="text-xs text-muted-foreground">{layout.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      {/*AnimatePresence end*/}
    </div>
  );
}