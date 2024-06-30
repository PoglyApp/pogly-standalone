import { styled } from "styled-components";
import { Badge, Button, Link, SvgIcon } from "@mui/material";
import BugReportIcon from "@mui/icons-material/BugReport";
import GitHubIcon from "@mui/icons-material/GitHub";
import UpdateIcon from "@mui/icons-material/Update";
import { useContext, useEffect, useState } from "react";
import { ModalContext } from "../../Contexts/ModalContext";
import { ChangelogModal } from "../Modals/ChangelogModal";
import { ChangelogType } from "../../Types/General/ChangelogType";
import { GetLatestChangelogVersion, useChangeLog } from "../../Hooks/useChangeLog";

export const ElementSelectionMenuFooter = () => {
  const { setModals } = useContext(ModalContext);

  const [changelog, setChangelog] = useState<ChangelogType | undefined>(undefined);
  const [latestChangelogVersion, setLatestChangelogVersion] = useState<string>("");

  const seenVersion = localStorage.getItem("changelog");

  useChangeLog(setChangelog);

  useEffect(() => {
    if (!changelog) return;
    setLatestChangelogVersion(GetLatestChangelogVersion(changelog));
  }, [changelog]);

  const openChangelogModal = () => {
    setModals((oldModals: any) => [
      ...oldModals,
      <ChangelogModal
        key="changelog_modal"
        changelog={changelog}
        seenVersion={seenVersion || ""}
        latestVersion={latestChangelogVersion}
      />,
    ]);
  };

  return (
    <SelectionMenuFooterContainer>
      <FooterLinkContainer>
        <UpdateIcon />
        <Button
          variant="text"
          onClick={openChangelogModal}
          sx={{
            paddingTop: "3px",
            paddingLeft: "5px",
            color: "#ffffffa6",
            textTransform: "initial",
            maxHeight: "24px",
            display: "block",
          }}
        >
          What's New?{" "}
          {latestChangelogVersion && seenVersion !== latestChangelogVersion ? (
            <Badge
              badgeContent="NEW"
              color="primary"
              sx={{
                left: "0",
                paddingLeft: "25px",
                paddingBottom: "3px",
                ".MuiBadge-badge": { backgroundColor: "#e53e3e" },
              }}
            />
          ) : (
            <></>
          )}
        </Button>
      </FooterLinkContainer>

      <FooterLinkContainer>
        <BugReportIcon />
        <Link
          href="https://github.com/PoglyApp/PoglyStandalone/issues"
          target="_blank"
          underline="always"
          sx={{ paddingTop: "3px", paddingLeft: "5px", color: "#ffffffa6" }}
        >
          Report Issues
        </Link>
      </FooterLinkContainer>

      <FooterLinkContainer>
        <GitHubIcon />
        <Link
          href="https://github.com/PoglyApp/PoglyStandalone"
          target="_blank"
          underline="always"
          sx={{ paddingTop: "3px", paddingLeft: "5px", color: "#ffffffa6" }}
        >
          Github
        </Link>
      </FooterLinkContainer>

      <FooterLinkContainer>
        <SvgIcon viewBox="0 0 24 24">
          <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
        </SvgIcon>
        <Link
          href="https://discord.gg/uPQsBaVdB7"
          target="_blank"
          underline="always"
          sx={{ paddingTop: "3px", paddingLeft: "5px", color: "#ffffffa6" }}
        >
          Discord
        </Link>
      </FooterLinkContainer>
      <p style={{ margin: "0", paddingLeft: "10px", paddingBottom: "10px", fontSize: "12px" }}>
        Version: {process.env.REACT_APP_VERSION}
      </p>
    </SelectionMenuFooterContainer>
  );
};

const SelectionMenuFooterContainer = styled.div`
  width: 218px;
  height: max-content;
  bottom: 0;
  position: fixed;
  align-content: end;

  padding-top: 15px;

  color: #ffffffa6;
  background-color: #001529;
`;

const FooterLinkContainer = styled.div`
  width: 218px;
  display: flex;
  bottom: 0;

  padding-left: 10px;
  margin-bottom: 10px;
`;
