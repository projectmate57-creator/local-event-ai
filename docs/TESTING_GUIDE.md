# TinyTinyEvents - Feature List & Manual Testing Guide

**Document Version:** 1.0  
**Last Updated:** February 8, 2026  
**Prepared For:** QA Team Lead

---

## Test Environment URLs

| Environment | URL |
|-------------|-----|
| **Preview** | https://id-preview--a9593a30-d834-435c-bda8-fd61fb2a202e.lovable.app |
| **Published** | https://local-event-ai.lovable.app |

---

## Part 1: Feature List

### 1.1 Public Event Discovery

| Feature | Description |
|---------|-------------|
| Event Listing | Browse all published events at `/events` |
| Date Filtering | Filter events by date range using calendar picker |
| City Filtering | Filter events by city location |
| Tag Filtering | Filter events by category tags |
| Sort Options | Sort by date (ascending/descending) |
| Search | Text search across event titles |
| Responsive Grid | Card-based layout adapts to screen size |

### 1.2 Event Detail Pages

| Feature | Description |
|---------|-------------|
| Event Information | Title, description, venue, address, date/time display |
| Event Poster | Full poster image display |
| Ticket Link | External link to purchase tickets (tracked) |
| Share Buttons | Social sharing options |
| Calendar Export | Add to Google Calendar or download ICS file |
| SEO-Friendly URLs | Slug-based URLs (e.g., `/events/berlin-tech-meetup`) |

### 1.3 Age Verification System

| Feature | Description |
|---------|-------------|
| Age Restriction Levels | Supports: `all_ages`, `16+`, `18+`, `21+` |
| Age Gate Modal | Blocks access to 18+/21+ events until verified |
| Session Storage | Verification persists for browser session |
| Visual Badges | Age restriction badges on event cards |

### 1.4 Authentication

| Feature | Description |
|---------|-------------|
| Email/Password Sign Up | Standard registration with email verification |
| Email/Password Sign In | Login with credentials |
| Magic Link | Passwordless login via email link |
| Google OAuth | Sign in with Google account |
| Protected Routes | Dashboard and upload pages require authentication |

### 1.5 AI Poster Extraction

| Feature | Description |
|---------|-------------|
| File Upload | Drag-and-drop or click to upload poster images |
| URL Upload | Paste image URL for extraction |
| Event URL Upload | Paste event page URL for extraction |
| AI Extraction | Automatic extraction of: title, venue, date, time, city, description, tags, age restriction |
| Confidence Scoring | Overall confidence percentage for extraction accuracy |
| Evidence Drawer | "Why this?" button shows AI reasoning for each field |
| Draft Editing | Manual editing of all extracted fields before publishing |

### 1.6 User Dashboard

| Feature | Description |
|---------|-------------|
| Draft Events | List of unpublished events pending review |
| Published Events | List of user's live events |
| Analytics Overview | 7-day statistics for views and ticket clicks |
| Quick Actions | Edit, view, or manage events |

### 1.7 AI Chatbot

| Feature | Description |
|---------|-------------|
| Floating Widget | Accessible from any page via bottom-right button |
| Natural Language Search | "Find hackathons in Berlin this week" |
| Example Prompts | Pre-filled suggestions for new users |
| Markdown Responses | Formatted event results with links |

### 1.8 Static Pages

| Page | Route |
|------|-------|
| Homepage | `/` |
| How It Works | `/how-it-works` |
| FAQ | `/faq` |
| Contact | `/contact` |
| Terms of Service | `/terms` |
| Privacy Policy | `/privacy` |

---

## Part 2: Manual Testing Guide

### Test Case Format
- **Steps**: Actions to perform
- **Expected**: What should happen
- **Status**: ☐ Pass / ☐ Fail

---

### TC-01: Homepage Load & Navigation

**Objective:** Verify homepage loads correctly and navigation works

**Steps:**
1. Navigate to the homepage (`/`)
2. Verify hero section displays with title and description
3. Click "Browse Events" button
4. Verify navigation to `/events` page
5. Return to homepage
6. Click "Upload Poster" button
7. Verify navigation to `/upload` page (or sign-in prompt if not authenticated)
8. Test header navigation links (Events, How It Works, FAQ)
9. Test footer links (Terms, Privacy, Contact)

**Expected:**
- Homepage loads with hero section, call-to-action buttons
- All navigation links work correctly
- Page transitions are smooth
- Mobile menu works on smaller screens

**Status:** ☐ Pass / ☐ Fail

**Notes:**
```

```

---

### TC-02: Event Browsing & Filtering

**Objective:** Verify event listing page functionality

**Steps:**
1. Navigate to `/events`
2. Verify events display in a grid layout
3. Click on date filter and select a date range
4. Verify events are filtered by date
5. Clear date filter
6. Select a city from the city filter (if available)
7. Verify events are filtered by city
8. Select a tag filter (if available)
9. Verify events are filtered by tag
10. Test sort dropdown (Date: Newest/Oldest)
11. Verify events reorder correctly
12. Test on mobile viewport (< 768px)

**Expected:**
- Events load and display with poster images
- Filters update results in real-time
- Skeleton loaders show during loading
- Empty state shows when no events match
- Responsive layout on all screen sizes

**Status:** ☐ Pass / ☐ Fail

**Notes:**
```

```

---

### TC-03: Event Detail Page

**Objective:** Verify event detail page displays all information correctly

**Steps:**
1. Navigate to `/events`
2. Click on any event card
3. Verify URL changes to `/events/{slug}`
4. Verify event title displays
5. Verify event poster image displays
6. Verify date and time display correctly
7. Verify venue and address display
8. Verify description displays (if available)
9. Click "Get Tickets" button (if ticket URL exists)
10. Verify external link opens in new tab
11. Click "Add to Calendar" button
12. Verify calendar options appear (Google Calendar, ICS)
13. Test share buttons
14. Click browser back button
15. Verify return to events listing

**Expected:**
- All event details display correctly
- External links open in new tabs
- Calendar integration works
- Share buttons function correctly
- Age restriction badge shows if applicable

**Status:** ☐ Pass / ☐ Fail

**Notes:**
```

```

---

### TC-04: Age Gate - All Ages Event

**Objective:** Verify all-ages events are accessible without age verification

**Steps:**
1. Clear browser session storage
2. Navigate to `/events`
3. Find an event marked as "All Ages" (no age badge)
4. Click on the event
5. Verify event detail page loads directly

**Expected:**
- No age verification modal appears
- Event content is immediately visible
- No session storage entry for age verification

**Status:** ☐ Pass / ☐ Fail

**Notes:**
```

```

---

### TC-05: Age Gate - 18+ Event

**Objective:** Verify age-restricted events require verification

**Steps:**
1. Clear browser session storage
2. Navigate to an 18+ or 21+ event directly (if known) or find via listing
3. Verify age gate modal appears
4. Verify modal shows event title and age requirement
5. Click "Go Back" button
6. Verify navigation to `/events` page
7. Navigate to the same age-restricted event again
8. Click "I am 18+ years old" (or appropriate age) button
9. Verify modal closes and event content displays
10. Navigate away and return to the same event
11. Verify no modal appears (session verified)
12. Close browser and reopen
13. Navigate to the age-restricted event
14. Verify modal appears again (session cleared)

**Expected:**
- Modal blocks access until verified
- "Go Back" navigates away safely
- Confirmation stores in session storage
- Verification persists within session
- Verification clears when session ends

**Status:** ☐ Pass / ☐ Fail

**Notes:**
```

```

---

### TC-06: User Sign Up

**Objective:** Verify new user registration flow

**Steps:**
1. Navigate to `/signin`
2. Click on "Sign Up" tab or toggle
3. Enter a valid email address (use a test email)
4. Enter a password (minimum requirements)
5. Click "Sign Up" button
6. Verify confirmation message appears
7. Check email for verification link
8. Click verification link in email
9. Verify account is activated
10. Attempt to sign in with new credentials

**Expected:**
- Sign up form validates inputs
- Confirmation email is sent
- Verification link activates account
- User can sign in after verification
- Error messages show for invalid inputs

**Status:** ☐ Pass / ☐ Fail

**Notes:**
```

```

---

### TC-07: User Sign In

**Objective:** Verify existing user login flow

**Steps:**
1. Navigate to `/signin`
2. Enter valid email address
3. Enter valid password
4. Click "Sign In" button
5. Verify successful login
6. Verify redirect to dashboard or intended page
7. Verify user state in header (avatar/name)
8. Sign out
9. Attempt sign in with incorrect password
10. Verify error message displays
11. Attempt sign in with non-existent email
12. Verify appropriate error message

**Expected:**
- Valid credentials log user in
- Invalid credentials show error messages
- Session persists across page refreshes
- Sign out clears session

**Status:** ☐ Pass / ☐ Fail

**Notes:**
```

```

---

### TC-08: Magic Link Sign In

**Objective:** Verify passwordless login via email link

**Steps:**
1. Navigate to `/signin`
2. Find "Magic Link" option
3. Enter valid email address
4. Click "Send Magic Link" button
5. Verify confirmation message
6. Check email for magic link
7. Click magic link in email
8. Verify automatic sign in
9. Verify redirect to dashboard

**Expected:**
- Magic link email is sent promptly
- Link logs user in automatically
- Link expires after use or timeout
- Error shows for invalid/expired links

**Status:** ☐ Pass / ☐ Fail

**Notes:**
```

```

---

### TC-09: Google OAuth Sign In

**Objective:** Verify Google social login

**Steps:**
1. Navigate to `/signin`
2. Click "Sign in with Google" button
3. Verify redirect to Google OAuth page
4. Select or enter Google account credentials
5. Authorize the application
6. Verify redirect back to application
7. Verify user is signed in
8. Verify user info displays correctly

**Expected:**
- Google OAuth popup/redirect works
- User is authenticated after approval
- Account is created if first-time login
- Existing account is linked correctly

**Status:** ☐ Pass / ☐ Fail

**Notes:**
```

```

---

### TC-10: Poster Upload - File

**Objective:** Verify image file upload and AI extraction

**Steps:**
1. Sign in to a test account
2. Navigate to `/upload`
3. Verify upload interface displays
4. Click upload area or drag an event poster image
5. Verify loading state shows "Extracting event details..."
6. Wait for extraction to complete
7. Verify redirect to draft page (`/drafts/{id}`)
8. Verify extracted fields are populated:
   - Title
   - Venue
   - Date/Time
   - City
   - Description (if extracted)
   - Tags (if extracted)
   - Age Restriction
9. Verify poster preview displays
10. Click "Why this?" button
11. Verify evidence drawer shows AI reasoning

**Expected:**
- File upload accepts common image formats (JPG, PNG, WebP)
- Loading animation shows during extraction
- Draft is created with extracted data
- Confidence score displays
- Evidence drawer explains field extraction

**Status:** ☐ Pass / ☐ Fail

**Notes:**
```

```

---

### TC-11: Poster Upload - URL

**Objective:** Verify image URL upload and AI extraction

**Steps:**
1. Sign in to a test account
2. Navigate to `/upload`
3. Find the URL input tab/option
4. Paste a valid image URL (direct link to a poster image)
5. Click submit/upload button
6. Verify loading state
7. Verify redirect to draft page
8. Verify extraction results populate

**Alternative - Event URL:**
1. Find the Event URL tab/option
2. Paste a URL to an event page (e.g., Eventbrite, Meetup)
3. Click submit button
4. Verify extraction from event page

**Expected:**
- URL validation works
- Valid image URLs are processed
- Event page URLs extract relevant data
- Error messages for invalid URLs

**Status:** ☐ Pass / ☐ Fail

**Notes:**
```

```

---

### TC-12: Draft Editing & Publishing

**Objective:** Verify draft editing and publish flow

**Steps:**
1. Create a new draft via upload (TC-10 or TC-11)
2. On the draft page, edit the title field
3. Edit the venue field
4. Change the date/time
5. Modify the description
6. Add or remove tags
7. Change age restriction setting
8. Verify all changes are saved (auto-save or save button)
9. Click "Publish" button
10. Verify confirmation or success message
11. Navigate to `/events`
12. Verify the event appears in the listing
13. Navigate to `/dashboard`
14. Verify the event shows under "Published Events"

**Expected:**
- All fields are editable
- Changes persist correctly
- Publish transitions event to live status
- Published event appears in public listing
- Dashboard reflects updated status

**Status:** ☐ Pass / ☐ Fail

**Notes:**
```

```

---

### TC-13: AI Chatbot

**Objective:** Verify chatbot functionality for event discovery

**Steps:**
1. Navigate to any page
2. Locate floating chat button (bottom-right)
3. Click chat button
4. Verify chat window opens
5. Verify example prompts display
6. Click an example prompt (e.g., "Find hackathons in Berlin this week")
7. Verify loading animation shows
8. Verify response displays with event results or helpful message
9. Type a custom query: "Any events this weekend?"
10. Submit the query
11. Verify response displays
12. Test query with no expected results: "underwater basket weaving events"
13. Verify graceful "no results" message
14. Click X button to close chat
15. Verify chat window closes
16. Reopen chat
17. Verify conversation history persists

**Expected:**
- Chat widget opens/closes smoothly
- Example prompts trigger searches
- Responses are formatted with markdown
- Event links are clickable
- No results handled gracefully
- Conversation persists during session

**Status:** ☐ Pass / ☐ Fail

**Notes:**
```

```

---

## Part 3: Testing Checklist Summary

| Test ID | Test Name | Status |
|---------|-----------|--------|
| TC-01 | Homepage Load & Navigation | ☐ |
| TC-02 | Event Browsing & Filtering | ☐ |
| TC-03 | Event Detail Page | ☐ |
| TC-04 | Age Gate - All Ages Event | ☐ |
| TC-05 | Age Gate - 18+ Event | ☐ |
| TC-06 | User Sign Up | ☐ |
| TC-07 | User Sign In | ☐ |
| TC-08 | Magic Link Sign In | ☐ |
| TC-09 | Google OAuth Sign In | ☐ |
| TC-10 | Poster Upload - File | ☐ |
| TC-11 | Poster Upload - URL | ☐ |
| TC-12 | Draft Editing & Publishing | ☐ |
| TC-13 | AI Chatbot | ☐ |

---

## Part 4: Browser & Device Testing Matrix

| Browser | Desktop | Mobile |
|---------|---------|--------|
| Chrome (latest) | ☐ | ☐ |
| Firefox (latest) | ☐ | ☐ |
| Safari (latest) | ☐ | ☐ |
| Edge (latest) | ☐ | ☐ |

---

## Notes & Issues Log

| Issue # | Test Case | Description | Severity | Status |
|---------|-----------|-------------|----------|--------|
| | | | | |
| | | | | |
| | | | | |

---

**Tested By:** _____________________  
**Date:** _____________________  
**Signature:** _____________________
