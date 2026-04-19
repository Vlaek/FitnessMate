# Exercise List Drag and Drop Design

**Date:** 2026-04-19

## Goal

Add drag and drop reordering for exercise lists inside the workout-related modals and make modal open/close transitions feel smooth and polished.

## Scope

This design applies to:

- `apps/web/app/components/template-editor-dialog.tsx`
- `apps/web/app/components/workout-session-dialog.tsx`
- `packages/ui/src/components/dialog.tsx`

## User Experience

### Exercise list reordering

Both exercise-editing modals should support reordering exercises directly inside the table-like editor.

Each exercise row should display a drag handle on the left side. The handle should visually suggest reorder behavior. Hovering the handle should use a `grab` cursor, and active dragging should use a `grabbing` cursor.

Dragging must begin from the handle area so that text inputs and exercise selectors remain easy to edit without accidental reorder interactions.

Reordering should update the local form state immediately and preserve all field values already entered in the moved row.

### Modal transitions

Modal overlays should fade in and fade out smoothly.

Modal panels should animate with a subtle fade-and-scale transition on both enter and exit. The interaction should feel responsive, not bouncy or delayed.

If the user prefers reduced motion, transitions should stay minimal.

## Technical Approach

### Shared exercise list editor

Extract the duplicated exercise table markup from the two dialog components into one shared component in `apps/web/app/components`.

The shared component will:

- render the exercise rows
- expose add, remove, update, and reorder callbacks
- keep the existing field structure and translations
- own the drag event wiring for row reordering

This keeps the two modals behaviorally consistent and avoids maintaining the same drag logic twice.

### Drag and drop behavior

Use native HTML drag and drop instead of introducing a new dependency.

The component should track:

- which exercise is currently being dragged
- which row is currently the drop target

Reordering should be implemented by moving one array item to a new index and then committing the reordered array back to the parent state.

### Modal animation behavior

Implement animation in the shared `Dialog` UI component so all modal windows benefit from the same behavior.

Animations should use Radix dialog state selectors for open and closed states instead of relying on enter-only classes.

## Error Handling and Interaction Rules

- Reordering must not delete or duplicate exercises.
- Removing exercises should keep the current validation rule that at least one exercise is required.
- The add-exercise action should continue to append a new row at the end of the list.
- Drag styling should not interfere with keyboard navigation or input focus.

## Testing Strategy

- Verify drag and drop works in both target modals.
- Verify moved rows keep their current values for name, sets, reps, and weight.
- Verify add and remove still behave as before.
- Verify modal enter and exit transitions are visible on open and close.
- Verify the dialog still closes via the close button and overlay interaction.
