import { useTranslation } from 'react-i18next';
import { IExercise } from '../interfaces/exercise';
import { generateWorkoutText } from '../utils/workout-text-generator';

interface IProps {
  exercises: IExercise[];
  description: string;
  bodyWeight?: string;
  templateName?: string;
  useWeekdayPrefix?: boolean;
  useWorkoutDatePrefix?: boolean;
  useEmptyLinesBetweenSections?: boolean;
  useTotalWorkload?: boolean;
  useRandomImage?: boolean;
  randomImagePath?: string;
  className?: string;
}

export function WorkoutPreview({
  exercises,
  description,
  bodyWeight = '',
  templateName = '',
  useWeekdayPrefix = false,
  useWorkoutDatePrefix = false,
  useEmptyLinesBetweenSections = true,
  useTotalWorkload = false,
  useRandomImage = false,
  randomImagePath = '',
  className = '',
}: IProps) {
  const { t } = useTranslation('common');

  const generatePreview = () => {
    return generateWorkoutText(
      t,
      exercises,
      description,
      bodyWeight,
      templateName,
      useWeekdayPrefix,
      useWorkoutDatePrefix,
      useEmptyLinesBetweenSections,
      useTotalWorkload,
    );
  };

  return (
    <div
      className={`max-h-[calc(100vh-8rem)] overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-4 ${className}`}
    >
      <pre className="font-sans text-sm whitespace-pre-wrap">{generatePreview()}</pre>
      {useRandomImage && randomImagePath && (
        <div className="mt-3">
          <img
            src={randomImagePath}
            alt={t('randomImagePreviewAlt')}
            className="max-h-48 w-full rounded-md border border-slate-200 object-cover"
          />
        </div>
      )}
    </div>
  );
}
