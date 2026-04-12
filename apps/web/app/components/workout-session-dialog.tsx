import { Button } from '@repo/ui/components/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@repo/ui/components/dialog';
import { Input } from '@repo/ui/components/input';
import { Label } from '@repo/ui/components/label';
import { Textarea } from '@repo/ui/components/textarea';
import { toast } from '@repo/ui/toast';
import { X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IExercise } from '../interfaces/exercise';
import { IWorkoutTemplate } from '../interfaces/workout-template';
import { RandomImageService } from '../services/random-image-service';
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
  const [bodyWeight, setBodyWeight] = useState('');
  const [useWeekdayPrefix, setUseWeekdayPrefix] = useState(false);
  const [useWorkoutDatePrefix, setUseWorkoutDatePrefix] = useState(false);
  const [useEmptyLinesBetweenSections, setUseEmptyLinesBetweenSections] = useState(true);
  const [useTotalWorkload, setUseTotalWorkload] = useState(false);
  const [useRandomImage, setUseRandomImage] = useState(false);
  const [randomImagePath, setRandomImagePath] = useState('');

  const { chatId, isConfigured } = useTelegramStore();
  const { addWorkoutToHistory } = useWorkoutHistoryStore();
  const isOpen = useModalStore((state) => state.isActive('workoutSession'));
  const { activeModal, closeModal, isActive } = useModalStore();
  const createEmptyExercise = (): IExercise => ({
    id: Math.random().toString(36).substr(2, 9),
    name: '',
    sets: '3',
    reps: '10',
    weight: 0,
  });

  type SessionFormState = {
    workoutExercises: IExercise[];
    workoutName: string;
    workoutDescription: string;
    bodyWeight: string;
    useWeekdayPrefix: boolean;
    useWorkoutDatePrefix: boolean;
    useEmptyLinesBetweenSections: boolean;
    useTotalWorkload: boolean;
    useRandomImage: boolean;
    randomImagePath: string;
  };

  const createEmptyFormState = (): SessionFormState => ({
    workoutExercises: [createEmptyExercise()],
    workoutName: '',
    workoutDescription: '',
    bodyWeight: '',
    useWeekdayPrefix: false,
    useWorkoutDatePrefix: false,
    useEmptyLinesBetweenSections: true,
    useTotalWorkload: false,
    useRandomImage: false,
    randomImagePath: '',
  });

  const initialFormStateRef = useRef<SessionFormState>(createEmptyFormState());

  const normalizeBodyWeight = (value?: string) => {
    const trimmed = value?.trim() || '';
    if (!trimmed) return '';
    const numeric = Number(trimmed);
    return Number.isFinite(numeric) && numeric > 0 ? trimmed : '';
  };

  const applyFormState = (state: SessionFormState) => {
    setWorkoutExercises(state.workoutExercises.map((exercise) => ({ ...exercise })));
    setWorkoutName(state.workoutName);
    setWorkoutDescription(state.workoutDescription);
    setBodyWeight(state.bodyWeight);
    setUseWeekdayPrefix(state.useWeekdayPrefix);
    setUseWorkoutDatePrefix(state.useWorkoutDatePrefix);
    setUseEmptyLinesBetweenSections(state.useEmptyLinesBetweenSections);
    setUseTotalWorkload(state.useTotalWorkload);
    setUseRandomImage(state.useRandomImage);
    setRandomImagePath(state.randomImagePath);
  };

  useEffect(() => {
    if (isActive('workoutSession') && activeModal?.data?.template) {
      const template = activeModal.data.template as IWorkoutTemplate;
      const formState: SessionFormState = {
        workoutExercises:
          template.exercises.length > 0
            ? template.exercises.map((ex) => ({
                ...ex,
                id: ex.id || Math.random().toString(36).substr(2, 9),
                sets: ex.sets.toString(),
                reps: ex.reps?.toString() || '10',
                weight: Number(ex.weight),
              }))
            : [createEmptyExercise()],
        workoutName: template.name,
        workoutDescription: template.description || '',
        bodyWeight: normalizeBodyWeight(template.bodyWeight),
        useWeekdayPrefix: template.useWeekdayPrefix || false,
        useWorkoutDatePrefix: template.useWorkoutDatePrefix || false,
        useEmptyLinesBetweenSections: template.useEmptyLinesBetweenSections ?? true,
        useTotalWorkload: template.useTotalWorkload || false,
        useRandomImage: template.useRandomImage || false,
        randomImagePath: template.randomImagePath || '',
      };

      initialFormStateRef.current = formState;
      applyFormState(formState);
    } else if (isActive('workoutSession')) {
      const emptyState = createEmptyFormState();
      initialFormStateRef.current = emptyState;
      applyFormState(emptyState);
    }
  }, [activeModal, isActive]);

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
    } else if (field === 'reps') {
      updatedExercise = { ...currentExercise, reps: value as string };
    } else if (field === 'weight') {
      updatedExercise = { ...currentExercise, weight: Number(value) }; // Ensure it's a number
    } else {
      return;
    }

    updatedExercises[index] = updatedExercise;

    setWorkoutExercises(updatedExercises);
  };

  const addExercise = () => {
    setWorkoutExercises([...workoutExercises, createEmptyExercise()]);
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

  const saveWorkoutSession = () => {
    addWorkoutToHistory({
      date: new Date().toISOString().split('T')[0], // Format as YYYY-MM-DD
      templateName: workoutName,
      exercises: workoutExercises,
    });
  };

  const handleSave = () => {
    saveWorkoutSession();
    closeModal();
    applyFormState(createEmptyFormState());
  };

  const handleSaveAndSend = async () => {
    const report = generateWorkoutText(
      t,
      workoutExercises,
      workoutDescription,
      bodyWeight,
      workoutName,
      useWeekdayPrefix,
      useWorkoutDatePrefix,
      useEmptyLinesBetweenSections,
      useTotalWorkload,
    );

    saveWorkoutSession();

    if (isConfigured() && chatId) {
      try {
        let success = true;
        let imagePathToSend = randomImagePath;

        if (useRandomImage && !imagePathToSend) {
          imagePathToSend = await RandomImageService.getRandomImage() || '';
          if (imagePathToSend) {
            setRandomImagePath(imagePathToSend);
          }
        }

        if (useRandomImage) {
          if (!imagePathToSend) {
            toast.error(t('noImagesFoundInFolder'));
            success = false;
          } else {
            success = await TelegramService.sendPhoto(imagePathToSend, chatId, report);
          }
        } else {
            success = await TelegramService.sendMessage(report, chatId);
        }

        if (success) {
          toast.success(t('workoutReportSentToTelegramSuccessfully'));
        } else {
          toast.error(t('failedToSendWorkoutReportToTelegram'));
        }
      } catch (error) {
        console.error('Error sending report:', error);
        toast.error(t('errorSendingWorkoutReportToTelegram'));
      }
    } else {
      toast.error(t('pleaseConfigureYourTelegramTokenAndChatIDToSendReports'));
    }

    closeModal();
    applyFormState(createEmptyFormState());
  };

  const handleReset = () => {
    applyFormState(initialFormStateRef.current);
  };

  const handleRandomImageToggle = async (checked: boolean) => {
    if (!checked) {
      setUseRandomImage(false);
      setRandomImagePath('');
      return;
    }

    const nextImagePath = randomImagePath || (await RandomImageService.getRandomImage());
    if (!nextImagePath) {
      toast.error(t('noImagesFoundInFolder'));
      setUseRandomImage(false);
      setRandomImagePath('');
      return;
    }

    setUseRandomImage(true);
    setRandomImagePath(nextImagePath);
  };

  const handlePickAnotherImage = async () => {
    const nextImagePath = await RandomImageService.getRandomImage(randomImagePath);
    if (!nextImagePath) {
      toast.error(t('noImagesFoundInFolder'));
      return;
    }
    setRandomImagePath(nextImagePath);
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
      <DialogContent className="grid max-h-[90vh] max-w-[1100px] grid-cols-[1.5fr_1fr] gap-6 overflow-y-auto">
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
                placeholder={t('enterWorkoutName')}
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

            <div>
              <Label htmlFor="workout-body-weight">{t('bodyWeight')}</Label>
              <Input
                id="workout-body-weight"
                type="number"
                min="0"
                value={bodyWeight}
                onChange={(e) => {
                  const next = e.target.value;
                  if (next === '') {
                    setBodyWeight('');
                    return;
                  }
                  const numeric = Number(next);
                  if (Number.isFinite(numeric) && numeric >= 0) {
                    setBodyWeight(next);
                  }
                }}
                placeholder={t('enterBodyWeight')}
                className="mt-1"
              />
            </div>

            <div className="space-y-4 pt-4">
              <div className="ml-2 flex flex-wrap items-center gap-x-6 gap-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="session-use-weekday-prefix"
                    checked={useWeekdayPrefix}
                    onChange={(e) => setUseWeekdayPrefix(e.target.checked)}
                    className="mr-2 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Label htmlFor="session-use-weekday-prefix">
                    {t('addWeekdayPrefix')} ({getWeekdayName()})
                  </Label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="session-use-workout-date-prefix"
                    checked={useWorkoutDatePrefix}
                    onChange={(e) => setUseWorkoutDatePrefix(e.target.checked)}
                    className="mr-2 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Label htmlFor="session-use-workout-date-prefix">{t('addWorkoutDate')}</Label>
                </div>
              </div>

              <div className="ml-2 flex items-center">
                <input
                  type="checkbox"
                  id="session-use-empty-lines-between-sections"
                  checked={useEmptyLinesBetweenSections}
                  onChange={(e) => setUseEmptyLinesBetweenSections(e.target.checked)}
                  className="mr-2 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <Label htmlFor="session-use-empty-lines-between-sections">
                  {t('addEmptyLinesBetweenSections')}
                </Label>
              </div>

              <div className="ml-2 flex items-center">
                <input
                  type="checkbox"
                  id="session-use-total-workload"
                  checked={useTotalWorkload}
                  onChange={(e) => setUseTotalWorkload(e.target.checked)}
                  className="mr-2 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <Label htmlFor="session-use-total-workload">{t('addTotalWorkload')}</Label>
              </div>

              <div className="ml-2 flex min-h-6 items-center">
                <input
                  type="checkbox"
                  id="session-use-random-image"
                  checked={useRandomImage}
                  onChange={(e) => void handleRandomImageToggle(e.target.checked)}
                  className="mr-2 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <Label htmlFor="session-use-random-image">{t('addRandomImage')}</Label>
                {useRandomImage && (
                  <button
                    type="button"
                    onClick={() => void handlePickAnotherImage()}
                    className="ml-3 cursor-pointer p-0 text-blue-600 hover:text-blue-700"
                  >
                    <span className="relative -top-[2px] text-sm underline underline-offset-2">
                      {t('chooseAnother')}
                    </span>
                  </button>
                )}
              </div>
            </div>

            <div className="mt-6">
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-sm font-medium text-slate-600">
                      <th className="w-[260px] px-2 py-2">{t('exerciseName')}</th>
                      <th className="w-24 px-2 py-2">{t('sets')}</th>
                      <th className="w-28 px-2 py-2">{t('repetitions')}</th>
                      <th className="w-28 px-2 py-2">{t('weight')}</th>
                      <th className="w-14 px-2 py-2" />
                    </tr>
                  </thead>
                  <tbody>
                    {workoutExercises.map((exercise, index) => (
                      <tr key={exercise.id} className="border-b border-slate-100 align-top">
                        <td className="w-[260px] px-2 py-2">
                          <ExerciseSelector
                            value={exercise.name}
                            onChange={(nameKey) => updateExerciseField(index, 'name', nameKey)}
                            placeholder={t('enterExerciseName')}
                            className="w-[260px] max-w-[260px]"
                          />
                        </td>
                        <td className="px-2 py-2">
                          <Input
                            id={`sets-${index}`}
                            type="text"
                            value={exercise.sets}
                            onChange={(e) => updateExerciseField(index, 'sets', e.target.value)}
                            aria-label={t('sets')}
                          />
                        </td>
                        <td className="px-2 py-2">
                          <Input
                            id={`reps-${index}`}
                            type="text"
                            value={exercise.reps || ''}
                            onChange={(e) => updateExerciseField(index, 'reps', e.target.value)}
                            aria-label={t('repetitions')}
                          />
                        </td>
                        <td className="px-2 py-2">
                          <Input
                            id={`weight-${index}`}
                            type="number"
                            value={exercise.weight}
                            onChange={(e) =>
                              updateExerciseField(index, 'weight', Number(e.target.value))
                            }
                            aria-label={t('weight')}
                          />
                        </td>
                        <td className="px-2 py-2">
                          <Button
                            type="button"
                            variant="destructive"
                            onClick={() => removeExercise(index)}
                            disabled={workoutExercises.length <= 1}
                          >
                            <X className="size-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <td className="px-2 py-3" colSpan={5}>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={addExercise}
                          className="w-full border-slate-300 text-slate-700 hover:bg-slate-50"
                        >
                          {t('addExercise')}
                        </Button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>

        <div className="sticky top-0 h-full max-h-[calc(100vh-16rem)] border-l border-slate-200 pl-6">
          <h3 className="mb-4 text-lg font-medium">{t('preview')}</h3>
          <WorkoutPreview
            exercises={workoutExercises}
            description={workoutDescription}
            bodyWeight={bodyWeight}
            templateName={workoutName}
            useWeekdayPrefix={useWeekdayPrefix}
            useWorkoutDatePrefix={useWorkoutDatePrefix}
            useEmptyLinesBetweenSections={useEmptyLinesBetweenSections}
            useTotalWorkload={useTotalWorkload}
            useRandomImage={useRandomImage}
            randomImagePath={randomImagePath}
          />
          <p className="mt-2 text-xs text-slate-500">{t('previewDescription')}</p>

          <div className="sticky bottom-0 mt-4 space-y-2 bg-white pt-3">
            <div className="grid grid-cols-2 gap-2">
              <Button type="button" variant="outline" onClick={handleReset} className="w-full">
                {t('reset')}
              </Button>
              <Button type="button" variant="outline" onClick={handleSave} className="w-full">
                {t('save')}
              </Button>
            </div>
            <Button
              type="button"
              onClick={() => void handleSaveAndSend()}
              className="w-full"
              variant="default"
            >
              {t('saveAndSend')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
