

# Fix Events Page Bugs

## Issues Found

1. **Past events still visible**: When the "All" date filter is selected (the default), the query fetches ALL events including past ones. Events whose date has passed should be hidden by default -- "All" should mean "all upcoming", not "all time."

2. **Pagination race condition**: `handleLoadMore` calls `setPage(prev => prev + 1)` then immediately calls `fetchEvents(false)`. Because React state updates are asynchronous, `fetchEvents` reads the OLD `page` value, causing duplicate or missing results.

3. **Filter changes don't properly reset state**: When filters change, `fetchEvents(true)` is called and sets `page` to 1 inside, but the offset calculation uses the stale `page` state value during that same render cycle.

---

## Fixes

### 1. Hide past events by default (EventsPage.tsx)

Add a baseline filter `start_at >= now()` to the query when `dateRange` is `"all"`. This ensures only future (or ongoing) events are shown. The specific date range filters (Today, This Week, This Month) already handle their own bounds, so this only applies to the "All" case.

### 2. Fix pagination race condition (EventsPage.tsx)

Refactor to use `useEffect` for both filter changes AND page changes:
- Split `fetchEvents` so `page` is passed as a parameter rather than read from state
- Use a separate `useEffect` watching `page` to trigger "load more" fetches
- Or simpler: pass the correct offset directly into `handleLoadMore` by computing it before the state update

### 3. Ensure clean filter resets (EventsPage.tsx)

When filters change, reset `page` to 0 and replace events. The `useEffect` already calls `fetchEvents(true)`, but the offset calculation needs to consistently use 0 for new filters (which it does via the `isNewFilter` flag -- this part is correct but the page state sync needs fixing).

---

## Technical Changes

**File: `src/pages/EventsPage.tsx`**

- Add `gte("start_at", new Date().toISOString())` to the base query (before any date range filter) so past events are excluded
- Refactor `fetchEvents` to accept a `pageOffset` parameter instead of reading from `page` state, eliminating the race condition
- Update `handleLoadMore` to compute the next page value and pass it directly
- Keep the `useEffect` on `[filters]` to reset and re-fetch on filter changes

These are targeted fixes to the existing file -- no new files or dependencies needed.
