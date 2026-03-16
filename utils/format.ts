import dayjs from 'dayjs';
import 'dayjs/locale/es';
import relativeTime from 'dayjs/plugin/relativeTime';
import localizedFormat from 'dayjs/plugin/localizedFormat';

dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);
dayjs.locale('es');

export function formatCurrency(amount: number, showSign = false): string {
  const formatted = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount));

  if (showSign && amount > 0) return `+${formatted}`;
  if (showSign && amount < 0) return `-${formatted}`;
  return formatted;
}

// Parses date-only strings (YYYY-MM-DD) ignoring timezone to avoid day-shift
function parseLocalDate(date: string | Date): ReturnType<typeof dayjs> {
  if (typeof date === 'string') return dayjs(date.substring(0, 10));
  return dayjs(date);
}

export function formatDate(date: string | Date, format = 'D [de] MMMM, YYYY'): string {
  return parseLocalDate(date).format(format);
}

export function formatShortDate(date: string | Date): string {
  return parseLocalDate(date).format('DD/MM/YYYY');
}

export function formatMonth(date: string | Date): string {
  return dayjs(date).format('MMMM YYYY');
}

export function formatDayOfWeek(date: string | Date): string {
  return parseLocalDate(date).format('ddd');
}

export function formatRelativeTime(date: string | Date): string {
  return dayjs(date).fromNow();
}

export function getCurrentMonth(): string {
  return dayjs().format('YYYY-MM');
}

export function getMonthStart(month?: string): string {
  return dayjs(month || undefined).startOf('month').toISOString();
}

export function getMonthEnd(month?: string): string {
  return dayjs(month || undefined).endOf('month').toISOString();
}

export function getWeekDays(): string[] {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    days.push(dayjs().subtract(i, 'day').format('ddd'));
  }
  return days;
}

export function toISODate(date: Date | string): string {
  return parseLocalDate(date).format('YYYY-MM-DD');
}
