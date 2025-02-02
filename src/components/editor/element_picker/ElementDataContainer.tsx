import { useFetchElementData } from "@/spacetimedb/hooks/useFetchElementData.tsx";

export const ElementDataContainer: React.FC = () => {
  useFetchElementData();
  return <div></div>;
};
