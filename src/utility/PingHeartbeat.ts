import { DbConnection } from "../module_bindings";

let heartbeatInterval: NodeJS.Timeout | null = null;

export const StartHeartbeat = (Client: DbConnection) => {
  if (heartbeatInterval) {
    //console.warn("Heartbeat already running.");
    return;
  }

  heartbeatInterval = setInterval(() => {
    try {
      //console.log("ping");
    } catch (error) {
      console.error("Failed to send heartbeat ping:", error);
      StopHeartbeat();
    }
  }, 5000); // 5 seconds
};

export const StopHeartbeat = () => {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
    //console.log("Heartbeat stopped");
  }
};
