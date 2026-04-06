import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@repo/ui/components/dialog';
import { useTranslation } from 'react-i18next';
import { IWorkoutHistory } from '../interfaces/workout-history';
import { useModalStore } from '../stores/modal-store';
import { formatDateDDMMYYYY } from '../utils/workout-text-generator';
import { WorkoutPreview } from './workout-preview';

export function WorkoutHistoryDetailDialog() {
  const { t } = useTranslation('common');
  const isOpen = useModalStore((state) => state.isActive('workoutHistoryDetail'));
  const { activeModal, closeModal } = useModalStore();

  const workoutHistory = activeModal.data?.workoutHistory as IWorkoutHistory;

  return (
    <Dialog open={isOpen && !!workoutHistory} onOpenChange={closeModal}>
      <DialogContent className="grid max-h-[90vh] max-w-5xl grid-cols-[1.5fr_1fr] gap-6 overflow-y-auto">
        <div className="space-y-4">
          <DialogHeader>
            <DialogTitle>
              {t('workoutSession')}: {workoutHistory?.templateName}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-medium">{t('date')}:</h3>
              {workoutHistory?.date && (
                <span className="pt-0.5 text-slate-700">
                  {formatDateDDMMYYYY(workoutHistory.date, t)}
                </span>
              )}
            </div>

            <div>
              <h3 className="text-lg font-medium">{t('exercises')}:</h3>
              <div className="mt-2 space-y-4">
                {workoutHistory?.exercises.map((exercise, index) => (
                  <div
                    key={exercise.id || index}
                    className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 p-3"
                  >
                    <div className="min-w-[200px] flex-1">
                      <span className="font-medium">{t(exercise.name)}</span>
                    </div>

                    <div className="w-20 text-center">
                      <span className="text-sm text-slate-600">{t('sets')}: </span>
                      <span className="font-medium">{exercise.sets}</span>
                    </div>

                    <div className="w-20 text-center">
                      <span className="text-sm text-slate-600">{t('weight')}: </span>
                      <span className="font-medium">
                        {exercise.weight} {t('kg')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="sticky top-0 h-full max-h-[calc(100vh-16rem)] border-l border-slate-200 pl-6">
          <h3 className="mb-4 text-lg font-medium">{t('preview')}</h3>
          <WorkoutPreview
            exercises={workoutHistory?.exercises || []}
            description=""
            templateName={workoutHistory?.templateName || ''}
            useWeekdayPrefix={false}
          />
          <p className="mt-2 text-xs text-slate-500">{t('historicalWorkoutPreview')}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
