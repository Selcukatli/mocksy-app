"use node";

import { AIMessage, TextGenerationResponse } from "./types";

/**
 * Direct OpenAI API call for GPT-5 models that bypasses AI SDK limitations
 */
export async function callGPT5Direct(
  model: string,
  messages: AIMessage[],
  maxOutputTokens: number = 2000,
  reasoningEffort: 'minimal' | 'low' | 'medium' | 'high' = 'minimal'
): Promise<TextGenerationResponse | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY not set");
  }

  try {
    // Convert messages to OpenAI format
    const openaiMessages = messages.map(msg => ({
      role: msg.role,
      content: typeof msg.content === 'string' ? msg.content : 
        msg.content.map(part => 
          part.type === 'text' ? part.text : ''
        ).join(' ')
    }));

    // Adjust tokens based on reasoning effort
    // Minimal effort doesn't need extra reasoning tokens
    const extraTokens = reasoningEffort === 'minimal' ? 0 : 2000;
    const totalTokens = Math.max(maxOutputTokens + extraTokens, maxOutputTokens);
    console.log(`[GPT-5 Direct] Calling ${model} with max_completion_tokens: ${totalTokens}, reasoning_effort: ${reasoningEffort}`);

    const startTime = Date.now();
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: openaiMessages,
        max_completion_tokens: totalTokens,
        reasoning_effort: reasoningEffort,
        verbosity: 'medium', // Control output length
        // No temperature - GPT-5 doesn't support it
      }),
    });
    const fetchTime = Date.now() - startTime;
    console.log(`[GPT-5 Direct] API call took ${fetchTime}ms`);

    if (!response.ok) {
      const error = await response.text();
      console.error(`[GPT-5 Direct] API error:`, error);
      throw new Error(`OpenAI API error: ${error}`);
    }

    const data = await response.json();
    console.log(`[GPT-5 Direct] Success! Got response from ${model}`);
    
    // Extract content from response
    const content = data.choices[0].message.content || '';

    return {
      content: content,
      usage: data.usage ? {
        inputTokens: data.usage.prompt_tokens,
        outputTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens,
        reasoningTokens: data.usage.reasoning_tokens,
      } : undefined,
      model: model,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[GPT-5 Direct] Failed:`, message);
    throw error;
  }
}
