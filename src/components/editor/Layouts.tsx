import styled from "styled-components";
import { Container } from "../general/Container";
import { Dropdown } from "../inputs/Dropdown";
import { LayoutDashboard, ChevronLeft } from "lucide-react";
import { Button } from "../inputs/Button";
import { useState } from "react";

export const Layouts = () => {
  const [hidden, setHidden] = useState<boolean>(false);

  if (hidden) {
    return (
      <HiddenContainer className="enablePointerEvents pt-2 pb-2 mt-14">
        <Button
          text="Layouts"
          fontSize="18px"
          style={{ textOrientation: "mixed", writingMode: "tb-rl" }}
          onclick={() => {
            setHidden(!hidden);
          }}
          tooltip="Show"
        />
      </HiddenContainer>
    );
  }

  return (
    <Container className="ml-5 mt-14 enablePointerEvents" style={{ height: "fit-content" }} title="layouts">
      <div className="flex items-end">
        <Dropdown style={{ width: "300px" }} icon={<LayoutDashboard />} />
        <Button
          icon={<StyledChevronLeft />}
          onclick={() => {
            setHidden(!hidden);
          }}
          tooltip="Hide"
        />
      </div>
    </Container>
  );
};

const StyledChevronLeft = styled(ChevronLeft)`
  cursor: pointer;
  margin-right: -18px;
  color: #7e828c;
`;

const HiddenContainer = styled.div`
  width: 33px;
  background-color: #1e212b;

  border-top-right-radius: 10px;
  border-bottom-right-radius: 10px;
`;
