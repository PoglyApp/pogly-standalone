import { useState, useEffect, useContext, memo } from "react";
import Config from "../../module_bindings/config";
import { TwitchPlayer, TwitchPlayerInstance } from "react-twitch-embed";
import { ConfigContext } from "../../Contexts/ConfigContext";
import { useSpacetimeContext } from "../../Contexts/SpacetimeContext";
import styled from "styled-components";
import { Alert, Button, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const StreamContainer = () => {
  const config: Config = useContext(ConfigContext);
  const { Runtime } = useSpacetimeContext();

  const [streamOverride, setStreamOverride] = useState<string | null>(null);
  const [invalidOverride, setInvalidOverride] = useState<boolean>(false);

  const ua = navigator.userAgent.toLowerCase();
  const chrome = ua.includes("chrome") || ua.includes("crios");

  useEffect(() => {
    const streamOverrides = localStorage.getItem("streamOverride");
    if (!streamOverrides || !Runtime) return;

    const overrideJson = JSON.parse(streamOverrides);
    const currentOverride = overrideJson.find((obj: any) => obj.module === Runtime.module);

    if (!currentOverride) return;

    (async () => {
      const regex = new RegExp("^https?:\\/\\/(?:[\\w-]+\\.)+[\\w-]+(?:\\/[^\\s]*)?$");

      if (!regex.test(currentOverride.override)) {
        console.error("Stream override URL failed REGEX check");
        setStreamOverride(" ");
        return setInvalidOverride(true);
      }

      const embedAllowed = await checkEmbeddingAllowed(currentOverride.override);

      if (!embedAllowed) {
        setStreamOverride(" ");
        return setInvalidOverride(true);
      }

      setStreamOverride(currentOverride.override);
    })();
  }, [Runtime]);

  const streamOnReady = (player: TwitchPlayerInstance) => {
    player.setQuality(localStorage.getItem("streamQuality") ? localStorage.getItem("streamQuality")! : "auto");
  };

  const streamOnLive = () => {
    if (!chrome) return;

    try {
      document.getElementById("chromealert")?.style.removeProperty("display");
      document.getElementById("stream")?.style.removeProperty("pointer-events");
    } catch (error) {
      console.log("[ERROR] Failed to remove properties from stream container", error);
    }
  };

  const streamOnPlaying = () => {
    closeAlert();
  };

  const closeAlert = () => {
    try {
      document.getElementById("stream")?.style.setProperty("pointer-events", "none");
      document.getElementById("chromealert")?.remove();
    } catch (error) {
      console.log("[ERROR] Failed to close alert", error);
    }
  };

  const showExplanation = () => {
    const explanation = document.getElementById("explanation");
    if (!explanation) return console.log("Explanation somehow missing?");

    try {
      if (explanation.style.display !== "unset") {
        explanation.style.display = "unset";
      } else {
        explanation.style.display = "none";
      }
    } catch (error) {
      console.log("[ERROR] Failed to show explanation", error);
    }
  };

  const checkEmbeddingAllowed = async (url: string): Promise<boolean> => {
    try {
      const response = await fetch(url, { method: "HEAD" });
      const xFrameOptions = response.headers.get("X-Frame-Options");
      const contentSecurityPolicy = response.headers.get("Content-Security-Policy");

      if (xFrameOptions?.includes("DENY") || xFrameOptions?.includes("SAMEORIGIN")) {
        return false;
      }

      if (contentSecurityPolicy?.includes("frame-ancestors 'none'")) {
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error checking embedding permissions:", error);
      return false;
    }
  };

  return (
    <>
      {config.streamingPlatform === "twitch" && !streamOverride && (
        <>
          {chrome && (
            <StyledAlert severity="warning" id="chromealert" style={{ display: "none" }}>
              Unable to autoplay stream. Please click play on the stream preview manually.
              <AlertButton onClick={showExplanation}>(Why am I seeing this?)</AlertButton>
              <IconButton sx={{ padding: "0px", marginLeft: "auto" }} onClick={closeAlert}>
                <CloseIcon sx={{ color: "#ffffffd9", fontSize: "36px", marginTop: "10px" }} />
              </IconButton>
            </StyledAlert>
          )}

          <div style={{ width: "100%", height: "100%", display: "flex" }}>
            <TwitchPlayer
              style={{ zIndex: 0, pointerEvents: "none", height: "100%", width: "100%" }}
              height="100%"
              width="100%"
              id="stream"
              channel={config.streamName}
              autoplay
              muted
              onReady={streamOnReady}
              onOnline={streamOnLive}
              onPlaying={streamOnPlaying}
            />

            {chrome && (
              <ExplanationContainer id="explanation">
                <ExplanationContent>
                  <ExplanationTitle>Stream preview changes for Chrome users</ExplanationTitle>
                  <ExplanationText>
                    You may have noticed that the stream preview no longer autoplays. This change comes from Twitch,
                    which recently introduced stricter visibility rules for embedding streams in order to combat
                    viewbotting.
                    <br />
                    <br />
                    Because of the way Pogly uses the embed, it's unfortunately not possible for us to fully comply with
                    these new requirements and Twitch does not currently offer a whitelist or workaround.
                    <br />
                    <br />
                    For now, if you'd like to watch the stream from the editor, you'll need to press play manually.
                    We'll continue exploring options to meet the visibility rules and restore autoplay if possible.
                    <br />
                    <br />
                    We apologize for the inconvenience and appreciate your understanding.
                  </ExplanationText>

                  <Button
                    variant="outlined"
                    sx={{
                      color: "#ffffffa6",
                      borderColor: "#ffffffa6",
                      "&:hover": { borderColor: "white" },
                      marginTop: "10px",
                      marginRight: "10px",
                      width: "fit-content",
                      justifySelf: "center",
                      display: "block",
                    }}
                    onClick={showExplanation}
                  >
                    Close
                  </Button>
                </ExplanationContent>
              </ExplanationContainer>
            )}
          </div>
        </>
      )}

      {config.streamingPlatform === "youtube" && !streamOverride && (
        <iframe
          style={{ zIndex: 0, pointerEvents: "none", border: "none" }}
          height="100%"
          width="100%"
          id="stream"
          src={"https://www.youtube.com/embed/live_stream?channel=" + config.streamName + "&autoplay=1&mute=1"}
          allowFullScreen
          title="YoutubeStream"
        />
      )}

      {config.streamingPlatform === "kick" && !streamOverride && (
        <iframe
          style={{ zIndex: 0, pointerEvents: "none", border: "none" }}
          height="100%"
          width="100%"
          id="stream"
          src={"https://player.kick.com/" + config.streamName + "?autoplay=true&muted=true"}
          allowFullScreen
          title="KickStream"
        />
      )}

      {streamOverride && !invalidOverride && (
        <iframe
          style={{ zIndex: 0, pointerEvents: "none", border: "none" }}
          height="100%"
          width="100%"
          id="stream"
          src={streamOverride}
          allowFullScreen
          title="OverrideStream"
        />
      )}

      {invalidOverride && (
        <div style={{ width: "100%", height: "100%", backgroundColor: "black", alignContent: "center" }} id="stream">
          <h1 style={{ color: "white", textAlign: "center", alignSelf: "center" }}>
            Unable to embed stream override. Website might not allow embedding. (Check console for details)
          </h1>
        </div>
      )}
    </>
  );
};

export default memo(StreamContainer, (prevProps, nextProps) => true);

const StyledAlert = styled(Alert)`
  position: absolute;

  font-size: 24px;
  background-color: #c27707 !important;
  color: #ffffffd9 !important;

  border-style: solid;
  border-color: #a76707;
  border-radius: 0px !important;

  padding: 0 8px 12px 8px;
  height: 40px;

  top: -52px;
  overflow-y: hidden;

  & > .MuiAlert-icon {
    color: #ffb13d;
    font-size: 36px;
  }

  & > .MuiAlert-message {
    display: flex;
    width: 100% !important;

    overflow-y: hidden;
  }

  left: 0;
  right: 0;
`;

const AlertButton = styled.a`
  text-decoration: inherit;

  font-size: 16px;
  color: #fdd79c;

  margin-left: 10px;
  margin-top: 5px;

  &:hover {
    color: #ffb13d;
    cursor: pointer;
  }
`;

const ExplanationContainer = styled.div`
  display: none;

  position: absolute;

  width: 100%;
  height: 100%;
  align-content: center;
  justify-content: center;

  backdrop-filter: blur(10px);
`;

const ExplanationContent = styled.div`
  background-color: #001529;
  border-radius: 10px;

  width: 800px;
  height: fit-content;

  padding: 30px;

  justify-self: center;
  align-self: center;

  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.12), 0 2px 2px rgba(0, 0, 0, 0.12), 0 4px 4px rgba(0, 0, 0, 0.12),
    0 8px 8px rgba(0, 0, 0, 0.12), 0 16px 16px rgba(0, 0, 0, 0.12);
`;

const ExplanationTitle = styled.div`
  color: white;

  text-align: center;
  font-size: 40px;
`;

const ExplanationText = styled.p`
  color: #ffffffa6;
  font-size: 30px;
`;
