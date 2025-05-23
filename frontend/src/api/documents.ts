import apiClient from './client';

export interface Document {
  id: string;
  user_id: string;
  title: string;
  content: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface CreateDocumentData {
  title: string;
  content: string;
}

export const documentService = {
  async getAll() {
    const response = await apiClient.get<Document[]>('/documents');
    return response.data;
  },

  async getById(id: string) {
    const response = await apiClient.get<Document>(`/documents/${id}`);
    return response.data;
  },

  async create(data: CreateDocumentData) {
    const response = await apiClient.post<Document>('/documents/create', data);
    return response.data;
  },

  async update(id: string, data: CreateDocumentData) {
    const response = await apiClient.put<Document>(`/documents/${id}`, data);
    return response.data;
  },

  async archive(id: string) {
    const response = await apiClient.delete(`/documents/${id}`);
    return response.data;
  }
}; 