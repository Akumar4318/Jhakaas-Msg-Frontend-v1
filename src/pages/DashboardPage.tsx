import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { DashboardSummary, ScheduledMessage } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { formatRelativeDate, formatDateTime } from '../utils/date.util';
import { Link, useOutletContext } from 'react-router-dom';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Users,
  Calendar,
  ArrowRight,
  PlusCircle,
} from 'lucide-react';

interface LayoutContext {
  onOpenScheduleModal: (dateStr?: string) => void;
}

export const DashboardPage: React.FC = () => {
  const { onOpenScheduleModal } = useOutletContext<LayoutContext>();

  const { data, isLoading } = useQuery<DashboardSummary>({
    queryKey: ['dashboard-summary'],
    queryFn: async () => {
      const res: any = await apiClient.get('/dashboard/summary');
      return res.data || res;
    },
  });

  const metrics = data?.metrics || {
    scheduled: 0,
    sent: 0,
    failed: 0,
    skipped: 0,
    totalContacts: 0,
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-l1">Dashboard Overview</h1>
          <p className="text-xs text-text-l5 mt-1">
            Summary of all automated WhatsApp messages and upcoming schedule queue
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/calendar"
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-text-l3 bg-background-white border border-border-light rounded-xl hover:bg-background-light transition-colors shadow-sm"
          >
            <Calendar className="w-4 h-4" />
            <span>Open Calendar</span>
          </Link>
          <button
            type="button"
            onClick={() => onOpenScheduleModal()}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-background-white bg-semantic-green hover:bg-semanticDark-green rounded-xl transition-colors shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Schedule Message</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Scheduled */}
        <div className="p-5 bg-background-white rounded-2xl border border-border-light shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-text-l6 uppercase tracking-wider">
              Scheduled
            </div>
            <div className="text-2xl font-bold text-semantic-blue mt-1">{metrics.scheduled}</div>
            <div className="text-[11px] text-text-l5 mt-0.5">Awaiting dispatch</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-semanticLight-blue text-semantic-blue flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Sent */}
        <div className="p-5 bg-background-white rounded-2xl border border-border-light shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-text-l6 uppercase tracking-wider">
              Sent
            </div>
            <div className="text-2xl font-bold text-semantic-green mt-1">{metrics.sent}</div>
            <div className="text-[11px] text-text-l5 mt-0.5">Delivered to WhatsApp</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-semanticLight-green text-semantic-green flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Skipped */}
        <div className="p-5 bg-background-white rounded-2xl border border-border-light shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-text-l6 uppercase tracking-wider">
              Skipped
            </div>
            <div className="text-2xl font-bold text-semantic-yellow mt-1">{metrics.skipped}</div>
            <div className="text-[11px] text-text-l5 mt-0.5">Holiday/Weekend rules</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-semanticLight-yellow text-semantic-yellow flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        {/* Failed */}
        <div className="p-5 bg-background-white rounded-2xl border border-border-light shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-text-l6 uppercase tracking-wider">
              Failed
            </div>
            <div className="text-2xl font-bold text-semantic-red mt-1">{metrics.failed}</div>
            <div className="text-[11px] text-text-l5 mt-0.5">Provider error / retry</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-semanticLight-red text-semantic-red flex items-center justify-center">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Two Column Grid: Upcoming Queue & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Scheduled Messages */}
        <div className="bg-background-white rounded-2xl border border-border-light p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-text-l1 flex items-center gap-2">
                <Clock className="w-4 h-4 text-semantic-blue" />
                <span>Upcoming Scheduled Queue</span>
              </h3>
              <Link
                to="/calendar"
                className="text-xs font-semibold text-semanticDark-green hover:text-semantic-green flex items-center gap-1"
              >
                <span>View in Calendar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {isLoading ? (
              <div className="py-8 text-center text-xs text-text-l6">Loading queue...</div>
            ) : data?.upcomingMessages && data.upcomingMessages.length > 0 ? (
              <div className="space-y-3">
                {data.upcomingMessages.map((msg: ScheduledMessage) => (
                  <div
                    key={msg.id}
                    className="p-3 bg-background-light border border-border-light rounded-xl flex items-center justify-between text-xs hover:bg-background-muted transition-colors"
                  >
                    <div className="flex-1 min-w-0 mr-3">
                      <div className="font-semibold text-text-l1 truncate">
                        {msg.contact?.name || 'Contact'}
                      </div>
                      <div className="text-text-l5 truncate mt-0.5">{msg.message}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-medium text-text-l3">
                        {formatRelativeDate(msg.scheduledAt)}
                      </div>
                      <StatusBadge status={msg.status} size="sm" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-text-l6">
                No scheduled messages pending. Click "Schedule Message" to add one!
              </div>
            )}
          </div>
        </div>

        {/* Recent Execution Activity */}
        <div className="bg-background-white rounded-2xl border border-border-light p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-text-l1 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-semantic-green" />
                <span>Recent Message Activity</span>
              </h3>
              <Link
                to="/messages/history"
                className="text-xs font-semibold text-semanticDark-green hover:text-semantic-green flex items-center gap-1"
              >
                <span>Full History</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {isLoading ? (
              <div className="py-8 text-center text-xs text-text-l6">Loading activity...</div>
            ) : data?.recentActivity && data.recentActivity.length > 0 ? (
              <div className="space-y-3">
                {data.recentActivity.map((msg: ScheduledMessage) => (
                  <div
                    key={msg.id}
                    className="p-3 bg-background-light border border-border-light rounded-xl flex items-center justify-between text-xs"
                  >
                    <div className="flex-1 min-w-0 mr-3">
                      <div className="font-semibold text-text-l1 truncate">
                        {msg.contact?.name || 'Contact'}
                      </div>
                      <div className="text-text-l5 truncate mt-0.5">{msg.message}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <StatusBadge status={msg.status} size="sm" />
                      <div className="text-[10px] text-text-l7 mt-1">
                        {formatDateTime(msg.updatedAt)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-text-l6">
                No recent activity recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
