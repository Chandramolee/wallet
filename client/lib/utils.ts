
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { addDays, addMonths, addWeeks, addYears } from "date-fns";
import { RecurringIntervalEnum } from "./types/transaction";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const convertToCents = (amount: number) => {
  if (isNaN(amount)) return 0;
  return Math.round(amount * 100);
};

export const convertToDollarUnit = (amount: number) => {
  if (isNaN(amount)) return 0;
  return amount / 100;
};

export function calculateNextOccurrence(
  date: Date,
  recurringInterval: keyof typeof RecurringIntervalEnum
) {
  const base = new Date(date);
  base.setHours(0, 0, 0, 0);

  switch (recurringInterval) {
    case RecurringIntervalEnum.DAILY:
      return addDays(base, 1);
    case RecurringIntervalEnum.WEEKLY:
      return addWeeks(base, 1);
    case RecurringIntervalEnum.MONTHLY:
      return addMonths(base, 1);
    case RecurringIntervalEnum.YEARLY:
      return addYears(base, 1);
    default:
      return base;
  }
}

export function calulateNextReportDate(lastSentDate?: Date): Date {
  const now = new Date();
  const baseDate = lastSentDate || now;
  return addMonths(baseDate, 1);
}
