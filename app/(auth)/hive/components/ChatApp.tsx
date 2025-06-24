
import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { ChatInterface } from './ChatInterface';
import { Thread, Message } from '../types/chat';
import { v4 as uuidv4 } from 'uuid';

const ChatApp = () => {
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

  const createNewThread = () => {
    const newThread: Thread = {
      id: uuidv4(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setThreads(prev => [newThread, ...prev]);
    setActiveThreadId(newThread.id);
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
    <div className="flex h-screen bg-gray-100">
      <Sidebar 
        threads={threads}
        activeThreadId={activeThreadId}
        onSelectThread={setActiveThreadId}
        onCreateThread={createNewThread}
        onDeleteThread={deleteThread}
        onUpdateThread={updateThread}
      />
      <main className="flex-1 flex flex-col">
        {activeThread && (
          <ChatInterface 
            thread={activeThread}
            onAddMessage={addMessage}
          />
        )}
      </main>
    </div>
  );
};

export default ChatApp;