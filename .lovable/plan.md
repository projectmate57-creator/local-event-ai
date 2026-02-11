

# Fix 5 Security Scan Errors

## Findings Analysis

| # | Finding | Root Cause | Action |
|---|---------|-----------|--------|
| 1 | Security Definer View | Our `events_public` view is intentionally SECURITY DEFINER to bypass RLS and serve public data safely | **Ignore** -- this is by design |
| 2 | User Roles Exposed to Public | The `Users can view their own roles` policy targets `public` role (includes anonymous). While `auth.uid()` is NULL for anon so no data leaks, it's better practice to restrict to `authenticated` only | **Fix** |
| 3 | Edit Tokens Could Be Stolen | The token-holder SELECT policy targets `public` role. This is by design for anonymous uploads, but the scan flags it as risky | **Ignore** -- by design, requires valid UUID token |
| 4 | Event Ownership Data Exposed | Same as #3 -- the token-holder policy. Owner data is only visible to authenticated owners via separate policy | **Ignore** -- same reason as #3 |
| 5 | Business Analytics Data Leaked | The `Block direct analytics inserts` policy targets `{anon,authenticated}`. While no anon SELECT policy exists (so anon can't read), tightening is good practice | **Fix** -- restrict INSERT block to authenticated only and add explicit anon denial |

## Changes

### Database Migration

1. **Drop and recreate `user_roles` SELECT policy** restricted to `authenticated` role only (currently `public`):
   - Drop `Users can view their own roles`
   - Recreate with same logic but targeting `authenticated` role

2. **Tighten `event_analytics` policies**:
   - Drop the INSERT block that targets `{anon,authenticated}` 
   - Recreate targeting only `authenticated`
   - Add an explicit policy denying anonymous SELECT

3. **Mark scan findings as resolved/ignored**:
   - Delete finding #2 (user_roles -- fixed)
   - Delete finding #5 (analytics -- fixed)  
   - Ignore finding #1 (security definer view -- by design)
   - Ignore findings #3 and #4 (token-holder access -- by design for anonymous uploads)

### No Frontend Changes Required

These are all database-level security hardening changes with no impact on the UI.

