'use client';

import { Button } from '@repo/ui/components/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@repo/ui/components/dialog';
import { Input } from '@repo/ui/components/input';
import { Label } from '@repo/ui/components/label';
import { Textarea } from '@repo/ui/components/textarea';
import { toast } from '@repo/ui/toast';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Exercise } from '../interfaces/exercise';
import { WorkoutTemplate } from '../interfaces/workout-template';
import { useModalStore } from '../stores/modal-store';
import { useWorkoutTemplateStore } from '../stores/workout-template-store';

export function TemplateEditorDialog() {
  const { t } = useTranslation('common');

  const { currentTemplate, setCurrentTemplate, setIsEditingTemplate, updateTemplate, addTemplate } =
    useWorkoutTemplateStore();
  const { closeModal } = useModalStore();
  const isOpen = useModalStore((state) => state.isActive('templateEditor'));

  const updateTemplateField = (field: keyof WorkoutTemplate, value: string | Exercise[]) => {
    if (!currentTemplate) return;

    setCurrentTemplate({
      ...currentTemplate,
      [field]: value,
    });
  };

  const updateExerciseInTemplate = (
    index: number,
    field: keyof Exercise,
    value: string | number,
  ) => {
    if (!currentTemplate) return;

    const updatedExercises = [...currentTemplate.exercises];
    updatedExercises[index] = { ...updatedExercises[index], [field]: value };
    updateTemplateField('exercises', updatedExercises);
  };

  const addExerciseToTemplate = () => {
    if (!currentTemplate) return;

    const newExercise: Exercise = {
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      sets: 3,
      weight: 0,
    };

    updateTemplateField('exercises', [...currentTemplate.exercises, newExercise]);
  };

  const removeExerciseFromTemplate = (index: number) => {
    if (!currentTemplate || currentTemplate.exercises.length <= 1) return;

    const updatedExercises = [...currentTemplate.exercises];
    updatedExercises.splice(index, 1);
    updateTemplateField('exercises', updatedExercises);
  };

  const handleSaveTemplate = () => {
    if (!currentTemplate) return;

    if (!currentTemplate.name.trim()) {
      toast.error(t('templateNameIsRequired'));
      return;
    }

    if (currentTemplate.id) {
      updateTemplate(currentTemplate);
    } else {
      const templateWithId: WorkoutTemplate = {
        ...currentTemplate,
        id: Date.now().toString(),
      };
      addTemplate(templateWithId);
    }

    setIsEditingTemplate(false);
    setCurrentTemplate(null);
    closeModal();
    toast.success(t('templateSavedSuccessfully'));
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto sm:max-w-md lg:max-w-lg">
        <DialogHeader>
          <DialogTitle>{currentTemplate?.id ? t('edit') : t('newTemplate')}</DialogTitle>
        </DialogHeader>

        {currentTemplate && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="template-name">{t('workoutTemplates')}</Label>
              <Input
                id="template-name"
                value={currentTemplate.name}
                onChange={(e) => updateTemplateField('name', e.target.value)}
                placeholder={t('enterTemplateName')}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="template-description">{t('workoutDescription')}</Label>
              <Textarea
                id="template-description"
                value={currentTemplate.description || ''}
                onChange={(e) => updateTemplateField('description', e.target.value)}
                placeholder={t('enterTemplateDescription')}
                className="mt-1 min-h-25"
              />
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">{t('exercises')}</h3>
                <Button
                  type="button"
                  variant="outline"
                  onClick={addExerciseToTemplate}
                  className="border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  {t('addExercise')}
                </Button>
              </div>

              <div className="mt-4 space-y-4">
                {currentTemplate.exercises.map((exercise, index) => (
                  <div
                    key={exercise.id || index}
                    className="flex gap-3 rounded-lg border border-slate-200 p-4"
                  >
                    <div>
                      <Label htmlFor={`exercise-name-${index}`}>{t('exerciseName')}</Label>
                      <Input
                        id={`exercise-name-${index}`}
                        value={exercise.name}
                        onChange={(e) => updateExerciseInTemplate(index, 'name', e.target.value)}
                        placeholder={t('enterExerciseName')}
                      />
                    </div>

                    <div className="flex-1">
                      <Label htmlFor={`sets-${index}`}>{t('sets')}</Label>
                      <Input
                        id={`sets-${index}`}
                        type="number"
                        value={exercise.sets}
                        onChange={(e) =>
                          updateExerciseInTemplate(index, 'sets', parseInt(e.target.value))
                        }
                        min="1"
                      />
                    </div>

                    <div className="flex-1">
                      <Label htmlFor={`weight-${index}`}>{t('weight')}</Label>
                      <Input
                        id={`weight-${index}`}
                        type="number"
                        value={exercise.weight}
                        onChange={(e) =>
                          updateExerciseInTemplate(index, 'weight', parseInt(e.target.value))
                        }
                        min="0"
                      />
                    </div>

                    <div>
                      <div className="h-6"></div>
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => removeExerciseFromTemplate(index)}
                        disabled={currentTemplate.exercises.length <= 1}
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            onClick={handleSaveTemplate}
            className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
          >
            {t('saveTemplate')}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              closeModal();
              setIsEditingTemplate(false);
              setCurrentTemplate(null);
            }}
            className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            {t('cancel')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
