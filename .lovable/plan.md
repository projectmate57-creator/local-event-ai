
Goal: make the Events map actually useful instead of showing two vague black dots.

What I found
- The map is working technically, but it only plots events that have `latitude` and `longitude`.
- In the current data, there are 11 upcoming public events, but only 2 have coordinates. That is why only 2 markers appear.
- The current marker design is also too generic, so even those 2 pins are hard to understand at a glance.

Plan

1. Fix the real issue: missing coordinates
- Add automatic geocoding when event data is extracted/saved/published.
- Use the event’s address first, then `venue + city`, then city as fallback.
- Store the result in the existing `latitude` / `longitude` columns.
- Backfill existing published events so the 9 unmapped events can appear too.

2. Make the map explain itself
- Add a summary bar above the map:
  - “11 events total”
  - “2 mapped”
  - “9 missing location”
- If some events are missing coordinates, show a small list or notice with their names so the user knows they are not lost.

3. Replace the black dots with useful markers
- Switch to branded/custom markers with clearer styling.
- Show a number or count badge for overlapping/nearby events.
- Add hover/selected state so the active marker is obvious.

4. Improve event identification on the map
- Upgrade popups to show:
  - poster thumbnail
  - title
  - date/time
  - venue/city
  - “View details” link
- Optionally sync the map with a small side/bottom event list so clicking a card highlights the marker.

5. Handle overlapping Berlin events better
- Add marker clustering or spiderfy behavior for close pins.
- Keep `fitBounds`, but prevent markers in the same area from hiding each other.

6. Add a fallback for events without exact addresses
- If full address geocoding fails, place a softer “city-level” marker using the city center.
- Visually distinguish approximate locations from exact ones.

Technical approach
- Keep using plain Leaflet; do not reintroduce React map wrappers.
- Frontend:
  - enhance `src/components/EventMapView.tsx` with better markers, richer popups, clustering/overlap handling, and map stats
  - optionally update `src/pages/EventsPage.tsx` to pass mapped/unmapped counts cleanly
- Backend:
  - extend extraction/publish flow so coordinates are generated automatically
  - backfill existing events with missing coordinates using current address/venue/city data
- Database:
  - no required schema change for basic improvement, since coordinate columns already exist

Recommended implementation order
1. Auto-geocode + backfill existing events
2. Add map stats (“mapped vs unmapped”)
3. Replace markers/popups
4. Add clustering/overlap handling
5. Add approximate city-level fallback markers

Expected result
- The map will show most or all of the 11 upcoming events.
- Users will immediately understand what each marker represents.
- Berlin-area overlap will be manageable instead of looking like two random black dots.
