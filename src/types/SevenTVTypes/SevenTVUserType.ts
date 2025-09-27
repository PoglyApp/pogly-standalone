import SevenTVConnections from "./SevenTVConnections";

export default interface SevenTVUserType {
  id: string;
  username: string;
  display_name: string;
  created_at: number;
  avatar_url: string;
  style: any;
  emote_sets: {
    id: string;
    name: string;
    flags: number;
    tags: any[];
    capacity: number;
  }[];
  editors: any[];
  roles: any[];
  connections: SevenTVConnections[];
}
