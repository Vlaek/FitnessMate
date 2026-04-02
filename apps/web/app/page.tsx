'use client';

import { toast } from '@repo/ui/toast';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MainHeader } from './components/main-header';
import { TelegramIntegrationSection } from './components/telegram-integration-section';
import { TemplateEditorDialog } from './components/template-editor-dialog';
import { WorkoutSessionDialog } from './components/workout-session-dialog';
import { WorkoutTemplatesSection } from './components/workout-templates-section';
import { Exercise } from './interfaces/exercise';
import { WorkoutTemplate } from './interfaces/workout-template';
import { TelegramService } from './services/telegram-service';
import { useTelegramStore } from './stores/telegram-store';
import { useWorkoutTemplateStore } from './stores/workout-template-store';

export default function HomePage() {
  const { t } = useTranslation('common');
  const {
    token: telegramToken,
    chatId,
    setToken,
    setChatId,
    resetToken,
    isConfigured,
  } = useTelegramStore();

  const {
    templates,
    currentTemplate,
    isEditingTemplate,
    setTemplates,
    setCurrentTemplate,
    setIsEditingTemplate,
    addTemplate,
    updateTemplate,
    deleteTemplate,
  } = useWorkoutTemplateStore();

  const [activeWorkout, setActiveWorkout] = useState<WorkoutTemplate | null>(null);
  const [workoutExercises, setWorkoutExercises] = useState<Exercise[]>([]);
  const [workoutDescription, setWorkoutDescription] = useState('');
  const [useWeekdayPrefix, setUseWeekdayPrefix] = useState(false);

  useEffect(() => {
    if (activeWorkout) {
      setWorkoutExercises(
        activeWorkout.exercises.map((ex) => ({
          ...ex,
          id: ex.id || Math.random().toString(36).substr(2, 9),
        })),
      );
    }
  }, [activeWorkout]);

  const handleAddNewTemplate = () => {
    const newTemplate: WorkoutTemplate = {
      name: t('newTemplate'),
      description: '',
      exercises: [{ id: Math.random().toString(36).substr(2, 9), name: '', sets: 3, weight: 0 }],
    };

    setCurrentTemplate(newTemplate);
    setIsEditingTemplate(true);
  };

  const handleEditTemplate = (template: WorkoutTemplate) => {
    setCurrentTemplate({ ...template });
    setIsEditingTemplate(true);
  };

  const handleDeleteTemplate = (id: string) => {
    if (confirm(t('areYouSureYouWantToDeleteThisTemplate'))) {
      deleteTemplate(id);
    }
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
    toast.success(t('templateSavedSuccessfully'));
  };

  const handleStartWorkout = (template: WorkoutTemplate) => {
    setActiveWorkout(template);
    setWorkoutDescription('');
  };

  const handleEndWorkout = () => {
    if (!activeWorkout) return;

    let report = '';
    if (useWeekdayPrefix) {
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
      report += `${days[today.getDay()]}\n\n`;
    }

    report += `${t('workoutSession')}: ${activeWorkout.name}\n`;
    if (workoutDescription.trim()) {
      report += `\n${workoutDescription}\n\n`;
    } else {
      report += '\n';
    }

    report += `${t('exercises')}:\n`;
    workoutExercises.forEach((ex, index) => {
      report += `${index + 1}. ${ex.name} - ${ex.sets} ${t('sets')} x ${ex.weight}kg\n`;
    });

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

    setActiveWorkout(null);
    setWorkoutExercises([]);
    setWorkoutDescription('');
  };

  const updateExerciseField = (index: number, field: keyof Exercise, value: string | number) => {
    const updatedExercises = [...workoutExercises];

    const currentExercise = updatedExercises[index];
    if (!currentExercise) return;

    let updatedExercise: Exercise;

    if (field === 'id') {
      updatedExercise = { ...currentExercise, id: value as string };
    } else if (field === 'name') {
      updatedExercise = { ...currentExercise, name: value as string };
    } else if (field === 'sets') {
      updatedExercise = { ...currentExercise, sets: value as number };
    } else if (field === 'weight') {
      updatedExercise = { ...currentExercise, weight: value as number };
    } else {
      return;
    }

    updatedExercises[index] = updatedExercise;

    setWorkoutExercises(updatedExercises);
  };

  const addExercise = () => {
    const newExercise: Exercise = {
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      sets: 3,
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
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container mx-auto max-w-6xl px-4">
        <MainHeader />

        <TelegramIntegrationSection
          telegramToken={telegramToken}
          chatId={chatId}
          setToken={setToken}
          setChatId={setChatId}
          resetToken={resetToken}
          isConfigured={isConfigured}
          t={t}
        />

        <WorkoutTemplatesSection
          templates={templates}
          handleAddNewTemplate={handleAddNewTemplate}
          handleEditTemplate={handleEditTemplate}
          handleDeleteTemplate={handleDeleteTemplate}
          handleStartWorkout={handleStartWorkout}
          t={t}
        />

        <WorkoutSessionDialog
          isOpen={!!activeWorkout}
          onClose={() => {
            setActiveWorkout(null);
            setWorkoutExercises([]);
            setWorkoutDescription('');
          }}
          activeWorkout={activeWorkout}
          workoutExercises={workoutExercises}
          workoutDescription={workoutDescription}
          useWeekdayPrefix={useWeekdayPrefix}
          setWorkoutDescription={setWorkoutDescription}
          setUseWeekdayPrefix={setUseWeekdayPrefix}
          updateExerciseField={updateExerciseField}
          addExercise={addExercise}
          removeExercise={removeExercise}
          handleEndWorkout={handleEndWorkout}
          getWeekdayName={getWeekdayName}
          t={t}
        />

        <TemplateEditorDialog
          isOpen={isEditingTemplate && Boolean(currentTemplate)}
          onClose={() => {
            setIsEditingTemplate(false);
            setCurrentTemplate(null);
          }}
          currentTemplate={currentTemplate}
          setCurrentTemplate={setCurrentTemplate}
          handleSaveTemplate={handleSaveTemplate}
          t={t}
        />
      </div>
    </div>
  );
}
