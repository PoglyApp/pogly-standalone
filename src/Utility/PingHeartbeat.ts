import PingHeartbeatReducer from "../module_bindings/ping_heartbeat_reducer";

let heartbeatInterval: NodeJS.Timeout | null = null;

export const StartHeartbeat = () => {
  if (heartbeatInterval) {
    //console.warn("Heartbeat already running.");
    return;
  }

  heartbeatInterval = setInterval(() => {
    try {
      PingHeartbeatReducer.call(); 
      //console.log("ping");
    } catch (error) {
      console.error("Failed to send heartbeat ping:", error);
      StopHeartbeat(); 
    }
  }, 5000); // 5 seconds
}

export const StopHeartbeat = () => {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
    //console.log("Heartbeat stopped");
  }
}