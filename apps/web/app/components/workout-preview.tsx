import { useTranslation } from 'react-i18next';
import { IExercise } from '../interfaces/exercise';
import { generateWorkoutText } from '../utils/workout-text-generator';

interface IProps {
  exercises: IExercise[];
  description: string;
  templateName?: string;
  useWeekdayPrefix?: boolean;
}

export function WorkoutPreview({
  exercises,
  description,
  templateName = '',
  useWeekdayPrefix = false,
}: IProps) {
  const { t } = useTranslation('common');

  const generatePreview = () => {
    return generateWorkoutText(t, exercises, description, templateName, useWeekdayPrefix);
  };

  return (
    <div className="max-h-[calc(100vh-8rem)] overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-4">
      <pre className="font-sans text-sm whitespace-pre-wrap">{generatePreview()}</pre>
    </div>
  );
}
