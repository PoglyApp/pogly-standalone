import { useContext, useEffect } from "react";
import { useAppDispatch } from "../../Store/Features/store";
import { addAuditLog } from "../../Store/Features/AuditLogSlice";
import { DebugLogger } from "../../Utility/DebugLogger";
import { SpacetimeContext } from "../../Contexts/SpacetimeContext";
import { AuditLog, EventContext } from "../../module_bindings";
import { SpacetimeContextType } from "../../Types/General/SpacetimeContextType";

export const useAuditLogEvents = () => {
  const dispatch = useAppDispatch();
  const spacetimeDB: SpacetimeContextType = useContext(SpacetimeContext);

  useEffect(() => {
    DebugLogger("Initializing audit log events");
    spacetimeDB.Client.db.auditLog.onInsert((ctx: EventContext, auditLog: AuditLog)=> {
      dispatch(addAuditLog(auditLog));
    });
  }, []);
};
