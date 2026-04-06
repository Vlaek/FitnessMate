import { IExercise } from './exercise';

export interface IWorkoutHistory {
  id: string;
  date: string;
  templateName: string;
  exercises: IExercise[];
}
