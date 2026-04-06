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
import { useModalStore } from '../stores/modal-store';
import { useWorkoutTemplateStore } from '../stores/workout-template-store';
import { ExerciseSelector } from './exercise-selector';
import { WorkoutPreview } from './workout-preview';

export function TemplateEditorDialog() {
  const { t } = useTranslation('common');
  const { addTemplate, updateTemplate } = useWorkoutTemplateStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [workoutName, setWorkoutName] = useState('');
  const [workoutDescription, setWorkoutDescription] = useState('');
  const [exercises, setExercises] = useState<IExercise[]>([
    { id: Math.random().toString(36).substr(2, 9), name: '', sets: '3', weight: 0 },
  ]);
  const [useWeekdayPrefix, setUseWeekdayPrefix] = useState(false);
  const [nameError, setNameError] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const isOpen = useModalStore((state) => state.isActive('templateEditor'));
  const { activeModal, closeModal } = useModalStore();

  useEffect(() => {
    if (activeModal?.data?.template) {
      const template = activeModal.data.template as IWorkoutTemplate;
      setName(template.name);
      setDescription(template.description || '');
      setWorkoutName(template.name);
      setWorkoutDescription(template.description || '');

      setExercises(
        template.exercises.map((ex) => ({
          ...ex,
          sets: ex.sets.toString(),
          weight: Number(ex.weight),
        })),
      );
      setUseWeekdayPrefix(template.useWeekdayPrefix || false);
    } else {
      setName('');
      setDescription('');
      setWorkoutName('');
      setWorkoutDescription('');
      setExercises([
        { id: Math.random().toString(36).substr(2, 9), name: '', sets: '3', weight: 0 },
      ]);
      setUseWeekdayPrefix(false);
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
    } else if (field === 'weight') {
      updatedExercise = { ...currentExercise, weight: Number(value) };
    } else {
      return;
    }

    updatedExercises[index] = updatedExercise;

    setExercises(updatedExercises);
  };

  const addExercise = () => {
    const newExercise: IExercise = {
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      sets: '3',
      weight: 0,
    };
    setExercises([...exercises, newExercise]);
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

  const handleSave = () => {
    setNameError('');
    if (!name.trim()) {
      setNameError(t('templateNameIsRequired'));
      return;
    }

    const template: IWorkoutTemplate = {
      id: activeModal?.data?.template?.id || Math.random().toString(36).substr(2, 9),
      name,
      description,
      exercises: exercises.map((ex) => ({
        ...ex,
        sets: ex.sets,
        weight: ex.weight,
      })),
      useWeekdayPrefix,
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
      <DialogContent className="grid max-h-[90vh] max-w-5xl grid-cols-[1.5fr_1fr] gap-6 overflow-y-auto">
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
                placeholder={t('enterTemplateName')}
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

            <div className="flex items-center">
              <input
                type="checkbox"
                id="use-weekday-prefix"
                checked={useWeekdayPrefix}
                onChange={(e) => setUseWeekdayPrefix(e.target.checked)}
                className="mr-2 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <Label htmlFor="use-weekday-prefix">{t('addWeekdayPrefix')}</Label>
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
                {exercises.map((exercise, index) => (
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
                        disabled={exercises.length <= 1}
                      >
                        <X className="size-4" />
                      </Button>
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
            exercises={exercises}
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
