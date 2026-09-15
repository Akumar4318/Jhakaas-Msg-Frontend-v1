import React, { useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin, { EventDropArg, DateClickArg } from '@fullcalendar/interaction';
import { EventClickArg, DatesSetArg } from '@fullcalendar/core';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { CalendarEventItem, MessageStatus } from '../../types';
import { getStatusConfig } from '../../utils/status.util';
import clsx from 'clsx';
import { formatTimeOnly } from '../../utils/date.util';

interface CalendarViewProps {
  onSelectSlot: (dateStr: string) => void;
  onSelectMessage: (messageId: string) => void;
  onSelectHoliday?: (holidayId: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  onSelectSlot,
  onSelectMessage,
}) => {
  const calendarRef = useRef<FullCalendar | null>(null);
  const queryClient = useQueryClient();

  // State to hold current visible calendar date range
  const [dateRange, setDateRange] = React.useState<{ start?: string; end?: string }>({});

  // Fetch Calendar Events for visible range
  const { data, isLoading } = useQuery<{ events: CalendarEventItem[] }>({
    queryKey: ['calendar-events', dateRange.start, dateRange.end],
    queryFn: async () => {
      const res: any = await apiClient.get('/messages/calendar', {
        params: {
          start: dateRange.start,
          end: dateRange.end,
        },
      });
      return res.data || res;
    },
    enabled: !!dateRange.start && !!dateRange.end,
  });

  const events = data?.events || [];

  // Drag & Drop Mutation
  const dragDropMutation = useMutation({
    mutationFn: async ({ messageId, newScheduledAt }: { messageId: string; newScheduledAt: string }) => {
      return apiClient.patch(`/messages/${messageId}`, {
        scheduledAt: newScheduledAt,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      queryClient.invalidateQueries({ queryKey: ['message-history'] });
    },
    onError: (error: any, variables, context: any) => {
      alert(`Could not reschedule message: ${error.message}`);
      if (context?.revert) {
        context.revert();
      }
    },
  });

  const handleDatesSet = (dateInfo: DatesSetArg) => {
    setDateRange({
      start: dateInfo.startStr,
      end: dateInfo.endStr,
    });
  };

  const handleDateClick = (arg: DateClickArg) => {
    onSelectSlot(arg.dateStr);
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const ext = clickInfo.event.extendedProps;
    if (ext.type === 'MESSAGE') {
      onSelectMessage(clickInfo.event.id);
    }
  };

  const handleEventDrop = (dropInfo: EventDropArg) => {
    const event = dropInfo.event;
    const ext = event.extendedProps;

    if (ext.type !== 'MESSAGE' || ext.status !== 'SCHEDULED') {
      dropInfo.revert();
      return;
    }

    const newStart = event.start;
    if (!newStart) {
      dropInfo.revert();
      return;
    }

    if (newStart.getTime() < Date.now() - 30000) {
      alert('Cannot drag messages to a past date or time.');
      dropInfo.revert();
      return;
    }

    dragDropMutation.mutate({
      messageId: event.id,
      newScheduledAt: newStart.toISOString(),
    });
  };

  // Custom Event Element Renderer
  const renderEventContent = (eventInfo: any) => {
    const ext = eventInfo.event.extendedProps;

    // 1. Holiday Banner
    if (ext.type === 'HOLIDAY') {
      return (
        <div className="w-full px-2 py-1 rounded-md bg-semanticLight-yellow border border-semantic-yellow/50 text-semanticDark-yellow text-xs font-medium flex items-center gap-1 shadow-sm truncate">
          <span>🎉</span>
          <span className="font-semibold truncate">{ext.holidayName || eventInfo.event.title}</span>
        </div>
      );
    }

    // 2. Scheduled WhatsApp Message Event
    const status = ext.status as MessageStatus;
    const config = getStatusConfig(status);
    const timeStr = eventInfo.event.start ? formatTimeOnly(eventInfo.event.start) : '';

    return (
      <div
        className={clsx(
          'w-full px-2 py-1 rounded-lg border text-xs flex flex-col gap-0.5 shadow-sm transition-all hover:shadow cursor-pointer',
          config.badgeClass,
        )}
      >
        <div className="flex items-center justify-between gap-1 font-semibold leading-tight truncate">
          <div className="flex items-center gap-1 truncate">
            <span className={clsx('w-1.5 h-1.5 rounded-full shrink-0', config.dotClass)} />
            <span className="truncate">{ext.contactName || 'Recipient'}</span>
          </div>
          <span className="text-[10px] opacity-75 font-mono shrink-0">{timeStr}</span>
        </div>
        <div className="text-[11px] opacity-90 truncate leading-snug">
          {ext.message}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-background-white rounded-2xl border border-border-light p-6 shadow-sm relative font-mono">
      {isLoading && (
        <div className="absolute top-4 right-4 flex items-center gap-2 text-xs text-text-l6">
          <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-semantic-green"></div>
          <span>Syncing calendar...</span>
        </div>
      )}

      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        datesSet={handleDatesSet}
        events={events}
        eventContent={renderEventContent}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        eventDrop={handleEventDrop}
        editable={true}
        selectable={true}
        dayMaxEvents={4}
        nowIndicator={true}
        height="auto"
        aspectRatio={1.6}
      />
    </div>
  );
};
