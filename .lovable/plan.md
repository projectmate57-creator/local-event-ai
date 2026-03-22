

## Plan: Add Lightbox to Event Detail Poster

**Goal**: Clicking the poster image on the event detail page opens it full-size in a modal overlay (lightbox). No external libraries needed — we'll use the existing Dialog component from shadcn/ui.

### Changes

**File: `src/pages/EventDetailPage.tsx`**
1. Import `Dialog`, `DialogContent`, `DialogTrigger` from `@/components/ui/dialog`
2. Add a `posterOpen` state (`useState(false)`)
3. Wrap the existing poster `<img>` in a `Dialog` + `DialogTrigger` with a cursor-pointer style
4. Add a `DialogContent` containing the full-resolution image with `object-contain` and no max-height constraint
5. Add a subtle "click to enlarge" indicator (e.g. a small zoom icon overlay or cursor change)

No new components, no new dependencies — just reusing the existing Dialog primitive.

