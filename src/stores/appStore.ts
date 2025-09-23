import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { App, Set, Screenshot, SourceImage, Vibe } from '@/types';

interface AppStore {
  // Data
  apps: App[];
  sets: Set[];
  screenshots: Screenshot[];
  sourceImages: SourceImage[];
  customVibes: Vibe[];

  // Favorites
  favoriteVibes: string[];

  // Actions - Apps
  createApp: (name: string, description?: string) => App;
  updateApp: (id: string, updates: Partial<App>) => void;
  deleteApp: (id: string) => void;
  getApp: (id: string) => App | undefined;

  // Actions - Sets
  createSet: (appId: string, name: string) => Set;
  updateSet: (id: string, updates: Partial<Set>) => void;
  deleteSet: (id: string) => void;
  getSet: (id: string) => Set | undefined;
  getSetsForApp: (appId: string) => Set[];

  // Actions - Screenshots
  createScreenshot: (setId: string, slotNumber: number) => Screenshot;
  updateScreenshot: (id: string, updates: Partial<Screenshot>) => void;
  deleteScreenshot: (id: string) => void;
  getScreenshot: (id: string) => Screenshot | undefined;
  getScreenshotsForSet: (setId: string) => Screenshot[];

  // Actions - Source Images
  uploadSourceImage: (appId: string, file: File) => Promise<SourceImage>;
  deleteSourceImage: (id: string) => void;
  getSourceImagesForApp: (appId: string) => SourceImage[];

  // Actions - Custom Vibes
  createCustomVibe: (vibe: Omit<Vibe, 'id' | 'createdAt' | 'createdByUser'>) => Vibe;
  updateCustomVibe: (id: string, updates: Partial<Vibe>) => void;
  deleteCustomVibe: (id: string) => void;
  getCustomVibes: () => Vibe[];
  getAllVibes: () => Vibe[]; // Returns both mock and custom vibes

  // Actions - Favorites
  toggleFavoriteVibe: (vibeId: string) => void;
  isFavoriteVibe: (vibeId: string) => boolean;

  // Utility
  clearAllData: () => void;
  exportData: () => string;
  importData: (jsonData: string) => boolean;
}

// Helper function to generate IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

// Helper function to convert File to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
  });
};

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Initial data
      apps: [],
      sets: [],
      screenshots: [],
      sourceImages: [],
      customVibes: [],
      favoriteVibes: [],

      // App actions
      createApp: (name, description) => {
        const newApp: App = {
          id: generateId(),
          name,
          description,
          sets: [],
          sourceImages: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({ apps: [...state.apps, newApp] }));
        return newApp;
      },

      updateApp: (id, updates) => {
        set((state) => ({
          apps: state.apps.map((app) =>
            app.id === id ? { ...app, ...updates, updatedAt: new Date() } : app
          ),
        }));
      },

      deleteApp: (id) => {
        const app = get().getApp(id);
        if (app) {
          // Delete all sets and screenshots for this app
          app.sets.forEach((setId) => {
            get().deleteSet(setId);
          });
          // Delete all source images
          const sourceImages = get().getSourceImagesForApp(id);
          sourceImages.forEach((img) => get().deleteSourceImage(img.id));
        }
        set((state) => ({
          apps: state.apps.filter((app) => app.id !== id),
        }));
      },

      getApp: (id) => {
        return get().apps.find((app) => app.id === id);
      },

      // Set actions
      createSet: (appId, name) => {
        const newSet: Set = {
          id: generateId(),
          appId,
          name,
          screenshots: [],
          deviceType: 'iPhone 15 Pro',
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // Initialize with 10 empty screenshot slots
        const screenshots: Screenshot[] = [];
        for (let i = 1; i <= 10; i++) {
          const screenshot: Screenshot = {
            id: generateId(),
            slotNumber: i,
            isEmpty: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          screenshots.push(screenshot);
        }
        newSet.screenshots = screenshots;


        set((state) => ({
          sets: [...state.sets, newSet],
          screenshots: [...state.screenshots, ...screenshots],
          apps: state.apps.map((app) =>
            app.id === appId
              ? { ...app, sets: [...app.sets, newSet.id], updatedAt: new Date() }
              : app
          ),
        }));
        return newSet;
      },

      updateSet: (id, updates) => {
        set((state) => ({
          sets: state.sets.map((set) =>
            set.id === id ? { ...set, ...updates, updatedAt: new Date() } : set
          ),
        }));
      },

      deleteSet: (id) => {
        const setToDelete = get().getSet(id);
        if (setToDelete) {
          // Delete all screenshots for this set
          setToDelete.screenshots.forEach((screenshot) => {
            get().deleteScreenshot(screenshot.id);
          });
        }
        set((state) => ({
          sets: state.sets.filter((s) => s.id !== id),
          apps: state.apps.map((app) => ({
            ...app,
            sets: app.sets.filter((setId) => setId !== id),
          })),
        }));
      },

      getSet: (id) => {
        return get().sets.find((set) => set.id === id);
      },

      getSetsForApp: (appId) => {
        return get().sets.filter((set) => set.appId === appId);
      },

      // Screenshot actions
      createScreenshot: (setId, slotNumber) => {
        const newScreenshot: Screenshot = {
          id: generateId(),
          slotNumber,
          isEmpty: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({
          screenshots: [...state.screenshots, newScreenshot],
        }));
        return newScreenshot;
      },

      updateScreenshot: (id, updates) => {
        set((state) => ({
          screenshots: state.screenshots.map((screenshot) =>
            screenshot.id === id
              ? { ...screenshot, ...updates, isEmpty: false, updatedAt: new Date() }
              : screenshot
          ),
          sets: state.sets.map((set) => ({
            ...set,
            screenshots: set.screenshots.map((screenshot) =>
              screenshot.id === id
                ? { ...screenshot, ...updates, isEmpty: false, updatedAt: new Date() }
                : screenshot
            ),
          })),
        }));
      },

      deleteScreenshot: (id) => {
        set((state) => ({
          screenshots: state.screenshots.filter((s) => s.id !== id),
          sets: state.sets.map((set) => ({
            ...set,
            screenshots: set.screenshots.filter((screenshot) => screenshot.id !== id),
          })),
        }));
      },

      getScreenshot: (id) => {
        return get().screenshots.find((screenshot) => screenshot.id === id);
      },

      getScreenshotsForSet: (setId) => {
        const set = get().getSet(setId);
        if (!set) {
          return [];
        }
        // Screenshots are stored directly in the set, not as IDs
        return set.screenshots || [];
      },

      // Source Image actions
      uploadSourceImage: async (appId, file) => {
        const base64 = await fileToBase64(file);
        const img = new Image();

        return new Promise((resolve) => {
          img.onload = () => {
            const newImage: SourceImage = {
              id: generateId(),
              appId,
              name: file.name,
              url: base64,
              dimensions: {
                width: img.width,
                height: img.height,
              },
              size: file.size,
              uploadedAt: new Date(),
            };

            set((state) => ({
              sourceImages: [...state.sourceImages, newImage],
            }));

            resolve(newImage);
          };
          img.src = base64;
        });
      },

      deleteSourceImage: (id) => {
        set((state) => ({
          sourceImages: state.sourceImages.filter((img) => img.id !== id),
        }));
      },

      getSourceImagesForApp: (appId) => {
        return get().sourceImages.filter((img) => img.appId === appId);
      },

      // Custom Vibe actions
      createCustomVibe: (vibeData) => {
        const newVibe: Vibe = {
          ...vibeData,
          id: generateId(),
          createdAt: new Date(),
          createdByUser: true,
        };
        set((state) => ({
          customVibes: [...state.customVibes, newVibe],
        }));
        return newVibe;
      },

      updateCustomVibe: (id, updates) => {
        set((state) => ({
          customVibes: state.customVibes.map((vibe) =>
            vibe.id === id ? { ...vibe, ...updates } : vibe
          ),
        }));
      },

      deleteCustomVibe: (id) => {
        set((state) => ({
          customVibes: state.customVibes.filter((vibe) => vibe.id !== id),
          favoriteVibes: state.favoriteVibes.filter((favId) => favId !== id),
        }));
      },

      getCustomVibes: () => {
        return get().customVibes;
      },

      getAllVibes: () => {
        // This will be merged with mock vibes from mockDataStore in components
        return get().customVibes;
      },

      // Favorite actions
      toggleFavoriteVibe: (vibeId) => {
        set((state) => ({
          favoriteVibes: state.favoriteVibes.includes(vibeId)
            ? state.favoriteVibes.filter((id) => id !== vibeId)
            : [...state.favoriteVibes, vibeId],
        }));
      },

      isFavoriteVibe: (vibeId) => {
        return get().favoriteVibes.includes(vibeId);
      },

      // Utility actions
      clearAllData: () => {
        set({
          apps: [],
          sets: [],
          screenshots: [],
          sourceImages: [],
          customVibes: [],
          favoriteVibes: [],
        });
      },

      exportData: () => {
        const state = get();
        return JSON.stringify({
          apps: state.apps,
          sets: state.sets,
          screenshots: state.screenshots,
          sourceImages: state.sourceImages,
          customVibes: state.customVibes,
          favoriteVibes: state.favoriteVibes,
        });
      },

      importData: (jsonData) => {
        try {
          const data = JSON.parse(jsonData);
          set({
            apps: data.apps || [],
            sets: data.sets || [],
            screenshots: data.screenshots || [],
            sourceImages: data.sourceImages || [],
            customVibes: data.customVibes || [],
            favoriteVibes: data.favoriteVibes || [],
          });
          return true;
        } catch {
          return false;
        }
      },
    }),
    {
      name: 'mocksy-app-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);