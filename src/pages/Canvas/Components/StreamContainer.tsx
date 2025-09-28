import { TwitchPlayerNonInteractive } from "react-twitch-embed";

export const StreamContainer = () => {
  const streamingPlatform = "twitch";
  const streamName = "guzu";

  return (
    <>
      {streamingPlatform === "twitch" && (
        <TwitchPlayerNonInteractive
          style={{ zIndex: 0, pointerEvents: "none", userSelect: "none" }}
          width="100%"
          height="100%"
          id="stream"
          channel={streamName}
          autoplay
          muted
        />
      )}
    </>
  );
};

/*
{streamingPlatform === "youtube" && (
    <iframe
        style={{ zIndex: 0, pointerEvents: "none", border: "none" }}
        height="100%"
        width="100%"
        id="stream"
        src={"https://www.youtube.com/embed/live_stream?channel=" + streamName + "&autoplay=1&mute=1"}
        allowFullScreen
        title="YoutubeStream"
    />
)}
{streamingPlatform === "kick" && (
    <iframe
        style={{ zIndex: 0, pointerEvents: "none", border: "none" }}
        height="100%"
        width="100%"
        id="stream"
        src={"https://player.kick.com/" + streamName + "?autoplay=true&muted=true"}
        allowFullScreen
        title="KickStream"
    />
)}
*/
