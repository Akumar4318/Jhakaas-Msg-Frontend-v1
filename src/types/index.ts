export type MessageStatus =
  | 'SCHEDULED'
  | 'QUEUED'
  | 'PROCESSING'
  | 'SENT'
  | 'DELIVERED'
  | 'READ'
  | 'FAILED'
  | 'CANCELLED'
  | 'SKIPPED_HOLIDAY'
  | 'SKIPPED_WEEKEND';

export type HolidayBehavior = 'DO_NOT_SEND' | 'SEND_ANYWAY' | 'MOVE_TO_NEXT_WORKING_DAY';
export type WeekendBehavior = 'DO_NOT_SEND' | 'SEND_ANYWAY' | 'MOVE_TO_NEXT_WORKING_DAY';

export interface User {
  id: string;
  name: string;
  email: string;
  timezone: string;
  workingDays: number[];
  createdAt: string;
}

export interface Contact {
  id: string;
  userId: string;
  name: string;
  phone: string;
  normalizedPhone: string;
  country?: string;
  timezone?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    scheduledMessages: number;
  };
}

export interface ScheduledMessage {
  id: string;
  userId: string;
  contactId: string;
  whatsappAccountId?: string;
  message: string;
  scheduledAt: string;
  timezone: string;
  status: MessageStatus;
  holidayBehavior: HolidayBehavior;
  weekendBehavior: WeekendBehavior;
  retryCount: number;
  maxRetries: number;
  providerMessageId?: string;
  sentAt?: string;
  failedAt?: string;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
  contact?: Contact;
  events?: MessageEvent[];
}

export interface MessageEvent {
  id: string;
  messageId: string;
  eventType: string;
  providerMessageId?: string;
  payload?: any;
  createdAt: string;
}

export interface Holiday {
  id: string;
  userId: string;
  name: string;
  date: string; // YYYY-MM-DD
  description?: string;
  createdAt: string;
}

export interface WhatsAppAccount {
  id: string;
  provider: 'META' | 'MOCK';
  phoneNumber: string;
  displayName: string;
  status: 'CONNECTED' | 'DISCONNECTED' | 'PENDING';
  providerAccountId?: string;
  createdAt: string;
}

export interface CalendarEventItem {
  id: string;
  title: string;
  start: string;
  end?: string;
  allDay?: boolean;
  editable?: boolean;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  extendedProps: {
    type: 'MESSAGE' | 'HOLIDAY';
    status?: MessageStatus;
    contactId?: string;
    contactName?: string;
    contactPhone?: string;
    message?: string;
    timezone?: string;
    holidayBehavior?: HolidayBehavior;
    weekendBehavior?: WeekendBehavior;
    failureReason?: string;
    providerMessageId?: string;
    sentAt?: string;
    holidayName?: string;
    description?: string;
  };
}

export interface DashboardSummary {
  metrics: {
    scheduled: number;
    sent: number;
    failed: number;
    skipped: number;
    skippedHoliday: number;
    skippedWeekend: number;
    cancelled: number;
    totalContacts: number;
  };
  upcomingMessages: ScheduledMessage[];
  recentActivity: ScheduledMessage[];
}
