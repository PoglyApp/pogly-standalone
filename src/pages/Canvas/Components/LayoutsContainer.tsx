import { Container } from "@/Components/General/Container";
import { Button } from "@/Components/Inputs/Button";
import { Select } from "@/Components/Inputs/Select";
import { TextInput } from "@/Components/Inputs/TextInput";
import { SpacetimeContext } from "@/Contexts/SpacetimeContext";
import { Layouts } from "@/module_bindings";
import { useLayoutsEvents } from "@/StDB/Hooks/useLayoutsEvents";
import { FolderPlus, X } from "lucide-react";
import { useContext, useEffect, useState } from "react";

export const LayoutsContainer = () => {
  const { spacetimeDB } = useContext(SpacetimeContext);

  const [activeLayout, setActiveLayout] = useState<Layouts>();
  const [layouts, setLayouts] = useState<Layouts[]>([]);
  const [showLayoutCreation, setShowLayoutCreation] = useState<boolean>(false);

  const [newLayoutName, setNewLayoutName] = useState<string>("");
  const [invalidName, setInvalidName] = useState<boolean>(false);

  useLayoutsEvents(setLayouts);

  useEffect(() => {
    if (!spacetimeDB) return;

    const layout: Layouts[] = spacetimeDB.Client.db.layouts.iter() as Layouts[];
    const active: Layouts = layout.find((l: Layouts) => l.active) as Layouts;

    setActiveLayout(active);
    setLayouts(layout);
  }, [spacetimeDB]);

  const handleLayoutSelect = (target: any) => {
    const value = target.value;

    if (value === "addLayout") {
      return setShowLayoutCreation(true);
    }

    const layoutId = target.id.split("_")[0];

    spacetimeDB.Client.reducers.setLayoutActive(layoutId);
  };

  const handleNameChange = (text: any) => {
    setNewLayoutName(text);

    if (!/^[a-z0-9]+$/i.test(text) && text !== "") {
      return setInvalidName(true);
    }
    if (text.length > 20) {
      return setInvalidName(true);
    }

    setInvalidName(false);
  };

  const addLayout = () => {
    if (invalidName || newLayoutName.length < 1) return;

    spacetimeDB.Client.reducers.addLayout(newLayoutName);
    setShowLayoutCreation(false);
    setNewLayoutName("");
  };

  return (
    <Container title="layouts" className="w-[320px] h-[70px] mt-[153px] ml-[40px]">
      <div className="flex w-full gap-2 pl-4 pr-4 mt-1">
        {activeLayout && !showLayoutCreation && (
          <Select
            className="w-full h-[36px] mb-[6px]"
            onChange={(event) => handleLayoutSelect(event.target.selectedOptions[0])}
            defaultValue={
              <option id={`${activeLayout.id}_layout`} value={activeLayout.name}>
                {activeLayout.name}
              </option>
            }
          >
            <>
              {layouts
                .filter((layout) => layout.name !== activeLayout.name)
                .map((layout) => {
                  return (
                    <option id={`${layout.id}_layout`} key={`${layout.id}_LAYOUT_OPTION`} value={layout.name}>
                      {layout.name}
                    </option>
                  );
                })}
              <option value="addLayout">+ new layout</option>
            </>
          </Select>
        )}

        {showLayoutCreation && (
          <div className="flex gap-2 w-full">
            <TextInput
              placeholder="layout name"
              onChange={(event) => handleNameChange(event.target.value)}
              value={newLayoutName}
              inputClassName={`text-[14px] ${invalidName && "border border-[#ff00006c]"}`}
            />
            <Button
              onClick={addLayout}
              className="w-fit text-[14px]"
              disabled={invalidName || newLayoutName.length < 1}
            >
              <FolderPlus className="w-[20px] h-[20px]" />
            </Button>
            <Button onClick={() => setShowLayoutCreation(false)} className="w-fit text-[14px]">
              <X className="w-[20px] h-[20px]" />
            </Button>
          </div>
        )}
      </div>
    </Container>
  );
};
