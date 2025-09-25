// Barrel exports for clean imports
export * from "./types";
export * from "./aiSdkClient";
export * from "./aiModels";

// Re-export the AI SDK's tool function for convenience
export { tool } from "ai";

// Re-export actions under aiSdkActions namespace to maintain compatibility
export * as aiSdkActions from "./aiSdkActions";

// Test exports removed for v5 compatibility