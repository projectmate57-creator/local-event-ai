import { useEffect } from "react";
import { PublicEvent } from "@/lib/types";

const BASE_URL = "https://local-event-ai.lovable.app";

interface EventJsonLdProps {
  event: PublicEvent;
}

export function EventJsonLd({ event }: EventJsonLdProps) {
  useEffect(() => {
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Event",
      name: event.title,
      description: event.description || undefined,
      startDate: event.start_at,
      endDate: event.end_at || undefined,
      url: `${BASE_URL}/events/${event.slug || event.id}`,
      image: event.poster_public_url || undefined,
      eventStatus: "https://schema.org/EventScheduled",
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      location: {
        "@type": "Place",
        name: event.venue || event.city,
        address: {
          "@type": "PostalAddress",
          streetAddress: event.address || undefined,
          addressLocality: event.city,
        },
        ...(event.latitude && event.longitude
          ? {
              geo: {
                "@type": "GeoCoordinates",
                latitude: event.latitude,
                longitude: event.longitude,
              },
            }
          : {}),
      },
      ...(event.ticket_url
        ? {
            offers: {
              "@type": "Offer",
              url: event.ticket_url,
              availability: "https://schema.org/InStock",
            },
          }
        : {}),
      organizer: {
        "@type": "Organization",
        name: "TinyTinyEvents",
        url: BASE_URL,
      },
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "event-jsonld";
    script.textContent = JSON.stringify(jsonLd);

    // Remove existing
    document.getElementById("event-jsonld")?.remove();
    document.head.appendChild(script);

    return () => {
      document.getElementById("event-jsonld")?.remove();
    };
  }, [event]);

  return null;
}

export function EventListJsonLd({ events }: { events: PublicEvent[] }) {
  useEffect(() => {
    if (!events.length) return;

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: events.slice(0, 20).map((event, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${BASE_URL}/events/${event.slug || event.id}`,
        name: event.title,
      })),
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "event-list-jsonld";
    script.textContent = JSON.stringify(jsonLd);

    document.getElementById("event-list-jsonld")?.remove();
    document.head.appendChild(script);

    return () => {
      document.getElementById("event-list-jsonld")?.remove();
    };
  }, [events]);

  return null;
}
