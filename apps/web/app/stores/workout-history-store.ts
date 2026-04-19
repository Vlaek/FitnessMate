import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type IExercise } from '../interfaces/exercise';

interface IWorkoutHistoryEntry {
  id: string;
  date: string;
  templateName: string;
  exercises: IExercise[];
}

interface WorkoutHistoryState {
  history: IWorkoutHistoryEntry[];
  addWorkoutToHistory: (workout: Omit<IWorkoutHistoryEntry, 'id'>) => void;
  updateWorkoutInHistory: (
    id: string,
    workout: Omit<IWorkoutHistoryEntry, 'id' | 'date'> & { date?: string },
  ) => void;
  deleteWorkoutFromHistory: (id: string) => void;
  getRecentWorkouts: (count: number) => IWorkoutHistoryEntry[];
  getAllWorkouts: () => IWorkoutHistoryEntry[];
}

const WORKOUT_HISTORY_KEY = 'workout_history';

export const useWorkoutHistoryStore = create<WorkoutHistoryState>()(
  persist(
    (set, get) => ({
      history: [],
      addWorkoutToHistory: (workout) => {
        const newWorkout = {
          ...workout,
          id: Date.now().toString(),
        };

        set((state) => ({
          history: [newWorkout, ...state.history],
        }));
      },
      updateWorkoutInHistory: (id, workout) => {
        set((state) => ({
          history: state.history.map((entry) =>
            entry.id === id
              ? {
                  ...entry,
                  ...workout,
                  date: workout.date || entry.date,
                }
              : entry,
          ),
        }));
      },
      deleteWorkoutFromHistory: (id) => {
        set((state) => ({
          history: state.history.filter((entry) => entry.id !== id),
        }));
      },
      getRecentWorkouts: (count: number) => {
        const state = get();
        return state.history.slice(0, count);
      },
      getAllWorkouts: () => {
        const state = get();
        return state.history;
      },
    }),
    {
      name: WORKOUT_HISTORY_KEY,
      onRehydrateStorage: () => {
        return (_, error) => {
          if (error) {
            console.error('An error happened during hydration of workout history', error);
          }
        };
      },
    },
  ),
);
