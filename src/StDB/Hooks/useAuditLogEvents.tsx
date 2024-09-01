import { useEffect } from "react";
import AuditLog from "../../module_bindings/audit_log";
import { ReducerEvent } from "@clockworklabs/spacetimedb-sdk";
import { useAppDispatch } from "../../Store/Features/store";
import { addAuditLog } from "../../Store/Features/AuditLogSlice";
import { DebugLogger } from "../../Utility/DebugLogger";

export const useAuditLogEvents = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    DebugLogger("Initializing audit log events");
    AuditLog.onInsert((auditLog, reducerEvent) => {
      dispatch(addAuditLog(auditLog));
    });
  }, []);
};
