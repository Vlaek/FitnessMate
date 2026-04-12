export interface IExercise {
  id: string;
  name: string;
  sets: string;
  reps?: string;
  weight: number;
  muscleGroup?: string;
}

export interface IExerciseCatalog {
  id: string;
  nameKey: string;
  muscleGroup?: string;
}
