import { format, formatDistanceToNow, isToday, isTomorrow, isThisWeek, parseISO, differenceInDays, isSameDay, isSameMonth, isSameYear } from "date-fns";

export function formatEventDate(dateString: string): string {
  const date = parseISO(dateString);
  
  if (isToday(date)) {
    return `Today at ${format(date, "h:mm a")}`;
  }
  
  if (isTomorrow(date)) {
    return `Tomorrow at ${format(date, "h:mm a")}`;
  }
  
  if (isThisWeek(date)) {
    return format(date, "EEEE 'at' h:mm a");
  }
  
  return format(date, "MMM d, yyyy 'at' h:mm a");
}

export function formatEventDateRange(start: string, end: string | null): string {
  const startDate = parseISO(start);
  const startFormatted = formatEventDate(start);
  
  if (!end) {
    return startFormatted;
  }
  
  const endDate = parseISO(end);
  const sameDay = format(startDate, "yyyy-MM-dd") === format(endDate, "yyyy-MM-dd");
  
  if (sameDay) {
    return `${startFormatted} - ${format(endDate, "h:mm a")}`;
  }
  
  return `${startFormatted} - ${format(endDate, "MMM d 'at' h:mm a")}`;
}

export function formatRelativeTime(dateString: string): string {
  const date = parseISO(dateString);
  return formatDistanceToNow(date, { addSuffix: true });
}

export interface EventDuration {
  days: number;
  label: string;
}

export function getEventDuration(start: string, end: string | null): EventDuration | null {
  if (!end) return null;
  
  const startDate = parseISO(start);
  const endDate = parseISO(end);
  const days = differenceInDays(endDate, startDate);
  
  if (days <= 0) return null;
  
  let label: string;
  if (days === 1) {
    label = "2 days";
  } else if (days < 7) {
    label = `${days + 1} days`;
  } else if (days === 7) {
    label = "1 week";
  } else if (days < 14) {
    label = `${Math.ceil((days + 1) / 7)} weeks`;
  } else if (days < 28) {
    label = `${Math.round((days + 1) / 7)} weeks`;
  } else if (days < 60) {
    label = "1 month";
  } else {
    label = `${Math.round((days + 1) / 30)} months`;
  }
  
  return { days: days + 1, label };
}

export function formatCompactDateRange(start: string, end: string | null): string {
  const startDate = parseISO(start);
  
  if (!end) {
    return format(startDate, "MMM d, yyyy");
  }
  
  const endDate = parseISO(end);
  
  if (isSameDay(startDate, endDate)) {
    return format(startDate, "MMM d, yyyy");
  }
  
  if (isSameMonth(startDate, endDate)) {
    return `${format(startDate, "MMM d")} - ${format(endDate, "d, yyyy")}`;
  }
  
  if (isSameYear(startDate, endDate)) {
    return `${format(startDate, "MMM d")} - ${format(endDate, "MMM d, yyyy")}`;
  }
  
  return `${format(startDate, "MMM d, yyyy")} - ${format(endDate, "MMM d, yyyy")}`;
}

export function getDateRangeFilter(range: "today" | "week" | "month" | "all") {
  const now = new Date();
  
  switch (range) {
    case "today":
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const todayEnd = new Date(todayStart);
      todayEnd.setDate(todayEnd.getDate() + 1);
      return { start: todayStart.toISOString(), end: todayEnd.toISOString() };
    
    case "week":
      const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);
      return { start: weekStart.toISOString(), end: weekEnd.toISOString() };
    
    case "month":
      const monthStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);
      return { start: monthStart.toISOString(), end: monthEnd.toISOString() };
    
    default:
      return null;
  }
}
