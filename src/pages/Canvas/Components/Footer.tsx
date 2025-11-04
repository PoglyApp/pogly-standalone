import styled from "styled-components";
import ChangelogIcon from "@/Assets/Icons/ChangelogIcon.svg";
import GithubIcon from "@/Assets/Icons/GithubIcon.svg";
import DiscordIcon from "@/Assets/Icons/DiscordIcon.svg";
import LogoutIcon from "@/Assets/Icons/LogoutIcon.svg";
import { Replace } from "lucide-react";
import { useEffect, useState } from "react";
import { Dropdown } from "@/Components/Inputs/Dropdown";
import { DropdownItem } from "@/Components/Inputs/DropdownItem";
import { QuickSwapType } from "@/Types/General/QuickSwapType";

export const Footer = () => {
  const [quickswapVisible, setQuickswapVisible] = useState<boolean>(false);
  const [quickSwapModules, setQuickSwapModules] = useState<QuickSwapType[]>([]);

  useEffect(() => {
    const modules = localStorage.getItem("poglyQuickSwap");

    if (modules && modules !== undefined) setQuickSwapModules(JSON.parse(modules));
  }, []);

  const disconnect = () => {
    localStorage.removeItem("stdbConnectDomain");
    localStorage.removeItem("stdbConnectModule");
    localStorage.removeItem("stdbConnectModuleAuthKey");

    window.location.reload();
  };

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
        <div className="flex items-center">
          <Button onClick={() => setQuickswapVisible(!quickswapVisible)}>
            <Replace color="#7e818c" width="30px" height="30px" />
          </Button>

          {quickswapVisible && (
            <Dropdown className="bottom-17" setQuickswapVisible={setQuickswapVisible}>
              {quickSwapModules.length > 0 ? (
                <>
                  {quickSwapModules.map((quickswap) => {
                    return <DropdownItem value={quickswap.module} onClick={() => {}} />;
                  })}
                </>
              ) : (
                <DropdownItem value="none" onClick={() => {}} />
              )}
            </Dropdown>
          )}
        </div>

        <Button onClick={disconnect}>
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
