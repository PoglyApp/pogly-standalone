import { useContext, useEffect, useState } from "react";
import SevenTVWrap from "../Utility/SevenTVWrap";
import Config from "../module_bindings/config";
import UserId from "../Types/SevenTVTypes/SevenTVUserIdType";
import Emote from "../Types/SevenTVTypes/SevenTVEmoteType";
import { ConfigContext } from "../Contexts/ConfigContext";
import SevenTVUserType from "../Types/SevenTVTypes/SevenTVUserType";
import { DebugLogger } from "../Utility/DebugLogger";

export const useSevenTV = (
  setEmotes: Function,
  setTwitchId: Function,
  sevenTVInitialized: boolean,
  setSevenTVInitialized: Function
) => {
  const config: Config = useContext(ConfigContext);

  const [streamerIdPromise, setStreamerIdPromise] = useState<Promise<UserId>>();
  const [twitchIdPromise, setTwitchIdPromise] = useState<Promise<SevenTVUserType>>();
  const [streamerId, setStreamerId] = useState<string>();
  const [streamerEmotePromise, setStreamerEmotePromise] = useState<Promise<Emote[]>>();
  const [streamerEmotes, setStreamerEmotes] = useState<Emote[]>();

  useEffect(() => {
    if (sevenTVInitialized) return;
    DebugLogger("Get 7TV streamer ID");

    setStreamerIdPromise(SevenTVWrap.GetSevenTVId(config.streamName));
  }, [sevenTVInitialized, setStreamerIdPromise, config.streamName]);

  useEffect(() => {
    if (sevenTVInitialized) return;
    DebugLogger("Get Twitch user by ID");

    streamerIdPromise?.then((p) => {
      if (!p.data) return;
      if (!p.data.users[0]) return
      setStreamerId(p.data.users[0].id);
      setTwitchIdPromise(SevenTVWrap.GetUserById(p.data.users[0].id));
    });
  }, [sevenTVInitialized, streamerIdPromise]);

  useEffect(() => {
    if (sevenTVInitialized) return;
    if (!streamerId) return;

    if (streamerId === "000000000000000000000000") {
      setSevenTVInitialized(true);
      return;
    }

    // what we do now
    SevenTVWrap.GetEmoteSetId(streamerId).then((id) => {
      setStreamerEmotePromise(SevenTVWrap.GetEmoteSetEmotes(id));
    });
  }, [sevenTVInitialized, setSevenTVInitialized, streamerId]);

  useEffect(() => {
    if (sevenTVInitialized) return;
    streamerEmotePromise?.then((p) => {
      if (!p) return;

      setStreamerEmotes(p);
    });
  }, [sevenTVInitialized, streamerEmotePromise]);

  useEffect(() => {
    if (sevenTVInitialized) return;
    twitchIdPromise?.then((p) => {
      if (!p) return;

      if ((p as any).status_code === 404 || !p.connections) return;

      setTwitchId(p.connections.find((c) => c.platform === "TWITCH")?.id);
    });
  }, [setTwitchId, sevenTVInitialized, twitchIdPromise]);

  useEffect(() => {
    if (sevenTVInitialized) return;
    if (!streamerEmotes) return;

    setEmotes(streamerEmotes);
  }, [sevenTVInitialized, streamerEmotes, setEmotes]);

  useEffect(() => {
    if (sevenTVInitialized) return;
    if (streamerId && streamerEmotes) {
      setSevenTVInitialized(true);
    }
  }, [setSevenTVInitialized, sevenTVInitialized, streamerId, streamerEmotes]);
};
