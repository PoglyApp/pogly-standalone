import { useEffect } from "react";
import { ChangelogType } from "../Types/General/ChangelogType";
import { DebugLogger } from "../Utility/DebugLogger";

export const useChangeLog = async (setChangelog: Function) => {
  useEffect(() => {
    (async () => {
      DebugLogger("Fetching change log");

      const response = await fetch("https://raw.githubusercontent.com/PoglyApp/.github/main/beacons/changelog");

      const responseJson = await response.json();

      const changeLog: ChangelogType = {
        _readme: responseJson._readme,
        changes: responseJson.changes.reverse(),
      };

      setChangelog(changeLog);
    })();
  }, [setChangelog]);
};

export const GetLatestChangelogVersion = (changelog: ChangelogType) => {
  return changelog.changes[0].version;
};
