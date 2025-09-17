'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Upload,
  Wand2,
  Sparkles,
  Download,
  ArrowRight,
  ArrowLeft,
  Check,
  FileImage,
  Palette,
  Zap,
  Globe,
} from 'lucide-react';

interface OnboardingDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const steps = [
  {
    title: 'Upload Your App Screenshots',
    icon: <Upload className="w-8 h-8" />,
    description: 'Start by uploading screenshots from your app. These will be your source images that you can transform with AI.',
    details: [
      'Upload multiple screenshots at once',
      'Support for PNG, JPG, and other formats',
      'Organize and manage all your app screens',
    ],
    illustration: (
      <div className="relative">
        <div className="flex gap-3 justify-center">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-20 aspect-[9/16] bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg border-2 border-dashed border-primary/30 flex items-center justify-center"
            >
              <FileImage className="w-6 h-6 text-muted-foreground/40" />
            </div>
          ))}
        </div>
        <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center backdrop-blur-sm">
          <Upload className="w-8 h-8 text-primary" />
        </div>
      </div>
    ),
  },
  {
    title: 'Choose Your Vibe',
    icon: <Palette className="w-8 h-8" />,
    description: 'Pick from pre-designed AI style templates or create your own unique vibe. Each vibe maintains consistent styling across all your screenshots.',
    details: [
      'Professional, trendy, or playful styles',
      'Customize colors, fonts, and layouts',
      'Save your own vibes for future use',
    ],
    illustration: (
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-2">
          <div className="h-20 bg-gradient-to-br from-pink-500 to-orange-500 rounded-lg" />
          <p className="text-xs font-medium text-center">Snap Style</p>
        </div>
        <div className="space-y-2">
          <div className="h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg" />
          <p className="text-xs font-medium text-center">Watercolor</p>
        </div>
        <div className="space-y-2">
          <div className="h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg" />
          <p className="text-xs font-medium text-center">GenZ Medley</p>
        </div>
        <div className="space-y-2">
          <div className="h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg" />
          <p className="text-xs font-medium text-center">Nature</p>
        </div>
        <div className="space-y-2">
          <div className="h-20 bg-gradient-to-br from-gray-600 to-gray-800 rounded-lg" />
          <p className="text-xs font-medium text-center">Minimal</p>
        </div>
        <div className="space-y-2">
          <div className="h-20 border-2 border-dashed border-primary/50 rounded-lg flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-primary/50" />
          </div>
          <p className="text-xs font-medium text-center">Custom</p>
        </div>
      </div>
    ),
  },
  {
    title: 'Generate with AI Magic',
    icon: <Zap className="w-8 h-8" />,
    description: 'Use simple prompts to transform your screenshots. The AI maintains your chosen vibe for consistent, professional results.',
    details: [
      'Natural language prompts',
      'Instant preview and iterations',
      'Batch processing for efficiency',
    ],
    illustration: (
      <div className="space-y-4">
        <div className="p-3 bg-muted/50 rounded-lg">
          <p className="text-sm font-medium mb-2">✨ "Add festive holiday theme"</p>
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-16 h-28 bg-gradient-to-br from-red-500/20 to-green-500/20 rounded-md animate-pulse"
              />
            ))}
          </div>
        </div>
        <div className="p-3 bg-muted/50 rounded-lg">
          <p className="text-sm font-medium mb-2">🌍 "Translate to Spanish"</p>
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-16 h-28 bg-gradient-to-br from-yellow-500/20 to-red-500/20 rounded-md animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Export for Every Platform',
    icon: <Download className="w-8 h-8" />,
    description: 'Export your screenshots in all the sizes and formats needed for iOS App Store, Google Play, and web stores.',
    details: [
      'Auto-resize for all device types',
      'Platform-specific requirements',
      'Batch export with one click',
    ],
    illustration: (
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3 bg-blue-500/10 rounded-lg">
          <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
            <Globe className="w-5 h-5 text-blue-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">iOS App Store</p>
            <p className="text-xs text-muted-foreground">6.7", 6.5", 5.5" displays</p>
          </div>
          <Check className="w-5 h-5 text-green-500" />
        </div>
        <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-lg">
          <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
            <Globe className="w-5 h-5 text-green-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Google Play Store</p>
            <p className="text-xs text-muted-foreground">Phone, Tablet, Chromebook</p>
          </div>
          <Check className="w-5 h-5 text-green-500" />
        </div>
      </div>
    ),
  },
];

export default function OnboardingDialog({ isOpen, onClose }: OnboardingDialogProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (index: number) => {
    setCurrentStep(index);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 30 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl bg-card border rounded-2xl shadow-2xl z-50"
          >
            <div className="relative p-8">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-muted/50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Progress indicators */}
              <div className="flex items-center justify-center gap-2 mb-8">
                {steps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToStep(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === currentStep
                        ? 'w-8 bg-primary'
                        : index < currentStep
                        ? 'w-2 bg-primary/50'
                        : 'w-2 bg-muted-foreground/20'
                    }`}
                  />
                ))}
              </div>

              {/* Content */}
              <div className="min-h-[400px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-8"
                  >
                    {/* Left side - Text content */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                          {steps[currentStep].icon}
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground font-medium">
                            STEP {currentStep + 1} OF {steps.length}
                          </p>
                          <h2 className="text-2xl font-bold">
                            {steps[currentStep].title}
                          </h2>
                        </div>
                      </div>

                      <p className="text-muted-foreground">
                        {steps[currentStep].description}
                      </p>

                      <ul className="space-y-2">
                        {steps[currentStep].details.map((detail, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <Check className="w-3 h-3 text-primary" />
                            </div>
                            <span className="text-sm">{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Right side - Illustration */}
                    <div className="flex items-center justify-center">
                      <div className="w-full max-w-sm">
                        {steps[currentStep].illustration}
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Navigation buttons */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t">
                <button
                  onClick={prevStep}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    currentStep === 0
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:bg-muted/50'
                  } flex items-center gap-2`}
                  disabled={currentStep === 0}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Previous
                </button>

                <div className="flex items-center gap-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Skip Tutorial
                  </button>

                  <button
                    onClick={nextStep}
                    className="px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors flex items-center gap-2"
                  >
                    {currentStep === steps.length - 1 ? (
                      <>
                        Get Started
                        <Sparkles className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        Next
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}