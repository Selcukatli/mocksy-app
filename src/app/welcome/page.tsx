'use client';

import { useState, useEffect, Suspense } from 'react';
import { SignIn, SignUp } from "@clerk/nextjs";
import { dark } from '@clerk/themes';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/components/ThemeProvider';
import {
  Sparkles,
  Palette,
  Globe,
  Zap,
  ArrowRight,
  ArrowLeft,
  Check
} from 'lucide-react';

const slides = [
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

function AuthPageContent() {
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') || 'sign-in';
  const context = searchParams.get('context');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isManualNav, setIsManualNav] = useState(false);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Define context messages for headers
  const contextHeaders: Record<string, { title: string; subtitle: string }> = {
    'create-app': {
      title: 'Sign in to create your first app',
      subtitle: 'Get started with Mocksy to generate beautiful app store screenshots'
    },
    'new-app': {
      title: 'Sign in to create a new app',
      subtitle: 'Continue where you left off with your app screenshots'
    },
    'app-access': {
      title: 'Welcome back to Mocksy',
      subtitle: 'Sign in to access your apps and screenshots'
    },
    'export': {
      title: 'Sign in to export screenshots',
      subtitle: 'Download your screenshots in multiple formats'
    },
    'translate': {
      title: 'Sign in to translate screenshots',
      subtitle: 'Reach global audiences with localized screenshots'
    },
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDarkMode = mounted && resolvedTheme === 'dark';

  useEffect(() => {
    // Skip auto-advance if manual navigation just happened
    if (isManualNav) {
      setIsManualNav(false);
      return;
    }

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [currentSlide, isManualNav]);

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
    <div className="min-h-screen flex bg-background">
      {/* Left Panel - Auth Component */}
      <div className="w-full lg:w-2/5 flex items-center justify-center p-8 lg:p-12 lg:pl-32">
        <div className="flex flex-col items-center justify-center gap-4">
          {/* Context Header - Only show if context is provided */}
          {context && contextHeaders[context] && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-center mb-2"
            >
              <h1 className="text-2xl font-bold text-foreground mb-1">
                {contextHeaders[context].title}
              </h1>
              <p className="text-sm text-muted-foreground">
                {contextHeaders[context].subtitle}
              </p>
            </motion.div>
          )}

          {mode === 'sign-up' ? (
            <SignUp
              appearance={{
                baseTheme: isDarkMode ? dark : undefined,
                variables: isDarkMode ? {
                  colorBackground: '#09090b', // zinc-950
                  colorInputBackground: '#18181b', // zinc-900
                  colorInputText: '#fafafa', // zinc-50 for text
                  colorText: '#e4e4e7', // zinc-200
                } : {},
                elements: {
                  formButtonPrimary:
                    "bg-primary text-primary-foreground hover:bg-primary/90 transition-colors",
                  footerActionLink:
                    "text-primary hover:text-primary/90 transition-colors",
                  card: "shadow-none border-0",
                  headerTitle: "text-foreground text-3xl font-bold",
                  headerSubtitle: "text-muted-foreground",
                  socialButtonsBlockButton:
                    "border-border hover:bg-muted transition-colors",
                  formFieldLabel: "text-foreground",
                  formFieldInput:
                    "bg-background border-border text-foreground",
                  identityPreviewText: "text-foreground",
                  identityPreviewEditButtonIcon: "text-muted-foreground",
                  dividerLine: "bg-border",
                  dividerText: "text-muted-foreground",
                  formFieldAction: "text-primary hover:text-primary/90",
                  footerAction: "text-center",
                },
              }}
              routing="hash"
            />
          ) : (
            <SignIn
              appearance={{
                baseTheme: isDarkMode ? dark : undefined,
                variables: isDarkMode ? {
                  colorBackground: '#09090b', // zinc-950
                  colorInputBackground: '#18181b', // zinc-900
                  colorInputText: '#fafafa', // zinc-50 for text
                  colorText: '#e4e4e7', // zinc-200
                } : {},
                elements: {
                  formButtonPrimary:
                    "bg-primary text-primary-foreground hover:bg-primary/90 transition-colors",
                  footerActionLink:
                    "text-primary hover:text-primary/90 transition-colors",
                  card: "shadow-none border-0",
                  headerTitle: "text-foreground text-3xl font-bold",
                  headerSubtitle: "text-muted-foreground",
                  socialButtonsBlockButton:
                    "border-border hover:bg-muted transition-colors",
                  formFieldLabel: "text-foreground",
                  formFieldInput:
                    "bg-background border-border text-foreground",
                  identityPreviewText: "text-foreground",
                  identityPreviewEditButtonIcon: "text-muted-foreground",
                  dividerLine: "bg-border",
                  dividerText: "text-muted-foreground",
                  formFieldAction: "text-primary hover:text-primary/90",
                  footerAction: "text-center",
                },
              }}
              routing="hash"
            />
          )}
        </div>
      </div>

      {/* Right Panel - Slides */}
      <div
        className={`hidden lg:flex lg:w-3/5 bg-gradient-to-br ${slides[currentSlide].bgGradient} p-8 lg:p-12 items-center justify-center relative overflow-hidden transition-all duration-500`}
        style={{
          maskImage: 'linear-gradient(to right, transparent, black 8rem)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 8rem)',
        }}
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
            // Use deterministic positions based on index
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
                  <div className={`relative w-24 h-24 rounded-3xl bg-gradient-to-br ${slides[currentSlide].gradient} dark:from-gray-700 dark:to-gray-600 p-6 shadow-2xl backdrop-blur-sm border border-white/10 dark:border-white/5`}>
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
                  <motion.div
                    className="absolute top-1/2 -right-3 w-3 h-3"
                    animate={{
                      scale: [0, 1, 0],
                      rotate: [0, 180, 360],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: 1,
                    }}
                  >
                    <Sparkles className="w-full h-full text-pink-300 drop-shadow-glow" />
                  </motion.div>
                </motion.div>
              </div>

              {/* Content Container - Fixed height */}
              <div className="min-h-[250px]">
                <h2 className="text-3xl lg:text-4xl font-bold mb-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  {slides[currentSlide].title}
                </h2>
                <p className="text-base lg:text-lg text-muted-foreground mb-6">
                  {slides[currentSlide].description}
                </p>

                {/* Features */}
                <div className="space-y-2">
                  {slides[currentSlide].features.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 + 0.1, duration: 0.2 }}
                      className="flex items-center gap-3"
                    >
                      <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-primary" />
                      </div>
                      <span className="text-sm lg:text-base text-muted-foreground">{feature}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Fixed Controls Container */}
          <div className="mt-8">
            {/* Slide indicators */}
            <div className="flex justify-start gap-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleSlideChange(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentSlide
                      ? 'w-8 bg-primary'
                      : 'w-2 bg-primary/30 hover:bg-primary/50'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            {/* Navigation buttons */}
            <div className="flex justify-start gap-3 mt-4">
              <button
                onClick={handlePrevSlide}
                className="w-10 h-10 rounded-full bg-background/50 backdrop-blur border border-border flex items-center justify-center hover:bg-background/80 transition-colors"
                aria-label="Previous slide"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextSlide}
                className="w-10 h-10 rounded-full bg-background/50 backdrop-blur border border-border flex items-center justify-center hover:bg-background/80 transition-colors"
                aria-label="Next slide"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex bg-background" />}>
      <AuthPageContent />
    </Suspense>
  );
}