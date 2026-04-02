'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@repo/ui/components/dialog';
import { Button } from '@repo/ui/components/button';
import { Input } from '@repo/ui/components/index';
import { Label } from '@repo/ui/components/label';
import { Textarea } from '@repo/ui/components/textarea';
import { WorkoutTemplate } from '../interfaces/workout-template';

interface TemplateEditorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentTemplate: WorkoutTemplate | null;
  setCurrentTemplate: (template: WorkoutTemplate | null) => void;
  handleSaveTemplate: () => void;
}

export function TemplateEditorDialog({
  isOpen,
  onClose,
  currentTemplate,
  setCurrentTemplate,
  handleSaveTemplate
}: TemplateEditorDialogProps) {
  if (!currentTemplate) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl">
        <DialogHeader 
          className="bg-teal-600 rounded-t-xl p-5 -m-6 mb-6" 
          style={{ borderRadius: '0.5rem 0.5rem 0 0' }} // Custom styling to match previous header
        >
          <DialogTitle className="text-2xl font-bold text-white">
            {currentTemplate.id ? 'Edit Template' : 'New Template'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="mb-6">
          <Label htmlFor="template-name" className="text-slate-700">Template Name *</Label>
          <Input
            id="template-name"
            value={currentTemplate.name}
            onChange={(e) => setCurrentTemplate({...currentTemplate, name: e.target.value})}
            placeholder="Enter template name"
            className="mt-1 p-3 border border-slate-300 rounded-lg w-full"
          />
        </div>
        
        <div className="mb-6">
          <Label htmlFor="template-desc" className="text-slate-700">Description</Label>
          <Textarea
            id="template-desc"
            value={currentTemplate.description}
            onChange={(e) => setCurrentTemplate({...currentTemplate, description: e.target.value})}
            placeholder="Describe your template"
            className="mt-1 p-3 border border-slate-300 rounded-lg w-full min-h-25"
          />
        </div>
        
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <Label className="text-slate-700 text-lg">Exercises</Label>
            <Button 
              type="button" 
              size="sm" 
              variant="outline" 
              onClick={() => {
                const updatedTemplate = {...currentTemplate};
                updatedTemplate.exercises = [
                  ...updatedTemplate.exercises,
                  { id: Math.random().toString(36).substr(2, 9), name: '', sets: 3, weight: 0 }
                ];
                setCurrentTemplate(updatedTemplate);
              }}
              className="border-slate-300 text-slate-700"
            >
              Add Exercise
            </Button>
          </div>
          
          {currentTemplate.exercises.map((exercise, index) => (
            <div key={index} className="grid grid-cols-12 gap-3 mb-4 items-center p-3 bg-slate-50 rounded-lg">
              <div className="col-span-5">
                <Input
                  value={exercise.name}
                  onChange={(e) => {
                    const updatedTemplate = {...currentTemplate};
                    if (updatedTemplate.exercises[index]) {
                      updatedTemplate.exercises[index].name = e.target.value;
                    }
                    setCurrentTemplate(updatedTemplate);
                  }}
                  placeholder="Exercise name"
                  className="w-full"
                />
              </div>
              <div className="col-span-3">
                <Input
                  type="number"
                  value={exercise.sets}
                  onChange={(e) => {
                    const updatedTemplate = {...currentTemplate};
                    if (updatedTemplate.exercises[index]) {
                      updatedTemplate.exercises[index].sets = parseInt(e.target.value) || 0;
                    }
                    setCurrentTemplate(updatedTemplate);
                  }}
                  placeholder="Sets"
                  className="w-full"
                />
              </div>
              <div className="col-span-3">
                <Input
                  type="number"
                  value={exercise.weight}
                  onChange={(e) => {
                    const updatedTemplate = {...currentTemplate};
                    if (updatedTemplate.exercises[index]) {
                      updatedTemplate.exercises[index].weight = parseFloat(e.target.value) || 0;
                    }
                    setCurrentTemplate(updatedTemplate);
                  }}
                  placeholder="Default weight (kg)"
                  className="w-full"
                />
              </div>
              <div className="col-span-1">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="icon"
                  onClick={() => {
                    const updatedTemplate = {...currentTemplate};
                    updatedTemplate.exercises.splice(index, 1);
                    setCurrentTemplate(updatedTemplate);
                  }}
                  disabled={currentTemplate.exercises.length <= 1}
                  className="w-full h-10 flex items-center justify-center border-slate-300 text-slate-600 hover:bg-red-50 hover:text-red-600"
                >
                  ×
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        <DialogFooter className="pt-4 border-t border-slate-200">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="border-slate-300 text-slate-700 px-6 py-2"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveTemplate}
            className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2"
          >
            Save Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}