import { useState, useEffect, useContext } from "react";
import Config from "../../module_bindings/config";
import { TwitchPlayerNonInteractive } from "react-twitch-embed";
import { ConfigContext } from "../../Contexts/ConfigContext";
import { useSpacetimeContext } from "../../Contexts/SpacetimeContext";

export const StreamContainer = () => {
  const config: Config = useContext(ConfigContext);
  const { Runtime } = useSpacetimeContext();

  const [streamOverride, setStreamOverride] = useState<string | null>(null);

  useEffect(() => {
    const streamOverrides = localStorage.getItem("streamOverride");
    if (!streamOverrides) return;

    const overrideJson = JSON.parse(streamOverrides);
    const currentOverride = overrideJson.find((obj: any) => obj.module === Runtime?.module);

    if (!currentOverride) return;

    console.log(currentOverride.override);

    setStreamOverride(currentOverride.override);
  }, []);

  return (
    <>
      {config.streamingPlatform === "twitch" && !streamOverride && (
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
          title="KickStream"
        />
      )}
    </>
  );
};
