import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { Contact, HolidayBehavior, WeekendBehavior } from '../../types';
import { Modal } from '../common/Modal';
import { WhatsAppPreview } from '../common/WhatsAppPreview';
import { Plus, Clock, Globe, ShieldAlert, Sparkles } from 'lucide-react';
import { format } from 'date-fns';

const scheduleSchema = z.object({
  contactId: z.string().min(1, 'Please select a contact'),
  message: z.string().min(1, 'Please enter a message to send'),
  scheduledDate: z.string().min(1, 'Please select a date'),
  scheduledTime: z.string().min(1, 'Please select a time'),
  timezone: z.string().default('Asia/Kolkata'),
  holidayBehavior: z.enum(['DO_NOT_SEND', 'SEND_ANYWAY', 'MOVE_TO_NEXT_WORKING_DAY']),
  weekendBehavior: z.enum(['DO_NOT_SEND', 'SEND_ANYWAY', 'MOVE_TO_NEXT_WORKING_DAY']),
});

type ScheduleFormData = z.infer<typeof scheduleSchema>;

interface ScheduleMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: string;
  onOpenAddContact: () => void;
}

export const ScheduleMessageModal: React.FC<ScheduleMessageModalProps> = ({
  isOpen,
  onClose,
  initialDate,
  onOpenAddContact,
}) => {
  const queryClient = useQueryClient();
  const [contactSearch] = useState('');

  const { data: contactsData } = useQuery<{ data: Contact[] }>({
    queryKey: ['contacts', contactSearch],
    queryFn: async () => {
      const res: any = await apiClient.get('/contacts', {
        params: { search: contactSearch },
      });
      return res;
    },
    enabled: isOpen,
  });

  const contacts = Array.isArray(contactsData)
    ? contactsData
    : (contactsData as any)?.data || [];

  const defaultDate = initialDate
    ? initialDate.substring(0, 10)
    : format(new Date(), 'yyyy-MM-dd');
  const defaultTime = initialDate && initialDate.length >= 16
    ? initialDate.substring(11, 16)
    : '10:00';

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      contactId: '',
      message: '',
      scheduledDate: defaultDate,
      scheduledTime: defaultTime,
      timezone: 'Asia/Kolkata',
      holidayBehavior: 'DO_NOT_SEND',
      weekendBehavior: 'DO_NOT_SEND',
    },
  });

  useEffect(() => {
    if (initialDate) {
      const d = initialDate.substring(0, 10);
      const t = initialDate.length >= 16 ? initialDate.substring(11, 16) : '10:00';
      setValue('scheduledDate', d);
      setValue('scheduledTime', t);
    }
  }, [initialDate, setValue, isOpen]);

  const watchedContactId = watch('contactId');
  const watchedMessage = watch('message');
  const watchedDate = watch('scheduledDate');
  const watchedTime = watch('scheduledTime');

  const selectedContact = contacts.find((c: Contact) => c.id === watchedContactId);

  const mutation = useMutation({
    mutationFn: async (data: ScheduleFormData) => {
      const combinedIso = `${data.scheduledDate}T${data.scheduledTime}:00`;
      return apiClient.post('/messages/schedule', {
        contactId: data.contactId,
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
      reset();
      onClose();
    },
  });

  const onSubmit = (data: ScheduleFormData) => {
    mutation.mutate(data);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Schedule WhatsApp Message"
      subtitle="Select a contact and choose the exact date, time, and holiday rules"
      maxWidth="2xl"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-mono">
        {/* Left: Scheduling Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="lg:col-span-7 space-y-4">
          {mutation.isError && (
            <div className="p-3 bg-semanticLight-red border border-semantic-red/40 text-semanticDark-red text-xs rounded-xl flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{(mutation.error as Error).message}</span>
            </div>
          )}

          {/* Contact Select + Add New */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-text-l2">
                Recipient Contact <span className="text-semantic-red">*</span>
              </label>
              <button
                type="button"
                onClick={() => onOpenAddContact()}
                className="text-xs font-bold text-semanticDark-green hover:text-semantic-green flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Contact</span>
              </button>
            </div>
            <select
              {...register('contactId')}
              className="w-full px-3.5 py-2 text-sm bg-background-white border border-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-semantic-green/30 focus:border-semantic-green transition-all font-medium text-text-l1"
            >
              <option value="">Select a contact...</option>
              {contacts.map((c: Contact) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.normalizedPhone || c.phone})
                </option>
              ))}
            </select>
            {errors.contactId && (
              <p className="text-xs text-semantic-red mt-1">{errors.contactId.message}</p>
            )}
          </div>

          {/* Message Text */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-text-l2">
                WhatsApp Message <span className="text-semantic-red">*</span>
              </label>
              <span className="text-[11px] text-text-l6">
                {watchedMessage?.length || 0} chars
              </span>
            </div>
            <textarea
              rows={3}
              {...register('message')}
              placeholder="e.g. Happy Birthday Rahul! Wishing you great success 🎉"
              className="w-full px-3.5 py-2 text-sm bg-background-white border border-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-semantic-green/30 focus:border-semantic-green transition-all resize-none text-text-l1"
            />
            {errors.message && (
              <p className="text-xs text-semantic-red mt-1">{errors.message.message}</p>
            )}
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-text-l2 mb-1">
                Date <span className="text-semantic-red">*</span>
              </label>
              <input
                type="date"
                {...register('scheduledDate')}
                className="w-full px-3 py-2 text-sm bg-background-white border border-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-semantic-green/30 focus:border-semantic-green transition-all text-text-l1"
              />
              {errors.scheduledDate && (
                <p className="text-xs text-semantic-red mt-1">{errors.scheduledDate.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-l2 mb-1">
                Time <span className="text-semantic-red">*</span>
              </label>
              <input
                type="time"
                {...register('scheduledTime')}
                className="w-full px-3 py-2 text-sm bg-background-white border border-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-semantic-green/30 focus:border-semantic-green transition-all text-text-l1"
              />
              {errors.scheduledTime && (
                <p className="text-xs text-semantic-red mt-1">{errors.scheduledTime.message}</p>
              )}
            </div>
          </div>

          {/* Timezone */}
          <div>
            <label className="block text-xs font-semibold text-text-l2 mb-1 flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-text-l6" />
              <span>Timezone</span>
            </label>
            <select
              {...register('timezone')}
              className="w-full px-3 py-2 text-sm bg-background-white border border-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-semantic-green/30 focus:border-semantic-green transition-all text-text-l1"
            >
              <option value="Asia/Kolkata">Asia/Kolkata (IST - UTC+05:30)</option>
              <option value="America/New_York">America/New_York (EST - UTC-05:00)</option>
              <option value="Europe/London">Europe/London (GMT - UTC+00:00)</option>
              <option value="Asia/Dubai">Asia/Dubai (GST - UTC+04:00)</option>
              <option value="Asia/Singapore">Asia/Singapore (SGT - UTC+08:00)</option>
              <option value="UTC">UTC</option>
            </select>
          </div>

          {/* Holiday & Weekend Rules */}
          <div className="p-3.5 bg-background-light border border-border-light rounded-xl space-y-3">
            <div>
              <label className="block text-xs font-semibold text-text-l2 mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-semantic-orange" />
                <span>Holiday Behavior:</span>
              </label>
              <select
                {...register('holidayBehavior')}
                className="w-full px-3 py-1.5 text-xs bg-background-white border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-semantic-green/30 text-text-l2 font-medium"
              >
                <option value="DO_NOT_SEND">Do not send (Skip message)</option>
                <option value="SEND_ANYWAY">Send anyway on holiday</option>
                <option value="MOVE_TO_NEXT_WORKING_DAY">Move to next working day</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-l2 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-semantic-blue" />
                <span>Weekend / Non-Working Day:</span>
              </label>
              <select
                {...register('weekendBehavior')}
                className="w-full px-3 py-1.5 text-xs bg-background-white border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-semantic-green/30 text-text-l2 font-medium"
              >
                <option value="DO_NOT_SEND">Do not send (Skip message)</option>
                <option value="SEND_ANYWAY">Send anyway on weekend</option>
                <option value="MOVE_TO_NEXT_WORKING_DAY">Move to next working day</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-light">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-text-l3 bg-background-white border border-border-light rounded-xl hover:bg-background-light transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="px-5 py-2 text-xs font-bold text-text-l1 hover:text-white bg-semantic-green hover:bg-semanticDark-green rounded-xl shadow-sm transition-colors disabled:opacity-50"
            >
              {mutation.isPending ? 'Scheduling...' : 'Schedule Message'}
            </button>
          </div>
        </form>

        {/* Right: Live WhatsApp Bubble Preview */}
        <div className="lg:col-span-5 flex flex-col justify-between pt-1">
          <div>
            <h4 className="text-[11px] font-bold text-text-l5 uppercase tracking-wider mb-2">
              WhatsApp Message Preview
            </h4>
            <WhatsAppPreview
              contactName={selectedContact?.name || 'Selected Contact'}
              contactPhone={selectedContact?.normalizedPhone || selectedContact?.phone}
              message={watchedMessage}
              scheduledTime={watchedDate && watchedTime ? `${watchedDate}T${watchedTime}:00` : undefined}
            />
          </div>

          <div className="mt-4 p-3 bg-semanticLight-green/60 border border-semantic-green/30 rounded-xl text-semanticDark-green text-[11px] leading-relaxed">
            <span className="font-bold">Backend Automation:</span> Automatically dispatched by NestJS background workers at the exact scheduled timestamp.
          </div>
        </div>
      </div>
    </Modal>
  );
};
