import { useEffect, useMemo, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { PublicEvent } from "@/lib/types";
import { MapPin, Calendar, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

// Fix default marker icon issue with webpack/vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Custom marker icon using primary color
const createCustomIcon = () =>
  new L.DivIcon({
    className: "custom-map-marker",
    html: `<div style="
      width: 28px; height: 28px;
      background: hsl(var(--primary));
      border: 3px solid hsl(var(--background));
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  });

function FitBounds({ events }: { events: PublicEvent[] }) {
  const map = useMap();

  useEffect(() => {
    const coords = events
      .filter((e) => e.latitude != null && e.longitude != null)
      .map((e) => [e.latitude!, e.longitude!] as [number, number]);

    if (coords.length > 0) {
      const bounds = L.latLngBounds(coords);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [events, map]);

  return null;
}

interface EventMapViewProps {
  events: PublicEvent[];
}

export function EventMapView({ events }: EventMapViewProps) {
  const mappableEvents = useMemo(
    () => events.filter((e) => e.latitude != null && e.longitude != null),
    [events]
  );

  const customIcon = useMemo(() => createCustomIcon(), []);

  if (mappableEvents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-20 text-center">
        <MapPin className="mb-4 h-16 w-16 text-muted-foreground/50" />
        <h2 className="mb-2 text-xl font-semibold text-foreground">
          No map data available
        </h2>
        <p className="text-muted-foreground">
          Events don't have location coordinates yet. Switch to grid view to browse.
        </p>
      </div>
    );
  }

  // Default center: Europe
  const defaultCenter: [number, number] = [51.1657, 10.4515];

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <MapContainer
        center={defaultCenter}
        zoom={5}
        style={{ height: "600px", width: "100%" }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds events={mappableEvents} />
        {mappableEvents.map((event) => (
          <Marker
            key={event.id}
            position={[event.latitude!, event.longitude!]}
            icon={customIcon}
          >
            <Popup>
              <div className="min-w-[200px] space-y-2 p-1">
                <h3 className="text-sm font-bold leading-tight">{event.title}</h3>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {event.start_at ? format(new Date(event.start_at), "MMM d, yyyy · h:mm a") : "TBD"}
                </div>
                {event.venue && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {event.venue}
                  </div>
                )}
                <Link
                  to={`/events/${event.slug || event.id}`}
                  className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  View Details <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
