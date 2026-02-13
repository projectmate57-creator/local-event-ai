

# Cookie Reject Enforcement + Admin Moderation Queue

## Feature 1: Cookie Reject Actually Blocks Analytics

Currently the "Reject" button stores `"rejected"` in localStorage but analytics tracking still fires. We'll fix this.

### Changes

1. **New utility file `src/lib/consent.ts`** -- A helper `hasAnalyticsConsent()` that returns `true` only if the cookie consent value is `"accepted"`.

2. **Gate analytics in `EventDetailPage.tsx`** -- Wrap both `track-analytics` calls (page view + ticket click) with the consent check so they only fire when the user has accepted cookies.

---

## Feature 2: Admin Moderation Queue

When the AI is unsure about content (flags it as `"pending"`), an admin must approve the event before it can be published. The database already has `moderation_status` and `moderation_notes` columns, and the `submit-poster` edge function already sets `moderation_status = "pending"` for borderline content. What's missing is the admin UI to review and approve/reject these events.

### Changes

### Admin Dashboard Enhancements (`AdminPage.tsx`)

1. **Add a "Moderation" filter tab** -- alongside the existing "All / Published / Draft" status filter, add a new filter option for `moderation_status = "pending"` so admins can quickly see the queue.

2. **Show moderation status badge** in the events table -- display a colored badge (yellow for pending, green for approved, red for rejected) next to each event's status.

3. **Add Approve/Reject actions** -- for events with `moderation_status = "pending"`, show "Approve" and "Reject" buttons in the actions column. These will update the `moderation_status` field (and optionally `moderation_notes` for rejection reasons).

4. **Add a stats card** for "Pending Review" count at the top of the dashboard.

5. **Show moderation notes** -- display the AI's screening reason so admins understand why the event was flagged.

### Draft Page Update (`DraftPage.tsx`)

The draft page already blocks publishing when `moderation_status === "pending"`. We'll add a clear info banner explaining to the user that their event is under review and will be available once approved.

### Technical Details

- No database changes needed -- `moderation_status` and `moderation_notes` columns already exist
- No new edge functions needed -- admins update via the existing Supabase client with their admin RLS policies
- The `events_public` view already filters to `moderation_status = 'approved'`, so rejected/pending events won't appear publicly

