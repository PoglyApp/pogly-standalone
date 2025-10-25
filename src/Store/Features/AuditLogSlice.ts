import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AuditLog } from "../../module_bindings";

interface AuditLogState {
  auditLog: AuditLog[];
}

const initialState: AuditLogState = {
  auditLog: [],
};

export const AuditLogSlice = createSlice({
  name: "auditLog",
  initialState,
  reducers: {
    initAuditLog: (state, action: PayloadAction<AuditLog[]>) => {
      state.auditLog = [...action.payload];
    },
    addAuditLog: (state, action: PayloadAction<AuditLog>) => {
      state.auditLog.push(action.payload);
    },
  },
});

export default AuditLogSlice.reducer;
export const { initAuditLog, addAuditLog } = AuditLogSlice.actions;
