# Weekly Volume Chart Navigation Design

**Date:** 2026-04-19

## Goal

Replace the current implicit limit on the "Training Volume Over Time" chart with explicit week-by-week navigation inside that chart card.

## Scope

This design applies only to the analytics chart card for training volume:

- `apps/web/app/analytics/page.tsx`

No other analytics cards should change behavior.

## User Experience

The "Training Volume Over Time" card should display a local weekly navigation control in the card header.

The control should contain:

- a left arrow button for the previous week
- the visible week range label
- a right arrow button for the next week

The chart must always show exactly one full calendar week from Monday through Sunday.

The X axis should always render seven day slots in order:

- Monday
- Tuesday
- Wednesday
- Thursday
- Friday
- Saturday
- Sunday

If there are no workouts on some days, those days must still appear with zero volume.

The right arrow should not allow navigation into future weeks beyond the current calendar week.

## Technical Approach

Track the currently selected week in the analytics page state as a week anchor date.

Build a derived weekly dataset that:

- finds the Monday for the selected week
- generates all seven days through Sunday
- aggregates workout volume into those day buckets
- returns a seven-item chart dataset every time

Replace the existing limited chart dataset with this weekly dataset only for the volume chart.

## Interaction Rules

- The weekly navigation affects only the training volume chart card.
- Other analytics metrics and sections keep their current behavior.
- The initial view should open on the current calendar week.
- The next-week button should be disabled while the current week is selected.

## Testing Strategy

- Verify the chart initially shows the current Monday-Sunday week.
- Verify previous-week navigation changes only this chart.
- Verify next-week navigation returns toward the current week.
- Verify the next-week button is disabled on the current week.
- Verify all seven days are displayed even when some have zero workouts.
- Verify volume totals still aggregate correctly within the chosen week.
