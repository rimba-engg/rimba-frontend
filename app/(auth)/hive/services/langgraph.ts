import { Client } from "@langchain/langgraph-sdk";
import { Message } from "../types/chat";
import { LANGGRAPH_CONFIG } from "../config/langgraph-config";

export interface LangGraphMessage {
  role: "human" | "assistant";
  content: string;
}

export interface StreamEvent {
  event: string;
  data: any;
}

class LangGraphService {
  private client: Client;
  private assistantId: string | null = null;

  constructor(apiUrl?: string) {
    // Initialize client - use config or provided URL
    this.client = new Client({ apiUrl: apiUrl || LANGGRAPH_CONFIG.API_URL });
  }

  async initialize() {
    try {
      // List all assistants and get the first one
      const assistants = await this.client.assistants.search({
        metadata: null,
        offset: 0,
        limit: 10,
      });

      if (assistants.length === 0) {
        throw new Error("No assistants found. Make sure your LangGraph server is running and has registered graphs.");
      }

      this.assistantId = assistants[0].assistant_id;
      console.log("LangGraph initialized with assistant:", this.assistantId);
      return this.assistantId;
    } catch (error) {
      console.error("Failed to initialize LangGraph:", error);
      throw error;
    }
  }

  async createThread() {
    try {
      const thread = await this.client.threads.create();
      return thread.thread_id;
    } catch (error) {
      console.error("Failed to create thread:", error);
      throw error;
    }
  }

  async *streamChat(threadId: string, messages: Message[]) {
    if (!this.assistantId) {
      throw new Error("LangGraph not initialized. Call initialize() first.");
    }

    try {
      // Convert our message format to LangGraph format
      const langGraphMessages: LangGraphMessage[] = messages.map(msg => ({
        role: msg.role === "user" ? "human" : "assistant",
        content: msg.content
      }));

      const streamResponse = this.client.runs.stream(
        threadId,
        this.assistantId,
        {
          input: { messages: langGraphMessages },
        }
      );

      for await (const chunk of streamResponse) {
        yield chunk;
      }
    } catch (error) {
      console.error("Failed to stream chat:", error);
      throw error;
    }
  }

  async getRunStatus(threadId: string, runId: string) {
    try {
      return await this.client.runs.get(threadId, runId);
    } catch (error) {
      console.error("Failed to get run status:", error);
      throw error;
    }
  }

  async getThreadState(threadId: string) {
    try {
      return await this.client.threads.getState(threadId);
    } catch (error) {
      console.error("Failed to get thread state:", error);
      throw error;
    }
  }

  async invokeAssistant(threadId: string, messages: Message[]) {
    if (!this.assistantId) {
      throw new Error("LangGraph not initialized. Call initialize() first.");
    }

    try {
      // Convert our message format to LangGraph format
      const langGraphMessages: LangGraphMessage[] = messages.map(msg => ({
        role: msg.role === "user" ? "human" : "assistant",
        content: msg.content
      }));

      const response = await this.client.runs.create(
        threadId,
        this.assistantId,
        {
          input: { messages: langGraphMessages },
        }
      );

      return response;
    } catch (error) {
      console.error("Failed to invoke assistant:", error);
      throw error;
    }
  }

  async listAssistants() {
    try {
      return await this.client.assistants.search({
        metadata: null,
        offset: 0,
        limit: 100,
      });
    } catch (error) {
      console.error("Failed to list assistants:", error);
      throw error;
    }
  }
}

// Export singleton instance
export const langGraphService = new LangGraphService(); 