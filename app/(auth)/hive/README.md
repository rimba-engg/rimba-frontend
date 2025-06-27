# Hive Chat Interface with LangGraph Integration

This chat interface is powered by LangGraph, providing real-time AI assistant capabilities through streaming responses.

## Setup

### Prerequisites

1. **LangGraph Server**: You need a running LangGraph server with registered assistants/graphs
2. **Server URL**: By default, the client connects to `http://localhost:8123`

### Configuration

You can configure the LangGraph server URL in several ways:

1. **Environment Variable** (Recommended):
   ```bash
   NEXT_PUBLIC_LANGGRAPH_API_URL=http://your-langgraph-server:8123
   ```

2. **Default Configuration**: 
   - The system defaults to `http://localhost:8123` for local development
   - Configuration is managed in `config/langgraph-config.ts`

### LangGraph Server Setup

1. Start your LangGraph server:
   ```bash
   langgraph up
   ```

2. Ensure your graphs are registered and assistants are available

3. The chat interface will automatically:
   - Connect to the server on initialization
   - List available assistants  
   - Use the first available assistant for conversations

## Features

### Real-time Streaming
- **Thinking State**: Shows when AI is processing
- **Streaming Responses**: Real-time token-by-token response streaming
- **Connection Status**: Visual indicators for connection state

### Thread Management
- **LangGraph Threads**: Each chat thread maps to a LangGraph thread
- **Persistent Conversations**: Maintain context across messages
- **Multiple Conversations**: Support for multiple concurrent threads

### Error Handling
- **Graceful Fallbacks**: Falls back to offline mode if LangGraph is unavailable
- **Connection Retry**: Automatic retry mechanisms for connection issues
- **Error Display**: Clear error messages with retry options

## Usage

1. **Starting a Conversation**:
   - Type your message in the input field
   - The system will automatically create a LangGraph thread if needed

2. **Connection Status**:
   - 🔌 **Not Connected**: LangGraph server not available
   - 🔄 **Connecting**: Attempting to connect to LangGraph
   - ⚠️ **Error**: Connection or processing error with retry option
   - ✅ **Connected**: Successfully connected (no status bar shown)

3. **Response Processing**:
   - "Connecting to AI..." - Establishing connection
   - "AI is thinking..." - Processing your request
   - Streaming response - Real-time response generation

## Architecture

### Components
- **`ChatApp`**: Main container managing threads and LangGraph state
- **`ChatInterface`**: Individual chat thread interface with streaming
- **`useLangGraph`**: React hook for LangGraph state management
- **`LangGraphService`**: Core service for API interactions

### Data Flow
```
User Input → ChatInterface → LangGraph Service → LangGraph Server
                ↓
Stream Response ← Process Chunks ← Stream Events ← LangGraph Server
```

## Development

### Local Development
1. Start your LangGraph server locally
2. The interface will auto-connect to `localhost:8123`
3. Add your graphs and test the integration

### Production Deployment
1. Set `NEXT_PUBLIC_LANGGRAPH_API_URL` to your production server
2. Ensure proper CORS configuration on your LangGraph server
3. Test connection and streaming functionality

## Troubleshooting

### Common Issues

1. **"No assistants found"**:
   - Ensure your LangGraph server is running
   - Verify graphs are registered in your server config
   - Check server logs for registration issues

2. **Connection timeouts**:
   - Verify the server URL is correct
   - Check network connectivity
   - Ensure CORS is properly configured

3. **Streaming issues**:
   - Check LangGraph server supports streaming endpoints
   - Verify your graph implements proper streaming logic
   - Monitor browser network tab for streaming responses

### Debug Mode
Enable debug logging by checking browser console for:
- LangGraph initialization messages
- Streaming events and chunks
- Error details and stack traces 