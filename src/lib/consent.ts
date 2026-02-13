const STORAGE_KEY = "cookie-consent-accepted";

/**
 * Returns true only if the user has explicitly accepted cookies.
 * Used to gate non-essential tracking (analytics, etc.).
 */
export function hasAnalyticsConsent(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "accepted";
  } catch {
    return false;
  }
}
