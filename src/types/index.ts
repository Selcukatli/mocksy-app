export interface Theme {
  id: string;
  name: string;
  description: string;
  gradient: string;
  colors: {
    primary: string;
    secondary: string;
    accent?: string;
  };
  style: {
    borderRadius: string;
    shadow: string;
    overlay?: string;
  };
  isCustom?: boolean;
  createdAt?: Date;
}

export interface Layout {
  id: string;
  name: string;
  description: string;
  icon: string;
  configuration: {
    textPosition: 'above' | 'below' | 'left' | 'right' | 'overlay' | 'none';
    textAlignment: 'left' | 'center' | 'right';
    deviceScale: number;
    padding: string;
  };
}

export interface DeviceFrame {
  id: string;
  name: string;
  type: 'phone' | 'tablet' | 'desktop';
  dimensions: {
    width: number;
    height: number;
  };
  screenArea: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface Screenshot {
  id: string;
  slotNumber: number;
  imageUrl?: string;
  title?: string;
  subtitle?: string;
  themeId?: string;
  layoutId?: string;
  deviceFrameId?: string;
  language?: string;
  isEmpty?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Set {
  id: string;
  appId: string;
  name: string;
  description?: string;
  screenshots: Screenshot[];
  deviceType: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface App {
  id: string;
  name: string;
  icon?: string;
  description?: string;
  category?: string;
  platforms?: {
    ios: boolean;
    android: boolean;
  };
  languages?: string[];
  sets: string[]; // Set IDs
  sourceImages: SourceImage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SourceImage {
  id: string;
  appId: string;
  name: string;
  url: string;
  dimensions: {
    width: number;
    height: number;
  };
  size: number;
  uploadedAt: Date;
}

export interface Vibe {
  id: string;
  name: string;
  description: string;
  thumbnail?: string;
  gradient: string;
  isPopular?: boolean;
  isFavorited?: boolean;
  createdByUser?: boolean;
  tags?: string[];
  createdAt?: Date;
}