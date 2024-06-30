import { ReactNode } from "react";
import Emote from "../Types/SevenTVTypes/EmoteType";
import User from "../Types/SevenTVTypes/SevenTVUserType";
import UserId from "../Types/SevenTVTypes/SevenTVUserIdType";

interface SevenTVResponse {
  data: any;
  status: number;
}

export class SevenTVWrapper {
  public async ApiGET(route: string): Promise<SevenTVResponse> {
    const request = await fetch("https://7tv.io/v3/" + route, {
      method: "GET",
      referrerPolicy: "no-referrer",
    });
    const data = await request.json();
    return {
      data: data,
      status: request.status,
    };
  }

  public async GqlApiPOST(data: any): Promise<SevenTVResponse> {
    try {
      const request = await fetch("https://7tv.io/v3/gql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        referrerPolicy: "no-referrer",
        body: JSON.stringify(data),
      });
      const ret = request.json();

      return {
        data: ret,
        status: request.status,
      };
    } catch (error) {
      console.log("ERROR WHILE FETCHING SEVENTV", error);
      return new Promise<SevenTVResponse>(() => {});
    }
  }

  public async ApiPOST(route: string, data: any): Promise<SevenTVResponse> {
    const request = await fetch("https://7tv.io/v3/" + route, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      referrerPolicy: "no-referrer",
      body: JSON.stringify(data),
    });
    const ret = request.json();

    return {
      data: ret,
      status: request.status,
    };
  }

  public async GetTwitchId(username: string): Promise<UserId> {
    const data = this.GqlApiPOST({
      operationName: "SearchUsers",
      variables: {
        query: `${username}`,
      },
      query: "query SearchUsers($query: String!) {\n  users(query: $query) {\n    id}\n}",
    });

    return (await data).data as UserId;
  }

  public async GetUserById(userId: string): Promise<User> {
    const { data, status } = await this.ApiGET("users/" + userId);

    return data as User;
  }

  public async GetEmoteSetId(userId: string): Promise<string> {
    const userObj = await this.GetUserById(userId);

    return userObj.emote_sets[0].id;
  }

  public async GetEmoteSetEmotes(emoteSetId: string): Promise<Emote[]> {
    const { data, status } = await this.ApiGET("emote-sets/" + emoteSetId);

    return data.emotes as Emote[];
  }

  public GetURLFromEmote(emote: Emote): string {
    return "https://cdn.7tv.app/emote/" + emote.id + "/3x.webp";
  }
}

const SevenTVWrap = new SevenTVWrapper();
export default SevenTVWrap;
