import apiClient from './client';

export interface GenerateDocumentData {
  prompt: string;
  title: string;
}

export const aiService = {
  async generateDocument(data: GenerateDocumentData) {
    const formData = new FormData();
    formData.append('prompt', data.prompt);
    formData.append('title', data.title);

    const response = await apiClient.post('/ai/generate-document', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
}; 