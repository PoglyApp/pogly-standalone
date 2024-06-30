import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import ElementData from "../../module_bindings/element_data";

interface ElementDataState {
  elementData: ElementData[];
}

const initialState: ElementDataState = {
  elementData: [],
};

export const ElementDataSlice = createSlice({
  name: "elementData",
  initialState,
  reducers: {
    initData: (state, action: PayloadAction<ElementData[]>) => {
      state.elementData = [...action.payload];
    },

    addElementData: (state, action: PayloadAction<ElementData>) => {
      state.elementData.push(action.payload);
    },

    updateElementData: (state, action: PayloadAction<ElementData>) => {
      const elementDatas = state.elementData;
      const elementData = elementDatas.findIndex((e) => e.id === action.payload.id);

      elementDatas[elementData] = action.payload;
      state.elementData = [...elementDatas];
    },

    addElementDataArray: (state, action: PayloadAction<ElementData[]>) => {
      action.payload.forEach((elementData: ElementData) => state.elementData.push(elementData));
    },

    removeElementData: (state, action: PayloadAction<ElementData>) => {
      state.elementData = state.elementData.filter((data) => {
        return data.id !== action.payload.id;
      });
    },
  },
});

export default ElementDataSlice.reducer;
export const { initData, addElementData, updateElementData, addElementDataArray, removeElementData } =
  ElementDataSlice.actions;
