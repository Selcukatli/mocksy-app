import { create } from 'zustand';
import { Theme, Layout, DeviceFrame, Vibe } from '@/types';

interface MockDataStore {
  themes: Theme[];
  layouts: Layout[];
  deviceFrames: DeviceFrame[];
  vibes: Vibe[];
}

export const useMockDataStore = create<MockDataStore>(() => ({
  themes: [
    {
      id: 'snap-style',
      name: 'Snap Style',
      description: 'Bold & Social',
      gradient: 'from-pink-500 via-orange-500 to-yellow-500',
      colors: {
        primary: '#ec4899',
        secondary: '#f97316',
        accent: '#eab308',
      },
      style: {
        borderRadius: '1.5rem',
        shadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        overlay: 'linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.4))',
      },
    },
    {
      id: 'watercolor',
      name: 'Watercolor',
      description: 'Artistic & Fluid',
      gradient: 'from-blue-500 via-cyan-500 to-teal-500',
      colors: {
        primary: '#3b82f6',
        secondary: '#06b6d4',
        accent: '#14b8a6',
      },
      style: {
        borderRadius: '2rem',
        shadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overlay: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(0,0,0,0.2))',
      },
    },
    {
      id: 'genz-medley',
      name: 'GenZ Medley',
      description: 'Trendy & Vibrant',
      gradient: 'from-purple-500 via-pink-500 to-rose-500',
      colors: {
        primary: '#a855f7',
        secondary: '#ec4899',
        accent: '#f43f5e',
      },
      style: {
        borderRadius: '1rem',
        shadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      },
    },
    {
      id: 'minimal',
      name: 'Minimal',
      description: 'Clean & Simple',
      gradient: 'from-gray-200 via-gray-100 to-white',
      colors: {
        primary: '#6b7280',
        secondary: '#9ca3af',
        accent: '#d1d5db',
      },
      style: {
        borderRadius: '0.5rem',
        shadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      },
    },
    {
      id: 'dark-mode',
      name: 'Dark Mode',
      description: 'Sleek & Modern',
      gradient: 'from-gray-900 via-gray-800 to-black',
      colors: {
        primary: '#111827',
        secondary: '#1f2937',
        accent: '#374151',
      },
      style: {
        borderRadius: '0.75rem',
        shadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
      },
    },
    {
      id: 'nature',
      name: 'Nature',
      description: 'Fresh & Organic',
      gradient: 'from-green-500 via-emerald-500 to-teal-500',
      colors: {
        primary: '#22c55e',
        secondary: '#10b981',
        accent: '#14b8a6',
      },
      style: {
        borderRadius: '2rem',
        shadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      },
    },
  ],

  layouts: [
    {
      id: 'text-above',
      name: 'Text Above',
      description: 'Header text above device',
      icon: '▭\n━',
      configuration: {
        textPosition: 'above',
        textAlignment: 'center',
        deviceScale: 0.8,
        padding: '2rem',
      },
    },
    {
      id: 'text-below',
      name: 'Text Below',
      description: 'Header text below device',
      icon: '━\n▭',
      configuration: {
        textPosition: 'below',
        textAlignment: 'center',
        deviceScale: 0.8,
        padding: '2rem',
      },
    },
    {
      id: 'text-left',
      name: 'Text Left',
      description: 'Text on the left side',
      icon: '━ ▭',
      configuration: {
        textPosition: 'left',
        textAlignment: 'left',
        deviceScale: 0.7,
        padding: '3rem',
      },
    },
    {
      id: 'text-right',
      name: 'Text Right',
      description: 'Text on the right side',
      icon: '▭ ━',
      configuration: {
        textPosition: 'right',
        textAlignment: 'right',
        deviceScale: 0.7,
        padding: '3rem',
      },
    },
    {
      id: 'text-overlay',
      name: 'Text Overlay',
      description: 'Text overlaid on device',
      icon: '▣',
      configuration: {
        textPosition: 'overlay',
        textAlignment: 'center',
        deviceScale: 1,
        padding: '1rem',
      },
    },
    {
      id: 'device-only',
      name: 'Device Only',
      description: 'No text, just device',
      icon: '▭',
      configuration: {
        textPosition: 'none',
        textAlignment: 'center',
        deviceScale: 1,
        padding: '0',
      },
    },
  ],

  deviceFrames: [
    {
      id: 'iphone-15-pro',
      name: 'iPhone 15 Pro',
      type: 'phone',
      dimensions: {
        width: 1290,
        height: 2796,
      },
      screenArea: {
        x: 50,
        y: 50,
        width: 1190,
        height: 2696,
      },
    },
    {
      id: 'iphone-15-pro-max',
      name: 'iPhone 15 Pro Max',
      type: 'phone',
      dimensions: {
        width: 1320,
        height: 2868,
      },
      screenArea: {
        x: 50,
        y: 50,
        width: 1220,
        height: 2768,
      },
    },
    {
      id: 'ipad-pro-12',
      name: 'iPad Pro 12.9"',
      type: 'tablet',
      dimensions: {
        width: 2048,
        height: 2732,
      },
      screenArea: {
        x: 100,
        y: 100,
        width: 1848,
        height: 2532,
      },
    },
  ],

  vibes: [
    {
      id: 'snap-style-vibe',
      name: 'Snap Style',
      description: 'Bold, colorful, and social media ready',
      gradient: 'from-pink-500 via-orange-500 to-yellow-500',
      thumbnail: '/vibes/snap-style.png',
      isPopular: true,
      tags: ['social', 'bold', 'colorful'],
      createdAt: new Date('2024-01-01'),
    },
    {
      id: 'watercolor-vibe',
      name: 'Watercolor Dreams',
      description: 'Soft, artistic brushstrokes',
      gradient: 'from-blue-500 via-cyan-500 to-teal-500',
      thumbnail: '/vibes/watercolor.png',
      isPopular: true,
      tags: ['artistic', 'soft', 'elegant'],
      createdAt: new Date('2024-01-02'),
    },
    {
      id: 'genz-vibe',
      name: 'GenZ Medley',
      description: 'Trendy gradients and modern aesthetics',
      gradient: 'from-purple-500 via-pink-500 to-rose-500',
      thumbnail: '/vibes/genz.png',
      isPopular: true,
      tags: ['trendy', 'modern', 'vibrant'],
      createdAt: new Date('2024-01-03'),
    },
    {
      id: 'minimal-vibe',
      name: 'Minimalist',
      description: 'Clean lines and simple elegance',
      gradient: 'from-gray-200 via-gray-100 to-white',
      thumbnail: '/vibes/minimal.png',
      tags: ['minimal', 'clean', 'simple'],
      createdAt: new Date('2024-01-04'),
    },
    {
      id: 'dark-vibe',
      name: 'Dark Mode Pro',
      description: 'Sleek and sophisticated dark theme',
      gradient: 'from-gray-900 via-gray-800 to-black',
      thumbnail: '/vibes/dark.png',
      tags: ['dark', 'professional', 'sleek'],
      createdAt: new Date('2024-01-05'),
    },
    {
      id: 'nature-vibe',
      name: 'Nature\'s Touch',
      description: 'Organic colors inspired by nature',
      gradient: 'from-green-500 via-emerald-500 to-teal-500',
      thumbnail: '/vibes/nature.png',
      tags: ['nature', 'organic', 'fresh'],
      createdAt: new Date('2024-01-06'),
    },
    {
      id: 'retro-wave',
      name: 'Retro Wave',
      description: '80s inspired neon aesthetics',
      gradient: 'from-purple-600 via-pink-600 to-orange-600',
      thumbnail: '/vibes/retro.png',
      tags: ['retro', '80s', 'neon'],
      createdAt: new Date('2024-01-07'),
    },
    {
      id: 'pastel-dreams',
      name: 'Pastel Dreams',
      description: 'Soft, dreamy pastel colors',
      gradient: 'from-pink-200 via-purple-200 to-indigo-200',
      thumbnail: '/vibes/pastel.png',
      tags: ['pastel', 'soft', 'dreamy'],
      createdAt: new Date('2024-01-08'),
    },
  ],
}));