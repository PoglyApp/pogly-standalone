import { useContext, useEffect } from "react";
import SevenTVWrap from "../Utility/SevenTVWrap";
import { ConfigContext } from "../Contexts/ConfigContext";
import { DebugLogger } from "../Utility/DebugLogger";
import BetterTVWrap from "../Utility/BetterTVWrap";
import SevenTVEmoteType from "../Types/SevenTVTypes/SevenTVEmoteType";
import BetterTVEmoteType from "../Types/BetterTVTypes/BetterTVEmoteType";
import { Config } from "../module_bindings";

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

      const globalSevenTvEmotes = await SevenTVWrap.GetEmoteSetEmotes("global");
      if (!globalSevenTvEmotes) {
        console.log("Could not get 7TV global emotes.");
        return setChannelEmotesInitialized(true);
      }

      const allSevenTvEmotes = [...sevenTvEmotes, ...globalSevenTvEmotes].filter(
        (e: SevenTVEmoteType, index, arr: SevenTVEmoteType[]) => index === arr.findIndex(x => x.id === e.id)
      );

      // BTTV
      if (sevenTVUser.connections[0]) {
        const bttvUser = await BetterTVWrap.GetUserByTwitchId(sevenTVUser.connections[0].id);

        if (bttvUser) {
          const bttvEmotes = [...bttvUser.channelEmotes, ...bttvUser.sharedEmotes].filter(
            (e: BetterTVEmoteType, index, arr: BetterTVEmoteType[]) => index === arr.findIndex(x => x.id === e.id)
          );

          setBTTVEmotes(bttvEmotes);
        }
      }

      setSevenTVEmotes(allSevenTvEmotes);
      setChannelEmotesInitialized(true);
    })();
  }, [channelEmotesInitialized, config.streamName, setSevenTVEmotes, setBTTVEmotes, setChannelEmotesInitialized]);
};
