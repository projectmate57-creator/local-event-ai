

# Allow Anonymous Uploads with AI Content Screening

## Problem
Users are forced to create accounts just to upload an event poster, which creates friction. Instead, we can use AI to screen content (is it actually a poster? is it safe?) and flag unclear cases for human review.

## How It Works

1. **Anyone can upload** -- no account needed
2. **AI screens the image** before creating a draft:
   - Is this actually an event poster/flyer? If not, reject it immediately
   - Does it contain dangerous or illegal content? If so, reject it
   - Is content unclear or borderline? Flag it for admin review (moderation_status = "pending")
   - Clean poster? Create the draft normally (moderation_status = "approved")
3. **Anonymous drafts use a secret link** -- the uploader gets a unique URL with an edit token so only they can edit their draft
4. **Admins review flagged content** in the existing admin panel

## Changes Required

| Area | Change |
|------|--------|
| Database | Make `owner_id` nullable, add `edit_token` column |
| Backend function | New `submit-poster` edge function with AI screening |
| Upload page | Remove sign-in requirement, call new function |
| Draft page | Allow access via edit token (no auth needed) |
| Extract function | Add anonymous path alongside authenticated path |

## Detailed Plan

### 1. Database Migration

- Make `events.owner_id` nullable (anonymous uploads have no owner)
- Add `edit_token UUID DEFAULT gen_random_uuid()` column for anonymous draft access
- Update RLS: add policy allowing SELECT/UPDATE where `edit_token` matches (passed via header or RPC)

### 2. New Edge Function: `submit-poster`

This replaces the direct client-side upload flow for anonymous users:

- Accepts: image URL or base64 image
- Step 1: **AI Content Screening** using Lovable AI (gemini-2.5-flash)
  - Prompt asks: "Is this an event poster? Rate 1-10. Any dangerous/illegal/explicit content?"
  - Returns: `{ is_poster: true/false, poster_score: 8, safety: "safe"|"unsafe"|"unclear", reason: "..." }`
- Step 2: Based on screening result:
  - `is_poster: false` (score < 4) -- reject with message "This doesn't appear to be an event poster"
  - `safety: "unsafe"` -- reject with message "Content violates platform guidelines"
  - `safety: "unclear"` or borderline poster score (4-6) -- create event with `moderation_status: "pending"` for human review
  - All clear -- create event with `moderation_status: "approved"`
- Step 3: If accepted, upload to storage, create event row (owner_id = null), trigger extraction
- Returns: draft URL with edit token (e.g., `/drafts/{id}?token={edit_token}`)

### 3. Upload Page Changes (`src/pages/UploadPage.tsx`)

- Remove the sign-in gate entirely
- For **authenticated users**: keep current flow (owner_id set, direct insert)
- For **anonymous users**: call `submit-poster` edge function instead
- Show appropriate feedback:
  - "Screening your image..." during AI check
  - Rejection message if not a poster or unsafe
  - Redirect to draft page with token if accepted

### 4. Draft Page Changes (`src/pages/DraftPage.tsx`)

- Read `token` from URL query params
- If user is authenticated AND owns the event: allow access (existing behavior)
- If `token` query param matches event's `edit_token`: allow access (anonymous path)
- If neither: show "not found"
- Anonymous users can edit and publish, but won't see their event in a dashboard

### 5. Extract Function Update (`supabase/functions/extract/index.ts`)

- Add a secondary path: if called with service role (from `submit-poster`), skip user auth check
- Keep existing authenticated path for re-extraction by owners

## User Experience Flow

```text
Anonymous user visits /upload
    |
    v
Uploads poster image
    |
    v
AI screens content (2-3 seconds)
    |
    +-- Not a poster --> "This doesn't look like an event poster. Please try again."
    |
    +-- Unsafe content --> "This content can't be posted."
    |
    +-- Unclear/borderline --> Creates draft (pending review), redirects to /drafts/{id}?token=xxx
    |
    +-- Clean poster --> Creates draft (approved), redirects to /drafts/{id}?token=xxx
    |
    v
User edits draft and publishes (if approved)
```

## Security Considerations

- Edit tokens are UUIDs -- unguessable, single-use per event
- Anonymous uploads still go through AI screening (stronger than auth-only)
- Storage uploads happen server-side in the edge function (no direct anonymous storage access)
- Rate limiting: edge function can track uploads per IP (future enhancement)
- Existing admin moderation workflow handles flagged content

