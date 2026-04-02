import { create } from 'zustand';

type ModalType = 'workoutSession' | 'templateEditor' | null;

interface ModalData {
  template?: any;
  [key: string]: any;
}

interface ModalState {
  activeModal: {
    type: ModalType;
    data?: ModalData;
  };
  openModal: (modalType: ModalType, data?: ModalData) => void;
  closeModal: () => void;
  isActive: (modalType: ModalType) => boolean;
}

export const useModalStore = create<ModalState>((set, get) => ({
  activeModal: { type: null },
  
  openModal: (modalType: ModalType, data?: ModalData) => set({ activeModal: { type: modalType, data } }),
  
  closeModal: () => set({ activeModal: { type: null } }),
  
  isActive: (modalType: ModalType) => get().activeModal.type === modalType,
}));