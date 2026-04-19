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

const DEFAULT_EXERCISES: IExerciseCatalog[] = [
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
  { id: '12', nameKey: 'gravitron', muscleGroup: 'back' },
  { id: '13', nameKey: 'oneArmDumbbellRow', muscleGroup: 'back' },

  // Legs
  { id: '14', nameKey: 'squats', muscleGroup: 'legs' },
  { id: '15', nameKey: 'romanianDeadlift', muscleGroup: 'legs' },
  { id: '16', nameKey: 'legPress', muscleGroup: 'legs' },
  { id: '17', nameKey: 'lunges', muscleGroup: 'legs' },
  { id: '18', nameKey: 'legCurl', muscleGroup: 'legs' },
  { id: '19', nameKey: 'hyperextension', muscleGroup: 'legs' },
  { id: '20', nameKey: 'gluteBridge', muscleGroup: 'legs' },

  // Shoulders
  { id: '21', nameKey: 'shoulderPress', muscleGroup: 'shoulders' },
  { id: '22', nameKey: 'lateralRaises', muscleGroup: 'shoulders' },
  { id: '23', nameKey: 'frontRaises', muscleGroup: 'shoulders' },
  { id: '24', nameKey: 'rearDeltFly', muscleGroup: 'shoulders' },
  { id: '25', nameKey: 'shrugs', muscleGroup: 'shoulders' },
  { id: '26', nameKey: 'seatedDumbbellPress', muscleGroup: 'shoulders' },

  // Arms - Biceps
  { id: '27', nameKey: 'bicepCurls', muscleGroup: 'arms' },
  { id: '28', nameKey: 'hammerCurls', muscleGroup: 'arms' },
  { id: '29', nameKey: 'preacherCurls', muscleGroup: 'arms' },
  { id: '30', nameKey: 'chinUps', muscleGroup: 'arms' },

  // Arms - Triceps
  { id: '31', nameKey: 'tricepPushdown', muscleGroup: 'arms' },
  { id: '32', nameKey: 'overheadTricepExtension', muscleGroup: 'arms' },
  { id: '33', nameKey: 'closeGripBenchPress', muscleGroup: 'arms' },
  { id: '34', nameKey: 'dips', muscleGroup: 'arms' },

  // Core
  { id: '35', nameKey: 'crunches', muscleGroup: 'core' },
  { id: '36', nameKey: 'plank', muscleGroup: 'core' },
  { id: '37', nameKey: 'russianTwists', muscleGroup: 'core' },
  { id: '38', nameKey: 'legRaises', muscleGroup: 'core' },
  { id: '39', nameKey: 'mountainClimbers', muscleGroup: 'core' },
  { id: '40', nameKey: 'sidePlank', muscleGroup: 'core' },
];

function normalizeExercises(exercises: IExerciseCatalog[] = []): IExerciseCatalog[] {
  const exerciseMap = new Map<string, IExerciseCatalog>();

  [...DEFAULT_EXERCISES, ...exercises].forEach((exercise) => {
    if (!exercise?.nameKey || exerciseMap.has(exercise.nameKey)) {
      return;
    }

    exerciseMap.set(exercise.nameKey, exercise);
  });

  return Array.from(exerciseMap.values()).map((exercise, index) => ({
    ...exercise,
    id: String(index + 1),
  }));
}

export const useExerciseCatalogStore = create<IExerciseCatalogState>()(
  persist(
    (set, get) => ({
      exercises: [],
      initialized: false,
      initializeExercises: () => {
        const { exercises } = get();
        set({ exercises: normalizeExercises(exercises), initialized: true });
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
      merge: (persistedState, currentState) => {
        const typedState = persistedState as Partial<IExerciseCatalogState> | undefined;

        return {
          ...currentState,
          ...typedState,
          exercises: normalizeExercises(typedState?.exercises),
          initialized: true,
        };
      },
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
