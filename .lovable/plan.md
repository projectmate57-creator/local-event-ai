

# Age Verification & Content Moderation Plan

## Overview

This plan implements a comprehensive age verification and content moderation system to detect and properly handle 18+ events (clubs, adult entertainment, alcohol-focused events) as well as flag potentially illegal content during AI extraction.

---

## What We'll Build

### 1. AI Content Classification
The AI extraction process will be enhanced to:
- Detect age-restricted content (18+, 21+) from event posters
- Classify events by age requirement (all ages, 16+, 18+, 21+)
- Flag potentially illegal or harmful content for review
- Identify event categories that typically require age verification

### 2. Age Gate for Visitors
When someone tries to view an 18+ event:
- A modal appears asking them to confirm they are 18+
- This is stored in their browser session
- Clear visual indicators (badges) show age-restricted events

### 3. Content Moderation for Uploaders
During the draft review process:
- Show the AI-detected age restriction clearly
- Allow users to adjust the age restriction if AI got it wrong
- Warn if content might violate platform guidelines
- Block publishing of flagged illegal content

---

## Technical Implementation

### Database Changes

New columns on the `events` table:

```text
+------------------------+----------+----------------------------------------+
| Column                 | Type     | Purpose                                |
+------------------------+----------+----------------------------------------+
| age_restriction        | text     | 'all_ages', '16+', '18+', '21+'       |
| content_flags          | text[]   | ['adult', 'alcohol', 'cannabis', etc] |
| moderation_status      | text     | 'pending', 'approved', 'rejected'     |
| moderation_notes       | text     | Admin notes for rejected content      |
+------------------------+----------+----------------------------------------+
```

Also update `events_public` view to expose `age_restriction` (but NOT content_flags or moderation details).

### AI Extraction Enhancement

Update the extraction edge function to detect:
- Explicit age requirements on posters ("18+", "21+", "Adults Only")
- Venue types (nightclubs, bars typically require 18+)
- Content indicators (alcohol brands, adult entertainment cues)
- Illegal activity indicators for flagging

The AI will return:
```json
{
  "age_restriction": "18+",
  "content_flags": ["nightclub", "alcohol"],
  "moderation_warning": null
}
```

### New Components

1. **AgeGateModal** - Displays when viewing 18+ events
2. **AgeRestrictionBadge** - Visual indicator on event cards
3. **ContentModerationPanel** - For admin review of flagged events
4. **AgeRestrictionSelector** - For draft page to override AI detection

### Page Updates

| Page | Changes |
|------|---------|
| DraftPage | Add age restriction selector, show detected flags |
| EventDetailPage | Add age gate modal for 18+ events |
| EventCard | Show age restriction badge |
| EventsPage | Optional filter to hide 18+ events |
| AdminPage | Content moderation queue for flagged events |
| FAQPage | Add FAQ about age-restricted events |

---

## User Flows

### Viewing an 18+ Event (New Visitor)

```text
User clicks event card
       |
       v
[Age Gate Modal]
"This event is for ages 18 and over.
 Please confirm you are 18+ to continue."
       |
   [Confirm] --> Event page loads, age verified stored in session
   [Cancel]  --> Returns to events list
```

### Uploading an 18+ Event (Poster Uploader)

```text
User uploads poster
       |
       v
AI extracts details + detects "18+ event"
       |
       v
Draft page shows:
- Age restriction badge (editable)
- Content classification chips
- Warning if content needs review
       |
       v
User reviews, adjusts if needed, publishes
```

### Flagged Content (Illegal/Harmful)

```text
AI detects problematic content
       |
       v
Event saved with moderation_status = 'pending'
       |
       v
User sees: "This event requires manual review before publishing"
       |
       v
Admin reviews in moderation queue
   [Approve] --> Event can be published
   [Reject]  --> User notified, event stays draft
```

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/AgeGateModal.tsx` | Age verification modal for 18+ events |
| `src/components/AgeRestrictionBadge.tsx` | Visual badge showing age requirement |
| `src/components/AgeRestrictionSelector.tsx` | Dropdown for draft page |
| `src/components/ContentModerationPanel.tsx` | Admin review panel |

## Files to Modify

| File | Changes |
|------|---------|
| `supabase/functions/extract/index.ts` | Add age/content detection to AI prompt |
| `src/lib/types.ts` | Add age restriction types |
| `src/pages/DraftPage.tsx` | Add age restriction UI |
| `src/pages/EventDetailPage.tsx` | Add age gate logic |
| `src/components/EventCard.tsx` | Show age badge |
| `src/pages/EventsPage.tsx` | Add age filter option |
| `src/pages/AdminPage.tsx` | Add moderation queue |
| `src/pages/FAQPage.tsx` | Add age verification FAQ |

---

## Security Considerations

1. **Age gate is advisory only** - We don't verify actual age, just get user acknowledgment (industry standard for event listings)
2. **Session-based storage** - Age confirmation stored in sessionStorage, clears when browser closes
3. **Server-side validation** - Moderation status enforced via database, not just frontend
4. **Admin override** - Admins can adjust age restrictions and approve/reject flagged content
5. **Audit trail** - Moderation decisions logged with admin ID and timestamp

---

## FAQ Updates

New questions to add:
- "What are age-restricted events?"
- "How does age verification work?"
- "What happens if my event is flagged for review?"
- "Why was my event rejected?"

