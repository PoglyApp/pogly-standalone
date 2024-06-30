import Emote from "./EmoteType";

export default interface EmoteSetType {
  id: string;
  name: string;
  flags: number;
  tags: string[];
  immutable: boolean;
  privileged: boolean;
  emotes?: Emote[];
  emote_count: number;
  capacity: number;
  owner: any;
}
