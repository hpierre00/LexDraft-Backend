import apiClient from './client';
import { DocumentType, AreaOfLaw, UUID } from "@/lib/types";

export interface GenerateDocumentData {
  title: string;
  document_type: DocumentType;
  area_of_law: AreaOfLaw;
  client_profile_id?: UUID;
  notes: string;
  jurisdiction?: string;
  county?: string;
  date_of_application?: string;
  case_number?: string;
}

export const aiService = {
  async generateDocument(data: GenerateDocumentData) {
    const response = await apiClient.post('/documents/create', data);
    return response.data;
  }
};