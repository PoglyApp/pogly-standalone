import BetterTVEmote from "../Types/BetterTVTypes/BetterTVEmoteType";
import BetterTVUserType from "../Types/BetterTVTypes/BetterTVUserType";
import { DebugLogger } from "./DebugLogger";

interface BetterTVResponse {
  data: any;
  status: number;
}

export class BetterTVWrapper {
  public async ApiGET(route: string): Promise<BetterTVResponse> {
    DebugLogger("Getting BetterTV emotes");

    const request = await fetch("https://api.betterttv.net/3/" + route, {
      method: "GET",
      referrerPolicy: "no-referrer",
    });
    const data = await request.json();
    return {
      data: data,
      status: request.status,
    };
  }

  public async GetUserByTwitchId(twitchId: string): Promise<BetterTVUserType | null> {
    DebugLogger("Getting BetterTV user by Twitch ID");

    const { data, status } = await this.ApiGET("cached/users/twitch/" + twitchId);

    if (status === 404) return null;
    if (!data) return null;

    return data as BetterTVUserType;
  }

  public GetURLFromEmote(emote: BetterTVEmote): string {
    return "https://cdn.betterttv.net/emote/" + emote.id + "/3x.webp";
  }
}

const BetterTVWrap = new BetterTVWrapper();
export default BetterTVWrap;
