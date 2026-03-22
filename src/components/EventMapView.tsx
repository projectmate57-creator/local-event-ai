import { useEffect, useMemo, useRef } from "react";
import L from "leaflet";
import { format } from "date-fns";
import { PublicEvent } from "@/lib/types";
import { MapPin } from "lucide-react";

// Fix default marker icon issue with webpack/vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const DEFAULT_CENTER: [number, number] = [51.1657, 10.4515];
const TILE_LAYER_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const TILE_LAYER_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const createCustomIcon = () =>
  new L.DivIcon({
    className: "custom-map-marker",
    html: `<div style="
      width: 28px;
      height: 28px;
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

const buildPopupHtml = (event: PublicEvent) => {
  const title = escapeHtml(event.title ?? "Untitled event");
  const venue = event.venue ? escapeHtml(event.venue) : null;
  const href = `/events/${event.slug || event.id}`;
  const formattedDate = event.start_at
    ? format(new Date(event.start_at), "MMM d, yyyy · h:mm a")
    : "TBD";

  return `
    <div style="min-width: 200px; padding: 4px 2px; color: hsl(var(--foreground));">
      <h3 style="margin: 0 0 8px; font-size: 14px; font-weight: 700; line-height: 1.3;">${title}</h3>
      <p style="margin: 0 0 6px; font-size: 12px; color: hsl(var(--muted-foreground));">${escapeHtml(formattedDate)}</p>
      ${venue ? `<p style="margin: 0 0 10px; font-size: 12px; color: hsl(var(--muted-foreground));">${venue}</p>` : ""}
      <a href="${href}" style="font-size: 12px; font-weight: 600; color: hsl(var(--primary)); text-decoration: none;">View Details →</a>
    </div>
  `;
};

interface EventMapViewProps {
  events: PublicEvent[];
}

export function EventMapView({ events }: EventMapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const mappableEvents = useMemo(
    () => events.filter((event) => event.latitude != null && event.longitude != null),
    [events]
  );

  const customIcon = useMemo(() => createCustomIcon(), []);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: DEFAULT_CENTER,
      zoom: 5,
      zoomControl: true,
    });

    L.tileLayer(TILE_LAYER_URL, {
      attribution: TILE_LAYER_ATTRIBUTION,
    }).addTo(map);

    const markersLayer = L.layerGroup().addTo(map);

    mapRef.current = map;
    markersLayerRef.current = markersLayer;

    requestAnimationFrame(() => {
      map.invalidateSize();
    });

    return () => {
      markersLayer.clearLayers();
      map.remove();
      markersLayerRef.current = null;
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const markersLayer = markersLayerRef.current;

    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    if (mappableEvents.length === 0) {
      map.setView(DEFAULT_CENTER, 5);
      return;
    }

    const bounds = L.latLngBounds(
      mappableEvents.map((event) => [event.latitude!, event.longitude!] as [number, number])
    );

    mappableEvents.forEach((event) => {
      L.marker([event.latitude!, event.longitude!], { icon: customIcon })
        .bindPopup(buildPopupHtml(event))
        .addTo(markersLayer);
    });

    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    requestAnimationFrame(() => {
      map.invalidateSize();
    });
  }, [customIcon, mappableEvents]);

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

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <div ref={mapContainerRef} className="z-0 h-[600px] w-full" aria-label="Event map" />
    </div>
  );
}
