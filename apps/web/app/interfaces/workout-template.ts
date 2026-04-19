import { IExercise } from './exercise';

export interface IWorkoutTemplate {
  id?: string;
  name: string;
  description: string;
  bodyWeight?: string;
  bodyFatPercentage?: string;
  muscleMassKg?: string;
  exercises: IExercise[];
  useWeekdayPrefix?: boolean;
  useWorkoutDatePrefix?: boolean;
  useEmptyLinesBetweenSections?: boolean;
  useTotalWorkload?: boolean;
  useRandomImage?: boolean;
  randomImagePath?: string;
}
