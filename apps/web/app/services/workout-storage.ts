import { IWorkoutTemplate } from '../interfaces/workout-template';

const WORKOUT_TEMPLATES_KEY = 'workout_templates';

export class WorkoutStorage {
  static getAllTemplates(): IWorkoutTemplate[] {
    const stored = localStorage.getItem(WORKOUT_TEMPLATES_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  static saveTemplate(template: IWorkoutTemplate): void {
    const templates = this.getAllTemplates();

    if (!template.id) {
      template.id = Date.now().toString();
    }

    const existingIndex = templates.findIndex((t) => t.id === template.id);

    if (existingIndex >= 0) {
      templates[existingIndex] = template;
    } else {
      templates.push(template);
    }

    localStorage.setItem(WORKOUT_TEMPLATES_KEY, JSON.stringify(templates));
  }

  static deleteTemplate(id: string): void {
    const templates = this.getAllTemplates().filter((t) => t.id !== id);
    localStorage.setItem(WORKOUT_TEMPLATES_KEY, JSON.stringify(templates));
  }

  static getTemplateById(id: string): IWorkoutTemplate | undefined {
    const templates = this.getAllTemplates();
    return templates.find((t) => t.id === id);
  }
}
