import apiClient from './client';

export interface Template {
  id: string;
  template_name: string;
  file_path: string;
  content: string;
  created_at: string;
  updated_at: string;
  states: { state_id: string; state_name: string };
  document_types: { document_type_id: string; document_type_name: string };
}

export interface CreateTemplateData {
  state: string;
  document_type: string;
  file: File;
}

export interface UpdateTemplateData {
  // Add any necessary properties for updating a template
}

export const templateService = {
  async getAll() {
    // Backend route is /api/v1/templates/list
    const response = await apiClient.get<{ templates: Template[] }>('/templates/list');
    return response.data.templates;
  },

  async getById(templateId: string): Promise<Template> {
    const response = await apiClient.get(`/templates/${templateId}`);
    return response.data;
  },

  async create(data: CreateTemplateData) {
    // Backend route is /api/v1/templates/create
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
  },

  async delete(templateId: string): Promise<void> {
    await apiClient.delete(`/templates/${templateId}`);
  },

  async listWithFilters(state_id?: string, document_type_id?: string, search?: string) {
    const params = new URLSearchParams();
    if (state_id) params.append('state_id', state_id);
    if (document_type_id) params.append('document_type_id', document_type_id);
    if (search) params.append('search', search);

    const response = await apiClient.get<{ templates: Template[] }>(`/templates/list?${params.toString()}`);
    return response.data.templates;
  },

  async searchTemplates(query: string) {
    const response = await apiClient.get<{ templates: Template[] }>(`/templates/search?query=${query}`);
    return response.data.templates;
  },

  async downloadTemplate(id: string): Promise<{ blob: Blob; filename: string }> {
    // Backend route is /api/v1/templates/{template_id}/download
    const response = await apiClient.get<Blob>(`/templates/${id}/download`, {
      responseType: 'blob', // Important for file downloads
    });

    const contentDisposition = response.headers['content-disposition'];
    let filename = `template-${id}.pdf`; // Default filename
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="(.+)"/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1];
      }
    }
    return { blob: response.data, filename };
  },

  async uploadMultiple(formData: FormData) {
    const response = await apiClient.post('/templates/upload-multi', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async getByState(stateId: string) {
    const response = await apiClient.get<{ templates: Template[] }>(`/templates/state/${stateId}`);
    return response.data.templates;
  },

  async getByDocumentType(documentTypeId: string) {
    const response = await apiClient.get<{ templates: Template[] }>(`/templates/type/${documentTypeId}`);
    return response.data.templates;
  },
};