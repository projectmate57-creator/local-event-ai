

# Two Fixes: Cookie Reject Option + Verify Poster Screening

## 1. Cookie Consent — Add "Reject" Button

Currently the cookie banner only shows "Accept". We'll add a "Reject" button that:
- Dismisses the banner (stores `"rejected"` in localStorage so it doesn't reappear)
- Disables any non-essential cookies (currently the app only uses essential cookies for login/preferences, so rejecting simply records the user's choice)

The banner will show two buttons side by side: a subtle "Reject" (outline/ghost style) and the existing "Accept" (primary style).

## 2. Verify Poster Upload + AI Screening Is Working

The `submit-poster` edge function is already created and configured. I'll do a quick end-to-end test by calling it directly to confirm:
- AI screening responds correctly
- Events are created in the database
- Edit tokens are generated

If any issues are found, I'll fix them.

## Technical Details

### Cookie Consent Changes (`src/components/CookieConsent.tsx`)

- Change storage key to support three states: not set (show banner), `"accepted"`, `"rejected"`
- Add `handleReject` function that stores `"rejected"` and hides the banner
- Add a "Reject" button with `variant="ghost"` next to the existing "Accept" button
- Both buttons dismiss the banner; the stored value records the user's choice

### Poster Verification

- Test the `submit-poster` edge function end-to-end
- Fix any deployment or runtime issues found
- Confirm the upload page works for anonymous users (no sign-in gate)

