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
import { useModalStore } from '../stores/modal-store';
import { useWorkoutTemplateStore } from '../stores/workout-template-store';
import { ExerciseSelector } from './exercise-selector';
import { WorkoutPreview } from './workout-preview';

export function TemplateEditorDialog() {
  const { t } = useTranslation('common');
  const { addTemplate, updateTemplate } = useWorkoutTemplateStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [bodyWeight, setBodyWeight] = useState('');
  const [exercises, setExercises] = useState<IExercise[]>([
    { id: Math.random().toString(36).substr(2, 9), name: '', sets: '3', reps: '10', weight: 0 },
  ]);
  const [useWeekdayPrefix, setUseWeekdayPrefix] = useState(false);
  const [useWorkoutDatePrefix, setUseWorkoutDatePrefix] = useState(false);
  const [useEmptyLinesBetweenSections, setUseEmptyLinesBetweenSections] = useState(true);
  const [useTotalWorkload, setUseTotalWorkload] = useState(false);
  const [useRandomImage, setUseRandomImage] = useState(false);
  const [randomImagePath, setRandomImagePath] = useState('');
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
    return Number.isFinite(numeric) && numeric > 0 ? trimmed : '';
  };

  const applyFormState = (state: TemplateFormState) => {
    setName(state.name);
    setDescription(state.description);
    setBodyWeight(state.bodyWeight);
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
      applyFormState(formState);
    } else {
      const emptyState = createEmptyFormState();
      initialFormStateRef.current = emptyState;
      applyFormState(emptyState);
      setNameError('');
    }
  }, [activeModal]);

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
    applyFormState(initialFormStateRef.current);
    setNameError('');
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
      exercises: exercises.map((ex) => ({
        ...ex,
        sets: ex.sets,
        weight: ex.weight,
      })),
      useWeekdayPrefix,
      useWorkoutDatePrefix,
      useEmptyLinesBetweenSections,
      useTotalWorkload,
      useRandomImage,
      randomImagePath: useRandomImage ? randomImagePath : '',
    };

    if (activeModal?.data?.template) {
      updateTemplate(template);
    } else {
      addTemplate(template);
    }

    toast.success(t('templateSavedSuccessfully'));
    closeModal();
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent className="grid max-h-[90vh] max-w-[1100px] grid-cols-[1.5fr_1fr] gap-6 overflow-y-auto">
        <div className="space-y-4">
          <DialogHeader>
            <DialogTitle>{t(activeModal?.data?.template ? 'edit' : 'newTemplate')}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="template-name">{t('workoutName')}</Label>
              <Input
                id="template-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('enterWorkoutName')}
                className={nameError ? 'border-red-500' : ''}
              />
              {nameError && <p className="mt-1 text-sm text-red-500">{nameError}</p>}
            </div>

            <div>
              <Label htmlFor="template-description">{t('workoutDescription')}</Label>
              <Textarea
                id="template-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('enterTemplateDescription')}
              />
            </div>

            <div>
              <Label htmlFor="template-body-weight">{t('bodyWeight')}</Label>
              <Input
                id="template-body-weight"
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
                <Label htmlFor="template-use-random-image">{t('addRandomImage')}</Label>
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
                    {exercises.map((exercise, index) => (
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
                            disabled={exercises.length <= 1}
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

        <div className="self-stretch border-l border-slate-200 pl-6">
          <div className="sticky top-0">
            <h3 className="mb-4 text-lg font-medium">{t('preview')}</h3>
            <WorkoutPreview
              exercises={exercises}
              description={description}
              bodyWeight={bodyWeight}
              templateName={name}
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
                <Button type="button" onClick={handleSave} variant="default" className="w-full">
                  {t('saveTemplate')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
