'use client';

import { Button } from '@repo/ui/components/button';
import { CardContent, CardFooter } from '@repo/ui/components/card';
import { Input } from '@repo/ui/components/input';
import { Label } from '@repo/ui/components/label';
import { toast } from '@repo/ui/toast';
import { useEffect, useState } from 'react';
import { TemplateEditorDialog } from './components/template-editor-dialog';
import { WorkoutSessionDialog } from './components/workout-session-dialog';
import { Exercise } from './interfaces/exercise';
import { WorkoutTemplate } from './interfaces/workout-template';
import { TelegramService } from './services/telegram-service';
import { useTelegramStore } from './stores/telegram-store';
import { useWorkoutTemplateStore } from './stores/workout-template-store';

export default function HomePage() {
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

  const handleSaveToken = () => {
    setToken(telegramToken);
    toast.success('Telegram token saved successfully!');
  };

  const handleResetToken = () => {
    resetToken();
    toast.success('Telegram token removed!');
  };

  const handleAddNewTemplate = () => {
    const newTemplate: WorkoutTemplate = {
      name: 'New Template',
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
    if (confirm('Are you sure you want to delete this template?')) {
      deleteTemplate(id);
    }
  };

  const handleSaveTemplate = () => {
    if (!currentTemplate) return;

    if (!currentTemplate.name.trim()) {
      toast.error('Template name is required!');
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
    toast.success('Template saved successfully!');
  };

  const handleStartWorkout = (template: WorkoutTemplate) => {
    setActiveWorkout(template);
    setWorkoutDescription('');
  };

  const handleEndWorkout = () => {
    if (!activeWorkout) return;

    let report = '';
    if (useWeekdayPrefix) {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const today = new Date();
      report += `${days[today.getDay()]}\n\n`;
    }

    report += `Workout: ${activeWorkout.name}\n`;
    if (workoutDescription.trim()) {
      report += `\n${workoutDescription}\n\n`;
    } else {
      report += '\n';
    }

    report += 'Exercises:\n';
    workoutExercises.forEach((ex, index) => {
      report += `${index + 1}. ${ex.name} - ${ex.sets} sets x ${ex.weight}kg\n`;
    });

    if (isConfigured() && chatId) {
      TelegramService.sendMessage(report, chatId)
        .then((success) => {
          if (success) {
            toast.success('Workout report sent to Telegram successfully!');
          } else {
            toast.error('Failed to send workout report to Telegram');
          }
        })
        .catch((error) => {
          console.error('Error sending report:', error);
          toast.error('Error sending workout report to Telegram');
        });
    } else {
      toast.error('Please configure your Telegram token and chat ID to send reports');
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
      toast.error('At least one exercise is required');
      return;
    }
    const updatedExercises = [...workoutExercises];
    updatedExercises.splice(index, 1);
    setWorkoutExercises(updatedExercises);
  };

  const getWeekdayName = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date();
    return days[today.getDay()];
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container mx-auto max-w-6xl px-4">
        <header className="mb-12 text-center">
          <h1 className="mb-3 text-5xl font-extrabold tracking-tight text-slate-900">
            FitnessMate
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-slate-600">
            Track your workouts and share results via Telegram
          </p>
        </header>

        <div className="mb-10 overflow-hidden rounded-2xl bg-white shadow-xl">
          <div className="bg-blue-600 p-6">
            <h2 className="text-2xl font-bold text-white">Telegram Integration</h2>
            <p className="text-blue-100">
              Configure your Telegram bot token to send workout reports
            </p>
          </div>
          <CardContent className="px-6 py-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <Label htmlFor="token" className="text-slate-700">
                  Bot Token
                </Label>
                <Input
                  id="token"
                  type="password"
                  value={telegramToken}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Enter your Telegram bot token"
                  className="mt-1 w-full rounded-lg border border-slate-300 p-3"
                />
              </div>
              <div>
                <Label htmlFor="chatId" className="text-slate-700">
                  Chat ID
                </Label>
                <Input
                  id="chatId"
                  type="text"
                  value={chatId}
                  onChange={(e) => setChatId(e.target.value)}
                  placeholder="Enter target chat ID"
                  className="mt-1 w-full rounded-lg border border-slate-300 p-3"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-wrap gap-3 bg-slate-50 px-6 py-4">
            <Button
              onClick={handleSaveToken}
              className="rounded-lg bg-green-600 px-5 py-2 text-white transition-colors hover:bg-green-700"
            >
              Save Token
            </Button>
            <Button
              variant="outline"
              onClick={handleResetToken}
              className="rounded-lg border-red-500 px-5 py-2 text-red-600 transition-colors hover:bg-red-50"
            >
              Reset Token
            </Button>
            <p className="ml-auto text-sm font-medium text-green-600">
              {isConfigured() ? (
                <span>✓ Token is configured</span>
              ) : (
                <span>○ Token not configured</span>
              )}
            </p>
          </CardFooter>
        </div>

        <div className="mb-10 overflow-hidden rounded-2xl bg-white shadow-xl">
          <div className="bg-teal-600 p-6">
            <div className="flex flex-row items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Workout Templates</h2>
                <p className="text-teal-100">Create and manage workout templates</p>
              </div>
              <Button
                onClick={handleAddNewTemplate}
                className="rounded-lg bg-white px-5 py-2 text-teal-600 transition-colors hover:bg-slate-100"
              >
                Add New Template
              </Button>
            </div>
          </div>
          <CardContent className="px-6 py-6">
            {templates.length === 0 ? (
              <p className="py-8 text-center text-lg text-slate-500">
                No templates yet. Create your first template!
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 transition-shadow duration-300 hover:shadow-md"
                  >
                    <h3 className="text-xl font-bold text-slate-800">{template.name}</h3>
                    <p className="mt-2 grow text-slate-600">
                      {template.description || 'No description'}
                    </p>
                    <div className="mt-5 flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditTemplate(template)}
                        className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50"
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="flex-1"
                      >
                        Delete
                      </Button>
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleStartWorkout(template)}
                        className="flex-1 bg-blue-500 hover:bg-blue-600"
                      >
                        Use
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </div>

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
        />
      </div>
    </div>
  );
}
