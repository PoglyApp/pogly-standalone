import { useContext, useEffect, useState } from "react";
import SevenTVWrap from "../Utility/SevenTVWrap";
import Config from "../module_bindings/config";
import UserId from "../Types/SevenTVTypes/SevenTVUserIdType";
import Emote from "../Types/SevenTVTypes/EmoteType";
import { ConfigContext } from "../Contexts/ConfigContext";

export const useSevenTV = (setEmotes: Function) => {
  const config: Config = useContext(ConfigContext);

  const [streamerIdPromise, setStreamerIdPromise] = useState<Promise<UserId>>();
  const [streamerId, setStreamerId] = useState<string>();
  const [streamerEmotePromise, setStreamerEmotePromise] = useState<Promise<Emote[]>>();
  const [streamerEmotes, setStreamerEmotes] = useState<Emote[]>();

  useEffect(() => {
    setStreamerIdPromise(SevenTVWrap.GetTwitchId(config.streamName));
  }, [setStreamerIdPromise, config.streamName]);

  useEffect(() => {
    streamerIdPromise?.then((p) => {
      if (!p.data) return;
      setStreamerId(p.data.users[0].id);
    });
  }, [streamerIdPromise]);

  useEffect(() => {
    if (!streamerId) return;
    if (streamerId === "000000000000000000000000") return;

    // what we do now
    SevenTVWrap.GetEmoteSetId(streamerId).then((id) => {
      setStreamerEmotePromise(SevenTVWrap.GetEmoteSetEmotes(id));
    });
  }, [streamerId]);

  useEffect(() => {
    streamerEmotePromise?.then((p) => {
      if (!p) return;

      setStreamerEmotes(p);
    });
  }, [streamerEmotePromise]);

  useEffect(() => {
    if (!streamerEmotes) return;
    setEmotes(streamerEmotes);
  }, [streamerEmotes, setEmotes]);
};
