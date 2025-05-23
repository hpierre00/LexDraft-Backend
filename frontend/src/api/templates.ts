import apiClient from './client';

export interface Template {
  id: string;
  state_id: string;
  document_type_id: string;
  template_name: string;
  file_path: string;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTemplateData {
  state: string;
  document_type: string;
  file: File;
}

export const templateService = {
  async getAll() {
    const response = await apiClient.get<{ templates: Template[] }>('/templates');
    return response.data.templates;
  },

  async getById(id: string) {
    const response = await apiClient.get<Template>(`/templates/${id}`);
    return response.data;
  },

  async create(data: CreateTemplateData) {
    const formData = new FormData();
    formData.append('state', data.state);
    formData.append('document_type', data.document_type);
    formData.append('file', data.file);

    const response = await apiClient.post('/templates/create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
}; 