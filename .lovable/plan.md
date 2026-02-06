

# Legal Protection Plan for TinyTinyEvents

## Overview
Add Terms of Service, Privacy Policy, and Cookie Consent to protect the platform and users while reflecting your actual use case - people photographing **public street posters** to share events.

---

## What We Will Create

### 1. Terms of Service Page (`/terms`)

**Key sections with corrected wording:**

- **What TinyTinyEvents Does** - A community platform for sharing public event posters
- **User Content** - Users can upload photos of publicly displayed posters they encounter
- **Content Removal Requests** - Event organizers can contact us to remove their event if desired (simple takedown process)
- **Prohibited Content:**
  - Fake/scam events with fraudulent ticket links
  - Misleading information intended to deceive
  - Events promoting illegal activities
  - Spam or duplicate postings
- **Third-Party Links Disclaimer** - We do not verify ticket URLs; users click at their own risk
- **No Liability for Events** - We are not responsible for event cancellations, accuracy, or ticket transactions
- **Account Termination** - We can suspend users who violate terms

### 2. Privacy Policy Page (`/privacy`)

**Covering:**
- Data we collect (email, uploaded images, event details, analytics)
- How AI processes poster images
- Third-party services (Google OAuth)
- Cookie usage (authentication, theme preference)
- Data retention policy
- How to request data deletion
- Contact for privacy inquiries

### 3. Cookie Consent Banner

**Simple, non-intrusive banner:**
```text
+--------------------------------------------------+
| We use cookies for login and preferences.        |
| [Accept]  [Learn More]                           |
+--------------------------------------------------+
```
- Appears at bottom of screen for first-time visitors
- Stores consent in localStorage
- Links to Privacy Policy

---

## Misuse Protection Summary

| Risk | How We Handle It |
|------|------------------|
| **Fake ticket scams** | Disclaimer: we don't verify links; report mechanism |
| **Organizer wants removal** | Simple contact form - we remove on request |
| **Phishing links** | Terms allow immediate removal |
| **Fake events** | Duplicate detection + report + removal rights |
| **Spam** | Account termination clause |
| **Illegal events** | Prohibited in terms |

---

## Files to Create

| File | Description |
|------|-------------|
| `src/pages/TermsPage.tsx` | Terms of Service with all protections |
| `src/pages/PrivacyPage.tsx` | Privacy Policy with data handling |
| `src/components/CookieConsent.tsx` | Cookie consent banner |

## Files to Modify

| File | Change |
|------|--------|
| `src/App.tsx` | Add routes for `/terms` and `/privacy` |

---

## Sample Terms Wording (Key Points)

**About User Content:**
> "TinyTinyEvents allows users to photograph and share publicly displayed event posters they encounter in their community. By uploading content, you confirm you photographed the poster in a public space."

**Content Removal:**
> "If you are an event organizer and would like your event removed from our platform, please contact us at hello@tinytinyevents.com and we will remove it promptly."

**Ticket Links Disclaimer:**
> "TinyTinyEvents does not sell tickets or verify external ticket links. Any purchases made through third-party links are at your own risk. We are not responsible for fraudulent or invalid tickets."

---

## Technical Notes

- Both pages use the existing `Layout` component
- Plain, friendly language (not heavy legal jargon)
- "Last updated" date shown on each page
- Cookie consent stored in `localStorage` as `cookie-consent-accepted`
- Footer links (`/terms`, `/privacy`) already exist and will work once pages are created

