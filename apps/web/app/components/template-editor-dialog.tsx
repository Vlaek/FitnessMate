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
import { useModalStore } from '../stores/modal-store';
import { useWorkoutTemplateStore } from '../stores/workout-template-store';
import { CustomImageUploadDialog } from './custom-image-upload-dialog';
import { ExerciseListEditor } from './exercise-list-editor';
import { WorkoutPreview } from './workout-preview';

export function TemplateEditorDialog() {
  const { t } = useTranslation('common');
  const { addTemplate, updateTemplate } = useWorkoutTemplateStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [bodyWeight, setBodyWeight] = useState('');
  const [bodyFatPercentage, setBodyFatPercentage] = useState('');
  const [muscleMassKg, setMuscleMassKg] = useState('');
  const [exercises, setExercises] = useState<IExercise[]>([
    { id: Math.random().toString(36).substr(2, 9), name: '', sets: '3', reps: '10', weight: 0 },
  ]);
  const [useWeekdayPrefix, setUseWeekdayPrefix] = useState(false);
  const [useWorkoutDatePrefix, setUseWorkoutDatePrefix] = useState(false);
  const [useEmptyLinesBetweenSections, setUseEmptyLinesBetweenSections] = useState(true);
  const [useTotalWorkload, setUseTotalWorkload] = useState(false);
  const [useRandomImage, setUseRandomImage] = useState(false);
  const [randomImagePath, setRandomImagePath] = useState('');
  const [customImageFile, setCustomImageFile] = useState<File | null>(null);
  const [customImagePreviewUrl, setCustomImagePreviewUrl] = useState('');
  const [isCustomImageDialogOpen, setIsCustomImageDialogOpen] = useState(false);
  const [nameError, setNameError] = useState('');

  const isOpen = useModalStore((state) => state.isActive('templateEditor'));
  const { activeModal, closeModal } = useModalStore();
  const createEmptyExercise = (): IExercise => ({
    id: Math.random().toString(36).substr(2, 9),
    name: '',
    sets: '3',
    reps: '10',
    weight: 0,
  });

  type TemplateFormState = {
    name: string;
    description: string;
    bodyWeight: string;
    bodyFatPercentage: string;
    muscleMassKg: string;
    exercises: IExercise[];
    useWeekdayPrefix: boolean;
    useWorkoutDatePrefix: boolean;
    useEmptyLinesBetweenSections: boolean;
    useTotalWorkload: boolean;
    useRandomImage: boolean;
    randomImagePath: string;
  };

  const createEmptyFormState = (): TemplateFormState => ({
    name: '',
    description: '',
    bodyWeight: '',
    bodyFatPercentage: '',
    muscleMassKg: '',
    exercises: [createEmptyExercise()],
    useWeekdayPrefix: false,
    useWorkoutDatePrefix: false,
    useEmptyLinesBetweenSections: true,
    useTotalWorkload: false,
    useRandomImage: false,
    randomImagePath: '',
  });

  const initialFormStateRef = useRef<TemplateFormState>(createEmptyFormState());

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

  const applyFormState = (state: TemplateFormState) => {
    setName(state.name);
    setDescription(state.description);
    setBodyWeight(state.bodyWeight);
    setBodyFatPercentage(state.bodyFatPercentage);
    setMuscleMassKg(state.muscleMassKg);
    setExercises(state.exercises.map((exercise) => ({ ...exercise })));
    setUseWeekdayPrefix(state.useWeekdayPrefix);
    setUseWorkoutDatePrefix(state.useWorkoutDatePrefix);
    setUseEmptyLinesBetweenSections(state.useEmptyLinesBetweenSections);
    setUseTotalWorkload(state.useTotalWorkload);
    setUseRandomImage(state.useRandomImage);
    setRandomImagePath(state.randomImagePath);
  };

  useEffect(() => {
    if (activeModal?.data?.template) {
      const template = activeModal.data.template as IWorkoutTemplate;
      const formState: TemplateFormState = {
        name: template.name,
        description: template.description || '',
        bodyWeight: normalizeBodyWeight(template.bodyWeight),
        bodyFatPercentage: normalizeMetricValue(template.bodyFatPercentage),
        muscleMassKg: normalizeMetricValue(template.muscleMassKg),
        exercises:
          template.exercises.length > 0
            ? template.exercises.map((ex) => ({
                ...ex,
                sets: ex.sets.toString(),
                reps: ex.reps?.toString() || '10',
                weight: Number(ex.weight),
              }))
            : [createEmptyExercise()],
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
    } else {
      const emptyState = createEmptyFormState();
      initialFormStateRef.current = emptyState;
      clearCustomImage();
      applyFormState(emptyState);
      setNameError('');
    }
  }, [activeModal]);

  useEffect(() => {
    return () => {
      if (customImagePreviewUrl) {
        URL.revokeObjectURL(customImagePreviewUrl);
      }
    };
  }, [customImagePreviewUrl]);

  const updateExerciseField = (index: number, field: keyof IExercise, value: string | number) => {
    const updatedExercises = [...exercises];

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
      updatedExercise = { ...currentExercise, weight: Number(value) };
    } else {
      return;
    }

    updatedExercises[index] = updatedExercise;

    setExercises(updatedExercises);
  };

  const addExercise = () => {
    setExercises([...exercises, createEmptyExercise()]);
  };

  const removeExercise = (index: number) => {
    if (exercises.length <= 1) {
      toast.error(t('atLeastOneExerciseIsRequired'));
      return;
    }
    const updatedExercises = [...exercises];
    updatedExercises.splice(index, 1);
    setExercises(updatedExercises);
  };

  const handleReset = () => {
    clearCustomImage();
    applyFormState(initialFormStateRef.current);
    setNameError('');
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

  const currentImagePreviewUrl = customImagePreviewUrl || randomImagePath;

  const handleSave = () => {
    setNameError('');
    if (!name.trim()) {
      setNameError(t('workoutNameIsRequired'));
      return;
    }

    const template: IWorkoutTemplate = {
      id: activeModal?.data?.template?.id || Math.random().toString(36).substr(2, 9),
      name,
      description,
      bodyWeight: normalizeBodyWeight(bodyWeight),
      bodyFatPercentage: normalizeMetricValue(bodyFatPercentage),
      muscleMassKg: normalizeMetricValue(muscleMassKg),
      exercises: exercises.map((ex) => ({
        ...ex,
        sets: ex.sets,
        weight: ex.weight,
      })),
      useWeekdayPrefix,
      useWorkoutDatePrefix,
      useEmptyLinesBetweenSections,
      useTotalWorkload,
      useRandomImage: !customImageFile && useRandomImage,
      randomImagePath: !customImageFile && useRandomImage ? randomImagePath : '',
    };

    if (activeModal?.data?.template) {
      updateTemplate(template);
    } else {
      addTemplate(template);
    }

    toast.success(t('templateSavedSuccessfully'));
    clearCustomImage();
    closeModal();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="grid max-h-[90vh] max-w-[1200px] grid-cols-[1.5fr_1fr] gap-6 overflow-y-auto">
          <div className="space-y-4">
            <DialogHeader>
              <DialogTitle>{t(activeModal?.data?.template ? 'edit' : 'newTemplate')}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Input
                  id="template-name"
                  label={t('workoutName')}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('enterWorkoutName')}
                  className={nameError ? 'border-red-500' : ''}
                />
                {nameError && <p className="mt-1 text-sm text-red-500">{nameError}</p>}
              </div>

              <div>
                <Textarea
                  id="template-description"
                  label={t('workoutDescription')}
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('enterTemplateDescription')}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <NumberInput
                  id="template-body-weight"
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
                />

                <NumberInput
                  id="template-body-fat-percentage"
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
                />

                <NumberInput
                  id="template-muscle-mass-kg"
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
                />
              </div>

              <div className="space-y-4 pt-4">
                <div className="ml-2 flex flex-wrap items-center gap-x-6 gap-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="template-use-weekday-prefix"
                      checked={useWeekdayPrefix}
                      onChange={(e) => setUseWeekdayPrefix(e.target.checked)}
                      className="mr-2 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="template-use-weekday-prefix">{t('addWeekdayPrefix')}</Label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="template-use-workout-date-prefix"
                      checked={useWorkoutDatePrefix}
                      onChange={(e) => setUseWorkoutDatePrefix(e.target.checked)}
                      className="mr-2 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="template-use-workout-date-prefix">{t('addWorkoutDate')}</Label>
                  </div>
                </div>

                <div className="ml-2 flex items-center">
                  <input
                    type="checkbox"
                    id="template-use-empty-lines-between-sections"
                    checked={useEmptyLinesBetweenSections}
                    onChange={(e) => setUseEmptyLinesBetweenSections(e.target.checked)}
                    className="mr-2 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Label htmlFor="template-use-empty-lines-between-sections">
                    {t('addEmptyLinesBetweenSections')}
                  </Label>
                </div>

                <div className="ml-2 flex items-center">
                  <input
                    type="checkbox"
                    id="template-use-total-workload"
                    checked={useTotalWorkload}
                    onChange={(e) => setUseTotalWorkload(e.target.checked)}
                    className="mr-2 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Label htmlFor="template-use-total-workload">{t('addTotalWorkload')}</Label>
                </div>

                <div className="ml-2 flex min-h-6 items-center">
                  <input
                    type="checkbox"
                    id="template-use-random-image"
                    checked={useRandomImage}
                    onChange={(e) => void handleRandomImageToggle(e.target.checked)}
                    className="mr-2 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Label htmlFor="template-use-random-image">{t('addImage')}</Label>
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
                  exercises={exercises}
                  onExerciseFieldChange={updateExerciseField}
                  onAddExercise={addExercise}
                  onRemoveExercise={removeExercise}
                  onReorderExercises={setExercises}
                />
              </div>
            </div>
          </div>

          <div className="self-stretch border-l border-slate-200 pl-6">
            <div className="sticky top-0">
              <h3 className="mb-4 text-lg font-medium">{t('preview')}</h3>
              <WorkoutPreview
                exercises={exercises}
                description={description}
                bodyWeight={bodyWeight}
                bodyFatPercentage={bodyFatPercentage}
                muscleMassKg={muscleMassKg}
                templateName={name}
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
                  <Button
                    onClick={handleSave}
                    variant="default"
                    className="w-full bg-blue-500 hover:bg-blue-600"
                  >
                    {t('saveTemplate')}
                  </Button>
                </div>
              </div>
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
