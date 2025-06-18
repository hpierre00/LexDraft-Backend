import apiClient from './client';

export interface Document {
  id: string;
  user_id: string;
  title: string;
  content: string;
  status: string;
  created_at: string;
  updated_at: string;
  evaluation_response?: string;
}

export interface CreateDocumentData {
  title: string;
  content: string;
}

export interface UpdateDocumentData {
  title?: string;
  content?: string;
  status?: string;
}

export const documentService = {
  async getAll() {
    // Backend route is /api/v1/documents/list
    const response = await apiClient.get<Document[]>('/documents/list');
    return response.data;
  },

  async getById(id: string) {
    // Backend route is /api/v1/documents/{id}
    const response = await apiClient.get<Document>(`/documents/${id}`);
    return response.data;
  },

  async create(data: CreateDocumentData) {
    // Backend route is /api/v1/documents/create
    const response = await apiClient.post<Document>(`/documents/create?title=${encodeURIComponent(data.title)}&content=${encodeURIComponent(data.content)}`);
    return response.data;
  },

  async update(id: string, data: UpdateDocumentData) {
    // Backend route is /api/v1/documents/{id}
    const response = await apiClient.put<Document>(`/documents/${id}`, data);
    return response.data;
  },

  async archive(id: string) {
    // Backend route is /api/v1/documents/{id}
    const response = await apiClient.delete(`/documents/${id}`);
    return response.data;
  },

  async download(id: string) {
    const response = await apiClient.get(`/documents/${id}/download`, {
      responseType: 'blob', // Important for file downloads
    });

    const contentDisposition = response.headers['content-disposition'];
    let filename = 'document.pdf';
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="(.+)"/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1];
      }
    }

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  async upload(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<Document>('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};