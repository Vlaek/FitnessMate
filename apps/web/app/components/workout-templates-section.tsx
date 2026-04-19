import { Button } from '@repo/ui/components/button';
import { CardContent } from '@repo/ui/components/card';
import { ConfirmDialog } from '@repo/ui/components/confirm-dialog';
import { GripVertical } from 'lucide-react';
import { type DragEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IWorkoutTemplate } from '../interfaces/workout-template';
import { useModalStore } from '../stores/modal-store';
import { useWorkoutTemplateStore } from '../stores/workout-template-store';

const moveTemplate = (items: IWorkoutTemplate[], fromIndex: number, toIndex: number) => {
  if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) {
    return items;
  }

  const nextItems = [...items];
  const [movedItem] = nextItems.splice(fromIndex, 1);

  if (!movedItem) {
    return items;
  }

  nextItems.splice(toIndex, 0, movedItem);
  return nextItems;
};

export function WorkoutTemplatesSection() {
  const { t } = useTranslation('common');
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
  const [draggedTemplateId, setDraggedTemplateId] = useState<string | null>(null);
  const [dropTargetTemplateId, setDropTargetTemplateId] = useState<string | null>(null);

  const {
    templates,
    deleteTemplate,
    reorderTemplates,
    setCurrentTemplate,
    setIsEditingTemplate,
  } =
    useWorkoutTemplateStore();
  const { openModal } = useModalStore();

  const handleDeleteTemplate = (id: string) => {
    setTemplateToDelete(id);
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (templateToDelete) {
      deleteTemplate(templateToDelete);
      setIsDeleteConfirmOpen(false);
      setTemplateToDelete(null);
    }
  };

  const handleStartWorkout = (template: IWorkoutTemplate) => {
    openModal('workoutSession', { template });
  };

  const handleAddNewTemplate = () => {
    setCurrentTemplate({
      name: '',
      description: '',
      exercises: [
        { id: Math.random().toString(36).substr(2, 9), name: '', sets: '3', reps: '10', weight: 0 },
      ],
    });
    setIsEditingTemplate(true);
    openModal('templateEditor');
  };

  const handleEditTemplate = (template: IWorkoutTemplate) => {
    setCurrentTemplate({ ...template });
    setIsEditingTemplate(true);
    openModal('templateEditor', { template });
  };

  const resetDragState = () => {
    setDraggedTemplateId(null);
    setDropTargetTemplateId(null);
  };

  const handleDragStart = (event: DragEvent<HTMLButtonElement>, templateId: string) => {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', templateId);
    setDraggedTemplateId(templateId);
    setDropTargetTemplateId(templateId);
  };

  const handleDragEnter = (templateId: string) => {
    if (!draggedTemplateId || draggedTemplateId === templateId) {
      return;
    }

    setDropTargetTemplateId(templateId);
  };

  const handleDrop = (templateId: string) => {
    if (!draggedTemplateId || draggedTemplateId === templateId) {
      resetDragState();
      return;
    }

    const fromIndex = templates.findIndex((template) => template.id === draggedTemplateId);
    const toIndex = templates.findIndex((template) => template.id === templateId);
    const nextTemplates = moveTemplate(templates, fromIndex, toIndex);

    reorderTemplates(nextTemplates);
    resetDragState();
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
                className={[
                  'flex flex-col rounded-xl border border-slate-200 bg-white p-5 transition-shadow duration-300 hover:shadow-md',
                  draggedTemplateId === template.id ? 'opacity-50' : '',
                  dropTargetTemplateId === template.id && draggedTemplateId !== template.id
                    ? 'bg-slate-50 ring-2 ring-teal-200'
                    : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onDragEnter={() => handleDragEnter(template.id)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => handleDrop(template.id)}
              >
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-xl font-bold text-slate-800">{template.name}</h3>
                  <button
                    type="button"
                    draggable
                    onDragStart={(event) => handleDragStart(event, template.id)}
                    onDragEnd={resetDragState}
                    className="flex h-9 w-9 shrink-0 cursor-grab items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 active:cursor-grabbing"
                    aria-label={t('reorderTemplates')}
                  >
                    <GripVertical className="size-4" />
                  </button>
                </div>
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

      <ConfirmDialog
        open={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
        title={t('areYouSureYouWantToDeleteThisTemplate')}
        description={t('deleteWorkoutConfirmationDescription')}
        cancelText={t('cancel')}
        confirmText={t('delete')}
        confirmVariant="destructive"
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
