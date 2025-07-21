import apiClient from './client';

/**
 * Interface for the data required to send a chat message.
 */
export interface ChatRequest {
  sessionId: string;
  message: string;
  contractText?: string;
}

/**
 * Interface for the structured response from the chat endpoint.
 * The 'response' field can be a string or a more complex object if a tool was used.
 */
export interface ChatResponse {
  response: any;
}

/**
 * Interface for the response when uploading a document for context.
 */
export interface UploadContextResponse {
  contract_text: string;
  message: string;
}
export interface ChatSession {
  session_id: string;
  user_id: string;
  title: string;
  updated_at: string;
  // This field would be ideal for the backend to provide for a preview
  last_message_preview?: string; 
}

export interface ChatHistory {
  session_id: string;
  title: string;
  history: Array<{
    type: string;
    content: string;
  }>;
}

export const agentService = {
  /**
   * Sends a message to the chat agent for a specific session.
   * @param data - The chat request data including sessionId, message, and optional context.
   * @returns The agent's response.
   */
  async chat(data: ChatRequest): Promise<ChatResponse> {
    // The backend expects 'multipart/form-data' because it uses FastAPI's Form().
    // We must construct a FormData object to send the request.
    const formData = new FormData();
    formData.append('session_id', data.sessionId);
    formData.append('message', data.message);

    if (data.contractText) {
      formData.append('contract_text', data.contractText);
    }

    const response = await apiClient.post<ChatResponse>('/agents/chat-lawyer/chat', formData, {
      headers: {
        // Axios will automatically set the 'Content-Type' to 'multipart/form-data'
        // when you pass a FormData object, but you could specify it explicitly if needed.
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Uploads a document to extract its text content for use as chat context.
   * This does not save the document in the database.
   * @param file - The file (PDF, DOCX, TXT) to upload.
   * @returns An object containing the extracted text and a status message.
   */
  async uploadForContext(file: File): Promise<UploadContextResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<UploadContextResponse>('/agents/chat-lawyer/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async listSessions(): Promise<ChatSession[]> {
    // This is the anticipated endpoint. You will need to build it in your FastAPI backend.
    const response = await apiClient.get<ChatSession[]>('/agents/chat-lawyer/sessions');
    return response.data;
  },

  /**
   * Gets the chat history for a specific session.
   * @param sessionId - The ID of the session to get history for.
   * @returns The chat history data.
   */
  async getChatHistory(sessionId: string): Promise<ChatHistory> {
    const response = await apiClient.get<ChatHistory>(`/agents/chat-lawyer/sessions/${sessionId}/history`);
    return response.data;
  },
};