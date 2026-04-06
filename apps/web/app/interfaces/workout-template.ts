import { IExercise } from './exercise';

export interface IWorkoutTemplate {
  id?: string;
  name: string;
  description: string;
  exercises: IExercise[];
  useWeekdayPrefix?: boolean;
}
