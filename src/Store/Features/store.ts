import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { ElementsSlice } from "./ElementsSlice";
import { GuestSlice } from "./GuestSlice";
import { ElementDataSlice } from "./ElementDataSlice";
import { CanvasElementSlice } from "./CanvasElementSlice";
import { AuditLogSlice } from "./AuditLogSlice";

export const store = configureStore({
  reducer: {
    elementData: ElementDataSlice.reducer,
    elements: ElementsSlice.reducer,
    canvasElements: CanvasElementSlice.reducer,
    guests: GuestSlice.reducer,
    auditLog: AuditLogSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const useAppDispatch: () => typeof store.dispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<
  ReturnType<typeof store.getState>
> = useSelector;
