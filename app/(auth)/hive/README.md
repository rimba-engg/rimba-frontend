# Hive Chat Interface with Backend LangGraph Integration

This chat interface is powered by LangGraph through our backend API, providing real-time AI assistant capabilities through streaming responses.

## Architecture Overview

The Hive chat interface now uses a **backend-based architecture** instead of directly connecting to LangGraph:

```
Frontend (React) → Backend API (FastAPI) → LangGraph Server
```

### Benefits of Backend Integration:
- **Security**: API keys are stored securely on the backend
- **Consistency**: Centralized LangGraph configuration and management
- **Performance**: Backend can handle connection pooling and caching
- **Monitoring**: All LangGraph interactions can be logged and monitored
- **Scalability**: Backend can manage multiple concurrent sessions

## Setup

### Backend Prerequisites

The backend FastAPI server must be running with the LangGraph module configured:

1. **Environment Variables** (Backend):
   ```bash
   # LangGraph Server URL
   LANGGRAPH_API_URL=https://hive-dev-26088926e7665bc694c2d4e2d51aee95.us.langgraph.app
   
   # LangSmith API Key (required for LangGraph Platform)
   LANGSMITH_API_KEY=your-langsmith-api-key
   ```

2. **Dependencies** (Backend):
   ```bash
   pip install langgraph-sdk sse-starlette
   ```

### Frontend Configuration

1. **Environment Variables** (Frontend):
   ```bash
   # Backend API URL
   NEXT_PUBLIC_API_URL=http://localhost:8000  # or your production backend URL
   ```

2. **No API Keys Required**: The frontend no longer needs direct access to LangSmith/LangGraph credentials

## Backend API Endpoints

The backend provides the following LangGraph endpoints:

- `GET /langgraph/health` - Check service health and connection status
- `GET /langgraph/assistants` - List available assistants  
- `POST /langgraph/threads` - Create a new thread
- `GET /langgraph/threads/{thread_id}/state` - Get thread state
- `POST /langgraph/chat` - Send a chat message (non-streaming)
- `POST /langgraph/chat/stream` - Stream chat responses (Server-Sent Events)

## Features

### Real-time Streaming
- **Thinking State**: Shows when AI is processing
- **Streaming Responses**: Real-time token-by-token response streaming via SSE
- **Connection Status**: Visual indicators for backend connection state

### Thread Management
- **Backend Thread Creation**: Threads are created through the backend API
- **Persistent Conversations**: Context maintained across messages
- **Multiple Conversations**: Support for multiple concurrent threads

### Error Handling
- **Graceful Fallbacks**: Falls back to offline mode if backend is unavailable
- **Connection Retry**: Automatic retry mechanisms for connection issues
- **Error Display**: Clear error messages with retry options

## Usage

1. **Starting a Conversation**:
   - Type your message in the input field
   - The system will automatically create a backend thread if needed

2. **Connection Status**:
   - 🔌 **Backend Not Connected**: Backend API not available
   - 🔄 **Connecting**: Attempting to connect to backend
   - ⚠️ **Error**: Backend or LangGraph connection error with retry option
   - ✅ **Connected**: Successfully connected (no status bar shown)

3. **Response Processing**:
   - "Connecting to AI..." - Establishing backend connection
   - "AI is thinking..." - Processing your request
   - Streaming response - Real-time response generation

## Development

### Local Development
1. Start the backend FastAPI server with LangGraph module:
   ```bash
   cd rimba-api
   uvicorn app.main:app --reload
   ```

2. Ensure backend environment variables are set:
   ```bash
   export LANGGRAPH_API_URL=https://your-langgraph-server
   export LANGSMITH_API_KEY=your-api-key
   ```

3. Start the frontend:
   ```bash
   npm run dev
   ```

### Production Deployment
1. Set backend environment variables in production
2. Set `NEXT_PUBLIC_API_URL` to your production backend URL
3. Ensure backend and frontend can communicate

## Troubleshooting

### Common Issues

1. **"Backend LangGraph service is not connected"**:
   - Check if the backend API is running
   - Verify `NEXT_PUBLIC_API_URL` is set correctly
   - Check backend logs for LangGraph connection issues

2. **"Backend service not available"**:
   - Ensure the FastAPI backend is running
   - Check network connectivity between frontend and backend
   - Verify the backend `/langgraph/health` endpoint is accessible

3. **Backend LangGraph connection errors**:
   - Verify `LANGSMITH_API_KEY` is set in backend environment
   - Check `LANGGRAPH_API_URL` points to your running LangGraph server
   - Ensure the LangGraph server has registered graphs/assistants

4. **Streaming issues**:
   - Check browser console for SSE connection errors
   - Verify backend supports Server-Sent Events
   - Monitor backend logs for streaming errors

### Debug Mode
Enable debug logging by checking browser console for:
- Backend API request/response logs
- Streaming events and chunks
- Error details and stack traces

### Health Check
Visit `/langgraph/health` on your backend to check:
- LangGraph connection status
- Number of available assistants
- Service health information

## Migration from Direct Connection

If migrating from the previous direct LangGraph connection:

1. **Remove frontend environment variables**:
   - Remove `NEXT_PUBLIC_LANGGRAPH_API_URL`
   - Remove `NEXT_PUBLIC_LANGSMITH_API_KEY`

2. **Add backend environment variables**:
   - Set `LANGGRAPH_API_URL` in backend
   - Set `LANGSMITH_API_KEY` in backend

3. **Update frontend configuration**:
   - Set `NEXT_PUBLIC_API_URL` to your backend URL

4. **Components automatically updated**:
   - `useBackendLangGraph` hook replaces `useLangGraph`
   - `BackendChatInterface` replaces `ChatInterface` 