import BetterTVEmote from "../BetterTVTypes/BetterTVEmoteType";
import SevenTVEmoteType from "../SevenTVTypes/SevenTVEmoteType";

export default interface ChannelEmoteType {
    type: string;
    emote: SevenTVEmoteType | BetterTVEmote;
}