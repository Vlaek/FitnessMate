import { Button } from '@repo/ui/components/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@repo/ui/components/dialog';
import { Input } from '@repo/ui/components/input';
import { Label } from '@repo/ui/components/label';
import { Textarea } from '@repo/ui/components/textarea';
import { toast } from '@repo/ui/toast';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IExercise } from '../interfaces/exercise';
import { IWorkoutTemplate } from '../interfaces/workout-template';
import { TelegramService } from '../services/telegram-service';
import { useModalStore } from '../stores/modal-store';
import { useTelegramStore } from '../stores/telegram-store';
import { useWorkoutHistoryStore } from '../stores/workout-history-store';
import { generateWorkoutText } from '../utils/workout-text-generator';
import { ExerciseSelector } from './exercise-selector';
import { WorkoutPreview } from './workout-preview';

export function WorkoutSessionDialog() {
  const { t } = useTranslation('common');

  const [workoutExercises, setWorkoutExercises] = useState<IExercise[]>([]);
  const [workoutName, setWorkoutName] = useState('');
  const [workoutDescription, setWorkoutDescription] = useState('');
  const [useWeekdayPrefix, setUseWeekdayPrefix] = useState(false);

  const { chatId, isConfigured } = useTelegramStore();
  const { addWorkoutToHistory } = useWorkoutHistoryStore();
  const isOpen = useModalStore((state) => state.isActive('workoutSession'));
  const { activeModal, closeModal, isActive } = useModalStore();

  useEffect(() => {
    if (isActive('workoutSession') && activeModal?.data?.template) {
      const template = activeModal.data.template as IWorkoutTemplate;
      setWorkoutExercises(
        template.exercises.map((ex) => ({
          ...ex,
          id: ex.id || Math.random().toString(36).substr(2, 9),
          sets: ex.sets.toString(),
          weight: Number(ex.weight), // Convert to number
        })),
      );

      setWorkoutName(template.name);
      setWorkoutDescription(template.description || '');
      setUseWeekdayPrefix(template.useWeekdayPrefix || false);
    }
  }, [activeModal]);

  const updateExerciseField = (index: number, field: keyof IExercise, value: string | number) => {
    const updatedExercises = [...workoutExercises];

    const currentExercise = updatedExercises[index];
    if (!currentExercise) return;

    let updatedExercise: IExercise;

    if (field === 'id') {
      updatedExercise = { ...currentExercise, id: value as string };
    } else if (field === 'name') {
      updatedExercise = { ...currentExercise, name: value as string };
    } else if (field === 'sets') {
      updatedExercise = { ...currentExercise, sets: value as string };
    } else if (field === 'weight') {
      updatedExercise = { ...currentExercise, weight: Number(value) }; // Ensure it's a number
    } else {
      return;
    }

    updatedExercises[index] = updatedExercise;

    setWorkoutExercises(updatedExercises);
  };

  const addExercise = () => {
    const newExercise: IExercise = {
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      sets: '3',
      weight: 0,
    };
    setWorkoutExercises([...workoutExercises, newExercise]);
  };

  const removeExercise = (index: number) => {
    if (workoutExercises.length <= 1) {
      toast.error(t('atLeastOneExerciseIsRequired'));
      return;
    }
    const updatedExercises = [...workoutExercises];
    updatedExercises.splice(index, 1);
    setWorkoutExercises(updatedExercises);
  };

  const handleEndWorkout = () => {
    if (!activeModal.data?.template) return;

    // Save workout to history
    addWorkoutToHistory({
      date: new Date().toISOString().split('T')[0], // Format as YYYY-MM-DD
      templateName: workoutName,
      exercises: workoutExercises,
    });

    closeModal();
    setWorkoutExercises([]);
    setWorkoutName('');
    setWorkoutDescription('');
  };

  const handleSendReport = () => {
    if (!activeModal.data?.template) return;

    const report = generateWorkoutText(
      t,
      workoutExercises,
      workoutDescription,
      workoutName,
      useWeekdayPrefix,
    );

    if (isConfigured() && chatId) {
      TelegramService.sendMessage(report, chatId)
        .then((success) => {
          if (success) {
            toast.success(t('workoutReportSentToTelegramSuccessfully'));
          } else {
            toast.error(t('failedToSendWorkoutReportToTelegram'));
          }
        })
        .catch((error) => {
          console.error('Error sending report:', error);
          toast.error(t('errorSendingWorkoutReportToTelegram'));
        });
    } else {
      toast.error(t('pleaseConfigureYourTelegramTokenAndChatIDToSendReports'));
    }

    // Still save to history when sending report
    addWorkoutToHistory({
      date: new Date().toISOString().split('T')[0], // Format as YYYY-MM-DD
      templateName: workoutName,
      exercises: workoutExercises,
    });

    closeModal();
    setWorkoutExercises([]);
    setWorkoutName('');
    setWorkoutDescription('');
  };

  const getWeekdayName = () => {
    const days = [
      t('sunday'),
      t('monday'),
      t('tuesday'),
      t('wednesday'),
      t('thursday'),
      t('friday'),
      t('saturday'),
    ];
    const today = new Date();
    return days[today.getDay()];
  };

  return (
    <Dialog open={isOpen && !!activeModal.data} onOpenChange={closeModal}>
      <DialogContent className="grid max-h-[90vh] max-w-5xl grid-cols-[1.5fr_1fr] gap-6 overflow-y-auto">
        <div className="space-y-4">
          <DialogHeader>
            <DialogTitle>{t('workoutSession')}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="workout-name">{t('workoutName')}</Label>
              <Input
                id="workout-name"
                value={workoutName}
                onChange={(e) => setWorkoutName(e.target.value)}
                placeholder={t('enterTemplateName')}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="workout-description">{t('workoutDescription')}</Label>
              <Textarea
                id="workout-description"
                value={workoutDescription}
                onChange={(e) => setWorkoutDescription(e.target.value)}
                placeholder={t('describeYourWorkout')}
                className="mt-1 min-h-25"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="use-weekday-prefix"
                checked={useWeekdayPrefix}
                onChange={(e) => setUseWeekdayPrefix(e.target.checked)}
                className="mr-2 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <Label htmlFor="use-weekday-prefix">
                {t('addWeekdayPrefix')} ({getWeekdayName()})
              </Label>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">{t('exercises')}</h3>
                <Button
                  type="button"
                  variant="outline"
                  onClick={addExercise}
                  className="border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  {t('addExercise')}
                </Button>
              </div>

              <div className="mt-4 space-y-4">
                {workoutExercises.map((exercise, index) => (
                  <div key={exercise.id} className="flex flex-wrap items-center gap-2">
                    <div className="min-w-[200px] flex-1">
                      <Label htmlFor={`exercise-name-${index}`}>{t('exerciseName')}</Label>
                      <ExerciseSelector
                        value={exercise.name}
                        onChange={(nameKey) => updateExerciseField(index, 'name', nameKey)}
                        placeholder={t('enterExerciseName')}
                      />
                    </div>

                    <div className="w-16">
                      <Label htmlFor={`sets-${index}`}>{t('sets')}</Label>
                      <Input
                        id={`sets-${index}`}
                        type="text"
                        value={exercise.sets}
                        onChange={(e) => updateExerciseField(index, 'sets', e.target.value)}
                      />
                    </div>

                    <div className="w-20">
                      <Label htmlFor={`weight-${index}`}>{t('weight')}</Label>
                      <Input
                        id={`weight-${index}`}
                        type="number"
                        value={exercise.weight}
                        onChange={(e) =>
                          updateExerciseField(index, 'weight', Number(e.target.value))
                        }
                      />
                    </div>

                    <div>
                      <div className="h-6"></div>
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => removeExercise(index)}
                        disabled={workoutExercises.length <= 1}
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              onClick={handleEndWorkout}
              className="flex-1 bg-green-600 text-white hover:bg-green-700"
            >
              {t('endWorkout')}
            </Button>
            <Button
              variant="outline"
              onClick={handleSendReport}
              className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              {t('sendReport')}
            </Button>
          </div>
        </div>

        <div className="sticky top-0 h-full max-h-[calc(100vh-16rem)] border-l border-slate-200 pl-6">
          <h3 className="mb-4 text-lg font-medium">{t('preview')}</h3>
          <WorkoutPreview
            exercises={workoutExercises}
            description={workoutDescription}
            templateName={workoutName}
            useWeekdayPrefix={useWeekdayPrefix}
          />
          <p className="mt-2 text-xs text-slate-500">{t('previewDescription')}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
