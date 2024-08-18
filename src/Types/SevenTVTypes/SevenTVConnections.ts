import SevenTVEmoteSetType from "./SevenTVEmoteSetType";

export default interface SevenTVConnections {
    id: string;
    platform: string;
    username: string;
    display_name: string;
    linked_at: number;
    emote_capacity: number;
    emote_set_id: any;
    emote_set: SevenTVEmoteSetType;
  }
  