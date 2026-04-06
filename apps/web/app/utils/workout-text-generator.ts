import { TFunction } from 'i18next';
import { IExercise } from '../interfaces/exercise';

export function generateWorkoutText(
  t: TFunction,
  exercises: IExercise[],
  description: string,
  templateName?: string,
  useWeekdayPrefix?: boolean,
): string {
  let text = '';
  const hasExercises = exercises.some((item) => item.name.length > 0);

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

  if (!hasExercises) {
    return text;
  }

  text += `${t('exercises')}:\n`;

  exercises.forEach((ex, index) => {
    if (ex.name) {
      text += `${index + 1}. ${ex.name || t('enterExerciseName')}`;

      if (!ex.sets.length && !ex.weight) {
        text += '\n';
      }

      if (ex.sets.length || ex.weight) {
        text += ' - ';

        if (ex.sets.length) {
          text += `${ex.sets} `;
        }

        if (ex.weight) {
          text += ex.sets.length ? `x ${ex.weight} ${t('kg')}` : `${ex.weight} ${t('kg')}`;
        }

        text += '\n';
      }
    }
  });

  return text;
}

/**
 * Formats a date string in the DD.MM.YYYY format based on the current language setting
 * @param date The date to format (string, Date object, or timestamp)
 * @param t Translation function from react-i18next
 * @returns Formatted date string in DD.MM.YYYY format
 */
export function formatDateDDMMYYYY(date: string | Date, t: TFunction): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Format date as DD.MM.YYYY regardless of the language
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0'); // Month is zero-indexed
  const year = dateObj.getFullYear();
  
  return `${day}.${month}.${year}`;
}