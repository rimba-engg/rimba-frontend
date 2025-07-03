import { validate } from "uuid";
import { getApiKey } from "@/app/(auth)/vertex/lib/api-key";
import { Thread } from "@langchain/langgraph-sdk";
import { useQueryState } from "nuqs";
import {
  createContext,
  useContext,
  ReactNode,
  useCallback,
  useState,
  Dispatch,
  SetStateAction,
} from "react";
import { createClient } from "./client";
import { vertexAgentConfig } from "../config";
import { getStoredUser, getStoredCustomer } from '@/lib/auth';
import { type User, type Customer  } from '@/lib/types';


interface ThreadContextType { 
  getThreads: () => Promise<Thread[]>;
  threads: Thread[];
  setThreads: Dispatch<SetStateAction<Thread[]>>;
  threadsLoading: boolean;
  setThreadsLoading: Dispatch<SetStateAction<boolean>>;
}

const ThreadContext = createContext<ThreadContextType | undefined>(undefined);

function getThreadSearchMetadata(
  assistantId: string,
  user_id: string,
  customer_id: string,
): { rimba_user_id: string, rimba_customer_id: string } {
  if (validate(assistantId)) {
    return { rimba_user_id: user_id, rimba_customer_id: customer_id };
  } else {
    return { rimba_user_id: user_id, rimba_customer_id: customer_id };
  }
}

export function ThreadProvider({ children }: { children: ReactNode }) {
  const { apiUrl, assistantId, apiKey } = vertexAgentConfig;
  const [threads, setThreads] = useState<Thread[]>([]);
  const [threadsLoading, setThreadsLoading] = useState(false);

  const getThreads = useCallback(async (): Promise<Thread[]> => {
    if (!apiUrl || !assistantId) return [];
    const client = createClient(apiUrl, getApiKey() ?? undefined);
    const user: User | null = getStoredUser();
    const customer: Customer | null = getStoredCustomer();
    console.log('user', user);
    console.log('customer', customer);

    if (!user || !customer) return [];

    const threads = await client.threads.search({
      metadata: {
        ...getThreadSearchMetadata(assistantId, user.id, customer.id),
      },
      limit: 100,
    });

    return threads;
  }, [apiUrl, assistantId]);

  const value = {
    getThreads,
    threads,
    setThreads,
    threadsLoading,
    setThreadsLoading,
  };

  return (
    <ThreadContext.Provider value={value}>{children}</ThreadContext.Provider>
  );
}

export function useThreads() {
  const context = useContext(ThreadContext);
  if (context === undefined) {
    throw new Error("useThreads must be used within a ThreadProvider");
  }
  return context;
}
