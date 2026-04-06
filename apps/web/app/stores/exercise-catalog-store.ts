import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { IExerciseCatalog } from '../interfaces/exercise';

interface IExerciseCatalogState {
  exercises: IExerciseCatalog[];
  initialized: boolean;
  initializeExercises: () => void;
  getExerciseByNameKey: (nameKey: string) => IExerciseCatalog | undefined;
  getExercisesByMuscleGroup: (muscleGroup: string) => IExerciseCatalog[];
  getAllMuscleGroups: () => string[];
}

const EXERCISE_CATALOG_KEY = 'exercise_catalog';

export const useExerciseCatalogStore = create<IExerciseCatalogState>()(
  persist(
    (set, get) => ({
      exercises: [],
      initialized: false,
      initializeExercises: () => {
        const defaultExercises: IExerciseCatalog[] = [
          // Chest
          { id: '1', nameKey: 'benchPress', muscleGroup: 'chest' },
          { id: '2', nameKey: 'inclineDumbbellPress', muscleGroup: 'chest' },
          { id: '3', nameKey: 'declineBenchPress', muscleGroup: 'chest' },
          { id: '4', nameKey: 'chestFly', muscleGroup: 'chest' },
          { id: '5', nameKey: 'pushUps', muscleGroup: 'chest' },
          { id: '6', nameKey: 'inclineBenchPress', muscleGroup: 'chest' },

          // Back
          { id: '7', nameKey: 'pullUps', muscleGroup: 'back' },
          { id: '8', nameKey: 'barbellRows', muscleGroup: 'back' },
          { id: '9', nameKey: 'latPulldown', muscleGroup: 'back' },
          { id: '10', nameKey: 'tBarRow', muscleGroup: 'back' },
          { id: '11', nameKey: 'seatedCableRow', muscleGroup: 'back' },

          // Legs
          { id: '12', nameKey: 'squats', muscleGroup: 'legs' },
          { id: '13', nameKey: 'romanianDeadlift', muscleGroup: 'legs' },
          { id: '14', nameKey: 'legPress', muscleGroup: 'legs' },
          { id: '15', nameKey: 'lunges', muscleGroup: 'legs' },
          { id: '16', nameKey: 'legCurl', muscleGroup: 'legs' },

          // Shoulders
          { id: '17', nameKey: 'shoulderPress', muscleGroup: 'shoulders' },
          { id: '18', nameKey: 'lateralRaises', muscleGroup: 'shoulders' },
          { id: '19', nameKey: 'frontRaises', muscleGroup: 'shoulders' },
          { id: '20', nameKey: 'rearDeltFly', muscleGroup: 'shoulders' },
          { id: '21', nameKey: 'shrugs', muscleGroup: 'shoulders' },

          // Arms - Biceps
          { id: '22', nameKey: 'bicepCurls', muscleGroup: 'arms' },
          { id: '23', nameKey: 'hammerCurls', muscleGroup: 'arms' },
          { id: '24', nameKey: 'preacherCurls', muscleGroup: 'arms' },
          { id: '25', nameKey: 'chinUps', muscleGroup: 'arms' },

          // Arms - Triceps
          { id: '26', nameKey: 'tricepPushdown', muscleGroup: 'arms' },
          { id: '27', nameKey: 'overheadTricepExtension', muscleGroup: 'arms' },
          { id: '28', nameKey: 'closeGripBenchPress', muscleGroup: 'arms' },
          { id: '29', nameKey: 'dips', muscleGroup: 'arms' },

          // Core
          { id: '30', nameKey: 'crunches', muscleGroup: 'core' },
          { id: '31', nameKey: 'plank', muscleGroup: 'core' },
          { id: '32', nameKey: 'russianTwists', muscleGroup: 'core' },
          { id: '33', nameKey: 'legRaises', muscleGroup: 'core' },
          { id: '34', nameKey: 'mountainClimbers', muscleGroup: 'core' },
        ];

        set({ exercises: defaultExercises, initialized: true });
      },
      getExerciseByNameKey: (nameKey: string) => {
        const { exercises } = get();
        return exercises.find((ex) => ex.nameKey === nameKey);
      },
      getExercisesByMuscleGroup: (muscleGroup: string) => {
        const { exercises } = get();
        return exercises.filter((ex) => ex.muscleGroup === muscleGroup);
      },
      getAllMuscleGroups: () => {
        const { exercises } = get();
        const muscleGroups = Array.from(new Set(exercises.map((ex) => ex.muscleGroup || '')));
        return muscleGroups;
      },
    }),
    {
      name: EXERCISE_CATALOG_KEY,
      onRehydrateStorage: () => {
        return (_, error) => {
          if (error) {
            console.error('An error happened during hydration of exercise catalog', error);
          }
        };
      },
    },
  ),
);
