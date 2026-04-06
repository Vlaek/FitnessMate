import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { IWorkoutTemplate } from '../interfaces/workout-template';

const LEGACY_WORKOUT_TEMPLATES_KEY = 'workout_templates';

interface IWorkoutTemplateState {
  templates: IWorkoutTemplate[];
  currentTemplate: IWorkoutTemplate | null;
  isEditingTemplate: boolean;
  setTemplates: (templates: IWorkoutTemplate[]) => void;
  addTemplate: (template: IWorkoutTemplate) => void;
  updateTemplate: (template: IWorkoutTemplate) => void;
  deleteTemplate: (id: string) => void;
  setCurrentTemplate: (template: IWorkoutTemplate | null) => void;
  setIsEditingTemplate: (editing: boolean) => void;
  getTemplateById: (id: string) => IWorkoutTemplate | undefined;
}

export const useWorkoutTemplateStore = create<IWorkoutTemplateState>()(
  persist(
    (set, get) => ({
      templates: [],
      currentTemplate: null,
      isEditingTemplate: false,
      setTemplates: (templates) => set({ templates }),
      addTemplate: (template) =>
        set((state) => ({
          templates: [...state.templates, template],
        })),
      updateTemplate: (updatedTemplate) =>
        set((state) => ({
          templates: state.templates.map((t) =>
            t.id === updatedTemplate.id ? updatedTemplate : t,
          ),
          currentTemplate:
            state.currentTemplate?.id === updatedTemplate.id
              ? updatedTemplate
              : state.currentTemplate,
        })),
      deleteTemplate: (id) =>
        set((state) => ({
          templates: state.templates.filter((t) => t.id !== id),
          currentTemplate: state.currentTemplate?.id === id ? null : state.currentTemplate,
        })),
      setCurrentTemplate: (template) => set({ currentTemplate: template }),
      setIsEditingTemplate: (editing) => set({ isEditingTemplate: editing }),
      getTemplateById: (id) => {
        const state = get();
        return state.templates.find((t) => t.id === id);
      },
    }),
    {
      name: 'workout-template-storage',
      onRehydrateStorage: () => {
        return (state, error) => {
          if (error) {
            console.error('An error happened during hydration', error);
          } else if (state && state.templates.length === 0) {
            try {
              const legacyStored = localStorage.getItem(LEGACY_WORKOUT_TEMPLATES_KEY);
              if (legacyStored) {
                const legacyTemplates = JSON.parse(legacyStored);
                if (Array.isArray(legacyTemplates) && legacyTemplates.length > 0) {
                  state.setTemplates(legacyTemplates);
                }
              }
            } catch (e) {
              console.error('Error loading legacy templates', e);
            }
          }
        };
      },
    },
  ),
);
