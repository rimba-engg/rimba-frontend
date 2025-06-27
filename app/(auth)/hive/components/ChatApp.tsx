
import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { BackendChatInterface } from './BackendChatInterface';
import { Thread, Message } from '../types/chat';
import { useBackendLangGraph } from '../hooks/useBackendLangGraph';
import { v4 as uuidv4 } from 'uuid';

const ChatApp = () => {
  const langGraph = useBackendLangGraph();
  const [threads, setThreads] = useState<Thread[]>([
    {
      id: '1',
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);
  const [activeThreadId, setActiveThreadId] = useState<string>('1');

  const activeThread = threads.find(thread => thread.id === activeThreadId);

  // Initialize the first thread with LangGraph thread ID when LangGraph becomes available
  useEffect(() => {
    const initializeFirstThread = async () => {
      if (langGraph.isInitialized && threads.length > 0 && !threads[0].langGraphThreadId) {
        try {
          const langGraphThreadId = await langGraph.createThread();
          setThreads(prev => prev.map(thread => 
            thread.id === '1' 
              ? { ...thread, langGraphThreadId }
              : thread
          ));
        } catch (error) {
          console.error('Failed to initialize first thread with LangGraph:', error);
        }
      }
    };

    initializeFirstThread();
  }, [langGraph.isInitialized, langGraph.createThread]);

  const createNewThread = async () => {
    try {
      // Create LangGraph thread first
      const langGraphThreadId = await langGraph.createThread();
      
      const newThread: Thread = {
        id: uuidv4(),
        title: 'New Chat',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        langGraphThreadId
      };
      setThreads(prev => [newThread, ...prev]);
      setActiveThreadId(newThread.id);
    } catch (error) {
      console.error('Failed to create new thread:', error);
      // Fallback to local thread without LangGraph integration
      const newThread: Thread = {
        id: uuidv4(),
        title: 'New Chat',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setThreads(prev => [newThread, ...prev]);
      setActiveThreadId(newThread.id);
    }
  };

  const deleteThread = (threadId: string) => {
    if (threads.length === 1) return; // Don't delete the last thread
    
    setThreads(prev => prev.filter(thread => thread.id !== threadId));
    
    if (activeThreadId === threadId) {
      const remainingThreads = threads.filter(thread => thread.id !== threadId);
      setActiveThreadId(remainingThreads[0]?.id || '');
    }
  };

  const updateThread = (threadId: string, updates: Partial<Thread>) => {
    setThreads(prev => prev.map(thread => 
      thread.id === threadId 
        ? { ...thread, ...updates, updatedAt: new Date() }
        : thread
    ));
  };

  const addMessage = (threadId: string, message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: uuidv4(),
      timestamp: new Date()
    };

    setThreads(prev => prev.map(thread => {
      if (thread.id === threadId) {
        const updatedMessages = [...thread.messages, newMessage];
        const title = thread.messages.length === 0 && message.role === 'user' 
          ? message.content.slice(0, 30) + (message.content.length > 30 ? '...' : '')
          : thread.title;
        
        return {
          ...thread,
          messages: updatedMessages,
          title,
          updatedAt: new Date()
        };
      }
      return thread;
    }));
  };

  return (
    <div className="flex h-[90vh] bg-gray-100">
      <Sidebar 
        threads={threads}
        activeThreadId={activeThreadId}
        onSelectThread={setActiveThreadId}
        onCreateThread={createNewThread}
        onDeleteThread={deleteThread}
        onUpdateThread={updateThread}
      />
      <main className="flex-1 flex flex-col">
        {/* LangGraph Status Header */}
        {(langGraph.isLoading || langGraph.error || !langGraph.isInitialized) && (
          <div className="p-3 border-b">
            {langGraph.isLoading && (
              <div className="flex items-center gap-2 text-blue-600">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm">Connecting to LangGraph...</span>
              </div>
            )}
            {langGraph.error && (
              <div className="flex items-center gap-2 text-red-600">
                <span className="text-sm">⚠️ LangGraph Error: {langGraph.error}</span>
                <button 
                  onClick={langGraph.initialize}
                  className="text-xs bg-red-100 px-2 py-1 rounded hover:bg-red-200"
                >
                  Retry
                </button>
              </div>
            )}
            {!langGraph.isInitialized && !langGraph.isLoading && !langGraph.error && (
              <div className="flex items-center gap-2 text-gray-600">
                <span className="text-sm">🔌 LangGraph not connected</span>
              </div>
            )}
          </div>
        )}
        
        {activeThread && (
          <BackendChatInterface 
            thread={activeThread}
            onAddMessage={addMessage}
            langGraph={langGraph}
          />
        )}
      </main>
    </div>
  );
};

export default ChatApp;