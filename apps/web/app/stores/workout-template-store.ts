import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WorkoutTemplate } from '../interfaces/workout-template';

interface WorkoutTemplateState {
  templates: WorkoutTemplate[];
  currentTemplate: WorkoutTemplate | null;
  isEditingTemplate: boolean;
  setTemplates: (templates: WorkoutTemplate[]) => void;
  addTemplate: (template: WorkoutTemplate) => void;
  updateTemplate: (template: WorkoutTemplate) => void;
  deleteTemplate: (id: string) => void;
  setCurrentTemplate: (template: WorkoutTemplate | null) => void;
  setIsEditingTemplate: (editing: boolean) => void;
  getTemplateById: (id: string) => WorkoutTemplate | undefined;
}

export const useWorkoutTemplateStore = create<WorkoutTemplateState>()(
  persist(
    (set, get) => ({
      templates: [],
      currentTemplate: null,
      isEditingTemplate: false,
      setTemplates: (templates) => set({ templates }),
      addTemplate: (template) => 
        set((state) => ({ 
          templates: [...state.templates, template] 
        })),
      updateTemplate: (updatedTemplate) => 
        set((state) => ({
          templates: state.templates.map(t => 
            t.id === updatedTemplate.id ? updatedTemplate : t
          ),
          // If the updated template is the current one being edited, update it too
          currentTemplate: state.currentTemplate?.id === updatedTemplate.id ? updatedTemplate : state.currentTemplate
        })),
      deleteTemplate: (id) => 
        set((state) => ({
          templates: state.templates.filter(t => t.id !== id),
          // If the deleted template was the current one being edited, clear it
          currentTemplate: state.currentTemplate?.id === id ? null : state.currentTemplate
        })),
      setCurrentTemplate: (template) => set({ currentTemplate: template }),
      setIsEditingTemplate: (editing) => set({ isEditingTemplate: editing }),
      getTemplateById: (id) => {
        const state = get();
        return state.templates.find(t => t.id === id);
      }
    }),
    {
      name: 'workout-template-storage', // name of the item in the storage (must be unique)
    }
  )
);