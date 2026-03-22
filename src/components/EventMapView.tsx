import { useEffect, useMemo, useRef } from "react";
import L from "leaflet";
import { format } from "date-fns";
import { PublicEvent } from "@/lib/types";
import { MapPin, Info } from "lucide-react";

// Fix default marker icon issue with webpack/vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const DEFAULT_CENTER: [number, number] = [52.52, 13.405]; // Berlin
const TILE_LAYER_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const TILE_LAYER_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const createCustomIcon = (hasExactLocation: boolean) =>
  new L.DivIcon({
    className: "custom-map-marker",
    html: `<div style="
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      background: ${hasExactLocation ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'};
      border: 3px solid hsl(var(--background));
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 3px 12px rgba(0,0,0,0.3);
      transition: transform 0.2s;
    ">
      <svg style="transform: rotate(45deg); width: 16px; height: 16px; fill: hsl(var(--primary-foreground));" viewBox="0 0 24 24">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
        <circle cx="12" cy="10" r="3" fill="hsl(var(--background))" opacity="0.9"/>
      </svg>
    </div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });

const buildPopupHtml = (event: PublicEvent) => {
  const title = escapeHtml(event.title ?? "Untitled event");
  const venue = event.venue ? escapeHtml(event.venue) : null;
  const city = event.city ? escapeHtml(event.city) : null;
  const href = `/events/${event.slug || event.id}`;
  const formattedDate = event.start_at
    ? format(new Date(event.start_at), "EEE, MMM d · h:mm a")
    : "TBD";
  const poster = event.poster_public_url
    ? `<img src="${escapeHtml(event.poster_public_url)}" alt="" style="width:100%; height:100px; object-fit:cover; border-radius:8px; margin-bottom:10px;" />`
    : "";

  return `
    <div style="min-width: 220px; max-width: 280px; padding: 4px 0; color: hsl(var(--foreground)); font-family: system-ui, sans-serif;">
      ${poster}
      <h3 style="margin: 0 0 6px; font-size: 14px; font-weight: 700; line-height: 1.3;">${title}</h3>
      <div style="display:flex; align-items:center; gap:4px; margin-bottom:4px;">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--muted-foreground))" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        <span style="font-size: 12px; color: hsl(var(--muted-foreground));">${escapeHtml(formattedDate)}</span>
      </div>
      ${venue || city ? `
        <div style="display:flex; align-items:center; gap:4px; margin-bottom:8px;">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--muted-foreground))" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          <span style="font-size: 12px; color: hsl(var(--muted-foreground));">${venue ? venue : ''}${venue && city ? ', ' : ''}${city ? city : ''}</span>
        </div>
      ` : ''}
      <a href="${href}" style="
        display: inline-block;
        padding: 6px 14px;
        font-size: 12px;
        font-weight: 600;
        color: hsl(var(--primary-foreground));
        background: hsl(var(--primary));
        border-radius: 6px;
        text-decoration: none;
        transition: opacity 0.2s;
      ">View Details →</a>
    </div>
  `;
};

// Offset overlapping markers slightly
function offsetOverlapping(events: PublicEvent[]): (PublicEvent & { offsetLat: number; offsetLng: number })[] {
  const seen = new Map<string, number>();
  return events.map((e) => {
    const key = `${e.latitude!.toFixed(3)},${e.longitude!.toFixed(3)}`;
    const count = seen.get(key) || 0;
    seen.set(key, count + 1);
    const angle = (count * 60) * (Math.PI / 180);
    const offset = count * 0.0008;
    return {
      ...e,
      offsetLat: e.latitude! + Math.cos(angle) * offset,
      offsetLng: e.longitude! + Math.sin(angle) * offset,
    };
  });
}

interface EventMapViewProps {
  events: PublicEvent[];
}

export function EventMapView({ events }: EventMapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const mappableEvents = useMemo(
    () => events.filter((e) => e.latitude != null && e.longitude != null),
    [events]
  );

  const unmappedEvents = useMemo(
    () => events.filter((e) => e.latitude == null || e.longitude == null),
    [events]
  );

  const exactIcon = useMemo(() => createCustomIcon(true), []);
  const approxIcon = useMemo(() => createCustomIcon(false), []);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: DEFAULT_CENTER,
      zoom: 11,
      zoomControl: true,
    });

    L.tileLayer(TILE_LAYER_URL, {
      attribution: TILE_LAYER_ATTRIBUTION,
    }).addTo(map);

    const markersLayer = L.layerGroup().addTo(map);
    mapRef.current = map;
    markersLayerRef.current = markersLayer;

    requestAnimationFrame(() => map.invalidateSize());

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
      map.setView(DEFAULT_CENTER, 11);
      return;
    }

    const offsetEvents = offsetOverlapping(mappableEvents);

    const bounds = L.latLngBounds(
      offsetEvents.map((e) => [e.offsetLat, e.offsetLng] as [number, number])
    );

    offsetEvents.forEach((event) => {
      const marker = L.marker([event.offsetLat, event.offsetLng], { icon: exactIcon })
        .bindPopup(buildPopupHtml(event), {
          maxWidth: 300,
          className: "custom-leaflet-popup",
        })
        .addTo(markersLayer);

      marker.on("mouseover", function () {
        this.openPopup();
      });
    });

    map.fitBounds(bounds, { padding: [60, 60], maxZoom: 14 });
    requestAnimationFrame(() => map.invalidateSize());
  }, [exactIcon, approxIcon, mappableEvents]);

  return (
    <div className="space-y-3">
      {/* Stats bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card px-4 py-2.5 text-sm">
        <div className="flex items-center gap-1.5 text-foreground font-medium">
          <MapPin className="h-4 w-4 text-primary" />
          <span>{events.length} events total</span>
        </div>
        <span className="text-muted-foreground">·</span>
        <span className="text-muted-foreground">
          {mappableEvents.length} on map
        </span>
        {unmappedEvents.length > 0 && (
          <>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground">
              {unmappedEvents.length} missing location
            </span>
          </>
        )}
      </div>

      {/* Map */}
      <div className="overflow-hidden rounded-xl border border-border">
        <div ref={mapContainerRef} className="z-0 h-[600px] w-full" aria-label="Event map" />
      </div>

      {/* Unmapped events notice */}
      {unmappedEvents.length > 0 && (
        <div className="rounded-lg border border-border bg-muted/50 p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
            <Info className="h-4 w-4 text-muted-foreground" />
            Events not shown on map (missing coordinates)
          </div>
          <div className="flex flex-wrap gap-2">
            {unmappedEvents.map((e) => (
              <a
                key={e.id}
                href={`/events/${e.slug || e.id}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-foreground transition-colors hover:bg-accent"
              >
                {e.title ?? "Untitled"}
                {e.city && (
                  <span className="text-muted-foreground">· {e.city}</span>
                )}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
