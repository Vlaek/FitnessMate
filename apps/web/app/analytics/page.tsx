'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/components/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/select';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Bar,
  BarChart,
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
import { IWorkoutHistory } from '../interfaces/workout-history';
import { useExerciseCatalogStore } from '../stores/exercise-catalog-store';
import { useWorkoutHistoryStore } from '../stores/workout-history-store';

const AnalyticsPage = () => {
  const { t } = useTranslation('common');
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('month');
  const { getAllWorkouts } = useWorkoutHistoryStore();
  const { initializeExercises, exercises } = useExerciseCatalogStore();
  const [workoutHistory, setWorkoutHistory] = useState<IWorkoutHistory[]>([]);

  useEffect(() => {
    initializeExercises();
  }, [initializeExercises]);

  useEffect(() => {
    const history = getAllWorkouts();
    setWorkoutHistory(history);
  }, [getAllWorkouts]);

  const chartData = workoutHistory.map((workout) => ({
    date: new Date(workout.date).toLocaleDateString(),
    templateName: workout.templateName,
    exercisesCount: workout.exercises.length,
    totalVolume: workout.exercises.reduce((sum, ex) => {
      const sets = parseInt(ex.sets) || 0;
      const weight = ex.weight || 0;
      return sum + sets * weight;
    }, 0),
  }));

  const exerciseProgressData = (() => {
    const exerciseMap: Record<string, { date: string; weight: number }[]> = {};

    workoutHistory.forEach((workout) => {
      workout.exercises.forEach((exercise) => {
        if (exercise.weight && exercise.name) {
          const weight = exercise.weight;
          if (weight > 0) {
            if (!exerciseMap[exercise.name]) {
              exerciseMap[exercise.name] = [];
            }
            exerciseMap[exercise.name].push({
              date: workout.date,
              weight: weight,
            });
          }
        }
      });
    });

    for (const exerciseName in exerciseMap) {
      if (exerciseMap[exerciseName].length > 1) {
        return exerciseMap[exerciseName].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        );
      }
    }

    return workoutHistory.slice(0, 3).map((workout, idx) => ({
      date: workout.date,
      weight: idx * 2.5 + 80,
    }));
  })();

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
            <Select value={timeRange} onValueChange={(value) => setTimeRange(value as any)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t('selectTimeRange')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">{t('lastWeek')}</SelectItem>
                <SelectItem value="month">{t('lastMonth')}</SelectItem>
                <SelectItem value="quarter">{t('lastQuarter')}</SelectItem>
              </SelectContent>
            </Select>

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

          <Card>
            <CardHeader>
              <CardTitle>{t('progressTracking')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={exerciseProgressData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="weight" name={t('weightKg')} fill="#8b5cf6" />
                </BarChart>
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

          <Card>
            <CardHeader>
              <CardTitle>{t('recentWorkouts')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workoutHistory.slice(-5).map((workout) => (
                  <div key={workout.id} className="rounded-lg border border-slate-200 p-4">
                    <div className="flex justify-between">
                      <h4 className="font-medium">{workout.templateName}</h4>
                      <span className="text-sm text-slate-500">{workout.date}</span>
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
