import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import Elements from "../../module_bindings/elements";
import { CanvasElementType } from "../../Types/General/CanvasElementType";

interface CanvasElementState {
  canvasElements: CanvasElementType[];
}

const initialState: CanvasElementState = {
  canvasElements: [],
};

export const CanvasElementSlice = createSlice({
  name: "canvasElements",
  initialState,
  reducers: {
    initCanvasElements: (state, action: PayloadAction<CanvasElementType[]>) => {
      state.canvasElements = [...action.payload];
    },
    addCanvasElement: (state, action: PayloadAction<CanvasElementType>) => {
      state.canvasElements.push(action.payload);
    },
    addCanvasElementArray: (state, action: PayloadAction<CanvasElementType[]>) => {
      action.payload.forEach((elementData: CanvasElementType) => state.canvasElements.push(elementData));
    },
    updateCanvasElement: (state, action: PayloadAction<Elements>) => {
      const elements = state.canvasElements;
      const element = elements.findIndex((e) => e.Elements.id === action.payload.id);

      elements[element].Elements = action.payload;
      state.canvasElements = [...elements];
    },
    removeCanvasElement: (state, action: PayloadAction<Elements>) => {
      state.canvasElements = state.canvasElements.filter((element: CanvasElementType) => {
        return element.Elements.id !== action.payload.id;
      });
    },
  },
});

export default CanvasElementSlice.reducer;
export const { initCanvasElements, addCanvasElement, addCanvasElementArray, updateCanvasElement, removeCanvasElement } =
  CanvasElementSlice.actions;
