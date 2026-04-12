import { TFunction } from 'i18next';
import { IExercise } from '../interfaces/exercise';

export function generateWorkoutText(
  t: TFunction,
  exercises: IExercise[],
  description: string,
  bodyWeight?: string,
  templateName?: string,
  useWeekdayPrefix?: boolean,
  useWorkoutDatePrefix?: boolean,
  useEmptyLinesBetweenSections: boolean = true,
  useTotalWorkload: boolean = false,
): string {
  const sections: string[] = [];
  const hasExercises = exercises.some((item) => item.name.length > 0);
  const sectionSeparator = useEmptyLinesBetweenSections ? '\n\n' : '\n';

  if (useWeekdayPrefix || useWorkoutDatePrefix) {
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
    const dayPart = useWeekdayPrefix ? days[today.getDay()] || '' : '';
    const datePart = useWorkoutDatePrefix
      ? `${String(today.getDate()).padStart(2, '0')}.${String(today.getMonth() + 1).padStart(2, '0')}.${today.getFullYear()}`
      : '';

    if (dayPart && datePart) {
      sections.push(`${dayPart} - ${datePart}`);
    } else if (dayPart || datePart) {
      sections.push(dayPart || datePart);
    }
  }

  if (templateName?.trim()) {
    sections.push(templateName.trim());
  }

  if (description.trim()) {
    sections.push(description.trim());
  }

  const parsedBodyWeight = bodyWeight?.trim() ? Number(bodyWeight) : NaN;
  if (Number.isFinite(parsedBodyWeight) && parsedBodyWeight > 0) {
    sections.push(`${t('bodyWeight')}: ${bodyWeight?.trim()} ${t('kg')}`);
  }

  if (hasExercises) {
    const exerciseLines: string[] = [];
    let totalWorkload = 0;
    let hasWorkloadData = false;

    exercises.forEach((ex, index) => {
      if (!ex.name) return;

      const exerciseDisplayName = t(ex.name, { defaultValue: ex.name || t('enterExerciseName') });
      let exerciseLine = `${index + 1}. ${exerciseDisplayName}`;

      const detailsParts: string[] = [];
      if (ex.sets?.length) {
        detailsParts.push(ex.sets);
      }
      if (ex.reps?.length) {
        detailsParts.push(ex.reps);
      }
      if (ex.weight) {
        detailsParts.push(`${ex.weight} ${t('kg')}`);
      }

      if (detailsParts.length > 0) {
        exerciseLine += ` - ${detailsParts.join(' x ')}`;
      }

      const parsedSets = Number(ex.sets);
      const parsedReps = Number(ex.reps);
      const parsedWeight = Number(ex.weight);
      if (
        Number.isFinite(parsedSets) &&
        Number.isFinite(parsedReps) &&
        Number.isFinite(parsedWeight) &&
        parsedSets > 0 &&
        parsedReps > 0 &&
        parsedWeight > 0
      ) {
        totalWorkload += parsedSets * parsedReps * parsedWeight;
        hasWorkloadData = true;
      }

      exerciseLines.push(exerciseLine);
    });

    if (exerciseLines.length > 0) {
      if (useTotalWorkload && hasWorkloadData) {
        sections.push(
          `${exerciseLines.join('\n')}\n\n${t('totalWorkload')}: ${totalWorkload.toLocaleString()} ${t('kg')}`,
        );
      } else {
        sections.push(exerciseLines.join('\n'));
      }
    }
  }

  return sections.join(sectionSeparator);
}

/**
 * Format date as DD.MM.YYYY regardless of the language
 * @param date The date to format (string, Date object, or timestamp)
 * @param t Translation function from react-i18next
 * @returns Formatted date string in DD.MM.YYYY format
 */
export function formatDateDDMMYYYY(date: string | Date | undefined, t: TFunction): string {
  if (!date) {
    return '';
  }

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  // Check if the date is valid
  if (isNaN(dateObj.getTime())) {
    console.warn(`Invalid date received: ${date}`);
    return '';
  }

  // Format date as DD.MM.YYYY regardless of the language
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0'); // Month is zero-indexed
  const year = dateObj.getFullYear();

  return `${day}.${month}.${year}`;
}
