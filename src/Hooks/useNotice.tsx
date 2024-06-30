import { useEffect } from "react";

export const useNotice = (setNoticeMessage: Function) => {
  const isPoglyOrDevInstance: Boolean =
    window.location.href.includes("localhost") || window.location.href.includes("standalone.pogly.gg");

  useEffect(() => {
    if (!isPoglyOrDevInstance) return;

    (async () => {
      const response = await fetch("https://raw.githubusercontent.com/PoglyApp/.github/main/beacons/notice");
      const responseJson = await response.json();

      const closedNoticeId = localStorage.getItem("notice_id") || null;

      if (responseJson.notice === "") return setNoticeMessage(null);
      if (closedNoticeId === responseJson.id) return;

      setNoticeMessage({ noticeId: responseJson.id, notice: responseJson.notice });
    })();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
