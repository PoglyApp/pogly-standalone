import BetterTVEmote from "../Types/BetterTVTypes/BetterTVEmoteType";
import BetterTVUserType from "../Types/BetterTVTypes/BetterTVUserType";

interface BetterTVResponse {
    data: any;
    status: number;
}

export class BetterTVWrapper {
    public async ApiGET(route: string): Promise<BetterTVResponse> {
        const request = await fetch("https://api.betterttv.net/3/" + route, {
            method: "GET",
            referrerPolicy: "no-referrer",
        });
        const data = await request.json();
        return {
            data: data,
            status: request.status
        };
    }

    public async GetUserByTwitchId(twitchId: string): Promise<BetterTVUserType> {
        const { data, status } = await this.ApiGET("cached/users/twitch/" + twitchId);

        return data as BetterTVUserType;
    }

    public GetURLFromEmote(emote: BetterTVEmote): string {
        return "https://cdn.betterttv.net/emote/" + emote.id + "/3x.webp";
      }
}

const BetterTVWrap = new BetterTVWrapper();
export default BetterTVWrap;