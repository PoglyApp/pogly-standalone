import { useContext, useEffect, useState } from "react";
import { useAppSelector } from "../../Store/Features/store";
import Guests from "../../module_bindings/guests";
import styled from "styled-components";
import Config from "../../module_bindings/config";
import { Avatar, Menu } from "@mui/material";
import { ConfigContext } from "../../Contexts/ConfigContext";
import { GuestListContextMenu } from "./ContextMenus/GuestListContextMenu";
import { HandleGuestListContextMenu } from "../../Utility/HandleContextMenu";
import { DebugLogger } from "../../Utility/DebugLogger";

export const GuestListContainer = () => {
  const config: Config = useContext(ConfigContext);

  const guestStore = useAppSelector((state: any) => state.guests.guests);

  const [displayedGuests, setDisplayedGuests] = useState<Guests[]>([]);
  const [hiddenGuests, setHiddenGuests] = useState<Guests[]>([]);
  const [showPedro, setShowPedro] = useState<boolean>(false);
  const [contextMenu, setContextMenu] = useState<any>(null);

  const [hidenGuestsAnchor, setHidenGuestsAnchor] = useState(null);
  const open = Boolean(hidenGuestsAnchor);

  useEffect(() => {
    if (guestStore.length > 5) {
      const guestsArray = [...guestStore];

      DebugLogger("Initializing more than 5 guests");

      setDisplayedGuests(() => [...guestsArray.slice(0, 5)]);
      setHiddenGuests(() => [...guestsArray.slice(5, guestStore.length)]);
    } else {
      DebugLogger("Initializing fewer than 5 guests");
      setDisplayedGuests(() => guestStore);
      setHiddenGuests(() => []);
    }
  }, [guestStore]);

  const showHiddenGuests = (event: any) => {
    DebugLogger("Handle show hidden guests");
    if (!hidenGuestsAnchor) setHidenGuestsAnchor(event.currentTarget);
    else setHidenGuestsAnchor(null);
  };

  const easterEgg = (event: any) => {
    DebugLogger("Show easter egg");
    if (event.detail === 2) {
      setShowPedro(!showPedro);
    }
  };

  if (!guestStore) return <></>;

  return (
    <>
      <Container id="GuestList">
        {displayedGuests.map((guest: Guests) => {
          if ((config.authentication && guest.authenticated) || !config.authentication) {
            //Authentication Enabled - Guest Authenticated
            if (guest.nickname !== "") {
              return (
                <div
                  key={guest.nickname + guest.color}
                  onContextMenu={(event: any) => {
                    HandleGuestListContextMenu(event, setContextMenu, contextMenu, guest);
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: guest.color,
                      verticalAlign: "middle",
                      position: "relative",
                      marginLeft: "6px",
                    }}
                    onClick={easterEgg}
                  >
                    {(showPedro && (
                      <img src="./assets/pedro.gif" style={{ width: "32px", height: "32px" }} alt="pedro" />
                    )) ||
                      guest.nickname[0]}
                  </Avatar>
                </div>
              );
            } else {
              return <></>;
            }
          } else {
            //Authentication Enabled - Guest not Authenticated
            return <></>;
          }
        })}

        {hiddenGuests.length !== 0 && (
          <>
            <StyledAvatar onClick={showHiddenGuests}>+{hiddenGuests.length}</StyledAvatar>
            <Menu
              id="hiddenGuestMenu"
              anchorEl={hidenGuestsAnchor}
              open={open}
              onClose={() => setHidenGuestsAnchor(null)}
              sx={{
                margin: "8px 0px 0 0",
              }}
            >
              {hiddenGuests.map((guest: Guests) => {
                if ((config.authentication && guest.authenticated) || !config.authentication) {
                  //Authentication Enabled - Guest Authenticated
                  if (guest.nickname !== "") {
                    return (
                      <div
                        key={guest.nickname + guest.color}
                        onContextMenu={(event: any) => {
                          HandleGuestListContextMenu(event, setContextMenu, contextMenu, guest);
                        }}
                      >
                        <Avatar
                          sx={{
                            bgcolor: guest.color,
                            verticalAlign: "middle",
                            position: "relative",
                            margin: "6px",
                          }}
                          onClick={easterEgg}
                        >
                          {(showPedro && (
                            <img src="./assets/pedro.gif" style={{ width: "32px", height: "32px" }} alt="pedro" />
                          )) ||
                            guest.nickname[0]}
                        </Avatar>
                      </div>
                    );
                  } else {
                    return <></>;
                  }
                } else {
                  //Authentication Enabled - Guest not Authenticated
                  return <></>;
                }
              })}
            </Menu>
          </>
        )}
      </Container>

      <GuestListContextMenu contextMenu={contextMenu} setContextMenu={setContextMenu} />
    </>
  );
};

const Container = styled.div`
  z-index: 1999999;
  padding-right: 30px;
  align-items: center;
  display: flex;
  gap: 4px;
  left: 100%;
  position: sticky;
`;

const StyledAvatar = styled(Avatar)`
  background-color: #0e3e6b;
  vertical-align: center;
  position: relative;
  margin-left: 6px;

  font-size: 18px;

  &:hover {
    background-color: #114f88;
    cursor: pointer;
  }
`;
