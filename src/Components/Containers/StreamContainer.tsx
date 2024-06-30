import { useState, useEffect, useContext } from "react";
import Config from "../../module_bindings/config";
import { TwitchPlayerNonInteractive } from "react-twitch-embed";
import { ConfigContext } from "../../Contexts/ConfigContext";

export const StreamContainer = () => {
  const config: Config = useContext(ConfigContext);

  return (
    <>
      {config.streamingPlatform === "twitch" && (
        <TwitchPlayerNonInteractive
          style={{ zIndex: 0, pointerEvents: "none" }}
          height="100%"
          width="100%"
          id="stream"
          channel={config.streamName}
          autoplay
          muted
        />
      )}
      {config.streamingPlatform === "youtube" && (
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
      {config.streamingPlatform === "kick" && (
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
    </>
  );
};
