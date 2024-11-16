import { StreamContainer } from "@/components/containers/StreamContainer";
import { useEffect } from "react";

export const Overlay: React.FC = () => {
  useEffect(() => {
    console.log("test");
  }, []);
  return (
    <div style={{ backgroundColor: "red", color: "red" }}>
      <h1>Test</h1>
      <StreamContainer />;
    </div>
  );
};
