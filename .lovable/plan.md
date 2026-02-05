
# Authentication Implementation Plan

## Overview
This plan adds user authentication to TinyTinyEvents so users can:
- Sign in with email/password or Google
- Create events that are associated with their account
- View their own events in a personal dashboard

---

## What Will Change

### 1. Sign In Page
A new `/signin` page with:
- Email and password login
- Email and password signup
- Google sign-in option (one click)
- Magic link option for passwordless login

### 2. Navigation Updates
The header will show:
- "Sign In" button when logged out
- User avatar/email and "Dashboard" link when logged in
- Sign out option

### 3. Personal Dashboard
The existing dashboard at `/dashboard` will display:
- Your draft events (unpublished)
- Your published events
- Basic analytics (views, clicks)

### 4. Event Ownership
When you upload a poster:
- The event will be linked to your account
- Only you can edit your own drafts
- Only you can delete your own events

---

## Technical Details

### Database Changes
Update Row Level Security (RLS) policies on the `events` table:
- **INSERT**: Only authenticated users can create events (linked to their user ID)
- **UPDATE**: Only the event owner can edit their events
- **DELETE**: Only the event owner can delete their events
- **SELECT**: Anyone can view published events; owners can view their own drafts

Update storage policies for the `posters` bucket:
- Only authenticated users can upload files

### New Routes
| Route | Purpose |
|-------|---------|
| `/signin` | Sign in/Sign up page |
| `/dashboard` | Personal events dashboard |

### File Changes
| File | Change |
|------|--------|
| `src/App.tsx` | Add AuthProvider wrapper and new routes |
| `src/components/Layout.tsx` | Add auth-aware navigation (Sign In / User menu) |
| `src/pages/UploadPage.tsx` | Require authentication, use actual user ID |
| `src/pages/DraftPage.tsx` | Verify user owns the draft |
| `src/hooks/useAuth.tsx` | Already exists, will be used |
| `src/pages/SignInPage.tsx` | Already exists, will be connected |
| `src/pages/DashboardPage.tsx` | Already exists, will be connected |

### Authentication Flow
```text
User visits /upload
    |
    v
Is user logged in? ----No----> Redirect to /signin
    |
   Yes
    |
    v
Upload poster with user's ID as owner_id
    |
    v
Redirect to /drafts/{id} to edit
    |
    v
Publish event -> Visible on /events
```

---

## Security Considerations
- Passwords validated (minimum 6 characters)
- Email format validation
- Server-side RLS policies enforce ownership
- No sensitive data exposed in client code

---

## After Implementation
You will need to:
1. Test the sign up flow with a test email
2. Optionally disable "Confirm email" in authentication settings to speed up testing
3. Try creating an event while logged in to verify ownership works
