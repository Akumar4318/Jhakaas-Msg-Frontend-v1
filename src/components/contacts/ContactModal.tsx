import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { Contact } from '../../types';
import { Modal } from '../common/Modal';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(8, 'Enter a valid phone number (e.g. +91 98765 43210)'),
  country: z.string().optional(),
  timezone: z.string().optional(),
  notes: z.string().optional(),
});

type ContactFormData = z.infer<typeof contactSchema>;

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  contact?: Contact | null;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose, contact }) => {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      phone: '',
      country: 'IN',
      timezone: 'Asia/Kolkata',
      notes: '',
    },
  });

  useEffect(() => {
    if (contact) {
      reset({
        name: contact.name,
        phone: contact.phone,
        country: contact.country || 'IN',
        timezone: contact.timezone || 'Asia/Kolkata',
        notes: contact.notes || '',
      });
    } else {
      reset({
        name: '',
        phone: '',
        country: 'IN',
        timezone: 'Asia/Kolkata',
        notes: '',
      });
    }
  }, [contact, reset, isOpen]);

  const mutation = useMutation({
    mutationFn: async (data: ContactFormData) => {
      if (contact) {
        return apiClient.patch(`/contacts/${contact.id}`, data);
      } else {
        return apiClient.post('/contacts', data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      onClose();
    },
  });

  const onSubmit = (data: ContactFormData) => {
    mutation.mutate(data);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={contact ? 'Edit Contact' : 'Add New Contact'}
      subtitle="Save contact details for automatic WhatsApp message scheduling"
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
            Contact Name <span className="text-semantic-red">*</span>
          </label>
          <input
            type="text"
            {...register('name')}
            placeholder="e.g. Rahul Sharma"
            className="w-full px-3.5 py-2 text-sm bg-background-white border border-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-semantic-green/20 focus:border-semantic-green transition-all text-text-l2"
          />
          {errors.name && <p className="text-xs text-semantic-red mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-text-l3 mb-1">
            Phone Number (with Country Code) <span className="text-semantic-red">*</span>
          </label>
          <input
            type="text"
            {...register('phone')}
            placeholder="e.g. +91 98765 43210"
            className="w-full px-3.5 py-2 text-sm bg-background-white border border-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-semantic-green/20 focus:border-semantic-green transition-all font-mono text-text-l2"
          />
          <p className="text-[11px] text-text-l7 mt-0.5">
            Auto-normalized to E.164 (e.g., +919876543210)
          </p>
          {errors.phone && <p className="text-xs text-semantic-red mt-1">{errors.phone.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-text-l3 mb-1">Country</label>
            <select
              {...register('country')}
              className="w-full px-3 py-2 text-sm bg-background-white border border-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-semantic-green/20 focus:border-semantic-green transition-all text-text-l2"
            >
              <option value="IN">India (IN)</option>
              <option value="US">United States (US)</option>
              <option value="GB">United Kingdom (GB)</option>
              <option value="AE">UAE (AE)</option>
              <option value="SG">Singapore (SG)</option>
              <option value="CA">Canada (CA)</option>
              <option value="AU">Australia (AU)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-l3 mb-1">Timezone</label>
            <select
              {...register('timezone')}
              className="w-full px-3 py-2 text-sm bg-background-white border border-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-semantic-green/20 focus:border-semantic-green transition-all text-text-l2"
            >
              <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
              <option value="America/New_York">America/New_York (EST)</option>
              <option value="Europe/London">Europe/London (GMT)</option>
              <option value="Asia/Dubai">Asia/Dubai (GST)</option>
              <option value="Asia/Singapore">Asia/Singapore (SGT)</option>
              <option value="UTC">UTC</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-text-l3 mb-1">Notes (Optional)</label>
          <textarea
            rows={2}
            {...register('notes')}
            placeholder="e.g. Lead designer, marketing team"
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
            {mutation.isPending ? 'Saving...' : contact ? 'Update Contact' : 'Create Contact'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
