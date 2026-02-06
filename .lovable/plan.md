
# Remove Stats Section from Homepage

## Overview
Remove the statistics section displaying "500+ Events Created", "10K+ Posters Scanned", and "50+ Cities" from the Index page hero section.

## Changes Required

| File | Change |
|------|--------|
| `src/pages/Index.tsx` | Remove the stats section (lines ~130-149) and the `stats` array definition (lines ~48-52) |

## Implementation Details

1. **Remove the `stats` array definition** (around line 48-52):
```tsx
// DELETE THIS:
const stats = [
  { value: "500+", label: "Events Created" },
  { value: "10K+", label: "Posters Scanned" },
  { value: "50+", label: "Cities" },
];
```

2. **Remove the stats display section** (around lines 130-149):
```tsx
// DELETE THIS entire motion.div block:
<motion.div
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.7, duration: 0.6 }}
  className="mt-20 flex justify-center gap-12 border-t border-foreground/10 pt-12 sm:gap-20"
>
  {stats.map((stat, i) => (
    ...
  ))}
</motion.div>
```

## Result
The homepage hero section will end with the call-to-action buttons, without the statistics bar below.
