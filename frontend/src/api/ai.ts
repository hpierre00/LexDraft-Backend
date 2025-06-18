import apiClient from './client';

export interface GenerateDocumentData {
  prompt: string;
  title: string;
  state_id?: string;
  document_type_id?: string;
}

export const aiService = {
  async generateDocument(data: GenerateDocumentData) {
    const response = await apiClient.post('/ai/generate-document', data);
    return response.data;
  }
};