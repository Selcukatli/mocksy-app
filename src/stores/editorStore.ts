import { create } from 'zustand';
import { Screenshot } from '@/types';

interface EditorStore {
  // Active editing state
  activeSetId: string | null;
  activeScreenshotId: string | null;
  activeSlotNumber: number | null;

  // Panel visibility
  isReviseOpen: boolean;
  isSourceImagePanelOpen: boolean;
  isThemePanelOpen: boolean;
  isLayoutPanelOpen: boolean;

  // Temporary edits (before saving)
  tempScreenshot: Partial<Screenshot> | null;

  // Selection state
  selectedSourceImageId: string | null;
  selectedThemeId: string | null;
  selectedLayoutId: string | null;

  // Actions - Active editing
  setActiveSlot: (setId: string, screenshotId: string, slotNumber: number) => void;
  clearActiveSlot: () => void;

  // Actions - Panels
  openRevisePanel: () => void;
  closeRevisePanel: () => void;
  openSourceImagePanel: () => void;
  closeSourceImagePanel: () => void;
  openThemePanel: () => void;
  closeThemePanel: () => void;
  openLayoutPanel: () => void;
  closeLayoutPanel: () => void;
  closeAllPanels: () => void;

  // Actions - Temporary edits
  updateTempScreenshot: (updates: Partial<Screenshot>) => void;
  applyTempChanges: () => void;
  discardTempChanges: () => void;

  // Actions - Selection
  selectSourceImage: (imageId: string | null) => void;
  selectTheme: (themeId: string | null) => void;
  selectLayout: (layoutId: string | null) => void;

  // Utility
  reset: () => void;
}

export const useEditorStore = create<EditorStore>((set, get) => ({
  // Initial state
  activeSetId: null,
  activeScreenshotId: null,
  activeSlotNumber: null,

  isReviseOpen: false,
  isSourceImagePanelOpen: false,
  isThemePanelOpen: false,
  isLayoutPanelOpen: false,

  tempScreenshot: null,

  selectedSourceImageId: null,
  selectedThemeId: null,
  selectedLayoutId: null,

  // Active editing actions
  setActiveSlot: (setId, screenshotId, slotNumber) => {
    set({
      activeSetId: setId,
      activeScreenshotId: screenshotId,
      activeSlotNumber: slotNumber,
      isReviseOpen: true,
    });
  },

  clearActiveSlot: () => {
    set({
      activeSetId: null,
      activeScreenshotId: null,
      activeSlotNumber: null,
      tempScreenshot: null,
    });
  },

  // Panel actions
  openRevisePanel: () => set({ isReviseOpen: true }),
  closeRevisePanel: () => set({ isReviseOpen: false }),

  openSourceImagePanel: () => set({ isSourceImagePanelOpen: true }),
  closeSourceImagePanel: () => set({ isSourceImagePanelOpen: false, selectedSourceImageId: null }),

  openThemePanel: () => set({ isThemePanelOpen: true }),
  closeThemePanel: () => set({ isThemePanelOpen: false, selectedThemeId: null }),

  openLayoutPanel: () => set({ isLayoutPanelOpen: true }),
  closeLayoutPanel: () => set({ isLayoutPanelOpen: false, selectedLayoutId: null }),

  closeAllPanels: () => {
    set({
      isReviseOpen: false,
      isSourceImagePanelOpen: false,
      isThemePanelOpen: false,
      isLayoutPanelOpen: false,
      tempScreenshot: null,
      selectedSourceImageId: null,
      selectedThemeId: null,
      selectedLayoutId: null,
    });
  },

  // Temporary edit actions
  updateTempScreenshot: (updates) => {
    set((state) => ({
      tempScreenshot: { ...state.tempScreenshot, ...updates },
    }));
  },

  applyTempChanges: () => {
    // This would be called to save changes to the appStore
    // The actual saving logic would be handled by the component
    set({ tempScreenshot: null });
  },

  discardTempChanges: () => {
    set({ tempScreenshot: null });
  },

  // Selection actions
  selectSourceImage: (imageId) => {
    set({ selectedSourceImageId: imageId });
    if (imageId) {
      get().updateTempScreenshot({ imageUrl: imageId });
    }
  },

  selectTheme: (themeId) => {
    set({ selectedThemeId: themeId });
    if (themeId) {
      get().updateTempScreenshot({ themeId });
    }
  },

  selectLayout: (layoutId) => {
    set({ selectedLayoutId: layoutId });
    if (layoutId) {
      get().updateTempScreenshot({ layoutId });
    }
  },

  // Utility
  reset: () => {
    set({
      activeSetId: null,
      activeScreenshotId: null,
      activeSlotNumber: null,
      isReviseOpen: false,
      isSourceImagePanelOpen: false,
      isThemePanelOpen: false,
      isLayoutPanelOpen: false,
      tempScreenshot: null,
      selectedSourceImageId: null,
      selectedThemeId: null,
      selectedLayoutId: null,
    });
  },
}));