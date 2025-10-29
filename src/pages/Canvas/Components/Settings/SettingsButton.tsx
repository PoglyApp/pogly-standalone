import styled from "styled-components";
import SettingsIcon from "@/Assets/Icons/SettingsIcon.svg";

interface IProps {
  settingsVisible: boolean;
  setSettingsVisible: Function;
}

export const SettingsButton = ({ settingsVisible, setSettingsVisible }: IProps) => {
  return (
    <Button className="mr-10 self-center" onClick={() => setSettingsVisible(!settingsVisible)}>
      <img src={SettingsIcon} alt="settings" />
    </Button>
  );
};

const Button = styled.button`
  cursor: pointer;

  width: 40px;
  height: 40px;

  border: solid 1px transparent;
  border-radius: 4px;

  &:hover {
    background-color: #82a5ff4d;
    border: solid 1px #82a5ff;
  }
`;
