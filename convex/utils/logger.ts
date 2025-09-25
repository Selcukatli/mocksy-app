/**
 * Centralized logging utility with environment-based log levels
 *
 * Set LOG_LEVEL environment variable to control verbosity:
 * - 'debug': All logs (most verbose)
 * - 'info': Info, warnings, and errors
 * - 'warn': Only warnings and errors
 * - 'error': Only errors (least verbose)
 *
 * Default is 'info' if not set.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

// Get current log level from environment or default to 'info'
const getCurrentLogLevel = (): LogLevel => {
  const envLevel = process.env.LOG_LEVEL?.toLowerCase();
  if (envLevel && envLevel in LOG_LEVELS) {
    return envLevel as LogLevel;
  }
  return 'info';
};

const currentLogLevel = getCurrentLogLevel();
const currentLogLevelValue = LOG_LEVELS[currentLogLevel];

export const logger = {
  debug: (...args: unknown[]) => {
    if (currentLogLevelValue <= LOG_LEVELS.debug) {
      console.log('[DEBUG]', ...args);
    }
  },

  info: (...args: unknown[]) => {
    if (currentLogLevelValue <= LOG_LEVELS.info) {
      console.log(...args);
    }
  },

  warn: (...args: unknown[]) => {
    if (currentLogLevelValue <= LOG_LEVELS.warn) {
      console.warn('[WARN]', ...args);
    }
  },

  error: (...args: unknown[]) => {
    // Always log errors
    console.error('[ERROR]', ...args);
  },

  // Special method for AI SDK logs with consistent formatting
  aiSdk: (message: string, data?: unknown) => {
    if (currentLogLevelValue <= LOG_LEVELS.info) {
      if (data) {
        console.log(`[AI SDK] ${message}`, data);
      } else {
        console.log(`[AI SDK] ${message}`);
      }
    }
  },

  // Special method for FAL image generation logs
  fal: (message: string, data?: unknown) => {
    if (currentLogLevelValue <= LOG_LEVELS.info) {
      if (data) {
        console.log(`[FAL] ${message}`, data);
      } else {
        console.log(`[FAL] ${message}`);
      }
    }
  },
};

// Export current log level for conditional logic if needed
export const isDebugMode = currentLogLevel === 'debug';
export const isProductionMode = currentLogLevel === 'error';