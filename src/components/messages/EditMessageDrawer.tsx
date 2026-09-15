import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { ScheduledMessage, HolidayBehavior, WeekendBehavior, MessageEvent } from '../../types';
import { Drawer } from '../common/Drawer';
import { StatusBadge } from '../common/StatusBadge';
import { WhatsAppPreview } from '../common/WhatsAppPreview';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { formatDateTime } from '../../utils/date.util';
import {
  User,
  ShieldAlert,
  Trash2,
  RotateCcw,
  Sparkles,
  Clock,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

const editSchema = z.object({
  contactId: z.string().optional(),
  message: z.string().min(1, 'Message text cannot be empty'),
  scheduledDate: z.string().min(1, 'Please select a date'),
  scheduledTime: z.string().min(1, 'Please select a time'),
  timezone: z.string().default('Asia/Kolkata'),
  holidayBehavior: z.enum(['DO_NOT_SEND', 'SEND_ANYWAY', 'MOVE_TO_NEXT_WORKING_DAY']),
  weekendBehavior: z.enum(['DO_NOT_SEND', 'SEND_ANYWAY', 'MOVE_TO_NEXT_WORKING_DAY']),
});

type EditFormData = z.infer<typeof editSchema>;

interface EditMessageDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  messageId?: string | null;
  onOpenScheduleDuplicate?: (contactId: string, messageText: string) => void;
}

export const EditMessageDrawer: React.FC<EditMessageDrawerProps> = ({
  isOpen,
  onClose,
  messageId,
  onOpenScheduleDuplicate,
}) => {
  const queryClient = useQueryClient();
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);

  const { data: message, isLoading } = useQuery<ScheduledMessage>({
    queryKey: ['message-details', messageId],
    queryFn: async () => {
      const res: any = await apiClient.get(`/messages/${messageId}`);
      return res.data || res;
    },
    enabled: isOpen && !!messageId,
  });

  const isEditable = message?.status === 'SCHEDULED' || message?.status === 'FAILED';

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<EditFormData>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      message: '',
      scheduledDate: '',
      scheduledTime: '',
      timezone: 'Asia/Kolkata',
      holidayBehavior: 'DO_NOT_SEND',
      weekendBehavior: 'DO_NOT_SEND',
    },
  });

  useEffect(() => {
    if (message) {
      const parsedDate = parseISO(message.scheduledAt);
      reset({
        message: message.message,
        scheduledDate: format(parsedDate, 'yyyy-MM-dd'),
        scheduledTime: format(parsedDate, 'HH:mm'),
        timezone: message.timezone || 'Asia/Kolkata',
        holidayBehavior: message.holidayBehavior,
        weekendBehavior: message.weekendBehavior,
      });
    }
  }, [message, reset]);

  const watchedMessage = watch('message');
  const watchedDate = watch('scheduledDate');
  const watchedTime = watch('scheduledTime');

  const updateMutation = useMutation({
    mutationFn: async (data: EditFormData) => {
      const combinedIso = `${data.scheduledDate}T${data.scheduledTime}:00`;
      return apiClient.patch(`/messages/${messageId}`, {
        message: data.message,
        scheduledAt: combinedIso,
        timezone: data.timezone,
        holidayBehavior: data.holidayBehavior as HolidayBehavior,
        weekendBehavior: data.weekendBehavior as WeekendBehavior,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      queryClient.invalidateQueries({ queryKey: ['message-history'] });
      queryClient.invalidateQueries({ queryKey: ['message-details', messageId] });
      onClose();
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async () => {
      return apiClient.post(`/messages/${messageId}/cancel`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      queryClient.invalidateQueries({ queryKey: ['message-history'] });
      queryClient.invalidateQueries({ queryKey: ['message-details', messageId] });
      setIsCancelConfirmOpen(false);
      onClose();
    },
  });

  const onSubmit = (data: EditFormData) => {
    updateMutation.mutate(data);
  };

  return (
    <>
      <Drawer
        isOpen={isOpen}
        onClose={onClose}
        title="Scheduled Message Details"
        subtitle={message ? `ID: ${message.id.substring(0, 8)}...` : undefined}
        width="lg"
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-text-l6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-semantic-green"></div>
          </div>
        ) : message ? (
          <div className="space-y-6 font-mono">
            {/* Status & Recipient Banner */}
            <div className="p-4 bg-background-light border border-border-light rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-semanticLight-green text-semanticDark-green flex items-center justify-center font-bold text-sm border border-semantic-green/30">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-text-l1">
                    {message.contact?.name || 'Recipient'}
                  </div>
                  <div className="text-xs font-mono text-text-l5">
                    {message.contact?.normalizedPhone || message.contact?.phone}
                  </div>
                </div>
              </div>
              <StatusBadge status={message.status} size="md" />
            </div>

            {/* Failure or Skip Notice */}
            {message.failureReason && (
              <div className="p-3 bg-semanticLight-orange border border-semantic-orange/40 rounded-xl text-xs text-semanticDark-orange flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Execution Note:</div>
                  <div>{message.failureReason}</div>
                </div>
              </div>
            )}

            {/* Edit Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {updateMutation.isError && (
                <div className="p-3 bg-semanticLight-red border border-semantic-red/40 text-semanticDark-red text-xs rounded-xl">
                  {(updateMutation.error as Error).message}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-text-l2 mb-1">
                  Message Content
                </label>
                <textarea
                  rows={3}
                  disabled={!isEditable}
                  {...register('message')}
                  className="w-full px-3.5 py-2 text-sm bg-background-white border border-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-semantic-green/30 focus:border-semantic-green transition-all resize-none disabled:bg-background-muted disabled:text-text-l4 text-text-l1"
                />
                {errors.message && (
                  <p className="text-xs text-semantic-red mt-1">{errors.message.message}</p>
                )}
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-text-l2 mb-1">
                    Scheduled Date
                  </label>
                  <input
                    type="date"
                    disabled={!isEditable}
                    {...register('scheduledDate')}
                    className="w-full px-3 py-2 text-sm bg-background-white border border-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-semantic-green/30 focus:border-semantic-green transition-all disabled:bg-background-muted disabled:text-text-l4 text-text-l1"
                  />
                  {errors.scheduledDate && (
                    <p className="text-xs text-semantic-red mt-1">{errors.scheduledDate.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-l2 mb-1">
                    Scheduled Time
                  </label>
                  <input
                    type="time"
                    disabled={!isEditable}
                    {...register('scheduledTime')}
                    className="w-full px-3 py-2 text-sm bg-background-white border border-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-semantic-green/30 focus:border-semantic-green transition-all disabled:bg-background-muted disabled:text-text-l4 text-text-l1"
                  />
                  {errors.scheduledTime && (
                    <p className="text-xs text-semantic-red mt-1">{errors.scheduledTime.message}</p>
                  )}
                </div>
              </div>

              {/* Holiday & Weekend Rules */}
              <div className="p-3.5 bg-background-light border border-border-light rounded-xl space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-text-l2 mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-semantic-orange" />
                    <span>Holiday Behavior</span>
                  </label>
                  <select
                    disabled={!isEditable}
                    {...register('holidayBehavior')}
                    className="w-full px-3 py-1.5 text-xs bg-background-white border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-semantic-green/30 text-text-l2 font-medium disabled:bg-background-muted"
                  >
                    <option value="DO_NOT_SEND">Do not send (Skip message)</option>
                    <option value="SEND_ANYWAY">Send anyway on holiday</option>
                    <option value="MOVE_TO_NEXT_WORKING_DAY">Move to next working day</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-l2 mb-1 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-semantic-blue" />
                    <span>Weekend Behavior</span>
                  </label>
                  <select
                    disabled={!isEditable}
                    {...register('weekendBehavior')}
                    className="w-full px-3 py-1.5 text-xs bg-background-white border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-semantic-green/30 text-text-l2 font-medium disabled:bg-background-muted"
                  >
                    <option value="DO_NOT_SEND">Do not send (Skip message)</option>
                    <option value="SEND_ANYWAY">Send anyway on weekend</option>
                    <option value="MOVE_TO_NEXT_WORKING_DAY">Move to next working day</option>
                  </select>
                </div>
              </div>

              {/* Actions for SCHEDULED / FAILED */}
              {isEditable && (
                <div className="flex items-center justify-between pt-4 border-t border-border-light">
                  <button
                    type="button"
                    onClick={() => setIsCancelConfirmOpen(true)}
                    className="text-xs font-bold text-semantic-red hover:text-semanticDark-red flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-semanticLight-red transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Cancel Message</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-xs font-medium text-text-l3 bg-background-white border border-border-light rounded-xl hover:bg-background-light transition-colors"
                    >
                      Close
                    </button>
                    <button
                      type="submit"
                      disabled={updateMutation.isPending}
                      className="px-4 py-2 text-xs font-bold text-text-l1 hover:text-white bg-semantic-green hover:bg-semanticDark-green rounded-xl shadow-sm transition-colors disabled:opacity-50"
                    >
                      {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              )}

              {/* Completed/Cancelled Actions */}
              {!isEditable && (
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-light">
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenScheduleDuplicate) {
                        onOpenScheduleDuplicate(message.contactId, message.message);
                      }
                      onClose();
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-semanticDark-green bg-semanticLight-green border border-semantic-green/30 rounded-xl hover:bg-semantic-green/20 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Duplicate / Schedule Again</span>
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-medium text-text-l3 bg-background-white border border-border-light rounded-xl hover:bg-background-light transition-colors"
                  >
                    Close
                  </button>
                </div>
              )}
            </form>

            {/* Live WhatsApp Preview */}
            <div className="pt-2">
              <h4 className="text-[11px] font-bold text-text-l5 uppercase tracking-wider mb-2">
                Live Chat Bubble Preview
              </h4>
              <WhatsAppPreview
                contactName={message.contact?.name}
                contactPhone={message.contact?.normalizedPhone}
                message={watchedMessage}
                scheduledTime={
                  watchedDate && watchedTime ? `${watchedDate}T${watchedTime}:00` : message.scheduledAt
                }
              />
            </div>

            {/* Audit Event Timeline */}
            {message.events && message.events.length > 0 && (
              <div className="pt-4 border-t border-border-light">
                <h4 className="text-[11px] font-bold text-text-l3 uppercase tracking-wider mb-3">
                  Event Timeline
                </h4>
                <div className="space-y-3 relative pl-4 border-l-2 border-border-light">
                  {message.events.map((evt: MessageEvent) => (
                    <div key={evt.id} className="relative text-xs">
                      <div className="absolute -left-[21px] top-0.5 w-2.5 h-2.5 rounded-full bg-semantic-green ring-4 ring-background-white" />
                      <div className="font-bold text-text-l1">{evt.eventType}</div>
                      <div className="text-[11px] text-text-l5">
                        {formatDateTime(evt.createdAt)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </Drawer>

      <ConfirmDialog
        isOpen={isCancelConfirmOpen}
        onClose={() => setIsCancelConfirmOpen(false)}
        onConfirm={() => cancelMutation.mutate()}
        title="Cancel Scheduled Message?"
        message="Are you sure you want to cancel this scheduled WhatsApp message? It will not be sent to the recipient."
        confirmText="Yes, Cancel Message"
        isDangerous={true}
        isLoading={cancelMutation.isPending}
      />
    </>
  );
};
