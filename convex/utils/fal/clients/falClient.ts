"use node";

import { fal } from "@fal-ai/client";
import {
  FalContentPolicyError,
  FalValidationError,
  FalAPIError,
} from "../types";

// Type definitions for FAL queue updates
interface FalQueueUpdate {
  status: "IN_QUEUE" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
  logs?: Array<{
    message: string;
    level?: string;
    timestamp?: string;
  }>;
}

/**
 * Configure fal.ai client with API key
 */
function configureFalClient(apiKey?: string): void {
  const key = apiKey || (process.env.FAL_KEY as string);
  if (!key) {
    throw new Error("FAL_KEY environment variable is not set");
  }

  fal.config({
    credentials: key,
  });
}

/**
 * Call any fal.ai model using their official client
 */
export async function callFalModel<
  TInput extends Record<string, unknown> = Record<string, unknown>,
  TOutput = unknown,
>(
  modelId: string,
  input: TInput,
  apiKey?: string,
  timeoutMs: number = 5 * 60 * 1000 // Default 5 minutes
): Promise<TOutput | null> {
  try {
    // Configure the client
    configureFalClient(apiKey);

    console.log(`Calling fal.ai model: ${modelId}`);
    console.log(`Input:`, input);

    // Create timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`FAL API call timed out after ${timeoutMs / 1000} seconds`));
      }, timeoutMs);
    });

    // Throttle IN_PROGRESS logs to avoid overflow
    let lastLogTime = 0;

    // Use the official client's subscribe method with timeout
    const result = await Promise.race([
      fal.subscribe(modelId, {
        input,
        logs: true,
        onQueueUpdate: (update: FalQueueUpdate) => {
          const now = Date.now();
          if (update.status === "IN_PROGRESS") {
            // Only log every 10 seconds to avoid overflow
            if (now - lastLogTime > 10000) {
              console.log(`Queue status: ${update.status}`);
              lastLogTime = now;
            }
            if (update.logs) {
              update.logs.forEach((log) => {
                console.log(`Log: ${log.message}`);
              });
            }
          } else {
            console.log(`Queue status: ${update.status}`);
          }
        },
      }),
      timeoutPromise
    ]);

    console.log(`✅ Success! Got result from ${modelId}`);
    return result.data as TOutput;
  } catch (error) {
    console.error(`❌ Error calling fal.ai model ${modelId}:`, error);

    // Parse and throw specific error types for better client handling
    if (error && typeof error === "object") {
      const errorObj = error as {
        body?: {
          detail?: Array<{
            type?: string;
            msg?: string;
            url?: string;
            input?: { prompt?: string };
          }>;
        };
        status?: number;
      };

      if (
        errorObj.body &&
        errorObj.body.detail &&
        Array.isArray(errorObj.body.detail)
      ) {
        const detail = errorObj.body.detail[0];
        console.error(
          "Error details:",
          JSON.stringify(errorObj.body.detail, null, 2),
        );

        if (detail.type === "content_policy_violation") {
          // Content policy violation - help client understand what went wrong
          const rejectedPrompt = detail.input?.prompt || "unknown prompt";
          const message = detail.msg || "Content flagged by safety checker";
          console.error(
            `🚫 Content policy violation for prompt: "${rejectedPrompt}"`,
          );
          throw new FalContentPolicyError(message, rejectedPrompt, detail.url);
        } else if (errorObj.status === 422) {
          // Other validation errors
          const message = detail.msg || "Validation failed";
          console.error(`❌ Validation error: ${message}`);
          throw new FalValidationError(message, errorObj.body.detail);
        }
      }

      // Generic API error
      const status = errorObj.status || 500;
      const message = `API request failed with status ${status}`;
      console.error(`❌ API Error: ${message}`);
      throw new FalAPIError(message, status, errorObj.body);
    }

    // Unknown error type
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error(`❌ Unknown error: ${message}`);
    throw new FalAPIError(message, 500, error);
  }
}
