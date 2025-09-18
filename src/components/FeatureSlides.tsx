'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Palette,
  Globe,
  Zap,
  ArrowRight,
  ArrowLeft,
  Check,
  LucideIcon
} from 'lucide-react';

export interface Slide {
  title: string;
  description: string;
  icon: LucideIcon;
  gradient: string;
  bgGradient: string;
  orbs: {
    color: string;
    size: string;
    position: string;
    blur: string;
  }[];
  features: string[];
}

const defaultSlides: Slide[] = [
  {
    title: "Generate Beautiful Screenshots",
    description: "Create stunning app store screenshots in seconds with AI-powered generation",
    icon: Sparkles,
    gradient: "from-purple-500 to-pink-500",
    bgGradient: "from-purple-600/10 via-pink-600/10 to-rose-600/10 dark:from-purple-600/5 dark:via-pink-600/5 dark:to-rose-600/5",
    orbs: [
      { color: "bg-purple-500/30 dark:bg-purple-500/10", size: "w-96 h-96", position: "top-10 -right-20", blur: "blur-3xl" },
      { color: "bg-pink-500/30 dark:bg-pink-500/10", size: "w-72 h-72", position: "bottom-20 -left-10", blur: "blur-2xl" },
      { color: "bg-rose-400/20 dark:bg-rose-400/5", size: "w-64 h-64", position: "top-1/2 left-1/3", blur: "blur-3xl" }
    ],
    features: [
      "AI-powered screenshot generation",
      "Multiple device frames",
      "Professional layouts"
    ]
  },
  {
    title: "Edit with Precision",
    description: "Fine-tune every detail with our powerful editing tools",
    icon: Palette,
    gradient: "from-blue-500 to-cyan-500",
    bgGradient: "from-blue-600/10 via-cyan-600/10 to-sky-600/10 dark:from-blue-600/5 dark:via-cyan-600/5 dark:to-sky-600/5",
    orbs: [
      { color: "bg-blue-500/30 dark:bg-blue-500/10", size: "w-80 h-80", position: "top-20 -left-20", blur: "blur-3xl" },
      { color: "bg-cyan-500/30 dark:bg-cyan-500/10", size: "w-96 h-96", position: "bottom-10 -right-20", blur: "blur-2xl" },
      { color: "bg-sky-400/20 dark:bg-sky-400/5", size: "w-72 h-72", position: "top-1/3 right-1/4", blur: "blur-3xl" }
    ],
    features: [
      "Advanced text editing",
      "Custom backgrounds",
      "Brand consistency"
    ]
  },
  {
    title: "Translate Globally",
    description: "Reach users worldwide with one-click translation to multiple languages",
    icon: Globe,
    gradient: "from-green-500 to-emerald-500",
    bgGradient: "from-green-600/10 via-emerald-600/10 to-teal-600/10 dark:from-green-600/5 dark:via-emerald-600/5 dark:to-teal-600/5",
    orbs: [
      { color: "bg-green-500/30 dark:bg-green-500/10", size: "w-72 h-72", position: "top-10 right-10", blur: "blur-3xl" },
      { color: "bg-emerald-500/30 dark:bg-emerald-500/10", size: "w-80 h-80", position: "bottom-20 left-10", blur: "blur-2xl" },
      { color: "bg-teal-400/20 dark:bg-teal-400/5", size: "w-96 h-96", position: "center", blur: "blur-3xl" }
    ],
    features: [
      "40+ languages supported",
      "Context-aware translations",
      "Localized layouts"
    ]
  },
  {
    title: "Launch Faster",
    description: "Export your screenshots ready for App Store and Google Play",
    icon: Zap,
    gradient: "from-orange-500 to-red-500",
    bgGradient: "from-orange-600/10 via-red-600/10 to-yellow-600/10 dark:from-orange-600/5 dark:via-red-600/5 dark:to-yellow-600/5",
    orbs: [
      { color: "bg-orange-500/30 dark:bg-orange-500/10", size: "w-96 h-96", position: "-top-20 left-20", blur: "blur-3xl" },
      { color: "bg-red-500/30 dark:bg-red-500/10", size: "w-72 h-72", position: "bottom-10 -right-10", blur: "blur-2xl" },
      { color: "bg-yellow-400/20 dark:bg-yellow-400/5", size: "w-80 h-80", position: "top-1/2 -left-10", blur: "blur-3xl" }
    ],
    features: [
      "App Store specifications",
      "Google Play requirements",
      "Batch export options"
    ]
  }
];

interface FeatureSlidesProps {
  slides?: Slide[];
  className?: string;
  autoPlay?: boolean;
  interval?: number;
  showNavigation?: boolean;
  showDots?: boolean;
  maskGradient?: boolean;
}

export default function FeatureSlides({
  slides = defaultSlides,
  className = '',
  autoPlay = true,
  interval = 5000,
  showNavigation = true,
  showDots = true,
  maskGradient = true,
}: FeatureSlidesProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isManualNav, setIsManualNav] = useState(false);

  useEffect(() => {
    if (!autoPlay) return;

    // Skip auto-advance if manual navigation just happened
    if (isManualNav) {
      setIsManualNav(false);
      return;
    }

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, interval);

    return () => clearInterval(timer);
  }, [currentSlide, isManualNav, autoPlay, interval, slides.length]);

  const handleSlideChange = (index: number) => {
    setIsManualNav(true);
    setCurrentSlide(index);
  };

  const handlePrevSlide = () => {
    setIsManualNav(true);
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNextSlide = () => {
    setIsManualNav(true);
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const CurrentIcon = slides[currentSlide].icon;

  return (
    <div
      className={`flex bg-gradient-to-br ${slides[currentSlide].bgGradient} p-8 lg:p-12 items-center justify-center relative overflow-hidden transition-all duration-500 ${className}`}
      style={maskGradient ? {
        maskImage: 'linear-gradient(to right, transparent, black 8rem)',
        WebkitMaskImage: 'linear-gradient(to right, transparent, black 8rem)',
      } : {}}
    >
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-grid" />

      {/* Animated background elements - unique per slide */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`bg-${currentSlide}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0"
        >
          {slides[currentSlide].orbs.map((orb, index) => (
            <motion.div
              key={index}
              className={`absolute ${orb.size} ${orb.color} rounded-full filter ${orb.blur} ${orb.position}`}
              animate={{
                x: [0, 30, -20, 0],
                y: [0, -30, 20, 0],
                scale: [1, 1.1, 0.95, 1],
              }}
              transition={{
                duration: 10 + index * 2,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
                delay: index * 0.5,
              }}
            />
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => {
          const left = `${(i * 37 % 100)}%`;
          const top = `${(i * 53 % 100)}%`;
          const duration = 3 + (i % 3);
          const delay = (i % 5) * 0.5;

          return (
            <motion.div
              key={`particle-${i}`}
              className={`absolute w-1 h-1 ${i % 2 === 0 ? 'bg-white/20 dark:bg-white/5' : 'bg-primary/20 dark:bg-primary/5'} rounded-full`}
              style={{
                left,
                top,
              }}
              animate={{
                y: [-20, -100],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration,
                repeat: Infinity,
                delay,
                ease: "easeOut",
              }}
            />
          );
        })}
      </div>

      <div className="relative z-10 max-w-lg w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="text-left"
          >
            {/* Icon */}
            <div className="mb-8 flex justify-start">
              <motion.div
                animate={{
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut",
                }}
                className="relative"
              >
                <div className={`absolute inset-0 w-24 h-24 rounded-3xl bg-gradient-to-br ${slides[currentSlide].gradient} blur-xl opacity-50 dark:opacity-20`} />
                <div className={`relative w-24 h-24 rounded-3xl bg-gradient-to-br ${slides[currentSlide].gradient} p-6 shadow-2xl backdrop-blur-sm border border-white/10 dark:border-white/5`}>
                  <CurrentIcon className="w-full h-full text-white drop-shadow-lg" />
                </div>
                {/* Sparkle effects around icon */}
                <motion.div
                  className="absolute -top-2 -right-2 w-4 h-4"
                  animate={{
                    scale: [0, 1, 0],
                    rotate: [0, 180, 360],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: 0,
                  }}
                >
                  <Sparkles className="w-full h-full text-yellow-300 drop-shadow-glow" />
                </motion.div>
                <motion.div
                  className="absolute -bottom-2 -left-2 w-3 h-3"
                  animate={{
                    scale: [0, 1, 0],
                    rotate: [0, -180, -360],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: 0.5,
                  }}
                >
                  <Sparkles className="w-full h-full text-blue-300 drop-shadow-glow" />
                </motion.div>
              </motion.div>
            </div>

            {/* Content */}
            <motion.h2
              className="text-5xl font-bold text-foreground mb-4 leading-tight"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              {slides[currentSlide].title}
            </motion.h2>
            <motion.p
              className="text-xl text-muted-foreground mb-8 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {slides[currentSlide].description}
            </motion.p>

            {/* Features */}
            <motion.div
              className="space-y-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {slides[currentSlide].features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3 group">
                  <div className="w-5 h-5 rounded-full bg-primary/20 dark:bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/30 transition-colors">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-foreground/80 group-hover:text-foreground transition-colors">{feature}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        {showNavigation && (
          <div className="flex items-center justify-between mt-12">
            <div className="flex gap-2">
              <button
                onClick={handlePrevSlide}
                className="p-2 rounded-lg bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors border border-white/20"
                aria-label="Previous slide"
              >
                <ArrowLeft className="w-5 h-5 text-white drop-shadow-lg" />
              </button>
              <button
                onClick={handleNextSlide}
                className="p-2 rounded-lg bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors border border-white/20"
                aria-label="Next slide"
              >
                <ArrowRight className="w-5 h-5 text-white drop-shadow-lg" />
              </button>
            </div>

            {/* Slide indicators */}
            {showDots && (
              <div className="flex gap-2">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleSlideChange(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentSlide
                        ? 'w-8 bg-white'
                        : 'bg-white/40 hover:bg-white/60'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}