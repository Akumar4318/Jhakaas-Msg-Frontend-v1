import { format, parseISO, isToday, isTomorrow, isYesterday } from 'date-fns';

export function formatDateTime(dateStr?: string | Date): string {
  if (!dateStr) return '-';
  const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
  try {
    return format(date, 'd MMM yyyy, h:mm a');
  } catch {
    return String(dateStr);
  }
}

export function formatDateOnly(dateStr?: string | Date): string {
  if (!dateStr) return '-';
  const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
  try {
    return format(date, 'd MMMM yyyy');
  } catch {
    return String(dateStr);
  }
}

export function formatTimeOnly(dateStr?: string | Date): string {
  if (!dateStr) return '-';
  const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
  try {
    return format(date, 'h:mm a');
  } catch {
    return String(dateStr);
  }
}

export function formatRelativeDate(dateStr?: string | Date): string {
  if (!dateStr) return '-';
  const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
  try {
    if (isToday(date)) return `Today at ${format(date, 'h:mm a')}`;
    if (isTomorrow(date)) return `Tomorrow at ${format(date, 'h:mm a')}`;
    if (isYesterday(date)) return `Yesterday at ${format(date, 'h:mm a')}`;
    return format(date, 'd MMM yyyy, h:mm a');
  } catch {
    return String(dateStr);
  }
}
