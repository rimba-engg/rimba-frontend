import { Message } from "../types/chat";
import { api, BASE_URL } from "../../../../lib/api";

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

  async healthCheck(): Promise<HealthCheck> {
    return api.get<HealthCheck>('/langgraph/health');
  }

  async listAssistants(): Promise<Assistant[]> {
    return api.get<Assistant[]>('/langgraph/assistants');
  }

  async createThread(metadata?: Record<string, any>): Promise<string> {
    const data = await api.post<ThreadResponse>('/langgraph/threads', {
      metadata: metadata || {}
    });
    return data.thread_id;
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    return api.post<ChatResponse>('/langgraph/chat', request);
  }

  async *streamChat(request: ChatRequest): AsyncGenerator<StreamEvent, void, unknown> {
    // For streaming, we need to use fetch directly but with proper auth headers
    // Get the access token and other headers from the api client
    const accessToken = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    const idToken = typeof window !== 'undefined' ? localStorage.getItem('id_token') : null;
    const customerId = typeof window !== 'undefined' ? localStorage.getItem('customer_id') : null;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }
    if (idToken) {
      headers['X-Id-Token'] = idToken;
    }
    if (customerId) {
      headers['X-Customer-Id'] = customerId;
    }

    const response = await fetch(`${BASE_URL}/langgraph/chat/stream`, {
      method: 'POST',
      headers,
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API Error: ${response.status} - ${error}`);
    }

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