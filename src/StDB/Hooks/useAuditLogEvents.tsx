import { useEffect } from "react";
import AuditLog from "../../module_bindings/audit_log";
import { ReducerEvent } from "@clockworklabs/spacetimedb-sdk";
import { useAppDispatch } from "../../Store/Features/store";
import { addAuditLog } from "../../Store/Features/AuditLogSlice";

export const useAuditLogEvents = () => {
    const dispatch = useAppDispatch();

    useEffect(() => {
        AuditLog.onInsert((auditLog, reducerEvent) => {
            dispatch(addAuditLog(auditLog));
        });
    }, []);
};