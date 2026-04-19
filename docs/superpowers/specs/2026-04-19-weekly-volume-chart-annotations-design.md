# Weekly Volume Chart Annotations Design

**Date:** 2026-04-19

## Goal

Refine the weekly "Training Volume Over Time" chart by adding a vertical dashed guide line for each day and making the chart origin visually explicit.

## Scope

This applies only to:

- `apps/web/app/analytics/page.tsx`

## User Experience

The weekly volume chart should display a vertical dashed guide line for every day shown on the chart.

These guide lines must align with each daily X-axis position.

The chart origin should be visually explicit:

- the start of the Y axis should show `0`
- the X axis should show the visible week dates in `DD.MM` format, starting from Monday of the selected week

This should be achieved as part of the chart axis presentation rather than as a floating annotation disconnected from the axes.

## Technical Approach

Keep the existing weekly line chart.

Add a derived set of per-day guide references based on the same seven-day dataset already used by the chart.

Render one dashed vertical reference line per day.

Adjust the axis/tick presentation so that the chart clearly shows `0` on Y and the selected week's `DD.MM` dates on X, beginning with Monday.

## Interaction Rules

- Weekly navigation remains unchanged.
- The chart data logic remains unchanged.
- Only the chart presentation is enhanced.

## Testing Strategy

- Verify every visible day has a vertical dashed guide line.
- Verify the lines move correctly when navigating between weeks.
- Verify the origin of the Y axis visibly shows `0`.
- Verify the X axis visibly shows the selected week dates in `DD.MM` format.
- Verify the first visible X-axis label is the Monday date of the selected week.
