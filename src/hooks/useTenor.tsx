import { useCallback, useEffect } from "react";
import { DebugLogger } from "../Utility/DebugLogger";

export const useTenor = (apiKey: string | null, searchQuery: string, searchIndex: string, setEmotes: Function) => {
  const callbackSearch = useCallback(
    (responseText: any) => {
      DebugLogger("Tenor callback search");
      var responseObj = JSON.parse(responseText);

      setEmotes(responseObj);
    },
    [setEmotes]
  );

  const tenorSearch = useCallback(() => {
    DebugLogger("Tenor search");
    var searchURL =
      "https://tenor.googleapis.com/v2/search?q=" + searchQuery + "&key=" + apiKey + "&limit=10&pos=" + searchIndex;

    httpGetAsync(searchURL, callbackSearch);
  }, [apiKey, searchIndex, searchQuery, callbackSearch]);

  useEffect(() => {
    if (!apiKey || searchQuery === "") return;

    tenorSearch();
  }, [searchQuery, apiKey, tenorSearch]);

  useEffect(() => {
    if (!apiKey || searchQuery === "" || searchIndex === "") return;

    tenorSearch();
  }, [searchIndex, apiKey, searchQuery, tenorSearch]);

  const httpGetAsync = async (url: string, callback: any) => {
    DebugLogger("Tenor GET query");

    const xmlHttp = new XMLHttpRequest();

    xmlHttp.onreadystatechange = function () {
      if (xmlHttp.readyState === 4 && xmlHttp.status === 200) callback(xmlHttp.responseText);
    };

    xmlHttp.open("GET", url, true);
    xmlHttp.send(null);
    return;
  };
};
