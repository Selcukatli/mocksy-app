'use client';

import { useState, useEffect, Suspense } from 'react';
import { SignIn, SignUp } from "@clerk/nextjs";
import { dark } from '@clerk/themes';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence, useMotionValue, PanInfo } from 'framer-motion';
import { useTheme } from '@/components/ThemeProvider';
import Image from 'next/image';
import {
  Sparkles,
  Heart,
  Code,
  ArrowRight,
  ArrowLeft,
  Check,
  Users
} from 'lucide-react';

const slides = [
  {
    title: "Ideas to Concepts in Seconds",
    description: "Describe your app or game. Mocksy generates visual concepts in seconds.",
    icon: Sparkles,
    gradient: "from-purple-500 to-pink-500",
    bgGradient: "from-purple-100 via-pink-50 to-rose-100 dark:from-purple-950 dark:via-pink-950 dark:to-rose-950",
    orbs: [
      { color: "bg-purple-500/30 dark:bg-purple-500/10", size: "w-96 h-96", position: "top-10 -right-20", blur: "blur-3xl" },
      { color: "bg-pink-500/30 dark:bg-pink-500/10", size: "w-72 h-72", position: "bottom-20 -left-10", blur: "blur-2xl" },
      { color: "bg-rose-400/20 dark:bg-rose-400/5", size: "w-64 h-64", position: "top-1/2 left-1/3", blur: "blur-3xl" }
    ],
    features: [
      "AI-powered generation",
      "Multiple variations",
      "Icons & screenshots"
    ],
    testimonial: {
      text: "Turned my idea into visuals in seconds. Mind-blowing!",
      author: "Sarah K."
    },
    mocksybotEffect: "sparkles"
  },
  {
    title: "Community Backs the Best",
    description: "Projects get voted and backed by people who want to see them built.",
    icon: Heart,
    gradient: "from-blue-500 to-cyan-500",
    bgGradient: "from-blue-100 via-cyan-50 to-sky-100 dark:from-blue-950 dark:via-cyan-950 dark:to-sky-950",
    orbs: [
      { color: "bg-blue-500/30 dark:bg-blue-500/10", size: "w-80 h-80", position: "top-20 -left-20", blur: "blur-3xl" },
      { color: "bg-cyan-500/30 dark:bg-cyan-500/10", size: "w-96 h-96", position: "bottom-10 -right-20", blur: "blur-2xl" },
      { color: "bg-sky-400/20 dark:bg-sky-400/5", size: "w-72 h-72", position: "top-1/3 right-1/4", blur: "blur-3xl" }
    ],
    features: [
      "Community voting",
      "Project backing",
      "Pre-validation"
    ],
    testimonial: {
      text: "Finally, a way to validate ideas before building.",
      author: "Mike T."
    },
    mocksybotEffect: "hearts"
  },
  {
    title: "Developers Ship Backed Ideas",
    description: "Build projects that already have users and funding secured.",
    icon: Code,
    gradient: "from-green-500 to-emerald-500",
    bgGradient: "from-green-100 via-emerald-50 to-teal-100 dark:from-green-950 dark:via-emerald-950 dark:to-teal-950",
    orbs: [
      { color: "bg-green-500/30 dark:bg-green-500/10", size: "w-72 h-72", position: "top-10 right-10", blur: "blur-3xl" },
      { color: "bg-emerald-500/30 dark:bg-emerald-500/10", size: "w-80 h-80", position: "bottom-20 left-10", blur: "blur-2xl" },
      { color: "bg-teal-400/20 dark:bg-teal-400/5", size: "w-96 h-96", position: "center", blur: "blur-3xl" }
    ],
    features: [
      "Ready funding",
      "Built-in audience",
      "Reduced risk"
    ],
    testimonial: {
      text: "Picked a backed project. Launched with 100 users and funding secured.",
      author: "Alex R."
    },
    mocksybotEffect: "typing"
  }
];

function AuthPageContent() {
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') || 'sign-in';
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isManualNav, setIsManualNav] = useState(false);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isSafari, setIsSafari] = useState(false);
  const [mocksybotHovered, setMocksybotHovered] = useState(false);
  const [userCount, setUserCount] = useState(1247); // Start at final value to avoid hydration mismatch
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const dragX = useMotionValue(0);

  useEffect(() => {
    setMounted(true);
    // Detect Safari once on mount
    const ua = navigator.userAgent;
    const isSafariBrowser = /^((?!chrome|android).)*safari/i.test(ua);
    setIsSafari(isSafariBrowser);
    
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    // Animated user count - start from 0 after mount to avoid hydration issues
    setUserCount(0);
    const targetCount = 1247;
    const duration = 2000;
    const steps = 60;
    const increment = targetCount / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= targetCount) {
        setUserCount(targetCount);
        clearInterval(timer);
      } else {
        setUserCount(Math.floor(current));
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, []);

  // Use state to avoid hydration mismatch
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  useEffect(() => {
    setIsDarkMode(resolvedTheme === 'dark');
  }, [resolvedTheme]);

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
  
  const handleDragEnd = (_e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 50;
    if (info.offset.x > threshold) {
      handlePrevSlide();
    } else if (info.offset.x < -threshold) {
      handleNextSlide();
    }
    dragX.set(0);
  };

  const CurrentIcon = slides[currentSlide].icon;

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Panel - Auth Component with visual */}
      <div className="w-full lg:w-2/5 flex flex-col items-center justify-center p-8 lg:p-12 lg:pl-32 relative">
        {/* Mocksy Logo and Mocksybot - Compact Layout */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="mb-4 flex flex-col items-center gap-2"
        >
          {/* Mocksy Logo */}
          <div className="relative w-48 h-12 lg:w-56 lg:h-14">
            <Image
              src={isDarkMode ? '/mocksy-logo-dark-mode.png' : '/mocksy-logo-light-mode.png'}
              alt="Mocksy"
              fill
              className="object-contain"
              sizes="224px"
              priority
            />
          </div>
          
          {/* User Counter - More compact - suppress hydration warning */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: mounted ? 1 : 0, scale: mounted ? 1 : 0.9 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2.5 py-0.5 rounded-full"
            suppressHydrationWarning
          >
            <Users className="w-3.5 h-3.5" />
            <span suppressHydrationWarning>Join {userCount.toLocaleString()}+ creators</span>
          </motion.div>
          
          {/* Mocksybot - More compact but still visible */}
          <div 
            className="relative w-24 h-20 lg:w-32 lg:h-24 overflow-visible cursor-pointer -mt-2"
            onMouseEnter={() => setMocksybotHovered(true)}
            onMouseLeave={() => setMocksybotHovered(false)}
          >
            <motion.div
              animate={{
                y: prefersReducedMotion ? 0 : [0, -6, 0],
                scale: mocksybotHovered ? 1.05 : 1,
              }}
              transition={{
                y: {
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
                scale: {
                  duration: 0.2,
                }
              }}
              className="relative overflow-hidden rounded-lg"
            >
              {isSafari ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src="/mocksybot.gif"
                  alt="Mocksybot"
                  className="w-24 h-24 lg:w-32 lg:h-32 object-contain object-top drop-shadow-2xl"
                />
              ) : (
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-24 h-24 lg:w-32 lg:h-32 object-contain object-top drop-shadow-2xl"
                >
                  <source src="/mocksybot.webm" type="video/webm" />
                </video>
              )}
            </motion.div>
          </div>
        </motion.div>

        <div className="flex flex-col items-center justify-center gap-4 w-full max-w-md">
          {!mounted ? (
            // Show a loading placeholder with same size as auth component to prevent layout shift
            <div className="w-full h-[500px] flex items-center justify-center">
              <div className="animate-pulse text-muted-foreground">Loading...</div>
            </div>
          ) : mode === 'sign-up' ? (
            <SignUp
              appearance={{
                baseTheme: isDarkMode ? dark : undefined,
                variables: isDarkMode ? {
                  colorBackground: '#09090b', // zinc-950
                  colorInputBackground: '#18181b', // zinc-900
                  colorInputText: '#fafafa', // zinc-50 for text
                  colorText: '#e4e4e7', // zinc-200
                } : undefined,
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
                } : undefined,
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
        
        {/* Mobile Carousel */}
        <div className="lg:hidden w-full max-w-md mt-8 px-4">
          <div className="relative">
            <motion.div
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={handleDragEnd}
              style={{ x: dragX }}
              className="cursor-grab active:cursor-grabbing"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className={`relative rounded-2xl p-6 bg-gradient-to-br ${slides[currentSlide].bgGradient} border border-border/50 backdrop-blur-sm overflow-hidden`}
                >
                  {/* Background orbs - simplified for mobile */}
                  <div className="absolute inset-0">
                    <div className={`absolute w-48 h-48 -top-10 -right-10 ${slides[currentSlide].orbs[0].color} rounded-full blur-3xl`} />
                    <div className={`absolute w-40 h-40 -bottom-10 -left-10 ${slides[currentSlide].orbs[1].color} rounded-full blur-2xl`} />
                  </div>
                  
                  {/* Content */}
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${slides[currentSlide].gradient} p-3 shadow-lg`}>
                        <CurrentIcon className="w-full h-full text-white" />
                      </div>
                      <h3 className="text-xl font-bold">{slides[currentSlide].title}</h3>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-4">
                      {slides[currentSlide].description}
                    </p>
                    
                    {/* Features - compact */}
                    <div className="space-y-2">
                      {slides[currentSlide].features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                            <Check className="w-3 h-3 text-primary" />
                          </div>
                          <span className="text-sm text-muted-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    {/* Testimonial */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="mt-4 pt-4 border-t border-border/50"
                    >
                      <p className="text-sm italic text-muted-foreground mb-1">
                        &ldquo;{slides[currentSlide].testimonial.text}&rdquo;
                      </p>
                      <p className="text-xs text-muted-foreground/70">
                        — {slides[currentSlide].testimonial.author}
                      </p>
                    </motion.div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.div>
            
            {/* Mobile navigation */}
            <div className="flex justify-center items-center gap-4 mt-4">
              <button
                onClick={handlePrevSlide}
                className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center hover:bg-muted/80 transition-colors"
                aria-label="Previous slide"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              
              <div className="flex gap-2">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleSlideChange(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === currentSlide
                        ? 'w-8 bg-primary'
                        : 'w-2 bg-primary/30'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
              
              <button
                onClick={handleNextSlide}
                className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center hover:bg-muted/80 transition-colors"
                aria-label="Next slide"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Text Content */}
      <div
        className={`hidden lg:flex lg:w-3/5 bg-gradient-to-br ${slides[currentSlide].bgGradient} p-8 lg:p-12 items-center justify-center relative overflow-hidden transition-all duration-500`}
        style={{
          maskImage: 'linear-gradient(to right, transparent, black 4rem)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 4rem)',
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

        <div className="relative z-10 max-w-4xl w-full pl-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="text-left"
            >
              {/* Icon - Top */}
              <div className="mb-8 flex justify-start">
                <motion.div
                  animate={
                    prefersReducedMotion
                      ? {}
                      : {
                          rotate: [0, 5, -5, 0],
                          scale: [1, 1.05, 1],
                          y: [0, -8, 0],
                        }
                  }
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut",
                  }}
                  className="relative"
                >
                  <div className={`absolute inset-0 w-32 h-32 rounded-[2rem] bg-gradient-to-br ${slides[currentSlide].gradient} blur-2xl opacity-50 dark:opacity-20`} />
                  <motion.div
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    className={`relative w-32 h-32 rounded-[2rem] bg-gradient-to-br ${slides[currentSlide].gradient} dark:from-gray-700 dark:to-gray-600 p-8 shadow-2xl backdrop-blur-sm border border-white/10 dark:border-white/5 cursor-pointer`}
                  >
                    <CurrentIcon className="w-full h-full text-white drop-shadow-lg" />
                  </motion.div>
                  {/* Sparkle effects around icon */}
                  {!prefersReducedMotion && (
                    <>
                      <motion.div
                        className="absolute -top-2 -right-2 w-5 h-5"
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
                        className="absolute -bottom-2 -left-2 w-4 h-4"
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
                        className="absolute top-1/2 -right-3 w-4 h-4"
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
                    </>
                  )}
                </motion.div>
              </div>

              {/* Content Container - Below Icon */}
              <div className="min-h-[250px]">
                <h2 className="text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  {slides[currentSlide].title}
                </h2>
                <p className="text-lg lg:text-xl text-muted-foreground mb-8">
                  {slides[currentSlide].description}
                </p>
                
                {/* Testimonial Box */}
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.3, duration: 0.4, type: "spring" }}
                  className="relative bg-background/20 backdrop-blur-md border border-white/10 dark:border-white/5 rounded-2xl p-6 shadow-xl max-w-lg"
                >
                  <p className="text-base lg:text-lg text-foreground mb-3 leading-relaxed italic">
                    &ldquo;{slides[currentSlide].testimonial.text}&rdquo;
                  </p>
                  <p className="text-sm text-muted-foreground font-medium">
                    — {slides[currentSlide].testimonial.author}
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Fixed Controls Container */}
          <div className="mt-8">
            {/* Slide indicators */}
            <div className="flex justify-start gap-2">
              {slides.map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => handleSlideChange(index)}
                  className={`h-2 rounded-full ${
                    index === currentSlide
                      ? 'bg-primary'
                      : 'bg-primary/30 hover:bg-primary/50'
                  }`}
                  animate={{
                    width: index === currentSlide ? 32 : 8,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            {/* Navigation buttons */}
            <div className="flex justify-start gap-3 mt-4">
              <motion.button
                onClick={handlePrevSlide}
                className="w-10 h-10 rounded-full bg-background/50 backdrop-blur border border-border flex items-center justify-center hover:bg-background/80 transition-colors"
                whileHover={{ scale: 1.05, x: -2 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Previous slide"
              >
                <ArrowLeft className="w-4 h-4" />
              </motion.button>
              <motion.button
                onClick={handleNextSlide}
                className="w-10 h-10 rounded-full bg-background/50 backdrop-blur border border-border flex items-center justify-center hover:bg-background/80 transition-colors"
                whileHover={{ scale: 1.05, x: 2 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Next slide"
              >
                <ArrowRight className="w-4 h-4" />
              </motion.button>
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