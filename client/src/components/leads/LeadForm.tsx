import { useEffect, useState } from 'react';
import Modal from '../ui/Modal';
import { Lead, LeadSource, LeadStatus, CreateLeadPayload } from '../../types';
import { useCreateLead, useUpdateLead } from '../../hooks/useLeads';

interface LeadFormProps {
  isOpen: boolean;
  onClose: () => void;
  editLead?: Lead | null;
}

const emptyForm: CreateLeadPayload = {
  name: '',
  email: '',
  status: LeadStatus.NEW,
  source: LeadSource.WEBSITE,
  notes: '',
};

export default function LeadForm({ isOpen, onClose, editLead }: LeadFormProps) {
  const [form, setForm] = useState<CreateLeadPayload>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof CreateLeadPayload, string>>>({});

  const createLead = useCreateLead();
  const updateLead = useUpdateLead();

  const isEdit = !!editLead;
  const isLoading = createLead.isPending || updateLead.isPending;

  useEffect(() => {
    if (editLead) {
      setForm({
        name: editLead.name,
        email: editLead.email,
        status: editLead.status,
        source: editLead.source,
        notes: editLead.notes ?? '',
      });
    } else {
      setForm(emptyForm);
    }
    setErrors({});
  }, [editLead, isOpen]);

  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    if (!form.name.trim() || form.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    if (!form.email || !/^\S+@\S+\.\S+$/.test(form.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!form.source) newErrors.source = 'Source is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (isEdit && editLead) {
      await updateLead.mutateAsync({ id: editLead._id, payload: form });
    } else {
      await createLead.mutateAsync(form);
    }
    onClose();
  };

  const field = (key: keyof CreateLeadPayload) => ({
    value: form[key] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value })),
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Lead' : 'Add New Lead'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input className="input" placeholder="e.g. Rahul Sharma" {...field('name')} />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <input className="input" type="email" placeholder="rahul@example.com" {...field('email')} />
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
        </div>

        {/* Status + Source */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Status
            </label>
            <select className="input" {...field('status')}>
              {Object.values(LeadStatus).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Source <span className="text-red-500">*</span>
            </label>
            <select className="input" {...field('source')}>
              {Object.values(LeadSource).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {errors.source && <p className="text-xs text-red-500 mt-1">{errors.source}</p>}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Notes
          </label>
          <textarea
            className="input resize-none"
            rows={3}
            placeholder="Any relevant info about this lead..."
            value={form.notes}
            onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-ghost flex-1">
            Cancel
          </button>
          <button type="submit" disabled={isLoading} className="btn-primary flex-1">
            {isLoading ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Lead'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
