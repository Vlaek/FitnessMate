import { WorkoutSessionDialog } from './workout-session-dialog';
import { TemplateEditorDialog } from './template-editor-dialog';
import { WorkoutHistoryDetailDialog } from './workout-history-detail-dialog';

export function ModalsContainer() {
  return (
    <>
      <WorkoutSessionDialog />
      <TemplateEditorDialog />
      <WorkoutHistoryDetailDialog />
    </>
  );
}