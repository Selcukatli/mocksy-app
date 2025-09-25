// Generic AI SDK types for text generation

// Content types for multimodal messages
export interface TextPart {
  type: "text";
  text: string;
}

export interface ImagePart {
  type: "image";
  image: string; // URL string or base64 string
  mimeType?: string;
}

export type MessageContent = string | Array<TextPart | ImagePart>;

export interface AIMessage {
  role: "user" | "assistant" | "system";
  content: MessageContent;
}

export interface AIProvider {
  name: "openai" | "anthropic" | "google" | "openrouter";
  model: string;
}

// Tool-related types
// Note: For actual tool definitions, use the AI SDK's `tool` function directly
// This interface is only for our internal type definitions
export interface ToolDefinition<TParams = unknown, TResult = unknown> {
  description?: string;
  parameters: unknown; // Zod schema or JSON schema
  execute?: (params: TParams) => Promise<TResult>;
}

export interface ToolCall {
  toolCallId: string;
  toolName: string;
  args: unknown;
}

export interface ToolResult {
  toolCallId: string;
  toolName: string;
  result: unknown;
}

export interface TextGenerationParams {
  messages: AIMessage[];
  provider?: AIProvider;
  temperature?: number;
  maxTokens?: number;
  maxOutputTokens?: number;
  // Tool-related fields
  tools?: Record<string, unknown>; // AI SDK tools have their own type
  toolChoice?: 'auto' | 'none' | 'required';
  maxSteps?: number;
  // Fallback providers to try if the primary fails
  fallbackProviders?: AIProvider[];
  // GPT-5 reasoning optimization
  reasoningEffort?: 'minimal' | 'low' | 'medium' | 'high';
}

export interface TextGenerationResponse {
  content: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    reasoningTokens?: number;
  };
  model?: string;
  // Tool-related fields
  toolCalls?: ToolCall[];
  toolResults?: ToolResult[];
  steps?: unknown[]; // Full step information from AI SDK
}

export interface AIError {
  message: string;
  code?: string;
  type: "network" | "auth" | "rate_limit" | "api_error" | "unknown";
}
