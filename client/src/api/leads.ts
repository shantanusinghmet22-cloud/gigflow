import api from './axios';
import {
  ApiResponse,
  CreateLeadPayload,
  Lead,
  LeadFilters,
  PaginatedLeadsResponse,
  UpdateLeadPayload,
} from '../types';

export const leadsApi = {
  getLeads: async (filters: LeadFilters) => {
    const params = new URLSearchParams();
    if (filters.status) params.set('status', filters.status);
    if (filters.source) params.set('source', filters.source);
    if (filters.search) params.set('search', filters.search);
    if (filters.sort) params.set('sort', filters.sort);
    if (filters.page) params.set('page', String(filters.page));
    params.set('limit', '10');

    const { data } = await api.get<PaginatedLeadsResponse>(`/leads?${params.toString()}`);
    return data;
  },

  getLeadById: async (id: string) => {
    const { data } = await api.get<ApiResponse<Lead>>(`/leads/${id}`);
    return data;
  },

  createLead: async (payload: CreateLeadPayload) => {
    const { data } = await api.post<ApiResponse<Lead>>('/leads', payload);
    return data;
  },

  updateLead: async (id: string, payload: UpdateLeadPayload) => {
    const { data } = await api.patch<ApiResponse<Lead>>(`/leads/${id}`, payload);
    return data;
  },

  deleteLead: async (id: string) => {
    const { data } = await api.delete<ApiResponse>(`/leads/${id}`);
    return data;
  },

  exportCSV: (filters: Omit<LeadFilters, 'page' | 'sort'>) => {
    const params = new URLSearchParams();
    if (filters.status) params.set('status', filters.status);
    if (filters.source) params.set('source', filters.source);
    if (filters.search) params.set('search', filters.search);

    const token = localStorage.getItem('gigflow_token');
    // Open in new tab — the server sets Content-Disposition: attachment
    const url = `${import.meta.env.VITE_API_URL || '/api'}/leads/export/csv?${params.toString()}`;
    
    // Use fetch to respect the auth header
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.blob())
      .then((blob) => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `gigflow-leads-${Date.now()}.csv`;
        link.click();
        URL.revokeObjectURL(link.href);
      });
  },
};
