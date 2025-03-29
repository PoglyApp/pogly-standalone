import { useState, useEffect, useContext, memo, useRef } from "react";
import { TwitchPlayer, TwitchPlayerInstance } from "react-twitch-embed";
import { ConfigContext } from "../../Contexts/ConfigContext";
import { SpacetimeContext } from "../../Contexts/SpacetimeContext";
import { Config } from "../../module_bindings";
import styled from "styled-components";

const StreamContainer = () => {
  const config: Config = useContext(ConfigContext);
  const { spacetimeDB } = useContext(SpacetimeContext);

  const [streamOverride, setStreamOverride] = useState<string | null>(null);

  useEffect(() => {
    const streamOverrides = localStorage.getItem("streamOverride");
    if (!streamOverrides || !spacetimeDB.Runtime) return;

    const overrideJson = JSON.parse(streamOverrides);
    const currentOverride = overrideJson.find((obj: any) => obj.module === spacetimeDB.Runtime.module);

    if (!currentOverride) return;

    setStreamOverride(currentOverride.override);
  }, [spacetimeDB.Runtime]);

  const streamOnReady = (player: TwitchPlayerInstance) => {
    player.setQuality(localStorage.getItem("streamQuality") ? localStorage.getItem("streamQuality")! : "auto");
    const warningSetting = localStorage.getItem("contentWarning");
    if (warningSetting) return;

    setTimeout(function () {
      if (player.getPlayerState().playback === "Ready") {
        document.getElementById("contentWarning")?.style.setProperty("display", "flex");
      }
    }, 1000);
  };

  const handleCloseWarning = () => {
    localStorage.setItem("contentWarning", "true");
    document.getElementById("contentWarning")?.style.setProperty("display", "none");
  };

  return (
    <>
      <StreamWarning id="contentWarning">
        <p style={{ margin: "0px", fontSize: "30px", paddingLeft: "10px" }}>
          Unable to view the stream? You can make the player interactive from settings!
        </p>
        <a
          style={{
            right: "0",
            alignSelf: "center",
            paddingRight: "20px",
            cursor: "pointer",
            textDecoration: "underline",
            position: "absolute",
          }}
          onClick={handleCloseWarning}
        >
          Don't show this again
        </a>
      </StreamWarning>

      {config.streamingPlatform === "twitch" && !streamOverride && (
        <TwitchPlayer
          style={{ zIndex: 0, pointerEvents: "none", height: "100%", width: "100%" }}
          height="100%"
          width="100%"
          id="stream"
          channel={config.streamName}
          autoplay
          muted
          onReady={streamOnReady}
        />
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

      {streamOverride && (
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
    </>
  );
};

const StreamWarning = styled.div`
  background-color: #c27707;
  color: #ffffffd9 !important;
  align-content: center;

  border-style: solid;
  border-color: #a76707;
  border-radius: 0px !important;

  height: 40px;
  margin-bottom: 0px;

  display: none;
`;

export default memo(StreamContainer, (prevProps, nextProps) => true);
