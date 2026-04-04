import { useTranslation } from 'react-i18next';
import { Exercise } from '../interfaces/exercise';

interface WorkoutPreviewProps {
  exercises: Exercise[];
  description: string;
  templateName?: string;
  useWeekdayPrefix?: boolean;
}

export function WorkoutPreview({
  exercises,
  description,
  templateName = '',
  useWeekdayPrefix = false,
}: WorkoutPreviewProps) {
  const { t } = useTranslation('common');

  const generatePreview = () => {
    let preview = '';

    if (useWeekdayPrefix) {
      const days = [
        t('sunday'),
        t('monday'),
        t('tuesday'),
        t('wednesday'),
        t('thursday'),
        t('friday'),
        t('saturday'),
      ];
      const today = new Date();
      preview += `${days[today.getDay()]}\n\n`;
    }

    if (templateName.trim()) {
      preview += `${templateName}\n\n`;
    }

    if (description.trim()) {
      preview += `${description}\n\n`;
    }

    preview += `${t('exercises')}:\n`;
    exercises.forEach((ex, index) => {
      preview += `${index + 1}. ${ex.name || t('enterExerciseName')}`;

      if (!ex.sets.length && !ex.weight.length) {
        preview += '\n';
      }

      if (ex.sets.length || ex.weight.length) {
        preview += ' - ';

        if (ex.sets.length) {
          preview += `${ex.sets} `;
        }

        if (ex.weight.length) {
          preview += ex.sets.length ? `x ${ex.weight} ` : `${ex.weight} `;
        }

        preview += '\n';
      }
    });

    return preview;
  };

  return (
    <div className="max-h-[calc(100vh-8rem)] overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-4">
      <pre className="font-sans text-sm whitespace-pre-wrap">{generatePreview()}</pre>
    </div>
  );
}
