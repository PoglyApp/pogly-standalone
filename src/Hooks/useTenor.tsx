import { useEffect } from "react";

export const useTenor = (apiKey: string | null, searchQuery: string, searchIndex: string, setEmotes: Function) => {
  useEffect(() => {
    if (!apiKey) return;
    if (searchQuery === "") return;

    tenorSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  useEffect(() => {
    if (!apiKey) return;
    if (searchQuery === "") return;
    if (searchIndex === "") return;

    tenorSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchIndex]);

  function httpGetAsync(url: string, callback: any) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function () {
      if (xmlHttp.readyState === 4 && xmlHttp.status === 200) callback(xmlHttp.responseText);
    };

    xmlHttp.open("GET", url, true);
    xmlHttp.send(null);
    return;
  }

  function tenorSearch() {
    var searchURL =
      "https://tenor.googleapis.com/v2/search?q=" + searchQuery + "&key=" + apiKey + "&limit=10&pos=" + searchIndex;

    httpGetAsync(searchURL, callbackSearch);
  }

  function callbackSearch(responseText: any) {
    var responseObj = JSON.parse(responseText);

    setEmotes(responseObj);
  }
};
