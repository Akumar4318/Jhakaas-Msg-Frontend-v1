import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { Contact } from '../types';
import { ContactModal } from '../components/contacts/ContactModal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { EmptyState } from '../components/common/EmptyState';
import {
  Users,
  Plus,
  Search,
  Phone,
  MessageSquare,
  Edit2,
  Trash2,
  Globe,
} from 'lucide-react';

export const ContactsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [deletingContactId, setDeletingContactId] = useState<string | null>(null);

  const { data: contactsData, isLoading } = useQuery<Contact[]>({
    queryKey: ['contacts', search],
    queryFn: async () => {
      const res: any = await apiClient.get('/contacts', {
        params: { search },
      });
      return res.data || res;
    },
  });

  const contacts = Array.isArray(contactsData) ? contactsData : [];

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiClient.delete(`/contacts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      setDeletingContactId(null);
    },
  });

  return (
    <div className="space-y-6 font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-l1">Contacts Directory</h1>
          <p className="text-xs text-text-l5 mt-1">
            Manage recipient contacts and normalized E.164 WhatsApp numbers
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditingContact(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-background-white bg-semantic-green hover:bg-semanticDark-green rounded-xl shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Contact</span>
        </button>
      </div>

      {/* Search Input Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-text-l7 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or phone number..."
          className="w-full pl-10 pr-4 py-2 text-sm bg-background-white border border-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-semantic-green/20 focus:border-semantic-green transition-all shadow-sm text-text-l2"
        />
      </div>

      {/* Contacts List Grid */}
      {isLoading ? (
        <div className="py-12 text-center text-xs text-text-l6">Loading contacts...</div>
      ) : contacts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="p-5 bg-background-white rounded-2xl border border-border-light shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-semanticLight-green text-semanticDark-green flex items-center justify-center font-bold text-sm">
                      {contact.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-text-l1 leading-tight">
                        {contact.name}
                      </h3>
                      <div className="text-xs font-mono text-text-l5 mt-0.5 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-text-l7" />
                        <span>{contact.normalizedPhone || contact.phone}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingContact(contact);
                        setIsModalOpen(true);
                      }}
                      className="p-1.5 text-text-l6 hover:text-text-l2 hover:bg-background-light rounded-lg transition-colors"
                      title="Edit Contact"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingContactId(contact.id)}
                      className="p-1.5 text-text-l6 hover:text-semantic-red hover:bg-semanticLight-red rounded-lg transition-colors"
                      title="Delete Contact"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {contact.notes && (
                  <p className="text-xs text-text-l5 mt-3 line-clamp-2 bg-background-light p-2 rounded-lg border border-border-light">
                    {contact.notes}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-border-light flex items-center justify-between text-xs text-text-l6">
                <span className="flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  <span>{contact.timezone || 'Asia/Kolkata'}</span>
                </span>
                <span className="flex items-center gap-1 text-semanticDark-green bg-semanticLight-green px-2 py-0.5 rounded-full font-medium text-[11px] border border-semantic-green/30">
                  <MessageSquare className="w-3 h-3" />
                  <span>{contact._count?.scheduledMessages || 0} scheduled</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Users}
          title="No contacts found"
          description={
            search
              ? `No contacts match "${search}". Try another keyword.`
              : 'Add contacts to start scheduling automated WhatsApp messages.'
          }
          actionLabel="Add First Contact"
          onAction={() => {
            setEditingContact(null);
            setIsModalOpen(true);
          }}
        />
      )}

      {/* Add / Edit Contact Modal */}
      <ContactModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        contact={editingContact}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingContactId}
        onClose={() => setDeletingContactId(null)}
        onConfirm={() => {
          if (deletingContactId) deleteMutation.mutate(deletingContactId);
        }}
        title="Delete Contact?"
        message="Are you sure you want to delete this contact? Any pending scheduled messages for this contact will also be removed."
        confirmText="Yes, Delete Contact"
        isDangerous={true}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
