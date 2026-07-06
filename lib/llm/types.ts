// Shared LLM types used across every provider so agents stay provider-agnostic.

export type ChatRole = "system" | "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface CompletionRequest {
  system?: string;
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
}

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
}

export interface CompletionResult {
  text: string;
  provider: ProviderName;
  model: string;
  usage?: TokenUsage;
}

export type ProviderName = "anthropic" | "openai";

export interface LLMProvider {
  readonly name: ProviderName;
  readonly model: string;
  complete(req: CompletionRequest): Promise<CompletionResult>;
}
