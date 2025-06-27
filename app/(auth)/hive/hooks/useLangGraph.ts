import { useState, useEffect, useCallback } from 'react';
import { langGraphService } from '../services/langgraph';
import { Message } from '../types/chat';

export interface LangGraphState {
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  assistantId: string | null;
}

export const useLangGraph = () => {
  const [state, setState] = useState<LangGraphState>({
    isInitialized: false,
    isLoading: false,
    error: null,
    assistantId: null,
  });

  const initialize = useCallback(async () => {
    if (state.isInitialized) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const assistantId = await langGraphService.initialize();
      setState(prev => ({
        ...prev,
        isInitialized: true,
        assistantId,
        isLoading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to initialize LangGraph',
        isLoading: false,
      }));
    }
  }, [state.isInitialized]);

  const createThread = useCallback(async () => {
    if (!state.isInitialized) {
      throw new Error('LangGraph not initialized');
    }

    try {
      return await langGraphService.createThread();
    } catch (error) {
      console.error('Failed to create thread:', error);
      throw error;
    }
  }, [state.isInitialized]);

  const streamChat = useCallback(async function* (
    threadId: string, 
    messages: Message[]
  ) {
    if (!state.isInitialized) {
      throw new Error('LangGraph not initialized');
    }

    try {
      yield* langGraphService.streamChat(threadId, messages);
    } catch (error) {
      console.error('Failed to stream chat:', error);
      throw error;
    }
  }, [state.isInitialized]);

  const listAssistants = useCallback(async () => {
    try {
      return await langGraphService.listAssistants();
    } catch (error) {
      console.error('Failed to list assistants:', error);
      throw error;
    }
  }, []);

  const getThreadState = useCallback(async (threadId: string) => {
    try {
      return await langGraphService.getThreadState(threadId);
    } catch (error) {
      console.error('Failed to get thread state:', error);
      throw error;
    }
  }, []);

  const invokeAssistant = useCallback(async (threadId: string, messages: Message[]) => {
    try {
      return await langGraphService.invokeAssistant(threadId, messages);
    } catch (error) {
      console.error('Failed to invoke assistant:', error);
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
    streamChat,
    listAssistants,
    getThreadState,
    invokeAssistant,
  };
}; 