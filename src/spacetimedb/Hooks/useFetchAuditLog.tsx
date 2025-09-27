import { useEffect } from "react";
import { useAppDispatch } from "../../Store/Features/store";
import { initAuditLog } from "../../Store/Features/AuditLogSlice";
import { DebugLogger } from "../../Utility/DebugLogger";

const useFetchAuditLog = (setAuditInitialized: Function) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // const auditLog = AuditLog.all();
    // dispatch(initAuditLog(auditLog));
    // Disabling initAuditLog so we don't get the history

    DebugLogger("Fetching audit log");

    setAuditInitialized(true);
  }, []);
};

export default useFetchAuditLog;
