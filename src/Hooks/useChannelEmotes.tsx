import { useContext, useEffect } from "react";
import SevenTVWrap from "../Utility/SevenTVWrap";
import Config from "../module_bindings/config";
import { ConfigContext } from "../Contexts/ConfigContext";
import { DebugLogger } from "../Utility/DebugLogger";
import BetterTVWrap from "../Utility/BetterTVWrap";

export const useChannelEmotes = (
  setSevenTVEmotes: Function,
  setBTTVEmotes: Function,
  channelEmotesInitialized: boolean,
  setChannelEmotesInitialized: Function
) => {
  const config: Config = useContext(ConfigContext);

  useEffect(() => {
    if (channelEmotesInitialized) return;

    DebugLogger("Initializing Channel emotes.");

    (async () => {
      // 7TV
      const sevenTVUserID = await SevenTVWrap.SearchForUser(config.streamName);
      if (!sevenTVUserID) {
        console.log("Could not find 7TV user ID.");
        return setChannelEmotesInitialized(true);
      }

      const sevenTVUser = await SevenTVWrap.GetUserById(sevenTVUserID);
      if (!sevenTVUser) {
        console.log("Could not find 7TV user.");
        return setChannelEmotesInitialized(true);
      }

      const emoteSetID = await SevenTVWrap.GetEmoteSetId(sevenTVUserID);
      if (!emoteSetID) {
        console.log("Could not find 7TV emote set ID.");
        return setChannelEmotesInitialized(true);
      }

      const sevenTvEmotes = await SevenTVWrap.GetEmoteSetEmotes(emoteSetID);
      if (!sevenTvEmotes) {
        console.log("Could not get 7TV emotes.");
        return setChannelEmotesInitialized(true);
      }

      // BTTV
      if (sevenTVUser.connections[0]) {
        const bttvUser = await BetterTVWrap.GetUserByTwitchId(sevenTVUser.connections[0].id);

        if (bttvUser) {
          const bttvEmotes = [...bttvUser.channelEmotes, ...bttvUser.sharedEmotes];

          setBTTVEmotes(bttvEmotes);
        }
      }

      setSevenTVEmotes(sevenTvEmotes);
      setChannelEmotesInitialized(true);
    })();
  }, [channelEmotesInitialized, config.streamName, setSevenTVEmotes, setBTTVEmotes, setChannelEmotesInitialized]);
};
