import { useContext, useEffect } from "react";
import SevenTVWrap from "../Utility/SevenTVWrap";
import Config from "../module_bindings/config";
import { ConfigContext } from "../Contexts/ConfigContext";
import { DebugLogger } from "../Utility/DebugLogger";

export const useSevenTV = (
  setEmotes: Function,
  setTwitchId: Function,
  sevenTVInitialized: boolean,
  setSevenTVInitialized: Function
) => {
  const config: Config = useContext(ConfigContext);

  useEffect(() => {
    if (sevenTVInitialized) return;

    DebugLogger("Initializing SevenTV emotes.");

    (async () => {
      const sevenTVUserID = await SevenTVWrap.SearchForUser(config.streamName);
      if (!sevenTVUserID) {
        console.log("Could not find 7TV user ID.");
        return setSevenTVInitialized(true);
      }

      const sevenTVUser = await SevenTVWrap.GetUserById(sevenTVUserID);
      if (!sevenTVUser) {
        console.log("Could not find 7TV user.");
        return setSevenTVInitialized(true);
      }

      if (sevenTVUser.connections[0]) setTwitchId(sevenTVUser.connections[0].id);

      const emoteSetID = await SevenTVWrap.GetEmoteSetId(sevenTVUserID);
      if (!emoteSetID) {
        console.log("Could not find 7TV emote set ID.");
        return setSevenTVInitialized(true);
      }

      const emotes = await SevenTVWrap.GetEmoteSetEmotes(emoteSetID);
      if (!emoteSetID) {
        console.log("Could not get 7TV emotes.");
        return setSevenTVInitialized(true);
      }

      setEmotes(emotes);
      setSevenTVInitialized(true);
    })();
  }, [sevenTVInitialized, config.streamName, setEmotes, setSevenTVInitialized, setTwitchId]);
};
