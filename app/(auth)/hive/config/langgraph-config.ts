// LangGraph Configuration
export const LANGGRAPH_CONFIG = {
  // Default to localhost for development, can be overridden via environment variables
  API_URL: process.env.NEXT_PUBLIC_LANGGRAPH_API_URL || 'https://hive-dev-26088926e7665bc694c2d4e2d51aee95.us.langgraph.app',
  
  // Authentication configuration - LangGraph Platform uses LangSmith API keys
  LANGSMITH_API_KEY: process.env.NEXT_PUBLIC_LANGSMITH_API_KEY,
  
  // Other configuration options
  DEFAULT_TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  
  // Event types we handle in streaming
  STREAM_EVENTS: {
    CHAIN_START: 'on_chain_start',
    CHAIN_STREAM: 'on_chain_stream', 
    CHAIN_END: 'on_chain_end',
    TOOL_START: 'on_tool_start',
    TOOL_END: 'on_tool_end',
  }
} as const;

export type LangGraphConfig = typeof LANGGRAPH_CONFIG; 