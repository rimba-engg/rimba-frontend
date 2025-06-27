import { useState, useEffect, useCallback } from 'react';
import { backendLangGraphService, Assistant, HealthCheck, StreamEvent } from '../services/backend-langgraph';
import { Message } from '../types/chat';

export interface BackendLangGraphState {
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  assistants: Assistant[];
  healthStatus: HealthCheck | null;
}

export const useBackendLangGraph = () => {
  const [state, setState] = useState<BackendLangGraphState>({
    isInitialized: false,
    isLoading: false,
    error: null,
    assistants: [],
    healthStatus: null,
  });

  const initialize = useCallback(async () => {
    if (state.isInitialized) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Check health first
      const health = await backendLangGraphService.healthCheck();
      
      if (!health.langgraph_connected) {
        throw new Error('Backend LangGraph service is not connected');
      }

      // Get available assistants
      const assistants = await backendLangGraphService.listAssistants();
      
      setState(prev => ({
        ...prev,
        isInitialized: true,
        healthStatus: health,
        assistants,
        isLoading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to initialize Backend LangGraph',
        isLoading: false,
      }));
    }
  }, [state.isInitialized]);

  const createThread = useCallback(async (metadata?: Record<string, any>) => {
    if (!state.isInitialized) {
      throw new Error('Backend LangGraph not initialized');
    }

    try {
      return await backendLangGraphService.createThread(metadata);
    } catch (error) {
      console.error('Failed to create thread:', error);
      throw error;
    }
  }, [state.isInitialized]);

  const sendMessage = useCallback(async (
    threadId: string | null,
    messages: Message[],
    assistantId?: string
  ) => {
    if (!state.isInitialized) {
      throw new Error('Backend LangGraph not initialized');
    }

    try {
      // Create thread if not provided
      const finalThreadId = threadId || await createThread();

      // Convert messages to backend format
      const backendMessages = backendLangGraphService.convertToBackendMessages(messages);

      // Send chat request
      const response = await backendLangGraphService.chat({
        thread_id: finalThreadId,
        messages: backendMessages,
        assistant_id: assistantId,
      });

      // Convert response back to our format
      const responseMessage = backendLangGraphService.convertFromBackendMessage(response.message);

      return {
        threadId: response.thread_id,
        message: responseMessage,
      };
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }, [state.isInitialized, createThread]);

  const streamChat = useCallback(async function* (
    threadId: string | null,
    messages: Message[],
    assistantId?: string
  ): AsyncGenerator<{ threadId: string; event: StreamEvent }, void, unknown> {
    if (!state.isInitialized) {
      throw new Error('Backend LangGraph not initialized');
    }

    try {
      // Create thread if not provided
      const finalThreadId = threadId || await createThread();

      // Convert messages to backend format
      const backendMessages = backendLangGraphService.convertToBackendMessages(messages);

      // Stream chat responses
      const streamGenerator = backendLangGraphService.streamChat({
        thread_id: finalThreadId,
        messages: backendMessages,
        assistant_id: assistantId,
      });

      for await (const event of streamGenerator) {
        yield {
          threadId: finalThreadId,
          event,
        };
      }
    } catch (error) {
      console.error('Failed to stream chat:', error);
      throw error;
    }
  }, [state.isInitialized, createThread]);

  const getHealth = useCallback(async () => {
    try {
      const health = await backendLangGraphService.healthCheck();
      setState(prev => ({ ...prev, healthStatus: health }));
      return health;
    } catch (error) {
      console.error('Failed to get health status:', error);
      throw error;
    }
  }, []);

  const refreshAssistants = useCallback(async () => {
    try {
      const assistants = await backendLangGraphService.listAssistants();
      setState(prev => ({ ...prev, assistants }));
      return assistants;
    } catch (error) {
      console.error('Failed to refresh assistants:', error);
      throw error;
    }
  }, []);

  // Auto-initialize on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  return {
    ...state,
    initialize,
    createThread,
    sendMessage,
    streamChat,
    getHealth,
    refreshAssistants,
  };
}; 