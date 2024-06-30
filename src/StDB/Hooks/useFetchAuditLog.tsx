import { useEffect } from "react";
import { useAppDispatch } from "../../Store/Features/store";
import AuditLog from "../../module_bindings/audit_log";
import { initAuditLog } from "../../Store/Features/AuditLogSlice";

const useFetchAuditLog = (setAuditInitialized: Function) => {
    const dispatch = useAppDispatch();
  
    useEffect(() => {
        // const auditLog = AuditLog.all();
        // dispatch(initAuditLog(auditLog));
        // Disabling initAuditLog so we don't get the history

        setAuditInitialized(true);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
  };


export default useFetchAuditLog;