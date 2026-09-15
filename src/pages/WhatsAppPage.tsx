import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiClient } from '../api/client';
import { WhatsAppAccount } from '../types';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { EmptyState } from '../components/common/EmptyState';
import {
  Smartphone,
  CheckCircle2,
  Plus,
  Trash2,
  Radio,
  ShieldCheck,
  Zap,
} from 'lucide-react';

const connectSchema = z.object({
  provider: z.enum(['META', 'MOCK']),
  phoneNumber: z.string().min(8, 'Phone number is required'),
  displayName: z.string().min(2, 'Display name is required'),
  phoneNumberId: z.string().optional(),
  accessToken: z.string().optional(),
});

type ConnectFormData = z.infer<typeof connectSchema>;

export const WhatsAppPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [disconnectingId, setDisconnectingId] = useState<string | null>(null);

  const { data: accountsData, isLoading } = useQuery<WhatsAppAccount[]>({
    queryKey: ['whatsapp-accounts'],
    queryFn: async () => {
      const res: any = await apiClient.get('/whatsapp/accounts');
      return res.data || res;
    },
  });

  const accounts = Array.isArray(accountsData) ? accountsData : [];

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<ConnectFormData>({
    resolver: zodResolver(connectSchema),
    defaultValues: {
      provider: 'MOCK',
      phoneNumber: '+919876543210',
      displayName: 'Personal WhatsApp',
      phoneNumberId: '',
      accessToken: '',
    },
  });

  const watchedProvider = watch('provider');

  const connectMutation = useMutation({
    mutationFn: async (data: ConnectFormData) => {
      return apiClient.post('/whatsapp/accounts/connect', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-accounts'] });
      reset();
      setIsModalOpen(false);
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiClient.delete(`/whatsapp/accounts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-accounts'] });
      setDisconnectingId(null);
    },
  });

  const onSubmit = (data: ConnectFormData) => {
    connectMutation.mutate(data);
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-l1">WhatsApp Accounts</h1>
          <p className="text-xs text-text-l5 mt-1">
            Connect your WhatsApp Cloud API or simulated testing provider for automated message delivery
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-background-white bg-semantic-green hover:bg-semanticDark-green rounded-xl shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Connect Account</span>
        </button>
      </div>

      {/* Account Cards Grid */}
      {isLoading ? (
        <div className="py-12 text-center text-xs text-text-l6">Loading accounts...</div>
      ) : accounts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((acc) => (
            <div
              key={acc.id}
              className="p-5 bg-background-white rounded-2xl border border-border-light shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-semanticLight-green text-semanticDark-green flex items-center justify-center font-bold">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-text-l1 leading-tight">
                        {acc.displayName}
                      </h3>
                      <div className="text-xs font-mono text-text-l5 mt-0.5">
                        {acc.phoneNumber}
                      </div>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-semanticLight-green text-semanticDark-green border border-semantic-green/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-semantic-green animate-pulse" />
                    Connected
                  </span>
                </div>

                <div className="mt-4 p-3 bg-background-light rounded-xl border border-border-light text-xs space-y-1">
                  <div className="flex items-center justify-between text-text-l5">
                    <span>Provider Type:</span>
                    <span className="font-semibold text-text-l3">
                      {acc.provider === 'MOCK' ? 'Simulated Mock' : 'Meta Cloud API'}
                    </span>
                  </div>
                  {acc.providerAccountId && (
                    <div className="flex items-center justify-between text-text-l5">
                      <span>Account ID:</span>
                      <span className="font-mono text-[11px] text-text-l4">
                        {acc.providerAccountId}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-border-light flex items-center justify-between">
                <span className="text-[11px] text-text-l6 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-semantic-green" />
                  <span>Ready to dispatch</span>
                </span>
                <button
                  type="button"
                  onClick={() => setDisconnectingId(acc.id)}
                  className="text-xs font-semibold text-semantic-red hover:text-semanticDark-red p-1.5 rounded-lg hover:bg-semanticLight-red transition-colors"
                  title="Disconnect Account"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Smartphone}
          title="No WhatsApp account connected"
          description="Connect an account to enable automatic dispatching of scheduled messages."
          actionLabel="Connect First Account"
          onAction={() => setIsModalOpen(true)}
        />
      )}

      {/* Connect Account Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Connect WhatsApp Account"
        subtitle="Select a provider and enter your WhatsApp configuration"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {connectMutation.isError && (
            <div className="p-3 bg-semanticLight-red border border-semantic-red/30 text-semantic-red text-xs rounded-xl">
              {(connectMutation.error as Error).message}
            </div>
          )}

          {/* Provider Selection */}
          <div>
            <label className="block text-xs font-semibold text-text-l3 mb-1">Provider Type</label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                  watchedProvider === 'MOCK'
                    ? 'border-semantic-green bg-semanticLight-green/50 ring-2 ring-semantic-green/20'
                    : 'border-border-light bg-background-white hover:bg-background-light'
                }`}
              >
                <input type="radio" value="MOCK" {...register('provider')} className="sr-only" />
                <Zap className="w-5 h-5 text-semantic-green shrink-0" />
                <div>
                  <div className="text-xs font-bold text-text-l2">Simulated Mock</div>
                  <div className="text-[10px] text-text-l6">Fast local testing</div>
                </div>
              </label>

              <label
                className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                  watchedProvider === 'META'
                    ? 'border-semantic-blue bg-semanticLight-blue/50 ring-2 ring-semantic-blue/20'
                    : 'border-border-light bg-background-white hover:bg-background-light'
                }`}
              >
                <input type="radio" value="META" {...register('provider')} className="sr-only" />
                <Radio className="w-5 h-5 text-semantic-blue shrink-0" />
                <div>
                  <div className="text-xs font-bold text-text-l2">Meta Cloud API</div>
                  <div className="text-[10px] text-text-l6">Official Graph API v20</div>
                </div>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-l3 mb-1">
              Account Display Name <span className="text-semantic-red">*</span>
            </label>
            <input
              type="text"
              {...register('displayName')}
              placeholder="e.g. Sales WhatsApp Support"
              className="w-full px-3.5 py-2 text-sm bg-background-white border border-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-semantic-green/20 focus:border-semantic-green transition-all text-text-l2"
            />
            {errors.displayName && (
              <p className="text-xs text-semantic-red mt-1">{errors.displayName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-l3 mb-1">
              WhatsApp Phone Number <span className="text-semantic-red">*</span>
            </label>
            <input
              type="text"
              {...register('phoneNumber')}
              placeholder="e.g. +91 98765 43210"
              className="w-full px-3.5 py-2 text-sm bg-background-white border border-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-semantic-green/20 focus:border-semantic-green transition-all font-mono text-text-l2"
            />
            {errors.phoneNumber && (
              <p className="text-xs text-semantic-red mt-1">{errors.phoneNumber.message}</p>
            )}
          </div>

          {/* Meta Cloud Specific Fields */}
          {watchedProvider === 'META' && (
            <div className="p-4 bg-background-light border border-border-light rounded-xl space-y-3 animate-in fade-in duration-150">
              <div>
                <label className="block text-xs font-semibold text-text-l3 mb-1">
                  Meta Phone Number ID <span className="text-semantic-red">*</span>
                </label>
                <input
                  type="text"
                  {...register('phoneNumberId')}
                  placeholder="e.g. 1048291039485"
                  className="w-full px-3.5 py-2 text-sm bg-background-white border border-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-semantic-green/20 focus:border-semantic-green transition-all font-mono text-text-l2"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-l3 mb-1">
                  Meta Permanent Access Token <span className="text-semantic-red">*</span>
                </label>
                <input
                  type="password"
                  {...register('accessToken')}
                  placeholder="EAAG..."
                  className="w-full px-3.5 py-2 text-sm bg-background-white border border-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-semantic-green/20 focus:border-semantic-green transition-all font-mono text-text-l2"
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-light">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-text-l3 bg-background-white border border-border-light rounded-xl hover:bg-background-light transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={connectMutation.isPending}
              className="px-4 py-2 text-sm font-medium text-background-white bg-semantic-green rounded-xl hover:bg-semanticDark-green shadow-sm transition-colors disabled:opacity-50"
            >
              {connectMutation.isPending ? 'Connecting...' : 'Connect Account'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Disconnect Confirmation */}
      <ConfirmDialog
        isOpen={!!disconnectingId}
        onClose={() => setDisconnectingId(null)}
        onConfirm={() => {
          if (disconnectingId) disconnectMutation.mutate(disconnectingId);
        }}
        title="Disconnect WhatsApp Account?"
        message="Are you sure you want to disconnect this WhatsApp account? Automatic message sending via this number will be suspended."
        confirmText="Yes, Disconnect"
        isDangerous={true}
        isLoading={disconnectMutation.isPending}
      />
    </div>
  );
};
