import { useState, useEffect, useContext, memo } from "react";
import Config from "../../module_bindings/config";
import { TwitchPlayer, TwitchPlayerInstance } from "react-twitch-embed";
import { ConfigContext } from "../../Contexts/ConfigContext";
import { useSpacetimeContext } from "../../Contexts/SpacetimeContext";

const StreamContainer = () => {
  const config: Config = useContext(ConfigContext);
  const { Runtime } = useSpacetimeContext();

  const [streamOverride, setStreamOverride] = useState<string | null>(null);
  const [invalidOverride, setInvalidOverride] = useState<boolean>(false);

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
