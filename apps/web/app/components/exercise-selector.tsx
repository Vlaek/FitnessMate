'use client';

import { Combobox, Option } from '@repo/ui/components/combobox';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useExerciseCatalogStore } from '../stores/exercise-catalog-store';

interface IProps {
  value: string;
  placeholder?: string;
  className?: string;
  onChange: (exerciseNameKey: string) => void;
}

export function ExerciseSelector({ value, placeholder, className, onChange }: IProps) {
  const { t } = useTranslation('common');
  const { exercises, initialized, initializeExercises } = useExerciseCatalogStore();

  useEffect(() => {
    if (!initialized) {
      initializeExercises();
    }
  }, [initialized, initializeExercises]);

  const exerciseOptions = useMemo<Option[]>(() => {
    return exercises
      .filter((ex) => ex.muscleGroup !== 'other')
      .map((exercise) => ({
        value: exercise.nameKey,
        label: `${t(exercise.nameKey)} (${t(exercise.muscleGroup || '')})`,
      }));
  }, [exercises, t]);

  return (
    <Combobox
      options={exerciseOptions}
      value={value}
      onChange={onChange}
      placeholder={placeholder || t('enterExerciseName')}
      className={className || 'w-[260px] max-w-[260px]'}
    />
  );
}
