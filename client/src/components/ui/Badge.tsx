import { LeadSource, LeadStatus } from '../../types';

const statusColors: Record<LeadStatus, string> = {
  [LeadStatus.NEW]: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  [LeadStatus.CONTACTED]: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  [LeadStatus.QUALIFIED]: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  [LeadStatus.LOST]: 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400',
};

const sourceColors: Record<LeadSource, string> = {
  [LeadSource.WEBSITE]: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  [LeadSource.INSTAGRAM]: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
  [LeadSource.REFERRAL]: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
};

interface StatusBadgeProps {
  status: LeadStatus;
}

interface SourceBadgeProps {
  source: LeadSource;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`badge ${statusColors[status]}`}>{status}</span>
  );
}

export function SourceBadge({ source }: SourceBadgeProps) {
  return (
    <span className={`badge ${sourceColors[source]}`}>{source}</span>
  );
}
