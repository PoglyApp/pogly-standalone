import { useContext, useEffect } from "react";
import SevenTVWrap from "../Utility/SevenTVWrap";
import Config from "../module_bindings/config";
import { ConfigContext } from "../Contexts/ConfigContext";
import { DebugLogger } from "../Utility/DebugLogger";
import BetterTVWrap from "../Utility/BetterTVWrap";
import SevenTVEmoteType from "../Types/SevenTVTypes/SevenTVEmoteType";
import BetterTVEmoteType from "../Types/BetterTVTypes/BetterTVEmoteType";
import { useSpacetimeContext } from "../Contexts/SpacetimeContext";

export const useChannelEmotes = (
  setSevenTVEmotes: Function,
  setBTTVEmotes: Function,
  channelEmotesInitialized: boolean,
  setChannelEmotesInitialized: Function
) => {
  const { Runtime } = useSpacetimeContext();
  const config: Config = useContext(ConfigContext);

  useEffect(() => {
    if (channelEmotesInitialized || !Runtime) return;

    DebugLogger("Initializing Channel emotes.");

    (async () => {
      let streamName: string = config.streamName;
      let streamPlatform: string = config.streamingPlatform;

      const sevenTVOverrides = localStorage.getItem("sevenTVOverrides");

      if (sevenTVOverrides) {
        const parsedOverrides = JSON.parse(sevenTVOverrides);
        const sevenTVOverride = parsedOverrides.find((obj: any) => obj.module === Runtime!.module);

        if (sevenTVOverride) {
          streamName = sevenTVOverride.override;
          streamPlatform = sevenTVOverride.platform;
        }
      }

      // 7TV
      const sevenTVUserID = await SevenTVWrap.SearchForUser(streamName);
      if (!sevenTVUserID) {
        console.log("Could not find 7TV user ID.");
        return setChannelEmotesInitialized(true);
      }

      const sevenTVUser = await SevenTVWrap.GetUserById(sevenTVUserID);
      if (!sevenTVUser) {
        console.log("Could not find 7TV user.");
        return setChannelEmotesInitialized(true);
      }

      const emoteSetID = await SevenTVWrap.GetEmoteSetId(sevenTVUserID, streamPlatform);
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
      setChannelEmotesInitialized(true);
    })();
  }, [
    Runtime,
    channelEmotesInitialized,
    config.streamName,
    setSevenTVEmotes,
    setBTTVEmotes,
    setChannelEmotesInitialized,
    config.streamingPlatform,
  ]);
};
