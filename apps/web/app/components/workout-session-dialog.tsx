import { Button } from '@repo/ui/components/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@repo/ui/components/dialog';
import { Input } from '@repo/ui/components/input';
import { Label } from '@repo/ui/components/label';
import { NumberInput } from '@repo/ui/components/number-input';
import { Textarea } from '@repo/ui/components/textarea';
import { toast } from '@repo/ui/toast';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { type IExercise } from '../interfaces/exercise';
import { type IWorkoutTemplate } from '../interfaces/workout-template';
import { RandomImageService } from '../services/random-image-service';
import { TelegramService } from '../services/telegram-service';
import { useModalStore } from '../stores/modal-store';
import { useTelegramStore } from '../stores/telegram-store';
import { useWorkoutHistoryStore } from '../stores/workout-history-store';
import { generateWorkoutText } from '../utils/workout-text-generator';
import { CustomImageUploadDialog } from './custom-image-upload-dialog';
import { ExerciseListEditor } from './exercise-list-editor';
import { WorkoutPreview } from './workout-preview';

export function WorkoutSessionDialog() {
  const { t } = useTranslation('common');

  const [workoutExercises, setWorkoutExercises] = useState<IExercise[]>([]);
  const [workoutName, setWorkoutName] = useState('');
  const [workoutDescription, setWorkoutDescription] = useState('');
  const [bodyWeight, setBodyWeight] = useState('');
  const [bodyFatPercentage, setBodyFatPercentage] = useState('');
  const [muscleMassKg, setMuscleMassKg] = useState('');
  const [useWeekdayPrefix, setUseWeekdayPrefix] = useState(false);
  const [useWorkoutDatePrefix, setUseWorkoutDatePrefix] = useState(false);
  const [useEmptyLinesBetweenSections, setUseEmptyLinesBetweenSections] = useState(true);
  const [useTotalWorkload, setUseTotalWorkload] = useState(false);
  const [useRandomImage, setUseRandomImage] = useState(false);
  const [randomImagePath, setRandomImagePath] = useState('');
  const [customImageFile, setCustomImageFile] = useState<File | null>(null);
  const [customImagePreviewUrl, setCustomImagePreviewUrl] = useState('');
  const [isCustomImageDialogOpen, setIsCustomImageDialogOpen] = useState(false);

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
    bodyFatPercentage: string;
    muscleMassKg: string;
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
    bodyFatPercentage: '',
    muscleMassKg: '',
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
    return Number.isFinite(numeric) && numeric >= 0 ? trimmed : '';
  };

  const normalizeMetricValue = (value?: string) => {
    const trimmed = value?.trim() || '';
    if (!trimmed) return '';
    const numeric = Number(trimmed);
    return Number.isFinite(numeric) && numeric >= 0 ? trimmed : '';
  };

  const clearCustomImage = () => {
    setCustomImageFile(null);
    setCustomImagePreviewUrl((current) => {
      if (current) {
        URL.revokeObjectURL(current);
      }
      return '';
    });
  };

  const applyFormState = (state: SessionFormState) => {
    setWorkoutExercises(state.workoutExercises.map((exercise) => ({ ...exercise })));
    setWorkoutName(state.workoutName);
    setWorkoutDescription(state.workoutDescription);
    setBodyWeight(state.bodyWeight);
    setBodyFatPercentage(state.bodyFatPercentage);
    setMuscleMassKg(state.muscleMassKg);
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
        bodyFatPercentage: normalizeMetricValue(template.bodyFatPercentage),
        muscleMassKg: normalizeMetricValue(template.muscleMassKg),
        useWeekdayPrefix: template.useWeekdayPrefix || false,
        useWorkoutDatePrefix: template.useWorkoutDatePrefix || false,
        useEmptyLinesBetweenSections: template.useEmptyLinesBetweenSections ?? true,
        useTotalWorkload: template.useTotalWorkload || false,
        useRandomImage: template.useRandomImage || false,
        randomImagePath: template.randomImagePath || '',
      };

      initialFormStateRef.current = formState;
      clearCustomImage();
      applyFormState(formState);
    } else if (isActive('workoutSession')) {
      const emptyState = createEmptyFormState();
      initialFormStateRef.current = emptyState;
      clearCustomImage();
      applyFormState(emptyState);
    }
  }, [activeModal, isActive]);

  useEffect(() => {
    return () => {
      if (customImagePreviewUrl) {
        URL.revokeObjectURL(customImagePreviewUrl);
      }
    };
  }, [customImagePreviewUrl]);

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
      bodyFatPercentage,
      muscleMassKg,
      workoutName,
      useWeekdayPrefix,
      useWorkoutDatePrefix,
      useEmptyLinesBetweenSections,
      useTotalWorkload,
    );

    saveWorkoutSession();

    if (isConfigured() && chatId) {
      try {
        let imagePathToSend = randomImagePath;

        if (useRandomImage && !customImageFile && !imagePathToSend) {
          imagePathToSend = (await RandomImageService.getRandomImage()) || '';
          if (imagePathToSend) {
            setRandomImagePath(imagePathToSend);
          }
        }

        let success: boolean;

        if (useRandomImage) {
          const imageSource = customImageFile || imagePathToSend;

          if (!imageSource) {
            toast.error(t('noImagesFoundInFolder'));
            success = false;
          } else {
            success = await TelegramService.sendPhoto(imageSource, chatId, report);
          }
        } else {
          success = await TelegramService.sendMessage(chatId, report);
        }

        if (success) {
          toast.success(t('workoutReportSentToTelegramSuccessfully'));
        } else {
          if (useRandomImage) {
            toast.error(t('failedToSendWorkoutReportWithImageToTelegram'));
          } else {
            toast.error(t('failedToSendWorkoutReportToTelegram'));
          }
        }
      } catch (networkError) {
        console.error('Network error sending report:', networkError);
        toast.error(t('networkErrorSendingWorkoutReportToTelegram'));
      }
    } else {
      toast.error(t('pleaseConfigureYourTelegramTokenAndChatIDToSendReports'));
    }

    closeModal();
    clearCustomImage();
    applyFormState(createEmptyFormState());
  };

  const handleReset = () => {
    clearCustomImage();
    applyFormState(initialFormStateRef.current);
  };

  const handleRandomImageToggle = async (checked: boolean) => {
    if (!checked) {
      setUseRandomImage(false);
      setRandomImagePath('');
      clearCustomImage();
      return;
    }

    if (customImagePreviewUrl) {
      setUseRandomImage(true);
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
    clearCustomImage();
    setUseRandomImage(true);
    setRandomImagePath(nextImagePath);
  };

  const handleCustomImageSelected = (file: File) => {
    clearCustomImage();
    const previewUrl = URL.createObjectURL(file);
    setCustomImageFile(file);
    setCustomImagePreviewUrl(previewUrl);
    setUseRandomImage(true);
  };

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      clearCustomImage();
      setIsCustomImageDialogOpen(false);
      closeModal();
      return;
    }
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

  const currentImagePreviewUrl = customImagePreviewUrl || randomImagePath;

  return (
    <>
      <Dialog open={isOpen && !!activeModal.data} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="grid max-h-[90vh] max-w-[1200px] grid-cols-[1.5fr_1fr] gap-6 overflow-y-auto">
          <div className="space-y-4">
            <DialogHeader>
              <DialogTitle>{t('workoutSession')}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Input
                  id="workout-name"
                  label={t('workoutName')}
                  value={workoutName}
                  onChange={(e) => setWorkoutName(e.target.value)}
                  placeholder={t('enterWorkoutName')}
                  className="mt-1"
                />
              </div>

              <div>
                <Textarea
                  id="workout-description"
                  label={t('workoutDescription')}
                  rows={4}
                  value={workoutDescription}
                  onChange={(e) => setWorkoutDescription(e.target.value)}
                  placeholder={t('describeYourWorkout')}
                  className="mt-1 min-h-25"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <NumberInput
                  id="workout-body-weight"
                  label={t('bodyWeight')}
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

                <NumberInput
                  id="workout-body-fat-percentage"
                  label={t('bodyFatPercentage')}
                  min="0"
                  step="0.1"
                  value={bodyFatPercentage}
                  onChange={(e) => {
                    const next = e.target.value;

                    if (next === '') {
                      setBodyFatPercentage('');
                      return;
                    }

                    const numeric = Number(next);

                    if (Number.isFinite(numeric) && numeric >= 0) {
                      setBodyFatPercentage(next);
                    }
                  }}
                  placeholder={t('enterBodyFatPercentage')}
                  className="mt-1"
                />

                <NumberInput
                  id="workout-muscle-mass-kg"
                  label={t('muscleMassKg')}
                  min="0"
                  step="0.1"
                  value={muscleMassKg}
                  onChange={(e) => {
                    const next = e.target.value;

                    if (next === '') {
                      setMuscleMassKg('');
                      return;
                    }

                    const numeric = Number(next);

                    if (Number.isFinite(numeric) && numeric >= 0) {
                      setMuscleMassKg(next);
                    }
                  }}
                  placeholder={t('enterMuscleMassKg')}
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
                  <Label htmlFor="session-use-random-image">{t('addImage')}</Label>
                  {useRandomImage && (
                    <div className="ml-3 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => void handlePickAnotherImage()}
                        className="cursor-pointer p-0 text-blue-600 hover:text-blue-700"
                      >
                        <span className="relative -top-[2px] text-sm underline underline-offset-2">
                          {t('chooseAnother')}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsCustomImageDialogOpen(true)}
                        className="cursor-pointer p-0 text-blue-600 hover:text-blue-700"
                      >
                        <span className="relative -top-[2px] text-sm underline underline-offset-2">
                          {t('addCustom')}
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <ExerciseListEditor
                  exercises={workoutExercises}
                  onExerciseFieldChange={updateExerciseField}
                  onAddExercise={addExercise}
                  onRemoveExercise={removeExercise}
                  onReorderExercises={setWorkoutExercises}
                />
              </div>
            </div>
          </div>

          <div className="sticky top-0 h-full max-h-[calc(100vh-16rem)] border-l border-slate-200 pl-6">
            <h3 className="mb-4 text-lg font-medium">{t('preview')}</h3>
            <WorkoutPreview
              exercises={workoutExercises}
              description={workoutDescription}
              bodyWeight={bodyWeight}
              bodyFatPercentage={bodyFatPercentage}
              muscleMassKg={muscleMassKg}
              templateName={workoutName}
              useWeekdayPrefix={useWeekdayPrefix}
              useWorkoutDatePrefix={useWorkoutDatePrefix}
              useEmptyLinesBetweenSections={useEmptyLinesBetweenSections}
              useTotalWorkload={useTotalWorkload}
              useImage={useRandomImage}
              imagePreviewUrl={currentImagePreviewUrl}
            />
            <p className="mt-2 text-xs text-slate-500">{t('previewDescription')}</p>

            <div className="sticky bottom-0 mt-4 space-y-3 pt-3">
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
                className="w-full bg-blue-500 hover:bg-blue-600"
                variant="default"
              >
                {t('saveAndSend')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <CustomImageUploadDialog
        open={isCustomImageDialogOpen}
        onOpenChange={setIsCustomImageDialogOpen}
        onImageSelected={handleCustomImageSelected}
      />
    </>
  );
}
