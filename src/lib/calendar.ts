import { Event } from "./types";
import { format, parseISO } from "date-fns";

export function generateGoogleCalendarUrl(event: Event): string {
  const startDate = parseISO(event.start_at);
  const endDate = event.end_at ? parseISO(event.end_at) : new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // Default 2 hours

  const formatForGoogle = (date: Date) => format(date, "yyyyMMdd'T'HHmmss");

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${formatForGoogle(startDate)}/${formatForGoogle(endDate)}`,
    ctz: event.timezone || "Europe/Berlin",
    details: event.description || "",
    location: [event.venue, event.address, event.city].filter(Boolean).join(", "),
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function generateICSContent(event: Event): string {
  const startDate = parseISO(event.start_at);
  const endDate = event.end_at ? parseISO(event.end_at) : new Date(startDate.getTime() + 2 * 60 * 60 * 1000);

  const formatForICS = (date: Date) => format(date, "yyyyMMdd'T'HHmmss");

  const location = [event.venue, event.address, event.city].filter(Boolean).join(", ");

  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//TinyTinyEvents//Event//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
DTSTART:${formatForICS(startDate)}
DTEND:${formatForICS(endDate)}
SUMMARY:${event.title}
DESCRIPTION:${(event.description || "").replace(/\n/g, "\\n")}
LOCATION:${location}
UID:${event.id}@tinytinyevents.com
END:VEVENT
END:VCALENDAR`;

  return icsContent;
}

export function downloadICS(event: Event): void {
  const icsContent = generateICSContent(event);
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.href = url;
  link.download = `${event.slug || event.id}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
