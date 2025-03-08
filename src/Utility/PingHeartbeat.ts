import { useContext } from "react";
import { SpacetimeContext } from "../Contexts/SpacetimeContext";

let heartbeatInterval: NodeJS.Timeout | null = null;

export const StartHeartbeat = () => {
  const spacetime = useContext(SpacetimeContext);

  if (heartbeatInterval) {
    //console.warn("Heartbeat already running.");
    return;
  }

  heartbeatInterval = setInterval(() => {
    try {
      spacetime?.Client.reducers.pingHeartbeat(); 
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