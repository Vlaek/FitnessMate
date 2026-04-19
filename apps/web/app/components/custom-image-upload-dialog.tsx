'use client';

import { Button } from '@repo/ui/components/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@repo/ui/components/dialog';
import { ImagePlus, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface CustomImageUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImageSelected: (file: File) => void;
}

export function CustomImageUploadDialog({
  open,
  onOpenChange,
  onImageSelected,
}: CustomImageUploadDialogProps) {
  const { t } = useTranslation('common');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelection = (file?: File) => {
    if (!file || !file.type.startsWith('image/')) {
      return;
    }

    onImageSelected(file);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('uploadYourImage')}</DialogTitle>
        </DialogHeader>

        <div
          role="button"
          tabIndex={0}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            setIsDragging(false);
          }}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);
            handleFileSelection(event.dataTransfer.files?.[0]);
          }}
          className={`flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors ${
            isDragging
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-slate-300 bg-slate-50 text-slate-600 hover:border-blue-400 hover:bg-blue-50/60'
          }`}
        >
          <div className="mb-4 rounded-full bg-white p-4 shadow-sm">
            {isDragging ? <Upload className="size-8" /> : <ImagePlus className="size-8" />}
          </div>
          <p className="text-base font-medium">{t('dragAndDropImage')}</p>
          <p className="mt-2 text-sm text-slate-500">{t('orChooseFile')}</p>
          <Button type="button" variant="outline" className="mt-5">
            {t('chooseFile')}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => handleFileSelection(event.target.files?.[0])}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
