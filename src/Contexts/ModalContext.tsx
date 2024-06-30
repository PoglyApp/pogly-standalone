import { createContext } from "react";

export const ModalContext = createContext<any>({
  modals: [],
  setModals: () => {},
  closeModal: (key: string, modals: any, setModals: Function) => {
    const newModalArray = modals.filter((modal: any) => modal && modal.key !== key);
    setModals(() => newModalArray);
  },
});
