import styled from "styled-components";
import ChangelogIcon from "@/Assets/Icons/ChangelogIcon.svg";
import GithubIcon from "@/Assets/Icons/GithubIcon.svg";
import DiscordIcon from "@/Assets/Icons/DiscordIcon.svg";
import LogoutIcon from "@/Assets/Icons/LogoutIcon.svg";

export const Footer = () => {
  return (
    <div className="ml-10">
      <div className="flex gap-2.5">
        <Button>
          <ButtonIcon src={ChangelogIcon} alt="changelog" />
        </Button>

        <Button>
          <ButtonIcon src={GithubIcon} alt="github" />
        </Button>

        <Button>
          <ButtonIcon src={DiscordIcon} alt="discord" />
        </Button>

        <Button>
          <ButtonIcon src={LogoutIcon} alt="logout" />
        </Button>
      </div>

      <span className="text-[#EDF1FF4D] absolute">ver {process.env.REACT_APP_VERSION}</span>
    </div>
  );
};

const Button = styled.button`
  cursor: pointer;

  border: solid 1px transparent;
  border-radius: 4px;

  &:hover {
    background-color: #82a5ff4d;
    border: solid 1px #82a5ff;
  }
`;

const ButtonIcon = styled.img`
  width: 32px;
  height: 32px;
`;
