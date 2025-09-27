import BetterTVEmote from "./BetterTVEmoteType";

export default interface BetterTVUserType {
  id: string;
  bots: string[];
  avatar: string;
  channelEmotes: BetterTVEmote[];
  sharedEmotes: BetterTVEmote[];
}
