import { useState, useEffect, useContext, memo } from "react";
import Config from "../../module_bindings/config";
import { TwitchPlayer, TwitchPlayerInstance } from "react-twitch-embed";
import { ConfigContext } from "../../Contexts/ConfigContext";
import { useSpacetimeContext } from "../../Contexts/SpacetimeContext";

const StreamContainer = () => {
  const config: Config = useContext(ConfigContext);
  const { Runtime } = useSpacetimeContext();

  const [streamOverride, setStreamOverride] = useState<string | null>(null);

  useEffect(() => {
    const streamOverrides = localStorage.getItem("streamOverride");
    if (!streamOverrides || !Runtime) return;

    const overrideJson = JSON.parse(streamOverrides);
    const currentOverride = overrideJson.find((obj: any) => obj.module === Runtime.module);

    if (!currentOverride) return;

    setStreamOverride(currentOverride.override);
  }, [Runtime]);

  const streamOnReady = (player: TwitchPlayerInstance) => {
    player.setQuality(localStorage.getItem("streamQuality") ? localStorage.getItem("streamQuality")! : "auto");
  };

  return (
    <>
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

export default memo(StreamContainer, (prevProps, nextProps) => true);
