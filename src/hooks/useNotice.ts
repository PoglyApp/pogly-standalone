import { useEffect } from "react";
import { DebugLogger } from "../Utility/DebugLogger";

export const useNotice = (setNoticeMessage: Function) => {
  const isPoglyOrDevInstance: Boolean =
    window.location.href.includes("localhost") || window.location.href.includes("standalone.pogly.gg");

  // TODO: Support for multiple notices at the same time

  useEffect(() => {
    if (!isPoglyOrDevInstance) return;

    DebugLogger("Fetching notice");

    (async () => {
      const response = await fetch("https://raw.githubusercontent.com/PoglyApp/.github/main/beacons/notice");
      const responseJson = await response.json();

      const closedNoticeId = localStorage.getItem("notice_id") || null;

      if (responseJson.notice === "") return setNoticeMessage(null);
      if (closedNoticeId === responseJson.id) return;

      setNoticeMessage({ noticeId: responseJson.id, notice: responseJson.notice });
    })();
  }, [isPoglyOrDevInstance, setNoticeMessage]);
};
