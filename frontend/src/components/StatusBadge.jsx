import React from 'react';
import { 
  File, 
  Send, 
  Eye, 
  CheckCircle, 
  AlertTriangle, 
  Play, 
  FileCheck, 
  Archive 
} from 'lucide-react';

export default function StatusBadge({ status }) {
  const getStatusConfig = (statusKey) => {
    switch (statusKey) {
      case 'draft':
        return {
          label: 'Draft',
          className: 'badge-draft',
          icon: File
        };
      case 'submitted':
        return {
          label: 'Submitted',
          className: 'badge-submitted',
          icon: Send
        };
      case 'under_review':
        return {
          label: 'Under Review',
          className: 'badge-under_review',
          icon: Eye
        };
      case 'approved':
        return {
          label: 'Approved',
          className: 'badge-approved',
          icon: CheckCircle
        };
      case 'revision_requested':
        return {
          label: 'Revision Req.',
          className: 'badge-revision_requested',
          icon: AlertTriangle
        };
      case 'in_production':
        return {
          label: 'In Production',
          className: 'badge-in_production',
          icon: Play
        };
      case 'completed':
        return {
          label: 'Completed',
          className: 'badge-completed',
          icon: FileCheck
        };
      case 'archived':
      default:
        return {
          label: 'Archived',
          className: 'badge-draft',
          icon: Archive
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <span className={`badge ${config.className}`}>
      <Icon size={12} />
      <span>{config.label}</span>
    </span>
  );
}
