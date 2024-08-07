import ElementData from "../../module_bindings/element_data";
import { styled } from "styled-components";
import { TextCategory } from "./Categories/TextCategory";
import { ImageCategory } from "./Categories/ImageCategory";
import { SevenTVCategory } from "./Categories/SevenTVCategory";
import { WidgetCategory } from "./Categories/WidgetCategory";
import { ElementSelectionContextMenu } from "./ContextMenus/ElementSelectionContextMenu";
import { useContext, useState } from "react";
import { ElementSelectionMenuFooter } from "./ElementSelectionMenuFooter";
import PermissionLevel from "../../module_bindings/permission_level";
import Config from "../../module_bindings/config";
import Permissions from "../../module_bindings/permissions";
import { useSpacetimeContext } from "../../Contexts/SpacetimeContext";
import { TenorCategory } from "./Categories/TenorCategory";
import { ConfigContext } from "../../Contexts/ConfigContext";
import { LayoutCategory } from "./Categories/LayoutCategory";
import { Divider, Typography } from "@mui/material";
import { LayoutContext, LayoutContextType } from "../../Contexts/LayoutContext";

interface IProps {
  elementData: ElementData[];
}

export const ElementSelectionMenu = (props: IProps) => {
  const { Identity } = useSpacetimeContext();
  const config: Config = useContext(ConfigContext);

  const [contextMenu, setContextMenu] = useState<any>(null);

  const strictSettings: { StrictMode: boolean; Permission?: PermissionLevel } = {
    StrictMode: Config.findByVersion(0)!.strictMode,
    Permission: Permissions.findByIdentity(Identity.identity)?.permissionLevel,
  };

  return (
    <>
      <SelectionMenuContainer id="SelectionMenu">
        <CategoryContainer>
          <LayoutCategory />

          <Divider
            sx={{
              ":before": { borderTopColor: "#ffffffa6" },
              ":after": { borderTopColor: "#ffffffa6" },
              marginBottom: "5px",
              marginTop: "5px",
            }}
          >
            <Typography sx={{ color: "#ffffffa6" }} variant="inherit">
              Elements
            </Typography>
          </Divider>

          <TextCategory />

          <ImageCategory
            elementData={props.elementData}
            strictSettings={strictSettings}
            contextMenu={contextMenu}
            setContextMenu={setContextMenu}
          />

          <WidgetCategory
            elementData={props.elementData}
            strictSettings={strictSettings}
            contextMenu={contextMenu}
            setContextMenu={setContextMenu}
          />

          {config.streamingPlatform === "twitch" && <SevenTVCategory />}

          <TenorCategory />
        </CategoryContainer>

        <ElementSelectionMenuFooter />
      </SelectionMenuContainer>

      <ElementSelectionContextMenu contextMenu={contextMenu} setContextMenu={setContextMenu} />
    </>
  );
};

const SelectionMenuContainer = styled.div`
  background-color: #001529;

  width: 218px;
  height: 100%;

  position: fixed;
  overflow-y: auto;

  padding-top: 10px;

  &::-webkit-scrollbar {
    width: 0;
    background: transparent;
  }
`;

const CategoryContainer = styled.div`
  max-height: 80%;
  overflow-y: scroll;
  overflow-x: hidden;

  &::-webkit-scrollbar {
    width: 0;
    background: transparent;
  }
`;
