"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import type { ChangeEvent } from "react";
import {
  Palette,
  PlusCircle,
  Shapes,
  Smartphone,
  Sparkles,
  Type,
  Upload,
  Wand2,
  X,
} from "lucide-react";

interface StyleJobStatus {
  message?: string | null;
  progress?: number | null;
}

interface CreateStyleDialogProps {
  open: boolean;
  styleDescription: string;
  onStyleDescriptionChange: (value: string) => void;
  hasReferenceImage: boolean;
  referenceImagePreview: string | null;
  onReferenceImageChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemoveReferenceImage: () => void;
  generating: boolean;
  onSubmit: () => void;
  onClose: () => void;
  backgroundStyle: string;
  onBackgroundStyleChange: (value: string) => void;
  backgroundFieldActive: boolean;
  onBackgroundFieldToggle: (active: boolean) => void;
  textStyle: string;
  onTextStyleChange: (value: string) => void;
  textFieldActive: boolean;
  onTextFieldToggle: (active: boolean) => void;
  deviceStyle: string;
  onDeviceStyleChange: (value: string) => void;
  deviceFieldActive: boolean;
  onDeviceFieldToggle: (active: boolean) => void;
  decorativeElements: string;
  onDecorativeElementsChange: (value: string) => void;
  decorativeFieldActive: boolean;
  onDecorativeFieldToggle: (active: boolean) => void;
  styleJob?: StyleJobStatus | null;
}

export function CreateStyleDialog({
  open,
  styleDescription,
  onStyleDescriptionChange,
  hasReferenceImage,
  referenceImagePreview,
  onReferenceImageChange,
  onRemoveReferenceImage,
  generating,
  onSubmit,
  onClose,
  backgroundStyle,
  onBackgroundStyleChange,
  backgroundFieldActive,
  onBackgroundFieldToggle,
  textStyle,
  onTextStyleChange,
  textFieldActive,
  onTextFieldToggle,
  deviceStyle,
  onDeviceStyleChange,
  deviceFieldActive,
  onDeviceFieldToggle,
  decorativeElements,
  onDecorativeElementsChange,
  decorativeFieldActive,
  onDecorativeFieldToggle,
  styleJob,
}: CreateStyleDialogProps) {
  const descriptionLength = styleDescription.trim().length;
  const maxSuggestedLength = 280;

  const detailSections = [
    {
      key: "background",
      label: "Background style",
      icon: Palette,
      active: backgroundFieldActive,
      onAdd: () => onBackgroundFieldToggle(true),
    },
    {
      key: "text",
      label: "Text style",
      icon: Type,
      active: textFieldActive,
      onAdd: () => onTextFieldToggle(true),
    },
    {
      key: "device",
      label: "Device frame",
      icon: Smartphone,
      active: deviceFieldActive,
      onAdd: () => onDeviceFieldToggle(true),
    },
    {
      key: "decorative",
      label: "Decorations",
      icon: Shapes,
      active: decorativeFieldActive,
      onAdd: () => onDecorativeFieldToggle(true),
    },
  ] as const;

  const inactiveDetailSections = detailSections.filter((section) => !section.active);
  const hasActiveDetail = detailSections.some((section) => section.active);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            aria-label="Close create style dialog"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-modal="true"
            className="relative mx-4 flex w-full max-w-md flex-col overflow-hidden rounded-xl border bg-card shadow-xl md:max-w-2xl"
          >
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h2 className="text-lg font-semibold">Generate Custom Style</h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1 transition-colors hover:bg-muted/50"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <AnimatePresence mode="wait">
              {generating ? (
                <motion.div
                  key="generating"
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -20 }}
                  transition={{
                    duration: 0.5,
                    ease: [0.16, 1, 0.3, 1] // Custom easing for smooth feel
                  }}
                  className="relative flex min-h-[500px] flex-col items-center justify-center overflow-hidden px-6 py-12"
                >
                  {/* Floating detail cards in background */}
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    {styleDescription && (
                      <motion.div
                        initial={{ opacity: 0, x: -40, rotate: -8 }}
                        animate={{ opacity: 0.7, x: -80, rotate: -4 }}
                        transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
                        className="absolute left-12 top-32 max-w-[13rem] rounded-lg border-2 border-primary/40 bg-primary/10 px-4 py-3 shadow-xl backdrop-blur-md"
                      >
                        <p className="text-xs font-semibold text-primary">Description</p>
                        <p className="mt-1 line-clamp-2 text-sm">{styleDescription}</p>
                      </motion.div>
                    )}

                    {backgroundFieldActive && backgroundStyle && (
                      <motion.div
                        initial={{ opacity: 0, x: 40, rotate: 8 }}
                        animate={{ opacity: 0.7, x: 80, rotate: 4 }}
                        transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
                        className="absolute right-12 top-28 max-w-[13rem] rounded-lg border-2 border-primary/40 bg-primary/10 px-4 py-3 shadow-xl backdrop-blur-md"
                      >
                        <p className="text-xs font-semibold text-primary">Background</p>
                        <p className="mt-1 line-clamp-2 text-sm">{backgroundStyle}</p>
                      </motion.div>
                    )}

                    {textFieldActive && textStyle && (
                      <motion.div
                        initial={{ opacity: 0, y: 40, rotate: 4 }}
                        animate={{ opacity: 0.7, y: 80, rotate: 2 }}
                        transition={{ delay: 0.35, duration: 0.6, ease: "easeOut" }}
                        className="absolute bottom-36 left-20 max-w-[13rem] rounded-lg border-2 border-primary/40 bg-primary/10 px-4 py-3 shadow-xl backdrop-blur-md"
                      >
                        <p className="text-xs font-semibold text-primary">Text Style</p>
                        <p className="mt-1 line-clamp-2 text-sm">{textStyle}</p>
                      </motion.div>
                    )}

                    {deviceFieldActive && deviceStyle && (
                      <motion.div
                        initial={{ opacity: 0, y: 40, rotate: -4 }}
                        animate={{ opacity: 0.7, y: 80, rotate: -2 }}
                        transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
                        className="absolute bottom-36 right-20 max-w-[13rem] rounded-lg border-2 border-primary/40 bg-primary/10 px-4 py-3 shadow-xl backdrop-blur-md"
                      >
                        <p className="text-xs font-semibold text-primary">Device Frame</p>
                        <p className="mt-1 line-clamp-2 text-sm">{deviceStyle}</p>
                      </motion.div>
                    )}

                    {decorativeFieldActive && decorativeElements && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.85, rotate: 6 }}
                        animate={{ opacity: 0.7, scale: 1, rotate: 3 }}
                        transition={{ delay: 0.45, duration: 0.6, ease: "easeOut" }}
                        className="absolute left-32 bottom-52 max-w-[13rem] rounded-lg border-2 border-primary/40 bg-primary/10 px-4 py-3 shadow-xl backdrop-blur-md"
                      >
                        <p className="text-xs font-semibold text-primary">Decorations</p>
                        <p className="mt-1 line-clamp-2 text-sm">{decorativeElements}</p>
                      </motion.div>
                    )}

                    {referenceImagePreview && (
                      <motion.div
                        initial={{ opacity: 0, x: 0, y: 20, rotate: -10 }}
                        animate={{ opacity: 0.85, x: 140, y: -40, rotate: -6 }}
                        transition={{ delay: 0.45, duration: 0.6, ease: "easeOut" }}
                        className="absolute top-1/3 right-10 md:right-24 rounded-2xl border-2 border-primary/40 bg-card/90 p-2 shadow-xl shadow-primary/20 backdrop-blur"
                      >
                        <Image
                          src={referenceImagePreview}
                          alt="Reference preview"
                          width={110}
                          height={110}
                          unoptimized
                          className="h-[110px] w-auto rounded-xl object-cover"
                        />
                      </motion.div>
                    )}
                  </div>

                  {/* Main loading UI - centered and above cards */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.15, duration: 0.4 }}
                    className="relative z-10"
                  >
                    <SparkleIndicator large />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25, duration: 0.4 }}
                    className="relative z-10 mt-8 text-center"
                  >
                    <p className="text-xl font-semibold">
                      {styleJob?.message ?? "Generating your style..."}
                    </p>
                    {typeof styleJob?.progress === "number" && (
                      <div className="mt-6 w-80">
                        <div className="h-2 w-full overflow-hidden rounded-full bg-primary/10">
                          <motion.div
                            className="relative h-full rounded-full bg-primary"
                            animate={{ width: `${Math.max(styleJob.progress * 100, 6)}%` }}
                            transition={{ duration: 0.35, ease: "easeOut" }}
                          >
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/40 to-white/0 opacity-70"
                              animate={{ x: ["-100%", "100%"] }}
                              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                            />
                          </motion.div>
                        </div>
                        <p className="mt-3 text-sm text-muted-foreground">
                          {Math.round(styleJob.progress * 100)}% complete
                        </p>
                      </div>
                    )}
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="max-h-[calc(100vh-220px)] overflow-y-auto px-6 py-5"
                >
              <div className="grid gap-5 md:grid-cols-[minmax(0,165px)_minmax(0,1fr)] md:items-stretch md:gap-4">
                <div className="order-1 flex flex-col md:order-2">
                  <div className="mb-1.5 flex items-center justify-between text-sm font-medium">
                    <label htmlFor="style-description" className="flex items-center gap-1.5">
                      <Wand2 className="h-3.5 w-3.5" />
                      Describe your style
                    </label>
                    <span className="text-xs font-normal text-muted-foreground">
                      {descriptionLength}
                      {maxSuggestedLength ? ` / ${maxSuggestedLength}` : ""}
                    </span>
                  </div>
                  <textarea
                    id="style-description"
                    value={styleDescription}
                    disabled={generating}
                    aria-disabled={generating}
                    onChange={(event) => onStyleDescriptionChange(event.target.value)}
                    placeholder="e.g., Cyberpunk neon with dark purple gradient, futuristic typography..."
                    className="min-h-[130px] resize-none rounded-lg border bg-background px-3 py-3 transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
                    autoFocus
                  />
                </div>

                <div className="order-2 flex w-full flex-col md:order-1 md:w-[200px] md:max-w-[200px]">
                  <div className="mb-1.5 flex items-center justify-between text-sm font-medium">
                    <span className="flex items-center gap-1.5">
                      <Upload className="h-3.5 w-3.5" />
                      Reference image
                    </span>
                    <span className="ml-2 text-xs font-normal text-muted-foreground">Optional</span>
                  </div>
                  <div className="relative flex-1">
                    <input
                      type="file"
                      id="reference-image"
                      accept="image/*"
                      onChange={onReferenceImageChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="reference-image"
                      className={`flex h-full w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed bg-muted/30 px-3 transition-colors hover:bg-muted/50 ${
                        referenceImagePreview ? "py-2" : "py-2.5"
                      }`}
                    >
                      {referenceImagePreview ? (
                        <motion.div
                          className="relative"
                          animate={
                            generating
                              ? {
                                  scale: [1, 1.01, 0.995, 1],
                                }
                              : { scale: 1 }
                          }
                          transition={{ duration: 1.6, repeat: generating ? Infinity : 0, ease: "easeInOut" }}
                        >
                          <div className="relative flex items-center justify-center">
                            <Image
                              src={referenceImagePreview}
                              alt="Reference preview"
                              width={140}
                              height={140}
                              unoptimized
                              className={`max-h-[120px] w-auto rounded-lg object-contain ${generating ? "brightness-[1.07]" : ""}`}
                            />
                          </div>
                          {generating && (
                            <>
                              <motion.div
                                className="pointer-events-none absolute -inset-3 rounded-2xl border border-primary/40"
                                animate={{ opacity: [0.35, 0.9, 0.35] }}
                                transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                              />
                              <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl">
                                <motion.div
                                  className="absolute inset-x-[-30%] h-1/2 bg-gradient-to-b from-primary/0 via-primary/25 to-primary/0 blur-lg"
                                  animate={{ y: ["-120%", "110%"] }}
                                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                                />
                              </div>
                            </>
                          )}
                          {!generating && (
                            <button
                              type="button"
                              onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                onRemoveReferenceImage();
                              }}
                              className="absolute -top-2 -right-2 rounded-full border bg-background p-1"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          )}
                        </motion.div>
                      ) : (
                        <>
                          <Upload className="h-5 w-5 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground text-center">
                            Paste or upload inspiration image
                          </span>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                <div className="order-3 space-y-2 text-muted-foreground/80 md:order-3 md:col-span-2 md:pt-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em]">
                    <PlusCircle className="h-3 w-3" />
                    Add more detail
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {inactiveDetailSections.length > 0 ? (
                      inactiveDetailSections.map((section) => (
                        <button
                          key={section.key}
                          type="button"
                          onClick={section.onAdd}
                          disabled={generating}
                          className="inline-flex items-center gap-2 rounded-full bg-muted/30 px-3.5 py-2 text-sm font-medium text-muted-foreground/90 transition hover:bg-muted/40 hover:text-primary disabled:opacity-50"
                        >
                          <section.icon className="h-4 w-4" />
                          {section.label}
                        </button>
                      ))
                    ) : (
                      <span className="text-xs">All optional details added</span>
                    )}
                  </div>
                </div>
              </div>

              {hasActiveDetail && (
                <div className="mt-6 space-y-4 border-t border-dashed border-border/60 pt-4">
                  <AnimatePresence initial={false}>
                    {backgroundFieldActive && (
                      <motion.div
                        key="background-detail"
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.2 }}
                        className="rounded-lg border border-dashed border-primary/30 bg-primary/5 p-4"
                      >
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2 text-sm font-medium">
                            <Palette className="h-4 w-4 text-primary" />
                            Background Style
                          </span>
                          <button
                            type="button"
                            onClick={() => onBackgroundFieldToggle(false)}
                            className="text-xs text-muted-foreground transition hover:text-destructive"
                          >
                            Remove
                          </button>
                        </div>
                        <input
                          id="background-style"
                          type="text"
                          value={backgroundStyle}
                          onChange={(event) => onBackgroundStyleChange(event.target.value)}
                          placeholder="e.g., gradient from dark purple to bright orange"
                          className="mt-3 w-full rounded-lg border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </motion.div>
                    )}

                    {textFieldActive && (
                      <motion.div
                        key="text-detail"
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.2 }}
                        className="rounded-lg border border-dashed border-primary/30 bg-primary/5 p-4"
                      >
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2 text-sm font-medium">
                            <Type className="h-4 w-4 text-primary" />
                            Text Style
                          </span>
                          <button
                            type="button"
                            onClick={() => onTextFieldToggle(false)}
                            className="text-xs text-muted-foreground transition hover:text-destructive"
                          >
                            Remove
                          </button>
                        </div>
                        <input
                          id="text-style"
                          type="text"
                          value={textStyle}
                          onChange={(event) => onTextStyleChange(event.target.value)}
                          placeholder="e.g., Impact font, white with thick black outline"
                          className="mt-3 w-full rounded-lg border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </motion.div>
                    )}

                    {deviceFieldActive && (
                      <motion.div
                        key="device-detail"
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.2 }}
                        className="rounded-lg border border-dashed border-primary/30 bg-primary/5 p-4"
                      >
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2 text-sm font-medium">
                            <Smartphone className="h-4 w-4 text-primary" />
                            Device Frame Style
                          </span>
                          <button
                            type="button"
                            onClick={() => onDeviceFieldToggle(false)}
                            className="text-xs text-muted-foreground transition hover:text-destructive"
                          >
                            Remove
                          </button>
                        </div>
                        <input
                          id="device-style"
                          type="text"
                          value={deviceStyle}
                          onChange={(event) => onDeviceStyleChange(event.target.value)}
                          placeholder="e.g., Glossy black frame with neon cyan glow"
                          className="mt-3 w-full rounded-lg border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </motion.div>
                    )}

                    {decorativeFieldActive && (
                      <motion.div
                        key="decorative-detail"
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.2 }}
                        className="rounded-lg border border-dashed border-primary/30 bg-primary/5 p-4"
                      >
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2 text-sm font-medium">
                            <Sparkles className="h-4 w-4 text-primary" />
                            Decorations
                          </span>
                          <button
                            type="button"
                            onClick={() => onDecorativeFieldToggle(false)}
                            className="text-xs text-muted-foreground transition hover:text-destructive"
                          >
                            Remove
                          </button>
                        </div>
                        <textarea
                          id="decorative-elements"
                          value={decorativeElements}
                          onChange={(event) => onDecorativeElementsChange(event.target.value)}
                          placeholder="e.g., Palm trees, geometric shapes, grid patterns at edges"
                          className="mt-3 min-h-[80px] w-full resize-none rounded-lg border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-2 border-t bg-card/95 px-6 py-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-lg border px-4 py-2 transition-colors hover:bg-muted/50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onSubmit}
                disabled={generating || (!styleDescription.trim() && !hasReferenceImage)}
                className="relative flex-1 overflow-hidden rounded-lg bg-primary px-4 py-2 text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {generating && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{ x: [-200, 200] }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                )}
                <span className="relative flex items-center justify-center gap-2">
                  <Wand2 className="h-4 w-4" />
                  {generating ? "Generating..." : "Generate Style"}
                </span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function SparkleIndicator({ large = false }: { large?: boolean }) {
  const particles = [
    { angle: 0, delay: 0 },
    { angle: 120, delay: 0.2 },
    { angle: 240, delay: 0.4 },
  ];
  const radius = large ? 20 : 6;

  return (
    <span
      className={`relative inline-flex items-center justify-center text-primary ${large ? "h-16 w-16" : "h-5 w-5"}`}
    >
      <motion.span
        className={`rounded-full bg-primary ${large ? "h-6 w-6" : "h-2 w-2"}`}
        animate={{ scale: [0.8, 1.15, 0.8], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
      />
      {particles.map(({ angle, delay }) => {
        const radians = (angle * Math.PI) / 180;
        const x = Math.cos(radians) * radius;
        const y = Math.sin(radians) * radius;

        return (
          <motion.span
            key={angle}
            className={`absolute rounded-full bg-primary/90 shadow-[0_0_6px_rgba(147,107,247,0.35)] ${large ? "h-4 w-4" : "h-1.5 w-1.5"}`}
            animate={{
              x: [0, x, 0],
              y: [0, y, 0],
              scale: [0.3, 1, 0.3],
              opacity: [0, 1, 0],
            }}
            transition={{ duration: 1.3, repeat: Infinity, delay, ease: "easeInOut" }}
          />
        );
      })}
      <motion.span
        className={`absolute rounded-full bg-primary/15 ${large ? "h-12 w-12" : "h-4 w-4"}`}
        animate={{ scale: [0.9, 1.3, 0.9], opacity: [0.4, 0.1, 0.4] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
      />
    </span>
  );
}

export type { StyleJobStatus };
