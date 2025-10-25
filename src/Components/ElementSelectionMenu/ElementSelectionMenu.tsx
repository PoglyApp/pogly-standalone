import { styled } from "styled-components";
import { TextCategory } from "./Categories/TextCategory";
import { ImageCategory } from "./Categories/ImageCategory";
import { ChannelEmoteCategory } from "./Categories/ChannelEmoteCategory";
import { WidgetCategory } from "./Categories/WidgetCategory";
import { ElementSelectionContextMenu } from "./ContextMenus/ElementSelectionContextMenu";
import { useContext, useMemo, useState } from "react";
import { ElementSelectionMenuFooter } from "./ElementSelectionMenuFooter";
import { SpacetimeContext } from "../../Contexts/SpacetimeContext";
import { TenorCategory } from "./Categories/TenorCategory";
import { LayoutCategory } from "./Categories/LayoutCategory";
import { Divider, Typography } from "@mui/material";
import { useAppSelector } from "../../Store/Features/store";
import { shallowEqual } from "react-redux";
import BetterTVEmote from "../../Types/BetterTVTypes/BetterTVEmoteType";
import SevenTVEmote from "../../Types/SevenTVTypes/SevenTVEmoteType";
import { useChannelEmotes } from "../../Hooks/useChannelEmotes";
import { SpotlightModal } from "../Modals/SpotlightModal";
import { Config, ElementData } from "../../module_bindings";
import { getPermissions } from "../../Utility/PermissionsHelper";

interface IProps {
  isDropping: boolean;
}

export const ElementSelectionMenu = (props: IProps) => {
  const { spacetimeDB } = useContext(SpacetimeContext);

  const elementData: ElementData[] = useAppSelector((state: any) => state.elementData.elementData, shallowEqual);
  const memoizedData = useMemo(() => elementData, [elementData]);

  const [channelEmotesInitialized, setChannelEmotesInitialized] = useState<boolean>(false);
  const [sevenTVEmotes, setSevenTVEmotes] = useState<SevenTVEmote[] | undefined>([]);
  const [betterTVEmotes, setBetterTVEmotes] = useState<BetterTVEmote[] | undefined>([]);

  useChannelEmotes(setSevenTVEmotes, setBetterTVEmotes, channelEmotesInitialized, setChannelEmotesInitialized);

  const [contextMenu, setContextMenu] = useState<any>(null);

  const strictMode = useMemo(() => spacetimeDB.Client.db.config.version.find(0)!.strictMode, [spacetimeDB.Client]);
  const permission = useMemo(
    () => getPermissions(spacetimeDB, spacetimeDB.Identity.identity),
    [spacetimeDB.Identity.identity, spacetimeDB.Client]
  );

  const memoizedStrictSettings = useMemo(
    () => ({
      StrictMode: strictMode,
      Permissions: permission,
    }),
    [strictMode, permission]
  );

  return (
    <>
      <SelectionMenuContainer id="SelectionMenu" className="canvas-font">
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
              isSearch={false}
            />
          </div>

          <WidgetCategory
            elementData={memoizedData}
            strictSettings={memoizedStrictSettings}
            contextMenu={contextMenu}
            setContextMenu={setContextMenu}
          />

          <ChannelEmoteCategory sevenTVEmotes={sevenTVEmotes} betterTVEmotes={betterTVEmotes} />

          <TenorCategory />
        </CategoryContainer>

        <ElementSelectionMenuFooter />
      </SelectionMenuContainer>

      <ElementSelectionContextMenu contextMenu={contextMenu} setContextMenu={setContextMenu} />

      <SpotlightModal sevenTVEmotes={sevenTVEmotes} bttvEmotes={betterTVEmotes} />
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
