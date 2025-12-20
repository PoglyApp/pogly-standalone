import { useContext, useEffect, useState } from "react";
import { useAppSelector } from "../../Store/Features/store";
import styled from "styled-components";
import { Avatar, Menu } from "@mui/material";
import { GuestListContextMenu } from "./ContextMenus/GuestListContextMenu";
import { HandleGuestListContextMenu } from "../../Utility/HandleContextMenu";
import { DebugLogger } from "../../Utility/DebugLogger";
import { Config, DbConnection, Guests } from "../../module_bindings";
import { SpacetimeContext } from "../../Contexts/SpacetimeContext";
import { useAuth } from "react-oidc-context";

export const GuestListContainer = () => {
  const guestStore = useAppSelector((state: any) => state.guests.guests);
  const { spacetimeDB } = useContext(SpacetimeContext);
  const auth = useAuth();
  const config: Config = spacetimeDB.Client.db.config.version.find(0);

  const [displayedGuests, setDisplayedGuests] = useState<Guests[]>([]);
  const [hiddenGuests, setHiddenGuests] = useState<Guests[]>([]);
  const [showPedro, setShowPedro] = useState<boolean>(false);
  const [contextMenu, setContextMenu] = useState<any>(null);

  const [hidenGuestsAnchor, setHidenGuestsAnchor] = useState<HTMLElement | null>(null);
  const open = Boolean(hidenGuestsAnchor);

  useEffect(() => {
    if (guestStore.length > 5) {
      const guestsArray = [...guestStore.filter((guest: Guests) => guest.nickname !== "")];
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

  const easterEgg = () => {
    DebugLogger("Show easter egg");
    setShowPedro((v) => !v);
  };

  if (!guestStore) return <></>;

  return (
    <>
      <Container id="GuestList">
        {displayedGuests.map((guest: Guests) => {
          if ((config.authentication && guest.authenticated) || !config.authentication) {
            if (guest.nickname !== "") {
              const avatarUrl = (spacetimeDB.Client as DbConnection).db.guestNames.identity.find(guest.identity)?.avatarUrl;
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
                    onDoubleClick={easterEgg}
                  >
                    {showPedro ? (
                      <img
                        src="./assets/pedro.gif"
                        alt="pedro"
                        style={{
                          position: "absolute",
                          inset: 0,
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          pointerEvents: "none",
                        }}
                      />
                    ) : avatarUrl ? (
                    <img
                        src={avatarUrl}
                        alt={guest.nickname[0]}
                        style={{
                          position: "absolute",
                          inset: 0,
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          pointerEvents: "none",
                        }}
                      />) : 
                    guest.nickname ? (
                      guest.nickname[0]
                    ) : (
                      "?"
                    )}
                  </Avatar>
                </div>
              );
            } else {
              return <></>;
            }
          } else {
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
              sx={{ margin: "8px 0px 0 0" }}
            >
              {hiddenGuests.map((guest: Guests) => {
                if ((config.authentication && guest.authenticated) || !config.authentication) {
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
                          onDoubleClick={easterEgg}
                        >
                          {showPedro ? (
                            <img
                              src="./assets/pedro.gif"
                              alt="pedro"
                              style={{
                                position: "absolute",
                                inset: 0,
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                pointerEvents: "none",
                              }}
                            />
                          ) : guest.nickname ? (
                            guest.nickname[0]
                          ) : (
                            "?"
                          )}
                        </Avatar>
                      </div>
                    );
                  } else {
                    return <></>;
                  }
                } else {
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
