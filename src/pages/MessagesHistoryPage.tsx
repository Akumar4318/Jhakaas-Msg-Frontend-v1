import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { ScheduledMessage, MessageStatus } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { EditMessageDrawer } from '../components/messages/EditMessageDrawer';
import { formatDateTime } from '../utils/date.util';
import { EmptyState } from '../components/common/EmptyState';
import {
  MessageSquare,
  Search,
  Filter,
  Eye,
  Calendar,
  AlertCircle,
} from 'lucide-react';

export const MessagesHistoryPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);

  const { data, isLoading } = useQuery<{ items: ScheduledMessage[]; pagination: any }>({
    queryKey: ['message-history', search, statusFilter],
    queryFn: async () => {
      const res: any = await apiClient.get('/messages/history', {
        params: {
          search: search || undefined,
          status: statusFilter !== 'ALL' ? statusFilter : undefined,
          limit: 50,
        },
      });
      return res.data || res;
    },
  });

  const messages = data?.items || [];

  return (
    <div className="space-y-6 font-mono">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-text-l1">Message Log &amp; History</h1>
        <p className="text-xs text-text-l5 mt-1">
          Complete audit trail of all scheduled, sent, skipped, and failed WhatsApp messages
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-text-l7 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by contact name, phone, or message content..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-background-white border border-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-semantic-green/20 focus:border-semantic-green transition-all shadow-sm text-text-l2"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-text-l7 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 text-sm bg-background-white border border-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-semantic-green/20 focus:border-semantic-green transition-all font-medium text-text-l3 shadow-sm"
          >
            <option value="ALL">All Statuses</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="SENT">Sent</option>
            <option value="FAILED">Failed</option>
            <option value="SKIPPED_HOLIDAY">Skipped (Holiday)</option>
            <option value="SKIPPED_WEEKEND">Skipped (Weekend)</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* History Table */}
      {isLoading ? (
        <div className="py-12 text-center text-xs text-text-l6">Loading history logs...</div>
      ) : messages.length > 0 ? (
        <div className="bg-background-white rounded-2xl border border-border-light overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-background-light border-b border-border-light text-text-l5 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Recipient</th>
                  <th className="px-5 py-3.5">Message Text</th>
                  <th className="px-5 py-3.5">Scheduled For</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Execution Details</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {messages.map((msg) => (
                  <tr
                    key={msg.id}
                    onClick={() => setSelectedMessageId(msg.id)}
                    className="hover:bg-background-light/70 transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="font-bold text-text-l1">
                        {msg.contact?.name || 'Unknown Contact'}
                      </div>
                      <div className="font-mono text-[11px] text-text-l6">
                        {msg.contact?.normalizedPhone || msg.contact?.phone}
                      </div>
                    </td>

                    <td className="px-5 py-4 max-w-xs">
                      <div className="line-clamp-2 text-text-l3">{msg.message}</div>
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap text-text-l3 font-medium">
                      {formatDateTime(msg.scheduledAt)}
                      <div className="text-[10px] text-text-l6">{msg.timezone}</div>
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      <StatusBadge status={msg.status} size="sm" />
                    </td>

                    <td className="px-5 py-4 max-w-xs text-text-l5">
                      {msg.status === 'SENT' ? (
                        <div className="text-[11px] text-semanticDark-green">
                          Sent at {formatDateTime(msg.sentAt)}
                        </div>
                      ) : msg.failureReason ? (
                        <div className="text-[11px] text-semanticDark-yellow truncate" title={msg.failureReason}>
                          {msg.failureReason}
                        </div>
                      ) : (
                        <div className="text-[11px] text-text-l6">In queue</div>
                      )}
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMessageId(msg.id);
                        }}
                        className="p-1.5 text-text-l6 hover:text-text-l2 hover:bg-background-light rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={MessageSquare}
          title="No messages found"
          description={
            search || statusFilter !== 'ALL'
              ? 'No messages match your search filter.'
              : 'Messages will appear here once scheduled or dispatched.'
          }
        />
      )}

      {/* Edit Drawer for selected message */}
      <EditMessageDrawer
        isOpen={!!selectedMessageId}
        onClose={() => setSelectedMessageId(null)}
        messageId={selectedMessageId}
      />
    </div>
  );
};
