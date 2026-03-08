

# Add Interactive Map View to Events Page

## Overview

Add a toggle on the Events page to switch between the current grid/list view and an interactive map view showing event locations as clickable pins. Uses **Leaflet** (free, no API key needed).

## Approach

### Database Change

Add `latitude` and `longitude` columns to the `events` table so we can plot events on a map. Also add them to the `events_public` view.

```sql
ALTER TABLE public.events ADD COLUMN latitude double precision;
ALTER TABLE public.events ADD COLUMN longitude double precision;
```

Update the `events_public` view to include `latitude` and `longitude`.

### Dependencies

- `leaflet` + `react-leaflet` + `@types/leaflet` for the map component

### New Files

- **`src/components/EventMapView.tsx`** — Leaflet map component that renders event markers with popups containing event title, date, venue, and a "View Details" link. Default center on Europe (or auto-fit bounds to visible events).

### Modified Files

- **`src/pages/EventsPage.tsx`** — Add a List/Map toggle button group above the events grid. When "Map" is selected, render `EventMapView` instead of the card grid. Pass filtered events to both views.

- **`src/lib/types.ts`** — Add `latitude` and `longitude` (both `number | null`) to `PublicEvent` interface.

- **`src/index.css`** — Import Leaflet CSS (`leaflet/dist/leaflet.css`).

### Geocoding Strategy

Events don't have coordinates yet. Two options:
1. **Manual** — Admin can add lat/lng when editing events
2. **Auto-geocode** — Use a free geocoding API (Nominatim) in the `extract` or `submit-poster` edge function to convert city+address to coordinates on event creation

For now, the map will only show events that have coordinates. Events without coordinates gracefully fall back to the grid view only. We can add auto-geocoding as a follow-up.

### UI Details

- Toggle between grid icon and map icon, placed next to the existing sort controls in `FiltersBar`
- Map fills the same content area as the grid
- Markers use a custom pin colored with the app's primary color
- Clicking a marker shows a popup with: event title, date, venue, and a link to `/events/:slug`
- Map respects all active filters (search, city, date range)

