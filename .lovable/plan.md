

## Fix Accessibility Issues (Score 82 → 95+)

### 1. Add Missing Form Labels
**Files:** `src/pages/ScriptGenerator.tsx`
- Add `id` attributes to the duration `<input>` and both `<select>` elements (Platform, Tone)
- Connect existing visible `<label>` elements using `htmlFor` matching the `id`
- If labels are styled `<span>`s, convert them to proper `<label>` elements

### 2. Improve Color Contrast
**Files:** `src/index.css` (or wherever CSS variables are defined)
- Darken `--muted-foreground` HSL value to meet WCAG AA ratio (4.5:1 for normal text, 3:1 for large text)
- Check and fix `--primary-foreground` on the "Sign In" button if contrast is insufficient
- Verify nav item text colors meet contrast requirements

### 3. Increase Touch Target Sizes
**Files:** `src/components/NavLink.tsx` or `src/components/AppShell.tsx`
- Increase bottom nav button padding/min-height to at least 48x48px touch targets

### 4. Fix Non-Composited Animation
**Files:** `src/index.css`
- Update `animate-fade-up` keyframes to use `transform` and `opacity` only (GPU-composited properties), removing any `filter` usage

### Technical Details
- All changes are CSS/markup only — no logic changes
- Contrast ratios will be calculated against the current `--background` color
- Touch targets follow Google's 48dp minimum guideline

