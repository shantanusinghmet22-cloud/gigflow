import Modal from '../ui/Modal';
import { Lead } from '../../types';
import { StatusBadge, SourceBadge } from '../ui/Badge';

interface LeadDetailProps {
  lead: Lead | null;
  onClose: () => void;
}

export default function LeadDetail({ lead, onClose }: LeadDetailProps) {
  if (!lead) return null;

  const creator = typeof lead.createdBy === 'object' ? lead.createdBy : null;

  return (
    <Modal isOpen={!!lead} onClose={onClose} title="Lead Details">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{lead.name}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-mono mt-0.5">{lead.email}</p>
          </div>
          <div className="flex gap-2">
            <StatusBadge status={lead.status} />
            <SourceBadge source={lead.source} />
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800" />

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Created</p>
            <p className="text-slate-700 dark:text-slate-300">
              {new Date(lead.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Last Updated</p>
            <p className="text-slate-700 dark:text-slate-300">
              {new Date(lead.updatedAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
          {creator && (
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Created By</p>
              <p className="text-slate-700 dark:text-slate-300">{creator.name}</p>
              <p className="text-xs text-slate-400 font-mono">{creator.email}</p>
            </div>
          )}
        </div>

        {lead.notes && (
          <>
            <div className="border-t border-slate-200 dark:border-slate-800" />
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Notes</p>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {lead.notes}
              </p>
            </div>
          </>
        )}

        <button onClick={onClose} className="btn-ghost w-full">Close</button>
      </div>
    </Modal>
  );
}
