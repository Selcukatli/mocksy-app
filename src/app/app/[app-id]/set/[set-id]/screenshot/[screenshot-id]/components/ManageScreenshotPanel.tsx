'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ChevronRight,
  Upload,
  Palette,
  Layout,
  Sparkles,
  RefreshCw,
  ImageIcon,
  Plus,
  Trash2,
  Smartphone
} from 'lucide-react';
import { useEditorStore } from '@/stores/editorStore';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import { Id, Doc } from '@convex/_generated/dataModel';

interface ManageScreenshotPanelProps {
  selectedSlot: Doc<"screenshots"> | null;
  headerText: string;
  subtitleText: string;
  onHeaderChange: (value: string) => void;
  onSubtitleChange: (value: string) => void;
  onClose?: () => void;
  isOpen?: boolean;
  onCreateScreenshot?: (title?: string, subtitle?: string) => Promise<void>;
  appId?: string;
}

export default function ManageScreenshotPanel({
  selectedSlot,
  headerText,
  subtitleText,
  onHeaderChange,
  onSubtitleChange,
  onClose,
  isOpen = false,
  onCreateScreenshot,
  appId,
}: ManageScreenshotPanelProps) {
  const [showSubtitle, setShowSubtitle] = useState(!!subtitleText);
  const [selectedAppScreen, setSelectedAppScreen] = useState<string | null>(null);
  const [selectedAppScreenUrl, setSelectedAppScreenUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearFromPanel, setClearFromPanel] = useState(false);
  const [artDirection, setArtDirection] = useState('');
  const {
    isSourceImagePanelOpen,
    isThemePanelOpen,
    isLayoutPanelOpen,
    closeRevisePanel,
    openSourceImagePanel,
    closeSourceImagePanel,
    openThemePanel,
    closeThemePanel,
    openLayoutPanel,
    closeLayoutPanel,
    selectSourceImage,
  } = useEditorStore();

  const updateScreenshotMutation = useMutation(api.screenshots.updateScreenshot);
  const generateUploadUrl = useMutation(api.fileStorage.fileUploads.generateUploadUrl);
  const uploadAppScreenMutation = useMutation(api.appScreens.uploadAppScreen);

  // Fetch app screens from Convex
  const appScreensQuery = useQuery(
    api.appScreens.getAppScreens,
    appId ? { appId: appId as Id<"apps"> } : "skip"
  );
  const appScreens = useMemo(() => appScreensQuery || [], [appScreensQuery]);

  // Update showSubtitle when subtitleText changes
  useEffect(() => {
    setShowSubtitle(!!subtitleText);
  }, [subtitleText]);

  // Set initial selected app screen if the screenshot already has one
  useEffect(() => {
    if (selectedSlot && !selectedSlot.isEmpty && selectedSlot.appScreenId) {
      setSelectedAppScreen(selectedSlot.appScreenId);
      const screen = appScreens.find(s => s._id === selectedSlot.appScreenId);
      if (screen) {
        setSelectedAppScreenUrl(screen.screenUrl || null);
      }
    }
  }, [selectedSlot, appScreens]);

  // Handle ESC key press to close panel
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (onClose) {
          onClose();
        } else {
          closeRevisePanel();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, closeRevisePanel]);

  const handleGenerateClick = async () => {
    if (!selectedSlot) return;

    // Check if this is a new slot or empty screenshot
    if (selectedSlot.isEmpty || selectedSlot._id.toString().startsWith('new-')) {
      // Create new screenshot
      if (onCreateScreenshot) {
        await onCreateScreenshot(headerText, subtitleText);
      }
    } else {
      // Update existing screenshot
      try {
        await updateScreenshotMutation({
          screenshotId: selectedSlot._id as Id<"screenshots">,
          title: headerText,
          subtitle: subtitleText,
        });
      } catch {
      }
    }
    // TODO: Implement actual screenshot generation
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      closeRevisePanel();
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !appId) return;

    setIsUploading(true);
    try {
      // Get upload URL from Convex
      const postUrl = await generateUploadUrl();

      // Upload the file
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      const { storageId } = await result.json();

      // Create image to get dimensions
      const img = new Image();
      img.src = URL.createObjectURL(file);
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      // Save app screen record
      const screenId = await uploadAppScreenMutation({
        appId: appId as Id<"apps">,
        name: file.name.replace(/\.[^/.]+$/, ""),
        storageId,
        dimensions: {
          width: img.width,
          height: img.height,
        },
        size: file.size,
      });

      // Select the newly uploaded screen
      setSelectedAppScreen(screenId);
      selectSourceImage(screenId);

      // Get the URL for the newly uploaded screen
      const newScreenUrl = URL.createObjectURL(file);
      setSelectedAppScreenUrl(newScreenUrl);

      // Close the panel after successful upload
      closeSourceImagePanel();
    } catch (error) {
      console.error("Error uploading app screen:", error);
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen || !selectedSlot) return null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
        onClick={handleClose}
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
                {selectedSlot.isEmpty ? 'Create a new screenshot for this slot' : 'Edit and regenerate your screenshot'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground hidden sm:inline">ESC</span>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              title="Close (ESC)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Panel Content */}
        <div className="flex-1 flex">
          {/* Left Side - Controls */}
          <div className="w-[400px] border-r bg-muted/30 p-6 overflow-y-auto">
            <div className="space-y-6">
              {/* Text Inputs */}
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">
                      Header Text
                    </label>
                    {!showSubtitle && (
                      <button
                        onClick={() => setShowSubtitle(true)}
                        className="text-xs text-primary hover:underline"
                      >
                        Add subtitle
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={headerText}
                    onChange={(e) => onHeaderChange(e.target.value)}
                    placeholder="Enter header text..."
                    className="w-full px-3 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                  />
                </div>
                {showSubtitle && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium">
                        Subtitle Text
                      </label>
                      <button
                        onClick={() => {
                          setShowSubtitle(false);
                          onSubtitleChange('');
                        }}
                        className="text-xs text-destructive hover:underline flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        Remove subtitle
                      </button>
                    </div>
                    <textarea
                      value={subtitleText}
                      onChange={(e) => onSubtitleChange(e.target.value)}
                      placeholder="Enter subtitle text..."
                      rows={3}
                      className="w-full px-3 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none resize-none"
                    />
                  </div>
                )}
              </div>

              {/* Options */}
              <div className="space-y-3">
                <div className="relative">
                  <button
                    onClick={openSourceImagePanel}
                    className="w-full p-3 bg-background hover:bg-muted/50 border rounded-lg transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Smartphone className="w-5 h-5 text-muted-foreground" />
                        <div className="text-left">
                          <p className="font-medium">App Screen</p>
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-muted-foreground">
                              {selectedAppScreen
                                ? `${appScreens.find(s => s._id === selectedAppScreen)?.name || 'Screen'}`
                                : 'Choose from uploaded screens'}
                            </p>
                            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </div>
                      </div>
                      {selectedAppScreenUrl && (
                        <div className="relative w-8 h-14 rounded overflow-hidden bg-muted">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={selectedAppScreenUrl}
                            alt="Selected screen"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </button>
                  {selectedAppScreen && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setClearFromPanel(false);
                        setShowClearConfirm(true);
                      }}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-muted hover:bg-muted/80 border border-border rounded-full transition-colors flex items-center justify-center shadow-sm"
                      title="Clear selection"
                    >
                      <X className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  )}
                </div>

                <button
                  onClick={openThemePanel}
                  className="w-full p-3 bg-background hover:bg-muted/50 border rounded-lg transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <Palette className="w-5 h-5 text-muted-foreground" />
                    <div className="text-left">
                      <p className="font-medium">Theme & Vibe</p>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-muted-foreground">Select visual style</p>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={openLayoutPanel}
                  className="w-full p-3 bg-background hover:bg-muted/50 border rounded-lg transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <Layout className="w-5 h-5 text-muted-foreground" />
                    <div className="text-left">
                      <p className="font-medium">Layout</p>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-muted-foreground">Adjust composition</p>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </div>
                </button>
              </div>

              {/* Art Direction */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">
                    Describe Visual Style
                  </label>
                  <span className="text-xs text-muted-foreground">optional</span>
                </div>
                <textarea
                  value={artDirection}
                  onChange={(e) => setArtDirection(e.target.value)}
                  placeholder="E.g., vibrant colors with geometric shapes, minimalist with soft gradients, dark mode with neon accents..."
                  rows={3}
                  className="w-full px-3 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none resize-none text-sm"
                />
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerateClick}
                className="w-full py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                {selectedSlot.isEmpty ? (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Screenshot
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-5 h-5" />
                    Regenerate Screenshot
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Side - Preview */}
          <div className="flex-1 flex items-center justify-center p-6 bg-gradient-to-br from-muted/5 via-muted/10 to-muted/5">
            <div className="w-full max-w-[280px]">
              {/* App Store Screenshot Preview */}
              <div className="relative">
                {/* Screenshot Container - App Store dimensions 1290x2796 (6.7" display) */}
                <div className="aspect-[1290/2796] bg-gradient-to-br from-slate-900 to-slate-800 rounded-[30px] overflow-hidden shadow-2xl relative">
                  <div className="w-full h-full flex flex-col">
                    {/* Header Section - Always visible, center aligned */}
                    <div className={`px-6 ${
                      showSubtitle && subtitleText
                        ? 'pt-8 pb-2'
                        : 'pt-10 pb-3'
                    } bg-gradient-to-b from-black/90 via-black/70 to-transparent relative z-10`}>
                      <div className="space-y-1 text-center">
                        <input
                          type="text"
                          value={headerText}
                          onChange={(e) => onHeaderChange(e.target.value)}
                          placeholder="Enter header text..."
                          className={`font-bold text-white text-center bg-transparent w-full outline-none placeholder:text-white/40 placeholder:font-normal ${
                            showSubtitle && subtitleText ? 'text-xl' : 'text-2xl'
                          }`}
                        />
                        {showSubtitle && (
                          <textarea
                            value={subtitleText}
                            onChange={(e) => onSubtitleChange(e.target.value)}
                            placeholder="Enter subtitle..."
                            rows={2}
                            className="text-xs text-white/90 text-center bg-transparent w-full outline-none resize-none placeholder:text-white/40 leading-relaxed max-w-[90%] mx-auto"
                          />
                        )}
                      </div>
                    </div>

                    {/* App Screen Content Area with padding */}
                    <div className="flex-1 relative px-4 pb-6 flex items-center justify-center">
                      <div
                        className="rounded-[20px] overflow-hidden relative bg-black group cursor-pointer"
                        onClick={openSourceImagePanel}
                      >
                        {selectedAppScreenUrl ? (
                          // Show selected app screen with natural dimensions
                          <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={selectedAppScreenUrl}
                              alt="App screen"
                              className="max-w-full max-h-full object-contain transition-opacity group-hover:opacity-75"
                            />
                            {/* Hover overlay */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center gap-2">
                                <Upload className="w-4 h-4 text-white" />
                                <span className="text-sm text-white font-medium">Change App Screen</span>
                              </div>
                            </div>
                          </>
                        ) : !selectedSlot.isEmpty && selectedSlot.imageStorageId ? (
                          // Show existing screenshot if available
                          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                            <p className="text-sm text-white/60">Generated Screenshot</p>
                          </div>
                        ) : (
                          // Empty state - maintain aspect ratio
                          <div className="w-[240px] aspect-[9/16] bg-black/20 flex flex-col items-center justify-center p-8 transition-colors group-hover:bg-black/30">
                            <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                              <ImageIcon className="w-10 h-10 text-white/40 group-hover:text-white/60 transition-colors" />
                            </div>
                            <p className="text-lg font-medium text-center mb-2 text-white/60">No App Screen</p>
                            <p className="text-sm text-white/40 text-center group-hover:text-white/60 transition-colors">
                              Click to select an app screen
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview Info */}
              <div className="mt-6 text-center space-y-1">
                <p className="text-xs text-muted-foreground">
                  App Store Preview • 1290 × 2796px
                </p>
                <p className="text-xs text-muted-foreground/60">
                  iPhone 15 Pro Max (6.7&quot;)
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* App Screen Selection Panel */}
      <AnimatePresence>
        {isSourceImagePanelOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
              onClick={closeSourceImagePanel}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="fixed right-0 top-0 h-full w-full max-w-4xl bg-background border-l shadow-2xl z-50 flex flex-col"
            >
            <div className="p-6 border-b flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Select App Screen</h3>
                <p className="text-sm text-muted-foreground mt-1">Choose a screen or upload a new one</p>
              </div>
              <div className="flex items-center gap-2">
                {selectedAppScreen && (
                  <button
                    onClick={() => {
                      setClearFromPanel(true);
                      setShowClearConfirm(true);
                    }}
                    className="px-3 py-1.5 text-sm bg-muted hover:bg-muted/80 rounded-lg transition-colors"
                  >
                    Clear Selection
                  </button>
                )}
                <button
                  onClick={closeSourceImagePanel}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                  title="Close (ESC)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                {/* Upload new screen card */}
                <label className="group cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                  <div className="aspect-[9/16] border-2 border-dashed border-muted-foreground/30 rounded-xl flex flex-col items-center justify-center hover:bg-muted/20 hover:border-primary/50 cursor-pointer transition-all">
                    {isUploading ? (
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3" />
                        <span className="text-sm font-medium text-muted-foreground">Uploading...</span>
                      </div>
                    ) : (
                      <>
                        <div className="p-4 rounded-full bg-muted/50 group-hover:bg-primary/10 transition-colors mb-3">
                          <Plus className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <span className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">Upload Screen</span>
                      </>
                    )}
                  </div>
                </label>

                {/* App screens */}
                {appScreens.map((screen) => (
                  <div
                    key={screen._id}
                    className="group cursor-pointer"
                    onClick={() => {
                      setSelectedAppScreen(screen._id);
                      setSelectedAppScreenUrl(screen.screenUrl || null);
                      selectSourceImage(screen._id);
                      closeSourceImagePanel();
                    }}
                  >
                    <div className={`aspect-[9/16] relative rounded-xl overflow-hidden transition-all ${
                      selectedAppScreen === screen._id
                        ? 'ring-2 ring-primary ring-offset-2'
                        : 'hover:ring-2 hover:ring-primary/50 hover:ring-offset-2'
                    }`}>
                      {screen.screenUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={screen.screenUrl}
                          alt={screen.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                          <ImageIcon className="w-12 h-12 text-muted-foreground/30" />
                        </div>
                      )}

                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                      {/* Selected indicator */}
                      {selectedAppScreen === screen._id && (
                        <div className="absolute top-3 right-3">
                          <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shadow-lg">
                            <svg className="w-4 h-4 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </div>
                      )}

                      {/* Screen name */}
                      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                        <p className="text-xs text-white font-medium truncate">{screen.name}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {appScreens.length === 0 && (
                <div className="text-center py-16">
                  <div className="w-20 h-20 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-4">
                    <ImageIcon className="w-10 h-10 text-muted-foreground/50" />
                  </div>
                  <h4 className="text-lg font-medium mb-2">No app screens yet</h4>
                  <p className="text-sm text-muted-foreground mb-6">Upload your first app screen to get started</p>
                  <label className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={isUploading}
                    />
                    {isUploading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Upload App Screen
                      </>
                    )}
                  </label>
                </div>
              )}
            </div>
          </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Theme Panel */}
      <AnimatePresence>
        {isThemePanelOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
              onClick={closeThemePanel}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="fixed right-0 top-0 h-full w-full max-w-3xl bg-background border-l shadow-2xl z-50 flex flex-col"
            >
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">Choose Theme</h3>
              <button
                onClick={closeThemePanel}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="grid grid-cols-3 gap-4">
                {/* TODO: Add theme options */}
                <div className="aspect-square border rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 cursor-pointer hover:scale-105 transition-transform" />
                <div className="aspect-square border rounded-lg bg-gradient-to-br from-green-500 to-teal-500 cursor-pointer hover:scale-105 transition-transform" />
                <div className="aspect-square border rounded-lg bg-gradient-to-br from-orange-500 to-red-500 cursor-pointer hover:scale-105 transition-transform" />
              </div>
            </div>
            <div className="p-6 border-t">
              <button
                onClick={() => {
                  // TODO: Handle theme selection
                  closeThemePanel();
                }}
                className="w-full py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors"
              >
                Apply Theme
              </button>
            </div>
          </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Layout Panel */}
      <AnimatePresence>
        {isLayoutPanelOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
              onClick={closeLayoutPanel}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="fixed right-0 top-0 h-full w-full max-w-3xl bg-background border-l shadow-2xl z-50 flex flex-col"
            >
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">Select Layout</h3>
              <button
                onClick={closeLayoutPanel}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="grid grid-cols-3 gap-4">
                {/* TODO: Add layout templates */}
                <div className="aspect-[9/16] border rounded-lg bg-muted cursor-pointer hover:border-primary transition-colors" />
                <div className="aspect-[9/16] border rounded-lg bg-muted cursor-pointer hover:border-primary transition-colors" />
                <div className="aspect-[9/16] border rounded-lg bg-muted cursor-pointer hover:border-primary transition-colors" />
              </div>
            </div>
            <div className="p-6 border-t">
              <button
                onClick={() => {
                  // TODO: Handle layout selection
                  closeLayoutPanel();
                }}
                className="w-full py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors"
              >
                Apply Layout
              </button>
            </div>
          </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Clear Confirmation Dialog */}
      <AnimatePresence>
        {showClearConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center"
              onClick={() => setShowClearConfirm(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                className="bg-background border rounded-xl p-6 max-w-sm mx-4 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-lg font-semibold mb-2">Clear App Screen?</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Are you sure you want to remove the selected app screen? You can always select it again later.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="flex-1 px-4 py-2 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setSelectedAppScreen(null);
                      setSelectedAppScreenUrl(null);
                      if (clearFromPanel) {
                        selectSourceImage(null);
                        closeSourceImagePanel();
                      }
                      setShowClearConfirm(false);
                      setClearFromPanel(false);
                    }}
                    className="flex-1 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}