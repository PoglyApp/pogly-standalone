import { useEffect } from "react";
import { ChangelogType } from "../Types/General/ChangelogType";

export const useChangeLog = async (setChangelog: Function) => {
  useEffect(() => {
    (async () => {
      const response = await fetch("https://raw.githubusercontent.com/PoglyApp/.github/main/beacons/changelog");

      const responseJson = await response.json();

      const changeLog: ChangelogType = {
        _readme: responseJson._readme,
        changes: responseJson.changes.reverse(),
      };

      setChangelog(changeLog);
    })();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};

export const GetLatestChangelogVersion = (changelog: ChangelogType) => {
  return changelog.changes[0].version;
};
