import Emote from "../Types/SevenTVTypes/SevenTVEmoteType";
import User from "../Types/SevenTVTypes/SevenTVUserType";
import { DebugLogger } from "./DebugLogger";

interface SevenTVResponse {
  data: any;
  status: number;
}

export class SevenTVWrapper {
  public async ApiGET(route: string): Promise<SevenTVResponse> {
    DebugLogger("7TV GET request");
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
    DebugLogger("7TV GQL POST request");
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
    DebugLogger("7TV POST request");
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

  public async SearchForUser(username: string): Promise<string | null> {
    DebugLogger("Getting 7TV ID");
    const query = await this.GqlApiPOST({
      operationName: "SearchUsers",
      variables: {
        query: `${username.toLowerCase()}`,
      },
      query: "query SearchUsers($query: String!) {\n  users(query: $query) {\n    id, username}\n}",
    });

    const user = (await query.data).data.users.filter(
      (_user: User) => _user.username.toLowerCase() === username.toLowerCase()
    )[0];

    if (!user) return null;

    return user.id;
  }

  public async GetUserById(userId: string): Promise<User | null> {
    DebugLogger("Getting 7TV user ID");
    const { data, status } = await this.ApiGET("users/" + userId);

    if (status === 404) return null;

    return data as User;
  }

  public async GetEmoteSetId(userId: string): Promise<string | null> {
    DebugLogger("Getting 7TV emote set ID");
    const userObj = await this.GetUserById(userId);

    if (!userObj) return null;

    return userObj.connections.filter((x) => x.platform.toLowerCase())[0].emote_set_id;
  }

  public async GetEmoteSetEmotes(emoteSetId: string): Promise<Emote[]> {
    DebugLogger("Getting 7TV emote set emotes");

    const { data, status } = await this.ApiGET("emote-sets/" + emoteSetId);

    return data.emotes as Emote[];
  }

  public GetURLFromEmote(emote: Emote): string {
    DebugLogger("Getting 7TV emote URL");
    return "https://cdn.7tv.app/emote/" + emote.id + "/3x.webp";
  }
}

const SevenTVWrap = new SevenTVWrapper();
export default SevenTVWrap;
