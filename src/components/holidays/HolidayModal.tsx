import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { Holiday } from '../../types';
import { Modal } from '../common/Modal';

const holidaySchema = z.object({
  name: z.string().min(2, 'Holiday name is required'),
  date: z.string().min(10, 'Date is required (YYYY-MM-DD)'),
  description: z.string().optional(),
});

type HolidayFormData = z.infer<typeof holidaySchema>;

interface HolidayModalProps {
  isOpen: boolean;
  onClose: () => void;
  holiday?: Holiday | null;
}

export const HolidayModal: React.FC<HolidayModalProps> = ({ isOpen, onClose, holiday }) => {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<HolidayFormData>({
    resolver: zodResolver(holidaySchema),
    defaultValues: {
      name: '',
      date: new Date().toISOString().substring(0, 10),
      description: '',
    },
  });

  useEffect(() => {
    if (holiday) {
      reset({
        name: holiday.name,
        date: holiday.date.substring(0, 10),
        description: holiday.description || '',
      });
    } else {
      reset({
        name: '',
        date: new Date().toISOString().substring(0, 10),
        description: '',
      });
    }
  }, [holiday, reset, isOpen]);

  const mutation = useMutation({
    mutationFn: async (data: HolidayFormData) => {
      if (holiday) {
        return apiClient.patch(`/holidays/${holiday.id}`, data);
      } else {
        return apiClient.post('/holidays', data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holidays'] });
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      onClose();
    },
  });

  const onSubmit = (data: HolidayFormData) => {
    mutation.mutate(data);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={holiday ? 'Edit Holiday' : 'Add Custom Holiday'}
      subtitle="Scheduled messages falling on this date will respect your holiday rule"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 font-mono">
        {mutation.isError && (
          <div className="p-3 bg-semanticLight-red border border-semantic-red/30 text-semantic-red text-xs rounded-xl">
            {(mutation.error as Error).message}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-text-l3 mb-1">
            Holiday Name <span className="text-semantic-red">*</span>
          </label>
          <input
            type="text"
            {...register('name')}
            placeholder="e.g. Independence Day, Christmas, Team Offsite"
            className="w-full px-3.5 py-2 text-sm bg-background-white border border-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-semantic-green/20 focus:border-semantic-green transition-all text-text-l2"
          />
          {errors.name && <p className="text-xs text-semantic-red mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-text-l3 mb-1">
            Date <span className="text-semantic-red">*</span>
          </label>
          <input
            type="date"
            {...register('date')}
            className="w-full px-3.5 py-2 text-sm bg-background-white border border-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-semantic-green/20 focus:border-semantic-green transition-all text-text-l2"
          />
          {errors.date && <p className="text-xs text-semantic-red mt-1">{errors.date.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-text-l3 mb-1">
            Description (Optional)
          </label>
          <textarea
            rows={2}
            {...register('description')}
            placeholder="e.g. Annual company festival celebration"
            className="w-full px-3.5 py-2 text-sm bg-background-white border border-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-semantic-green/20 focus:border-semantic-green transition-all resize-none text-text-l2"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-light">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-text-l3 bg-background-white border border-border-light rounded-xl hover:bg-background-light transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="px-4 py-2 text-sm font-medium text-background-white bg-semantic-green rounded-xl hover:bg-semanticDark-green shadow-sm transition-colors disabled:opacity-50"
          >
            {mutation.isPending ? 'Saving...' : holiday ? 'Update Holiday' : 'Add Holiday'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
