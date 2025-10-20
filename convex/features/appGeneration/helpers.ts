/**
 * Helper function to fetch with retry logic
 */
export async function fetchWithRetry(url: string, maxAttempts = 3): Promise<Response> {
  let lastError: string = "";

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`  Attempt ${attempt}/${maxAttempts} to download from ${url.substring(0, 60)}...`);
      const response = await fetch(url);
      if (response.ok) {
        return response;
      }
      lastError = response.statusText;
      console.log(`  ⚠️  Attempt ${attempt} failed: ${lastError}`);
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
      console.log(`  ⚠️  Attempt ${attempt} failed: ${lastError}`);
    }

    // Wait before retrying (exponential backoff)
    if (attempt < maxAttempts) {
      const delayMs = Math.pow(2, attempt) * 1000; // 2s, 4s
      console.log(`  ⏳ Waiting ${delayMs/1000}s before retry...`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  throw new Error(`Failed to download after ${maxAttempts} attempts: ${lastError}`);
}
