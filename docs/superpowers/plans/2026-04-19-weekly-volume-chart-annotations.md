# Weekly Volume Chart Annotations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add vertical dashed daily guide lines to the weekly volume chart and make the chart explicitly show `0` on Y and `DD.MM` dates on X.

**Architecture:** Keep the existing weekly line chart and enhance only its presentation. Reuse the existing seven-day weekly dataset to render per-day vertical references and tune axis/tick behavior so the chart clearly shows zero on Y and the selected week's `DD.MM` dates on X.

**Tech Stack:** Next.js, React 19, TypeScript, Recharts

---

### Task 1: Add Daily Vertical Guide Lines

**Files:**
- Modify: `apps/web/app/analytics/page.tsx`

- [ ] **Step 1: Reuse the weekly dataset to derive daily guide references**

```tsx
const weeklyGuideLines = weeklyVolumeData.map((day) => day.label);
```

- [ ] **Step 2: Render one dashed vertical reference line per day**

```tsx
{weeklyGuideLines.map((dayLabel) => (
  <ReferenceLine
    key={dayLabel}
    x={dayLabel}
    stroke="#cbd5e1"
    strokeDasharray="4 4"
  />
))}
```

- [ ] **Step 3: Run typecheck**

Run: `.\node_modules\.bin\tsc.CMD --noEmit`
Expected: PASS

### Task 2: Make the Chart Axes Explicit

**Files:**
- Modify: `apps/web/app/analytics/page.tsx`

- [ ] **Step 1: Ensure the Y axis visibly starts at zero**

```tsx
<YAxis domain={[0, weeklyVolumeYAxisMax]} ticks={weeklyVolumeYAxisTicks} />
```

- [ ] **Step 2: Ensure the X axis clearly shows the week's dates in `DD.MM` format**

```tsx
<XAxis
  dataKey="label"
  ticks={weeklyVolumeData.map((day) => day.label)}
  interval={0}
/>
```

- [ ] **Step 3: Verify the Monday date remains the first visible X-axis label**

Check that:
- the first X-axis label is the Monday date of the selected week
- all seven X-axis labels are formatted as `DD.MM`
- the Y-axis baseline visibly includes `0`

- [ ] **Step 4: Run final typecheck**

Run: `.\node_modules\.bin\tsc.CMD --noEmit`
Expected: PASS
