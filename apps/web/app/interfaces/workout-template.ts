import { Exercise } from './exercise';

export interface WorkoutTemplate {
  id?: string;
  name: string;
  description: string;
  exercises: Exercise[];
}