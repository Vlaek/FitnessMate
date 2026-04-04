import { TFunction } from 'i18next';
import { Exercise } from '../interfaces/exercise';

export function generateWorkoutText(
  t: TFunction,
  exercises: Exercise[],
  description: string,
  templateName?: string,
  useWeekdayPrefix?: boolean
): string {
  let text = '';

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
    text += `${days[today.getDay()]}\n\n`;
  }

  if (templateName?.trim()) {
    text += `${templateName}\n\n`;
  }

  if (description.trim()) {
    text += `${description}\n\n`;
  }

  text += `${t('exercises')}:\n`;
  exercises.forEach((ex, index) => {
    text += `${index + 1}. ${ex.name || t('enterExerciseName')}`;

    if (!ex.sets.length && !ex.weight.length) {
      text += '\n';
    }

    if (ex.sets.length || ex.weight.length) {
      text += ' - ';

      if (ex.sets.length) {
        text += `${ex.sets} `;
      }

      if (ex.weight.length) {
        text += ex.sets.length ? `x ${ex.weight} ` : `${ex.weight} `;
      }

      text += '\n';
    }
  });

  return text;
}