import ElementData from "../../module_bindings/element_data";
import { styled } from "styled-components";
import { TextCategory } from "./Categories/TextCategory";
import { ImageCategory } from "./Categories/ImageCategory";
import { ChannelEmoteCategory } from "./Categories/ChannelEmoteCategory";
import { WidgetCategory } from "./Categories/WidgetCategory";
import { ElementSelectionContextMenu } from "./ContextMenus/ElementSelectionContextMenu";
import { useContext, useEffect, useMemo, useState } from "react";
import { ElementSelectionMenuFooter } from "./ElementSelectionMenuFooter";
import Config from "../../module_bindings/config";
import Permissions from "../../module_bindings/permissions";
import { useSpacetimeContext } from "../../Contexts/SpacetimeContext";
import { TenorCategory } from "./Categories/TenorCategory";
import { ConfigContext } from "../../Contexts/ConfigContext";
import { LayoutCategory } from "./Categories/LayoutCategory";
import { Divider, Typography } from "@mui/material";
import { useAppSelector } from "../../Store/Features/store";
import { shallowEqual } from "react-redux";

interface IProps {
  isDropping: boolean;
}

export const ElementSelectionMenu = (props: IProps) => {
  const { Identity } = useSpacetimeContext();
  const config: Config = useContext(ConfigContext);

  const elementData: ElementData[] = useAppSelector((state: any) => state.elementData.elementData, shallowEqual);
  const memoizedData = useMemo(() => elementData, [elementData]);

  const [contextMenu, setContextMenu] = useState<any>(null);

  const strictMode = useMemo(() => Config.findByVersion(0)!.strictMode, []);
  const permissionLevel = useMemo(
    () => Permissions.findByIdentity(Identity.identity)?.permissionLevel,
    [Identity.identity]
  );

  const memoizedStrictSettings = useMemo(
    () => ({
      StrictMode: strictMode,
      Permission: permissionLevel,
    }),
    [strictMode, permissionLevel]
  );

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

          <div style={{ borderStyle: `${props.isDropping ? "dashed" : "none"}`, borderColor: "green" }}>
            <ImageCategory
              elementData={memoizedData}
              strictSettings={memoizedStrictSettings}
              contextMenu={contextMenu}
              setContextMenu={setContextMenu}
            />
          </div>

          <WidgetCategory
            elementData={memoizedData}
            strictSettings={memoizedStrictSettings}
            contextMenu={contextMenu}
            setContextMenu={setContextMenu}
          />

          {config.streamingPlatform === "twitch" && <ChannelEmoteCategory />}

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
  height: 95vh;

  position: absolute;
  overflow-y: auto;

  padding-top: 10px;

  z-index: 2;

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
