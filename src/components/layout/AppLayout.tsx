import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ScheduleMessageModal } from '../messages/ScheduleMessageModal';
import { ContactModal } from '../contacts/ContactModal';

export const AppLayout: React.FC = () => {
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [initialSlotDate, setInitialSlotDate] = useState<string | undefined>();

  const handleOpenSchedule = (dateStr?: string) => {
    setInitialSlotDate(dateStr);
    setIsScheduleOpen(true);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <Sidebar onOpenScheduleModal={() => handleOpenSchedule()} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onOpenScheduleModal={() => handleOpenSchedule()} />
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet context={{ onOpenScheduleModal: handleOpenSchedule, onOpenContactModal: () => setIsContactOpen(true) }} />
        </main>
      </div>

      {/* Global Schedule Message Modal */}
      <ScheduleMessageModal
        isOpen={isScheduleOpen}
        onClose={() => {
          setIsScheduleOpen(false);
          setInitialSlotDate(undefined);
        }}
        initialDate={initialSlotDate}
        onOpenAddContact={() => setIsContactOpen(true)}
      />

      {/* Global Contact Modal */}
      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />
    </div>
  );
};
