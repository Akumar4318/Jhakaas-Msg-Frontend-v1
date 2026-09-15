import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { Holiday } from '../types';
import { HolidayModal } from '../components/holidays/HolidayModal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { EmptyState } from '../components/common/EmptyState';
import { formatDateOnly } from '../utils/date.util';
import { Sparkles, Plus, Edit2, Trash2, Calendar, Info } from 'lucide-react';

export const HolidaysPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);
  const [deletingHolidayId, setDeletingHolidayId] = useState<string | null>(null);

  const { data: holidaysData, isLoading } = useQuery<Holiday[]>({
    queryKey: ['holidays'],
    queryFn: async () => {
      const res: any = await apiClient.get('/holidays');
      return res.data || res;
    },
  });

  const holidays = Array.isArray(holidaysData) ? holidaysData : [];

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiClient.delete(`/holidays/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holidays'] });
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      setDeletingHolidayId(null);
    },
  });

  return (
    <div className="space-y-6 font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-l1">Holiday Calendar</h1>
          <p className="text-xs text-text-l5 mt-1">
            Configure custom holidays. Messages scheduled on these dates will respect your configured holiday behavior.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditingHoliday(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-background-white bg-semantic-green hover:bg-semanticDark-green rounded-xl shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Holiday</span>
        </button>
      </div>

      {/* Info Banner on Behavior */}
      <div className="p-4 bg-semanticLight-yellow border border-semantic-yellow/40 rounded-2xl flex items-start gap-3 text-xs text-semanticDark-yellow">
        <Info className="w-5 h-5 text-semantic-yellow shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold">How Holiday Rules Work:</span>
          <p className="text-semanticDark-yellow/80 leading-relaxed">
            When scheduling any WhatsApp message, you can set the holiday rule to{' '}
            <strong>Do not send</strong> (skips message), <strong>Send anyway</strong>, or{' '}
            <strong>Move to next working day</strong>. The backend scheduler checks these holidays dynamically at the moment of execution.
          </p>
        </div>
      </div>

      {/* Holidays List Table / Cards */}
      {isLoading ? (
        <div className="py-12 text-center text-xs text-text-l6">Loading holidays...</div>
      ) : holidays.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {holidays.map((h) => (
            <div
              key={h.id}
              className="p-5 bg-background-white rounded-2xl border border-border-light shadow-sm flex items-start justify-between gap-3"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-semanticLight-yellow text-semantic-yellow border border-semantic-yellow/30 flex items-center justify-center font-bold text-base shrink-0">
                  🎉
                </div>
                <div>
                  <h3 className="text-sm font-bold text-text-l1 leading-tight">{h.name}</h3>
                  <div className="text-xs font-semibold text-semanticDark-yellow mt-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatDateOnly(h.date)}</span>
                  </div>
                  {h.description && (
                    <p className="text-xs text-text-l5 mt-2">{h.description}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setEditingHoliday(h);
                    setIsModalOpen(true);
                  }}
                  className="p-1.5 text-text-l6 hover:text-text-l2 hover:bg-background-light rounded-lg transition-colors"
                  title="Edit Holiday"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeletingHolidayId(h.id)}
                  className="p-1.5 text-text-l6 hover:text-semantic-red hover:bg-semanticLight-red rounded-lg transition-colors"
                  title="Delete Holiday"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Sparkles}
          title="No custom holidays configured"
          description="Add national holidays, company offsite dates, or festivals to prevent automated messages on those days."
          actionLabel="Add First Holiday"
          onAction={() => {
            setEditingHoliday(null);
            setIsModalOpen(true);
          }}
        />
      )}

      {/* Add / Edit Holiday Modal */}
      <HolidayModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        holiday={editingHoliday}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingHolidayId}
        onClose={() => setDeletingHolidayId(null)}
        onConfirm={() => {
          if (deletingHolidayId) deleteMutation.mutate(deletingHolidayId);
        }}
        title="Delete Holiday?"
        message="Are you sure you want to delete this holiday? Scheduled messages will no longer consider this date a holiday."
        confirmText="Yes, Delete Holiday"
        isDangerous={true}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
