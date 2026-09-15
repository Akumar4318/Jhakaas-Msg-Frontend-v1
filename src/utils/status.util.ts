import { MessageStatus } from '../types';

export interface StatusConfig {
  label: string;
  badgeClass: string;
  dotClass: string;
  description: string;
}

export const STATUS_CONFIG: Record<MessageStatus, StatusConfig> = {
  SCHEDULED: {
    label: 'Scheduled',
    badgeClass: 'bg-semanticLight-blue text-semanticDark-blue border-semantic-blue/40',
    dotClass: 'bg-semantic-blue',
    description: 'Waiting for scheduled date and time',
  },
  QUEUED: {
    label: 'Queued',
    badgeClass: 'bg-semanticLight-indigo text-semanticDark-indigo border-semantic-indigo/40',
    dotClass: 'bg-semantic-indigo',
    description: 'In processing queue',
  },
  PROCESSING: {
    label: 'Processing',
    badgeClass: 'bg-semanticLight-yellow text-semanticDark-yellow border-semantic-yellow/50',
    dotClass: 'bg-semantic-yellow animate-pulse',
    description: 'Dispatching to WhatsApp provider',
  },
  SENT: {
    label: 'Sent',
    badgeClass: 'bg-semanticLight-green text-semanticDark-green border-semantic-green/40',
    dotClass: 'bg-semantic-green',
    description: 'Successfully dispatched to WhatsApp',
  },
  DELIVERED: {
    label: 'Delivered',
    badgeClass: 'bg-semanticLight-teal text-semanticDark-teal border-semantic-teal/40',
    dotClass: 'bg-semantic-teal',
    description: 'Delivered to recipient handset',
  },
  READ: {
    label: 'Read',
    badgeClass: 'bg-semanticLight-cyan text-semanticDark-cyan border-semantic-cyan/40',
    dotClass: 'bg-semantic-cyan',
    description: 'Read by recipient',
  },
  FAILED: {
    label: 'Failed',
    badgeClass: 'bg-semanticLight-red text-semanticDark-red border-semantic-red/40',
    dotClass: 'bg-semantic-red',
    description: 'Failed to send message',
  },
  CANCELLED: {
    label: 'Cancelled',
    badgeClass: 'bg-background-muted text-text-l5 border-border-light',
    dotClass: 'bg-border-dark',
    description: 'Cancelled by user',
  },
  SKIPPED_HOLIDAY: {
    label: 'Skipped (Holiday)',
    badgeClass: 'bg-semanticLight-orange text-semanticDark-orange border-semantic-orange/40',
    dotClass: 'bg-semantic-orange',
    description: 'Skipped due to holiday rule',
  },
  SKIPPED_WEEKEND: {
    label: 'Skipped (Weekend)',
    badgeClass: 'bg-semanticLight-purple text-semanticDark-purple border-semantic-purple/40',
    dotClass: 'bg-semantic-purple',
    description: 'Skipped due to non-working day rule',
  },
};

export function getStatusConfig(status?: MessageStatus): StatusConfig {
  if (!status || !STATUS_CONFIG[status]) {
    return {
      label: status || 'Unknown',
      badgeClass: 'bg-background-muted text-text-l4 border-border-light',
      dotClass: 'bg-border-dark',
      description: '',
    };
  }
  return STATUS_CONFIG[status];
}
