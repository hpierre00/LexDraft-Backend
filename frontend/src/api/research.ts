const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export interface ResearchRequest {
  query: string;
  clarifying_answers?: Record<string, string>;
  save_to_history?: boolean;
  research_id?: string;
}

export interface ResearchResponse {
  result: string;
  success: boolean;
  message?: string;
  research_id?: string;
}

export interface ResearchHistoryItem {
  id: string;
  title: string;
  query: string;
  status: 'preliminary' | 'questions_pending' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface ResearchHistoryDetail {
  id: string;
  user_id: string;
  title: string;
  query: string;
  preliminary_result?: string;
  clarifying_questions?: string[];
  clarifying_answers?: Record<string, string>;
  final_result?: string;
  status: 'preliminary' | 'questions_pending' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface ResearchHistoryList {
  items: ResearchHistoryItem[];
  total: number;
  page: number;
  per_page: number;
  has_next: boolean;
  has_prev: boolean;
}

export const researchApi = {
  async conductResearch(request: ResearchRequest, token: string): Promise<ResearchResponse> {
    console.log('Conducting research with request:', request);
    
    const response = await fetch(`${API_BASE_URL}/api/v1/research/conduct`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(request),
    });

    console.log('Research response status:', response.status);

    if (!response.ok) {
      const error = await response.text();
      console.error('Research failed:', error);
      throw new Error(`Research failed: ${error}`);
    }

    const result = await response.json();
    console.log('Research result:', result);
    return result;
  },

  async getResearchHistory(page: number = 1, perPage: number = 20, token: string): Promise<ResearchHistoryList> {
    console.log(`Fetching research history - page: ${page}, perPage: ${perPage}`);
    
    const response = await fetch(`${API_BASE_URL}/api/v1/research/history?page=${page}&per_page=${perPage}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    console.log('History response status:', response.status);

    if (!response.ok) {
      const error = await response.text();
      console.error('Failed to fetch research history:', error);
      throw new Error(`Failed to fetch research history: ${error}`);
    }

    const result = await response.json();
    console.log('History result:', result);
    return result;
  },

  async getResearchHistoryDetail(researchId: string, token: string): Promise<ResearchHistoryDetail> {
    const response = await fetch(`${API_BASE_URL}/api/v1/research/history/${researchId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to fetch research detail: ${error}`);
    }

    return response.json();
  },

  async deleteResearchHistory(researchId: string, token: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/v1/research/history/${researchId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to delete research: ${error}`);
    }
  },

  async healthCheck(): Promise<{ status: string; service: string }> {
    const response = await fetch(`${API_BASE_URL}/api/v1/research/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Research service health check failed');
    }

    return response.json();
  },
}; 