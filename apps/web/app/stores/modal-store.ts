import { create } from 'zustand';

type ModalType = 'workoutSession' | 'templateEditor' | null;

interface IModalData {
  template?: any;
  [key: string]: any;
}

interface IModalState {
  activeModal: {
    type: ModalType;
    data?: IModalData;
  };
  openModal: (modalType: ModalType, data?: IModalData) => void;
  closeModal: () => void;
  isActive: (modalType: ModalType) => boolean;
}

export const useModalStore = create<IModalState>((set, get) => ({
  activeModal: { type: null },

  openModal: (modalType: ModalType, data?: IModalData) =>
    set({ activeModal: { type: modalType, data } }),

  closeModal: () => set({ activeModal: { type: null } }),

  isActive: (modalType: ModalType) => get().activeModal.type === modalType,
}));
