
# Duplicate Event Detection System

## Overview

When publishing an event, the system will check for existing published events with similar characteristics and warn the user if potential duplicates are found. This prevents redundant event postings in the public listing.

---

## How It Works

Before an event is published, the system checks for matches based on:

1. **Same city** (case-insensitive exact match)
2. **Same date** (within 24-hour window of start time)
3. **Similar title** (case-insensitive substring or fuzzy match)

If duplicates are found, a warning dialog appears showing the matching events. The user can then:
- **Cancel** - Go back and review/edit the event
- **Publish Anyway** - Override the warning and publish

---

## User Experience

```text
User clicks "Publish"
        |
        v
+------------------+
| Check for        |
| duplicates       |
+------------------+
        |
   +----+----+
   |         |
   v         v
No match   Match found
   |         |
   v         v
Publish    Show Warning Dialog
           +------------------------+
           | Potential Duplicate    |
           | Detected!              |
           |                        |
           | "Tech Meetup Berlin"   |
           | Feb 15, 2026 @ 6:00 PM |
           | Berlin                 |
           |                        |
           | [Cancel] [Publish Anyway]
           +------------------------+
```

---

## Changes Summary

| Component | Change |
|-----------|--------|
| Database | Add `check_duplicate_events` function |
| DraftPage.tsx | Intercept publish, run check, show dialog |
| New Component | `DuplicateWarningDialog.tsx` |

---

## Technical Details

### 1. Database Function

Create a PostgreSQL function that queries `events_public` for potential duplicates:

```sql
CREATE FUNCTION public.check_duplicate_events(
  p_title TEXT,
  p_city TEXT,
  p_start_at TIMESTAMPTZ,
  p_exclude_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  city TEXT,
  start_at TIMESTAMPTZ,
  venue TEXT
)
```

**Matching criteria:**
- City matches (case-insensitive)
- Start date within +/- 24 hours
- Title contains similar words (case-insensitive ILIKE)

### 2. DuplicateWarningDialog Component

A new alert dialog component that:
- Displays list of potential duplicate events
- Shows event title, date, and venue for each match
- Provides "Cancel" and "Publish Anyway" action buttons

### 3. Publish Flow Integration

Modify `DraftPage.tsx` to:
1. Add state for dialog visibility and duplicate results
2. Create a `checkDuplicates` async function
3. Intercept the Publish button click
4. Show dialog if duplicates found
5. Allow user to confirm or cancel

---

## Implementation Order

1. **Database migration** - Create the `check_duplicate_events` function
2. **Create dialog component** - `DuplicateWarningDialog.tsx`
3. **Update DraftPage** - Integrate duplicate check into publish flow
4. **Test end-to-end** - Verify the flow works correctly
