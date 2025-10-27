import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Elements } from "../../module_bindings";

interface ElementsState {
  elements: Elements[];
}

const initialState: ElementsState = {
  elements: [],
};

export const ElementsSlice = createSlice({
  name: "elements",
  initialState,
  reducers: {
    initElements: (state, action: PayloadAction<Elements[]>) => {
      state.elements = [...action.payload];
    },

    addElement: (state, action: PayloadAction<Elements>) => {
      state.elements.push(action.payload);
    },

    updateElement: (state, action: PayloadAction<Elements>) => {
      const elements = state.elements;
      const element = elements.findIndex((e) => e.id === action.payload.id);

      elements[element] = action.payload;
      state.elements = [...elements];
    },

    removeElement: (state, action: PayloadAction<Elements>) => {
      state.elements = state.elements.filter((element) => {
        return element.id !== action.payload.id;
      });
    },
  },
});

export default ElementsSlice.reducer;
export const { initElements, addElement, removeElement, updateElement } = ElementsSlice.actions;
