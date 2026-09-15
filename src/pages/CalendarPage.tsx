import React, { useState } from 'react';
import { CalendarView } from '../components/calendar/CalendarView';
import { EditMessageDrawer } from '../components/messages/EditMessageDrawer';
import { useOutletContext } from 'react-router-dom';

interface LayoutContext {
  onOpenScheduleModal: (dateStr?: string) => void;
  onOpenContactModal: () => void;
}

export const CalendarPage: React.FC = () => {
  const { onOpenScheduleModal } = useOutletContext<LayoutContext>();
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);

  const handleSelectSlot = (dateStr: string) => {
    onOpenScheduleModal(dateStr);
  };

  const handleSelectMessage = (messageId: string) => {
    setSelectedMessageId(messageId);
  };

  const handleDuplicate = () => {
    onOpenScheduleModal();
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-text-l1 headline-medium">Message Calendar</h1>
            <span className="text-xs bg-semanticLight-green text-semanticDark-green font-semibold px-2 py-0.5 rounded-full border border-semantic-green/30">
              Live View
            </span>
          </div>
          <p className="text-xs text-text-l5 mt-1 body-text-secondary">
            Click any empty date or time slot to schedule a message. Drag & drop events to reschedule instantly.
          </p>
        </div>

        {/* Standard Design Legend */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium text-text-l3 bg-background-white border border-border-light px-3 py-1.5 rounded-xl shadow-sm">
          <span className="text-text-l6 font-semibold text-[10px] uppercase">Legend:</span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-semantic-blue" /> Scheduled
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-semantic-green" /> Sent
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-semantic-red" /> Failed
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-semantic-orange" /> Skipped
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-semantic-yellow" /> 🎉 Holiday
          </span>
        </div>
      </div>

      {/* Calendar Core View */}
      <CalendarView
        onSelectSlot={handleSelectSlot}
        onSelectMessage={handleSelectMessage}
      />

      {/* Edit Drawer */}
      <EditMessageDrawer
        isOpen={!!selectedMessageId}
        onClose={() => setSelectedMessageId(null)}
        messageId={selectedMessageId}
        onOpenScheduleDuplicate={handleDuplicate}
      />
    </div>
  );
};
