import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import Guests from "../../module_bindings/guests";

interface GuestState {
  guests: Guests[];
}

const initialState: GuestState = {
  guests: [],
};

export const GuestSlice = createSlice({
  name: "guests",
  initialState,
  reducers: {
    initGuests: (state, action: PayloadAction<Guests[]>) => {
      state.guests = [...action.payload];
    },

    addGuest: (state, action: PayloadAction<Guests>) => {
      state.guests.push(action.payload);
    },

    removeGuest: (state, action: PayloadAction<Guests>) => {
      state.guests = state.guests.filter((guest) => {
        return guest.address.toHexString() !== action.payload.address.toHexString();
      });
    },

    updateGuest: (state, action: PayloadAction<Guests>) => {
      const guests = state.guests;
      const guest = guests.findIndex((g) => g.address.toHexString() === action.payload.address.toHexString());

      guests[guest] = action.payload;
      state.guests = [...guests];
    },

    updateGuestLayout: (state, action: PayloadAction<Guests>) => {
      const guests = state.guests;
      const guest = guests.findIndex((g) => g.address.toHexString() === action.payload.address.toHexString());

      guests[guest].selectedLayoutId = action.payload.selectedLayoutId;
      state.guests = [...guests];
    },
  },
});

export default GuestSlice.reducer;
export const { initGuests, addGuest, removeGuest, updateGuest, updateGuestLayout } = GuestSlice.actions;
