'use client';

import { useState, useEffect } from 'react';
import { CardContent, CardFooter } from '@repo/ui/components/card';
import { Button } from '@repo/ui/components/button';
import { Input } from '@repo/ui/components/input';
import { Label } from '@repo/ui/components/label';
import { Textarea } from '@repo/ui/components/textarea';
import { Checkbox } from '@repo/ui/components/checkbox';
import { Exercise } from './interfaces/exercise';
import { WorkoutTemplate } from './interfaces/workout-template';
import { TelegramService } from './services/telegram-service';
import { WorkoutStorage } from './services/workout-storage';
import { useTelegramStore } from './stores/telegram-store';

export default function HomePage() {
  // Using Telegram store instead of local state
  const { token: telegramToken, chatId, setToken, setChatId, resetToken, isConfigured } = useTelegramStore();
  
  // State for workout templates
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [currentTemplate, setCurrentTemplate] = useState<WorkoutTemplate | null>(null);
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  
  // State for active workout
  const [activeWorkout, setActiveWorkout] = useState<WorkoutTemplate | null>(null);
  const [workoutExercises, setWorkoutExercises] = useState<Exercise[]>([]);
  const [workoutDescription, setWorkoutDescription] = useState('');
  const [useWeekdayPrefix, setUseWeekdayPrefix] = useState(false);
  
  // Load data from localStorage on mount
  useEffect(() => {
    // Telegram token is now automatically loaded from localStorage via the store
    // No need to manually load it here anymore
    
    const savedTemplates = WorkoutStorage.getAllTemplates();
    setTemplates(savedTemplates);
  }, []);

  useEffect(() => {
    if (activeWorkout) {
      setWorkoutExercises(activeWorkout.exercises.map(ex => ({
        ...ex,
        id: ex.id || Math.random().toString(36).substr(2, 9)
      })));
    }
  }, [activeWorkout]);

  const handleSaveToken = () => {
    setToken(telegramToken);
    alert('Telegram token saved successfully!');
  };

  const handleResetToken = () => {
    resetToken();
    alert('Telegram token removed!');
  };

  const handleAddNewTemplate = () => {
    const newTemplate: WorkoutTemplate = {
      name: 'New Template',
      description: '',
      exercises: [{ id: Math.random().toString(36).substr(2, 9), name: '', sets: 3, weight: 0 }]
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
      WorkoutStorage.deleteTemplate(id);
      setTemplates(WorkoutStorage.getAllTemplates());
      
      if (currentTemplate?.id === id) {
        setCurrentTemplate(null);
        setIsEditingTemplate(false);
      }
    }
  };

  const handleSaveTemplate = () => {
    if (!currentTemplate) return;

    if (!currentTemplate.name.trim()) {
        alert('Template name is required');
        return;
    }
    
    WorkoutStorage.saveTemplate(currentTemplate);
    setTemplates(WorkoutStorage.getAllTemplates());
    setIsEditingTemplate(false);
    setCurrentTemplate(null);
    alert('Template saved successfully!');
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
        .then(success => {
          if (success) {
            alert('Workout report sent to Telegram successfully!');
          } else {
            alert('Failed to send workout report to Telegram');
          }
        })
        .catch(error => {
          console.error('Error sending report:', error);
          alert('Error sending workout report to Telegram');
        });
    } else {
      alert('Please configure your Telegram token and chat ID to send reports');
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
      weight: 0
    };
    setWorkoutExercises([...workoutExercises, newExercise]);
  };

  const removeExercise = (index: number) => {
    if (workoutExercises.length <= 1) {
      alert('At least one exercise is required');
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
      <div className="container mx-auto px-4 max-w-6xl">
        <header className="mb-12 text-center">
          <h1 className="text-5xl font-extrabold text-slate-900 mb-3 tracking-tight">FitnessMate</h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Track your workouts and share results via Telegram
          </p>
        </header>

        <div className="mb-10 rounded-2xl shadow-xl overflow-hidden bg-white">
          <div className="bg-blue-600 p-6">
            <h2 className="text-2xl font-bold text-white">Telegram Integration</h2>
            <p className="text-blue-100">Configure your Telegram bot token to send workout reports</p>
          </div>
          <CardContent className="py-6 px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="token" className="text-slate-700">Bot Token</Label>
                <Input
                  id="token"
                  type="password"
                  value={telegramToken}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Enter your Telegram bot token"
                  className="mt-1 p-3 border border-slate-300 rounded-lg w-full"
                />
              </div>
              <div>
                <Label htmlFor="chatId" className="text-slate-700">Chat ID</Label>
                <Input
                  id="chatId"
                  type="text"
                  value={chatId}
                  onChange={(e) => setChatId(e.target.value)}
                  placeholder="Enter target chat ID"
                  className="mt-1 p-3 border border-slate-300 rounded-lg w-full"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-slate-50 px-6 py-4 flex flex-wrap gap-3">
            <Button 
              onClick={handleSaveToken} 
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg transition-colors"
            >
              Save Token
            </Button>
            <Button 
              variant="outline" 
              onClick={handleResetToken}
              className="border-red-500 text-red-600 hover:bg-red-50 px-5 py-2 rounded-lg transition-colors"
            >
              Reset Token
            </Button>
            <p className="text-sm ml-auto text-green-600 font-medium">
              <span className={!isConfigured ? 'opacity-100' : 'opacity-0'}>○ Token not configured</span>
              <span className={isConfigured ? 'opacity-100' : 'opacity-0'}>✓ Token is configured</span>
            </p>
          </CardFooter>
        </div>

        <div className="mb-10 rounded-2xl shadow-xl overflow-hidden bg-white">
          <div className="bg-teal-600 p-6">
            <div className="flex flex-row items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Workout Templates</h2>
                <p className="text-teal-100">Create and manage workout templates</p>
              </div>
              <Button 
                onClick={handleAddNewTemplate}
                className="bg-white text-teal-600 hover:bg-slate-100 px-5 py-2 rounded-lg transition-colors"
              >
                Add New Template
              </Button>
            </div>
          </div>
          <CardContent className="py-6 px-6">
            {templates.length === 0 ? (
              <p className="text-slate-500 text-center py-8 text-lg">No templates yet. Create your first template!</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {templates.map((template) => (
                  <div 
                    key={template.id} 
                    className="border border-slate-200 rounded-xl p-5 flex flex-col hover:shadow-md transition-shadow duration-300 bg-white"
                  >
                    <h3 className="font-bold text-xl text-slate-800">{template.name}</h3>
                    <p className="text-slate-600 mt-2 grow">{template.description || 'No description'}</p>
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

        {activeWorkout && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl">
              <div className="p-6">
                <div className="bg-blue-600 rounded-t-xl p-5 -m-6 mb-6">
                  <h2 className="text-2xl font-bold text-white">Workout: {activeWorkout.name}</h2>
                </div>
                
                <div className="mb-6">
                  <Label className="text-slate-700">Description</Label>
                  <Textarea
                    value={workoutDescription}
                    onChange={(e) => setWorkoutDescription(e.target.value)}
                    placeholder="How did your workout go?"
                    className="mt-1 p-3 border border-slate-300 rounded-lg w-full min-h-25"
                  />
                </div>
                
                <div className="mb-6 flex items-center p-4 bg-blue-50 rounded-lg">
                  <Checkbox 
                    id="weekday-prefix" 
                    checked={useWeekdayPrefix}
                    onCheckedChange={(checked) => setUseWeekdayPrefix(!!checked)} 
                  />
                  <Label htmlFor="weekday-prefix" className="ml-2 text-slate-700">
                    Include weekday in post title ({getWeekdayName()})
                  </Label>
                </div>
                
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-4">
                    <Label className="text-slate-700 text-lg">Exercises</Label>
                    <Button 
                      type="button" 
                      size="sm" 
                      variant="outline" 
                      onClick={addExercise}
                      className="border-slate-300 text-slate-700"
                    >
                      Add Exercise
                    </Button>
                  </div>
                  
                  {workoutExercises.map((exercise, index) => (
                    <div key={index} className="grid grid-cols-12 gap-3 mb-4 items-center p-3 bg-slate-50 rounded-lg">
                      <div className="col-span-5">
                        <Input
                          value={exercise.name}
                          onChange={(e) => updateExerciseField(index, 'name', e.target.value)}
                          placeholder="Exercise name"
                          className="w-full"
                        />
                      </div>
                      <div className="col-span-3">
                        <Input
                          type="number"
                          value={exercise.sets}
                          onChange={(e) => updateExerciseField(index, 'sets', parseInt(e.target.value) || 0)}
                          placeholder="Sets"
                          className="w-full"
                        />
                      </div>
                      <div className="col-span-3">
                        <Input
                          type="number"
                          value={exercise.weight}
                          onChange={(e) => updateExerciseField(index, 'weight', parseFloat(e.target.value) || 0)}
                          placeholder="Weight (kg)"
                          className="w-full"
                        />
                      </div>
                      <div className="col-span-1">
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="icon"
                          onClick={() => removeExercise(index)}
                          disabled={workoutExercises.length <= 1}
                          className="w-full h-10 flex items-center justify-center border-slate-300 text-slate-600 hover:bg-red-50 hover:text-red-600"
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setActiveWorkout(null);
                      setWorkoutExercises([]);
                      setWorkoutDescription('');
                    }}
                    className="border-slate-300 text-slate-700 px-6 py-2"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleEndWorkout}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
                  >
                    Finish & Send Report
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {isEditingTemplate && currentTemplate && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl">
              <div className="p-6">
                <div className="bg-teal-600 rounded-t-xl p-5 -m-6 mb-6">
                  <h2 className="text-2xl font-bold text-white">
                    {currentTemplate.id ? 'Edit Template' : 'New Template'}
                  </h2>
                </div>
                
                <div className="mb-6">
                  <Label htmlFor="template-name" className="text-slate-700">Template Name *</Label>
                  <Input
                    id="template-name"
                    value={currentTemplate.name}
                    onChange={(e) => setCurrentTemplate({...currentTemplate, name: e.target.value})}
                    placeholder="Enter template name"
                    className="mt-1 p-3 border border-slate-300 rounded-lg w-full"
                  />
                </div>
                
                <div className="mb-6">
                  <Label htmlFor="template-desc" className="text-slate-700">Description</Label>
                  <Textarea
                    id="template-desc"
                    value={currentTemplate.description}
                    onChange={(e) => setCurrentTemplate({...currentTemplate, description: e.target.value})}
                    placeholder="Describe your template"
                    className="mt-1 p-3 border border-slate-300 rounded-lg w-full min-h-25"
                  />
                </div>
                
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-4">
                    <Label className="text-slate-700 text-lg">Exercises</Label>
                    <Button 
                      type="button" 
                      size="sm" 
                      variant="outline" 
                      onClick={() => {
                        const updatedTemplate = {...currentTemplate};
                        updatedTemplate.exercises = [
                          ...updatedTemplate.exercises,
                          { id: Math.random().toString(36).substr(2, 9), name: '', sets: 3, weight: 0 }
                        ];
                        setCurrentTemplate(updatedTemplate);
                      }}
                      className="border-slate-300 text-slate-700"
                    >
                      Add Exercise
                    </Button>
                  </div>
                  
                  {currentTemplate.exercises.map((exercise, index) => (
                    <div key={index} className="grid grid-cols-12 gap-3 mb-4 items-center p-3 bg-slate-50 rounded-lg">
                      <div className="col-span-5">
                        <Input
                          value={exercise.name}
                          onChange={(e) => {
                            const updatedTemplate = {...currentTemplate};
                            if (updatedTemplate.exercises[index]) {
                              updatedTemplate.exercises[index].name = e.target.value;
                            }
                            setCurrentTemplate(updatedTemplate);
                          }}
                          placeholder="Exercise name"
                          className="w-full"
                        />
                      </div>
                      <div className="col-span-3">
                        <Input
                          type="number"
                          value={exercise.sets}
                          onChange={(e) => {
                            const updatedTemplate = {...currentTemplate};
                            if (updatedTemplate.exercises[index]) {
                              updatedTemplate.exercises[index].sets = parseInt(e.target.value) || 0;
                            }
                            setCurrentTemplate(updatedTemplate);
                          }}
                          placeholder="Sets"
                          className="w-full"
                        />
                      </div>
                      <div className="col-span-3">
                        <Input
                          type="number"
                          value={exercise.weight}
                          onChange={(e) => {
                            const updatedTemplate = {...currentTemplate};
                            if (updatedTemplate.exercises[index]) {
                              updatedTemplate.exercises[index].weight = parseFloat(e.target.value) || 0;
                            }
                            setCurrentTemplate(updatedTemplate);
                          }}
                          placeholder="Default weight (kg)"
                          className="w-full"
                        />
                      </div>
                      <div className="col-span-1">
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="icon"
                          onClick={() => {
                            const updatedTemplate = {...currentTemplate};
                            updatedTemplate.exercises.splice(index, 1);
                            setCurrentTemplate(updatedTemplate);
                          }}
                          disabled={currentTemplate.exercises.length <= 1}
                          className="w-full h-10 flex items-center justify-center border-slate-300 text-slate-600 hover:bg-red-50 hover:text-red-600"
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsEditingTemplate(false);
                      setCurrentTemplate(null);
                    }}
                    className="border-slate-300 text-slate-700 px-6 py-2"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSaveTemplate}
                    className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2"
                  >
                    Save Template
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}