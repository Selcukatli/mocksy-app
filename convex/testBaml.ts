"use node";
import { action } from "./_generated/server";
import { b } from "../baml_client";
import type { BasicResponse, DetailedResponse } from "../baml_client/types";

interface TestResults {
  simple?: string | { error: string };
  structured?: BasicResponse | { error: string };
  list?: string[] | { error: string };
  detailed?: DetailedResponse | { error: string };
}

interface TestTimings {
  simple?: number;
  structured?: number;
  list?: number;
  detailed?: number;
}

export const testBasic = action({
  handler: async () => {
    const results: TestResults = {};
    const timings: TestTimings = {};

    try {
      console.log("🚀 Starting BAML tests with OpenRouter...\n");

      // Test 1: Simple string response
      console.log("Test 1: Simple string in/out");
      const start1 = Date.now();
      try {
        const simple = await b.SimpleTest("What is 2+2?");
        timings.simple = Date.now() - start1;
        results.simple = simple;
        console.log(`✅ Simple test (${timings.simple}ms):`, simple);
      } catch (error) {
        console.error("❌ Simple test failed:", error);
        results.simple = { error: String(error) };
      }

      // Test 2: Structured response
      console.log("\nTest 2: Structured output");
      const start2 = Date.now();
      try {
        const structured: BasicResponse = await b.StructuredTest("What is the capital of France?");
        timings.structured = Date.now() - start2;
        results.structured = structured;
        console.log(`✅ Structured test (${timings.structured}ms):`, structured);
      } catch (error) {
        console.error("❌ Structured test failed:", error);
        results.structured = { error: String(error) };
      }

      // Test 3: Array output
      console.log("\nTest 3: Array output");
      const start3 = Date.now();
      try {
        const list = await b.ListTest("programming languages");
        timings.list = Date.now() - start3;
        results.list = list;
        console.log(`✅ List test (${timings.list}ms):`, list);
      } catch (error) {
        console.error("❌ List test failed:", error);
        results.list = { error: String(error) };
      }

      // Test 4: Optional fields with smarter model
      console.log("\nTest 4: Optional fields with Claude");
      const start4 = Date.now();
      try {
        const detailed: DetailedResponse = await b.DetailedTest("Why is the sky blue?");
        timings.detailed = Date.now() - start4;
        results.detailed = detailed;
        console.log(`✅ Detailed test (${timings.detailed}ms):`, detailed);
      } catch (error) {
        console.error("❌ Detailed test failed:", error);
        results.detailed = { error: String(error) };
      }

      // Summary
      console.log("\n📊 Summary:");
      console.log("Timings:", timings);
      console.log("Total time:", Object.values(timings).reduce((a, b) => (a ?? 0) + (b ?? 0), 0), "ms");

      return {
        success: true,
        results,
        timings,
        totalTime: Object.values(timings).reduce((a, b) => (a ?? 0) + (b ?? 0), 0)
      };

    } catch (error) {
      console.error("🚨 BAML test suite failed:", error);
      return {
        success: false,
        error: String(error),
        results,
        timings
      };
    }
  }
});

export const testOpenRouterConnection = action({
  handler: async () => {
    console.log("Testing basic OpenRouter connection via BAML...");

    try {
      const result = await b.SimpleTest("Say 'hello' if you can hear me");
      console.log("✅ OpenRouter connected successfully!");
      console.log("Response:", result);
      return {
        success: true,
        response: result,
        message: "BAML successfully connected to OpenRouter"
      };
    } catch (error) {
      console.error("❌ Failed to connect to OpenRouter:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      return {
        success: false,
        error: errorMessage,
        details: errorStack
      };
    }
  }
});