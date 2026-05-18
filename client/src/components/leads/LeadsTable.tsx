import { useState } from 'react';
import { Edit2, Trash2, Eye } from 'lucide-react';
import { Lead, UserRole } from '../../types';
import { StatusBadge, SourceBadge } from '../ui/Badge';
import { useAuthStore } from '../../store/authStore';
import { useDeleteLead } from '../../hooks/useLeads';
import Modal from '../ui/Modal';

interface LeadsTableProps {
  leads: Lead[];
  onEdit: (lead: Lead) => void;
  onView: (lead: Lead) => void;
}

function ConfirmDelete({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  const deleteLead = useDeleteLead();
  return (
    <Modal isOpen onClose={onClose} title="Delete Lead" size="sm">
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
        Are you sure you want to delete <span className="font-medium text-slate-900 dark:text-white">{lead.name}</span>?
        This action cannot be undone.
      </p>
      <div className="flex gap-3">
        <button onClick={onClose} className="btn-ghost flex-1">Cancel</button>
        <button
          onClick={async () => { await deleteLead.mutateAsync(lead._id); onClose(); }}
          disabled={deleteLead.isPending}
          className="btn-danger flex-1"
        >
          {deleteLead.isPending ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </Modal>
  );
}

export default function LeadsTable({ leads, onEdit, onView }: LeadsTableProps) {
  const { user } = useAuthStore();
  const isAdmin = user?.role === UserRole.ADMIN;
  const [deleteTarget, setDeleteTarget] = useState<Lead | null>(null);

  const canModify = (lead: Lead) => {
    if (isAdmin) return true;
    const creatorId = typeof lead.createdBy === 'object' ? lead.createdBy._id : lead.createdBy;
    return creatorId === user?.id;
  };

  if (leads.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <div className="text-4xl mb-3">🔍</div>
        <h3 className="text-base font-medium text-slate-700 dark:text-slate-300 mb-1">No leads found</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">Try adjusting your filters or add a new lead</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800">
              {['Name', 'Email', 'Status', 'Source', 'Created', 'Actions'].map((h) => (
                <th
                  key={h}
                  className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {leads.map((lead) => (
              <tr
                key={lead._id}
                className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
              >
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-900 dark:text-slate-100">{lead.name}</div>
                  {typeof lead.createdBy === 'object' && isAdmin && (
                    <div className="text-xs text-slate-400 mt-0.5">by {lead.createdBy.name}</div>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400 font-mono text-xs">
                  {lead.email}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={lead.status} />
                </td>
                <td className="px-4 py-3">
                  <SourceBadge source={lead.source} />
                </td>
                <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs">
                  {new Date(lead.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onView(lead)}
                      className="p-1.5 rounded-md text-slate-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors"
                      title="View details"
                    >
                      <Eye size={15} />
                    </button>
                    {canModify(lead) && (
                      <>
                        <button
                          onClick={() => onEdit(lead)}
                          className="p-1.5 rounded-md text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                          title="Edit lead"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(lead)}
                          className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          title="Delete lead"
                        >
                          <Trash2 size={15} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {deleteTarget && (
        <ConfirmDelete lead={deleteTarget} onClose={() => setDeleteTarget(null)} />
      )}
    </>
  );
}
