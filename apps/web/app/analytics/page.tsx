'use client';

import { Button } from '@repo/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/components/card';
import Link from 'next/link';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useExerciseCatalogStore } from '../stores/exercise-catalog-store';
import { useModalStore } from '../stores/modal-store';
import { useWorkoutHistoryStore } from '../stores/workout-history-store';
import { formatDateDDMMYYYY } from '../utils/workout-text-generator';

const AnalyticsPage = () => {
  const { t } = useTranslation('common');
  const workoutHistory = useWorkoutHistoryStore((state) => state.history);
  const { initializeExercises, exercises } = useExerciseCatalogStore();
  const { openModal } = useModalStore();

  useEffect(() => {
    initializeExercises();
  }, [initializeExercises]);

  const chartData = workoutHistory.map((workout) => ({
    date: formatDateDDMMYYYY(workout.date, t),
    templateName: workout.templateName,
    exercisesCount: workout.exercises.length,
    totalVolume: workout.exercises.reduce((sum, ex) => {
      const sets = parseInt(ex.sets) || 0;
      const reps = parseInt(ex.reps || '') || 1;
      const weight = ex.weight || 0;
      return sum + sets * reps * weight;
    }, 0),
  }));

  const muscleGroupData = (() => {
    const muscleGroups: Record<string, number> = {};

    workoutHistory.forEach((workout) => {
      workout.exercises.forEach((exercise) => {
        if (exercise.name) {
          const catalogExercise = exercises.find(
            (catalogEx) => catalogEx.nameKey === exercise.name,
          );

          if (catalogExercise) {
            const muscleGroup = catalogExercise.muscleGroup;
            muscleGroups[muscleGroup || 'other'] = (muscleGroups[muscleGroup || 'other'] || 0) + 1;
          } else {
            muscleGroups['other'] = (muscleGroups['other'] || 0) + 1;
          }
        }
      });
    });

    return Object.entries(muscleGroups)
      .filter(([group]) => group !== 'other')
      .map(([name, value]) => ({
        name: t(name),
        value,
      }));
  })();

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
  const recentWorkouts = [...workoutHistory]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  if (workoutHistory.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 py-8">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-3xl font-bold text-slate-800">{t('workoutAnalytics')}</h1>

            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
            >
              {t('goToHomePage')}
            </Link>
          </div>

          <Card className="border-dashed border-slate-300">
            <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
              <h2 className="text-2xl font-semibold text-slate-800">
                {t('noWorkoutsForAnalytics')}
              </h2>
              <p className="max-w-lg text-slate-500">{t('addFirstWorkoutForAnalytics')}</p>
              <Button type="button" onClick={() => openModal('workoutHistoryCreate')}>
                {t('addWorkout')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container mx-auto max-w-6xl px-4">
        <h1 className="mb-8 text-3xl font-bold text-slate-800">{t('workoutAnalytics')}</h1>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-700">{t('workoutHistory')}</h2>
            <p className="text-slate-500">{t('trackYourProgressOverTime')}</p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
            >
              {t('goToHomePage')}
            </Link>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                {t('totalWorkouts')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{workoutHistory.length}</div>
              <p className="text-xs text-slate-500">{t('completedSessions')}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                {t('totalVolume')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {chartData.reduce((sum, d) => sum + d.totalVolume, 0)} {t('kg')}
              </div>
              <p className="text-xs text-slate-500">{t('lifted')}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{t('trainingVolumeOverTime')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="totalVolume"
                    stroke="#3b82f6"
                    name={t('volumeKg')}
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {muscleGroupData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{t('muscleGroupDistribution')}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={muscleGroupData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    >
                      {muscleGroupData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle>{t('recentWorkouts')}</CardTitle>
                <Button type="button" size="sm" onClick={() => openModal('workoutHistoryCreate')}>
                  {t('addWorkout')}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                {recentWorkouts.map((workout) => (
                  <div
                    key={workout.id}
                    className="w-full cursor-pointer rounded-lg border border-slate-200 p-4 transition-all hover:border-blue-400 hover:bg-blue-50/30 md:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.75rem)]"
                    onClick={() => openModal('workoutHistoryDetail', { workoutHistory: workout })}
                  >
                    <div className="flex justify-between">
                      <h4 className="font-medium text-slate-800">{workout.templateName}</h4>
                      <span className="text-sm text-slate-500">
                        {formatDateDDMMYYYY(workout.date, t)}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-slate-600">
                      <span>
                        {workout.exercises.length} {t('exercises')}
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-slate-500">
                      {workout.exercises
                        .slice(0, 2)
                        .map((ex) => t(ex.name))
                        .join(', ')}
                      {workout.exercises.length > 2
                        ? ` +${workout.exercises.length - 2} ${t('more')}`
                        : ''}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
