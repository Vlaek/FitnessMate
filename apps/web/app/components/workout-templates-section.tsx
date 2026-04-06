import { Button } from '@repo/ui/components/button';
import { CardContent } from '@repo/ui/components/card';
import { useTranslation } from 'react-i18next';
import { IWorkoutTemplate } from '../interfaces/workout-template';
import { useModalStore } from '../stores/modal-store';
import { useWorkoutTemplateStore } from '../stores/workout-template-store';

export function WorkoutTemplatesSection() {
  const { t } = useTranslation('common');

  const { templates, deleteTemplate, setCurrentTemplate, setIsEditingTemplate } =
    useWorkoutTemplateStore();
  const { openModal } = useModalStore();

  const handleDeleteTemplate = (id: string) => {
    if (confirm(t('areYouSureYouWantToDeleteThisTemplate'))) {
      deleteTemplate(id);
    }
  };

  const handleStartWorkout = (template: IWorkoutTemplate) => {
    openModal('workoutSession', { template });
  };

  const handleAddNewTemplate = () => {
    setCurrentTemplate({
      name: '',
      description: '',
      exercises: [{ id: Math.random().toString(36).substr(2, 9), name: '', sets: '3', weight: 0 }],
    });
    setIsEditingTemplate(true);
    openModal('templateEditor');
  };

  const handleEditTemplate = (template: IWorkoutTemplate) => {
    setCurrentTemplate({ ...template });
    setIsEditingTemplate(true);
    openModal('templateEditor');
  };

  return (
    <div className="mb-10 overflow-hidden rounded-2xl bg-white shadow-xl">
      <div className="bg-teal-600 p-6">
        <div className="flex flex-row items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">{t('workoutTemplates')}</h2>
            <p className="text-teal-100">{t('createAndManageWorkoutTemplates')}</p>
          </div>
          <Button
            onClick={handleAddNewTemplate}
            className="rounded-lg bg-white px-5 py-2 text-teal-600 transition-colors hover:bg-slate-100"
          >
            {t('addNewTemplate')}
          </Button>
        </div>
      </div>
      <CardContent className="px-6 py-6">
        {templates.length === 0 ? (
          <p className="py-8 text-center text-lg text-slate-500">{t('noTemplatesYet')}</p>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-2">
            {templates.map((template) => (
              <div
                key={template.id}
                className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 transition-shadow duration-300 hover:shadow-md"
              >
                <h3 className="text-xl font-bold text-slate-800">{template.name}</h3>
                <p className="mt-2 grow text-slate-600">
                  {template.description || t('noDescription')}
                </p>
                <div className="mt-5 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditTemplate(template)}
                    className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50"
                  >
                    {t('edit')}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteTemplate(template?.id || '')}
                    className="flex-1"
                  >
                    {t('delete')}
                  </Button>
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => handleStartWorkout(template)}
                    className="flex-1 bg-blue-500 hover:bg-blue-600"
                  >
                    {t('use')}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </div>
  );
}
