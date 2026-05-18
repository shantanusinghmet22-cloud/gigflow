import { useState } from 'react';
import { Plus, Download, RefreshCw } from 'lucide-react';
import { useLeads } from '../hooks/useLeads';
import { useDebounce } from '../hooks/useDebounce';
import { leadsApi } from '../api/leads';
import { Lead, LeadFilters } from '../types';
import LeadsTable from '../components/leads/LeadsTable';
import LeadForm from '../components/leads/LeadForm';
import LeadDetail from '../components/leads/LeadDetail';
import FiltersBar from '../components/leads/FiltersBar';
import Pagination from '../components/ui/Pagination';

export default function DashboardPage() {
  const [filters, setFilters] = useState<LeadFilters>({ sort: 'latest', page: 1 });
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 400);

  const [formOpen, setFormOpen] = useState(false);
  const [editLead, setEditLead] = useState<Lead | null>(null);
  const [viewLead, setViewLead] = useState<Lead | null>(null);

  const activeFilters: LeadFilters = { ...filters, search: debouncedSearch || undefined };
  const { data, isLoading, isError, refetch } = useLeads(activeFilters);

  const handleFilterChange = (partial: Partial<LeadFilters>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
  };

  const handleEdit = (lead: Lead) => {
    setEditLead(lead);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditLead(null);
  };

  const stats = data
    ? [
        { label: 'Total Leads', value: data.meta.total },
        { label: 'This Page', value: data.data.length },
      ]
    : [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Leads</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage and track your sales pipeline
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => leadsApi.exportCSV({ status: filters.status, source: filters.source, search: debouncedSearch })}
            className="btn-ghost border border-slate-200 dark:border-slate-700"
            title="Export to CSV"
          >
            <Download size={16} />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          <button onClick={() => setFormOpen(true)} className="btn-primary">
            <Plus size={16} />
            Add Lead
          </button>
        </div>
      </div>

      {/* Stats strip */}
      {data && (
        <div className="flex gap-4">
          {stats.map(({ label, value }) => (
            <div key={label} className="card px-4 py-3 flex-1 max-w-[140px]">
              <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Main card */}
      <div className="card shadow-sm">
        {/* Filters */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <FiltersBar
            filters={filters}
            onChange={handleFilterChange}
            onSearchChange={(s) => { setSearchInput(s); handleFilterChange({ page: 1 }); }}
            searchInput={searchInput}
          />
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-slate-400">
            <RefreshCw size={18} className="animate-spin" />
            <span className="text-sm">Loading leads...</span>
          </div>
        ) : isError ? (
          <div className="text-center py-16">
            <p className="text-sm text-red-500 mb-3">Failed to load leads</p>
            <button onClick={() => refetch()} className="btn-ghost text-sm">
              <RefreshCw size={14} />
              Try again
            </button>
          </div>
        ) : (
          <>
            <LeadsTable
              leads={data?.data ?? []}
              onEdit={handleEdit}
              onView={setViewLead}
            />
            {data?.meta && (
              <Pagination
                meta={data.meta}
                onPageChange={(page) => handleFilterChange({ page })}
              />
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <LeadForm isOpen={formOpen} onClose={closeForm} editLead={editLead} />
      <LeadDetail lead={viewLead} onClose={() => setViewLead(null)} />
    </div>
  );
}
