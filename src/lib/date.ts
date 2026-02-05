import { format, formatDistanceToNow, isToday, isTomorrow, isThisWeek, parseISO } from "date-fns";

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
