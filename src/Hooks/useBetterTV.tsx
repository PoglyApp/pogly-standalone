import { useEffect, useState } from "react";
import BetterTVUserType from "../Types/BetterTVTypes/BetterTVUserType";
import BetterTVWrap from "../Utility/BetterTVWrap";
import BetterTVEmote from "../Types/BetterTVTypes/BetterTVEmoteType";
import { DebugLogger } from "../Utility/DebugLogger";

export const useBetterTV = (
  twitchId: string | undefined,
  setEmotes: Function,
  betterTVInitialized: boolean,
  setBetterTVInitialized: Function
) => {
  const [userPromise, setUserPromise] = useState<Promise<BetterTVUserType>>();

  useEffect(() => {
    if (betterTVInitialized) return;
    if (!twitchId) return;

    setUserPromise(BetterTVWrap.GetUserByTwitchId(twitchId));
  }, [betterTVInitialized, setUserPromise, twitchId]);

  useEffect(() => {
    if (betterTVInitialized) return;

    DebugLogger("Getting BetterTV emotes");

    userPromise?.then((p) => {
      if (!p) return;

      let emotes: BetterTVEmote[] = [];

      p.channelEmotes.forEach((e) => {
        emotes.push(e);
      });
      p.sharedEmotes.forEach((e) => {
        emotes.push(e);
      });

      setEmotes(emotes);
      setBetterTVInitialized(true);
    });
  }, [betterTVInitialized, setBetterTVInitialized, setEmotes, userPromise]);
};
