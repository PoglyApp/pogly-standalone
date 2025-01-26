import { Menu, MenuItem, styled, Tooltip } from "@mui/material";
import { useEffect, useState } from "react";
import { QuickSwapType } from "../Types/General/QuickSwapType";
import { DebugLogger } from "../Utility/DebugLogger";
import { useSpacetimeContext } from "../Contexts/SpacetimeContext";
import { HandleQuickSwapContextMenu } from "../Utility/HandleContextMenu";
import { QuickSwapContextMenu } from "./ContextMenu/QuickSwapContextMenu";

interface IProps {
  quickSwapMenuAnchor: any;
  quickSwapMenuOpen: any;
  setQuickSwapMenuAnchor: Function;
}

export const QuickSwapMenu = (props: IProps) => {
  const { Client } = useSpacetimeContext();

  const [quickSwapModules, setQuickSwapModules] = useState<QuickSwapType[]>([]);
  const [contextMenu, setContextMenu] = useState<any>(null);

  const currentModule = localStorage.getItem("stdbConnectModule") || "";

  useEffect(() => {
    if (!props.quickSwapMenuAnchor) return;

    const modules = localStorage.getItem("poglyQuickSwap");

    if (modules && modules !== undefined) setQuickSwapModules(JSON.parse(modules));
  }, [props.quickSwapMenuAnchor]);

  const swapModule = (module: QuickSwapType) => {
    DebugLogger("Swapping module via quick swap menu");
    localStorage.setItem("stdbConnectDomain", module.domain);
    localStorage.setItem("stdbConnectModule", module.module);
    localStorage.setItem("stdbConnectModuleAuthKey", module.auth);
    Client.disconnect();
    window.location.reload();
  };

  return (
    <div>
      <Menu
        id="quickswap-menu"
        anchorEl={props.quickSwapMenuAnchor}
        open={props.quickSwapMenuOpen}
        onClose={() => props.setQuickSwapMenuAnchor(null)}
        MenuListProps={{
          "aria-labelledby": "quickswap-button",
        }}
      >
        {quickSwapModules.length > 0 ? (
          quickSwapModules.map((module) => (
            <div
              onContextMenu={(event: any) => {
                HandleQuickSwapContextMenu(event, setContextMenu, contextMenu, module.module);
              }}
              key={module.module}
            >
              <StyledMenuItem
                onClick={() => swapModule(module)}
                disabled={currentModule === module.module ? true : false}
              >
                {module.nickname ? (
                  <Tooltip title={module.module}>
                    <div>{module.nickname} *</div>
                  </Tooltip>
                ) : (
                  <div>{module.module}</div>
                )}
              </StyledMenuItem>
            </div>
          ))
        ) : (
          <span style={{ padding: "10px" }}>No saved modules</span>
        )}
      </Menu>

      <QuickSwapContextMenu contextMenu={contextMenu} setContextMenu={setContextMenu} />
    </div>
  );
};

const StyledMenuItem = styled(MenuItem)`
  &:hover {
    background-color: #020e1a !important;
  }
`;
