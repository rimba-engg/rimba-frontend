import { Message } from "../types/chat";

export interface BackendMessage {
  role: "user" | "assistant";
  content: string;
  id?: string;
  timestamp?: string;
}

export interface ChatRequest {
  thread_id?: string;
  messages: BackendMessage[];
  assistant_id?: string;
}

export interface ChatResponse {
  thread_id: string;
  message: BackendMessage;
  run_id?: string;
}

export interface ThreadResponse {
  thread_id: string;
}

export interface Assistant {
  assistant_id: string;
  name?: string;
  description?: string;
  graph_id: string;
  version?: number;
  created_at?: string;
  updated_at?: string;
}

export interface HealthCheck {
  status: string;
  langgraph_connected: boolean;
  assistant_count?: number;
}

export interface StreamEvent {
  event: string;
  data: any;
}

class BackendLangGraphService {
  private baseUrl: string;

  constructor() {
    // Use the main API URL from environment or default
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  }

  private async fetchWithAuth(url: string, options: RequestInit = {}) {
    // Add any authentication headers if needed
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const response = await fetch(`${this.baseUrl}${url}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API Error: ${response.status} - ${error}`);
    }

    return response;
  }

  async healthCheck(): Promise<HealthCheck> {
    const response = await this.fetchWithAuth('/langgraph/health');
    return response.json();
  }

  async listAssistants(): Promise<Assistant[]> {
    const response = await this.fetchWithAuth('/langgraph/assistants');
    return response.json();
  }

  async createThread(metadata?: Record<string, any>): Promise<string> {
    const response = await this.fetchWithAuth('/langgraph/threads', {
      method: 'POST',
      body: JSON.stringify({ metadata: metadata || {} }),
    });
    const data: ThreadResponse = await response.json();
    return data.thread_id;
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const response = await this.fetchWithAuth('/langgraph/chat', {
      method: 'POST',
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async *streamChat(request: ChatRequest): AsyncGenerator<StreamEvent, void, unknown> {
    const response = await this.fetchWithAuth('/langgraph/chat/stream', {
      method: 'POST',
      body: JSON.stringify(request),
    });

    if (!response.body) {
      throw new Error('No response body for streaming');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        
        // Keep the last incomplete line in buffer
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (trimmedLine.startsWith('data: ')) {
            const jsonStr = trimmedLine.slice(6);
            if (jsonStr === '[DONE]') {
              return;
            }
            try {
              const data = JSON.parse(jsonStr);
              console.log('SSE Event received:', data); // Debug log
              yield data as StreamEvent;
            } catch (e) {
              console.warn('Failed to parse SSE data:', jsonStr, e);
            }
          } else if (trimmedLine === '') {
            // Empty line indicates end of event
            continue;
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  // Helper method to convert our Message format to BackendMessage format
  convertToBackendMessages(messages: Message[]): BackendMessage[] {
    return messages.map(msg => ({
      role: msg.role,
      content: msg.content,
      id: msg.id,
      timestamp: msg.timestamp?.toISOString(),
    }));
  }

  // Helper method to convert BackendMessage to our Message format
  convertFromBackendMessage(message: BackendMessage): Message {
    return {
      id: message.id || Date.now().toString(),
      role: message.role,
      content: message.content,
      timestamp: message.timestamp ? new Date(message.timestamp) : new Date(),
    };
  }
}

// Export singleton instance
export const backendLangGraphService = new BackendLangGraphService(); 