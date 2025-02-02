import { UserContext } from "@/contexts/UserContext.ts";
import { ElementData } from "@/module_bindings/element_data_type.ts";
import { useContext, useEffect, useState } from "react";

export const useFetchElementData = () => {
  const user = useContext(UserContext);

  const [elementData, setElementData] = useState<ElementData[]>([]);

  useEffect(() => {
    if (elementData.length > 0 || !user) return;

    console.log("Fetching ElementData");

    const data = user.Client.db.elementData.iter();

    console.log(data);
  }, []);
};
