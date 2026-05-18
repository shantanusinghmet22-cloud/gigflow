import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { leadsApi } from '../api/leads';
import { CreateLeadPayload, LeadFilters, UpdateLeadPayload } from '../types';

export const LEADS_KEY = 'leads';

export function useLeads(filters: LeadFilters) {
  return useQuery({
    queryKey: [LEADS_KEY, filters],
    queryFn: () => leadsApi.getLeads(filters),
    placeholderData: (prev) => prev, // keep previous data while fetching
  });
}

export function useCreateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateLeadPayload) => leadsApi.createLead(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [LEADS_KEY] });
      toast.success('Lead created successfully!');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error ?? 'Failed to create lead');
    },
  });
}

export function useUpdateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateLeadPayload }) =>
      leadsApi.updateLead(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [LEADS_KEY] });
      toast.success('Lead updated!');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error ?? 'Failed to update lead');
    },
  });
}

export function useDeleteLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => leadsApi.deleteLead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [LEADS_KEY] });
      toast.success('Lead deleted.');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error ?? 'Failed to delete lead');
    },
  });
}
