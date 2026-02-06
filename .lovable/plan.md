

# Multi-Day Event Display & Floating Date Feature

## Overview
Enhance event date display to better communicate multi-day events and add a floating date/time element on event detail pages for easy visibility.

---

## What We Will Build

### 1. Improved Multi-Day Event Formatting

**Current behavior:**
- Shows: `Feb 6, 2026 at 10:00 AM - Mar 6 at 10:00 PM`

**New behavior with duration labels:**
- **Same day:** `Feb 6, 2026 at 10:00 AM - 6:00 PM`
- **2 days:** `Feb 6 - 7, 2026 (2 days)`
- **3-6 days:** `Feb 6 - 10, 2026 (5 days)`
- **1 week:** `Feb 6 - 13, 2026 (1 week)`
- **2+ weeks:** `Feb 6 - 20, 2026 (2 weeks)`
- **Month-long:** `Feb 6 - Mar 6, 2026 (1 month)`

### 2. Floating Date Card on Event Page

A sticky card that remains visible when scrolling on the event detail page:

```text
+-----------------------------------+
|  WHEN                             |
|  Feb 6 - Mar 6, 2026              |
|  1 month long | Europe/Berlin     |
+-----------------------------------+
```

**Behavior:**
- Floats at top of screen when user scrolls past the main date section
- Shows condensed date + duration badge
- Mobile: appears as a slim bar at top
- Desktop: small floating card in corner

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/lib/date.ts` | Add `getEventDuration()` and `formatEventDateWithDuration()` functions |
| `src/pages/EventDetailPage.tsx` | Add floating date component with scroll detection |
| `src/components/EventCard.tsx` | Show duration badge for multi-day events |

## Files to Create

| File | Description |
|------|-------------|
| `src/components/FloatingEventDate.tsx` | Reusable floating date component |

---

## Technical Details

### New Date Utility Functions

```text
getEventDuration(start, end):
  - Calculates days between start and end
  - Returns: { days: number, label: string }
  - Labels: "2 days", "1 week", "2 weeks", "1 month", etc.

formatEventDateWithDuration(start, end):
  - Returns formatted date range with duration
  - Example: "Feb 6 - Mar 6, 2026 (1 month)"
```

### Floating Date Component

**Features:**
- Uses `useState` + scroll event listener to detect when to show
- Shows after scrolling past ~200px (where main date section ends)
- Smooth fade-in animation with framer-motion
- Fixed position at top-right (desktop) or full-width bar (mobile)
- Includes "Add to Calendar" quick action button

### Event Card Updates

For multi-day events, show a small badge:
```text
+------------------+
| [poster image]   |
| Title            |
| Feb 6 at 10 AM   |
| [2 days] Berlin  |
+------------------+
```

---

## Visual Examples

**Duration badges:**
- `2 days` - For 2-day events
- `5 days` - For 3-6 day events  
- `1 week` - For 7-day events
- `2 weeks` - For 8-14 day events
- `1 month` - For 28-31 day events

**Floating card (desktop):**
```text
    +-------------------------+
    | Feb 6 - 13              |
    | 1 week | [Add to Cal]   |
    +-------------------------+
```

**Floating bar (mobile):**
```text
+---------------------------------------+
| Feb 6 - 13 (1 week) | [Calendar icon] |
+---------------------------------------+
```

---

## Implementation Notes

- Duration calculation uses `differenceInDays` from date-fns
- Floating element uses `position: fixed` with `z-index` above content
- Respects dark/light theme with proper colors
- Accessible with proper ARIA labels
- No changes to database needed

