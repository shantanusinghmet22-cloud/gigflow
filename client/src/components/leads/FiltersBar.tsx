import { Search, X } from 'lucide-react';
import { LeadFilters, LeadSource, LeadStatus } from '../../types';

interface FiltersBarProps {
  filters: LeadFilters;
  onChange: (filters: Partial<LeadFilters>) => void;
  onSearchChange: (search: string) => void;
  searchInput: string;
}

export default function FiltersBar({ filters, onChange, onSearchChange, searchInput }: FiltersBarProps) {
  const hasActiveFilters = filters.status || filters.source || filters.search;

  const clearAll = () => {
    onChange({ status: '', source: '', sort: 'latest', page: 1 });
    onSearchChange('');
  };

  return (
    <div className="flex flex-wrap gap-3 items-center">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          className="input pl-9"
          placeholder="Search by name or email..."
          value={searchInput}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Status filter */}
      <select
        className="input w-auto min-w-[130px]"
        value={filters.status ?? ''}
        onChange={(e) => onChange({ status: e.target.value as LeadStatus | '', page: 1 })}
      >
        <option value="">All Status</option>
        {Object.values(LeadStatus).map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      {/* Source filter */}
      <select
        className="input w-auto min-w-[130px]"
        value={filters.source ?? ''}
        onChange={(e) => onChange({ source: e.target.value as LeadSource | '', page: 1 })}
      >
        <option value="">All Sources</option>
        {Object.values(LeadSource).map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      {/* Sort */}
      <select
        className="input w-auto min-w-[120px]"
        value={filters.sort ?? 'latest'}
        onChange={(e) => onChange({ sort: e.target.value as 'latest' | 'oldest', page: 1 })}
      >
        <option value="latest">Latest</option>
        <option value="oldest">Oldest</option>
      </select>

      {/* Clear */}
      {hasActiveFilters && (
        <button onClick={clearAll} className="btn-ghost text-sm gap-1.5">
          <X size={14} />
          Clear
        </button>
      )}
    </div>
  );
}
