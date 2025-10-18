import { useContext, useEffect, useState } from "react";
import SevenTVWrap from "../Utility/SevenTVWrap";
import BetterTVWrap from "../Utility/BetterTVWrap";
import SevenTVEmoteType from "../Types/SevenTVTypes/SevenTVEmoteType";
import BetterTVEmoteType from "../Types/BetterTVTypes/BetterTVEmoteType";
import { SpacetimeContext } from "../Contexts/SpacetimeContext";

export const useChannelEmotes = (setSevenTVEmotes: Function, setBTTVEmotes: Function) => {
  const { spacetimeDB } = useContext(SpacetimeContext);
  const [initialized, setInitialized] = useState<boolean>(false);

  useEffect(() => {
    if (!spacetimeDB || initialized) return;

    (async () => {
      // 7TV
      const sevenTVUserID = await SevenTVWrap.SearchForUser(spacetimeDB.Config.streamName);
      if (!sevenTVUserID) {
        console.log("Could not find 7TV user ID.");
        return setInitialized(true);
      }

      const sevenTVUser = await SevenTVWrap.GetUserById(sevenTVUserID);
      if (!sevenTVUser) {
        console.log("Could not find 7TV user.");
        return setInitialized(true);
      }

      const emoteSetID = await SevenTVWrap.GetEmoteSetId(sevenTVUserID);
      if (!emoteSetID) {
        console.log("Could not find 7TV emote set ID.");
        return setInitialized(true);
      }

      const sevenTvEmotes = await SevenTVWrap.GetEmoteSetEmotes(emoteSetID);
      if (!sevenTvEmotes) {
        console.log("Could not get 7TV emotes.");
        return setInitialized(true);
      }

      const globalSevenTvEmotes = await SevenTVWrap.GetEmoteSetEmotes("global");
      if (!globalSevenTvEmotes) {
        console.log("Could not get 7TV global emotes.");
        return setInitialized(true);
      }

      const allSevenTvEmotes = [...sevenTvEmotes, ...globalSevenTvEmotes].filter(
        (e: SevenTVEmoteType, index, arr: SevenTVEmoteType[]) => index === arr.findIndex((x) => x.id === e.id)
      );

      // BTTV
      if (sevenTVUser.connections[0]) {
        const bttvUser = await BetterTVWrap.GetUserByTwitchId(sevenTVUser.connections[0].id);

        if (bttvUser) {
          const bttvEmotes = [...bttvUser.channelEmotes, ...bttvUser.sharedEmotes].filter(
            (e: BetterTVEmoteType, index, arr: BetterTVEmoteType[]) => index === arr.findIndex((x) => x.id === e.id)
          );

          setBTTVEmotes(bttvEmotes);
        }
      }

      setSevenTVEmotes(allSevenTvEmotes);
    })();
  }, [spacetimeDB.Config.streamName, setSevenTVEmotes, setBTTVEmotes]);
};
