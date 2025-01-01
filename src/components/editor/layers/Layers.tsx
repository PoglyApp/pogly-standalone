import { LayerElementType } from "@/types/LayerElementType";
import { Container } from "../../general/Container";
import { LayerElement } from "./LayerElement";
import { useState } from "react";
import styled from "styled-components";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/inputs/Button";

export const Layers: React.FC = () => {
  const [hidden, setHidden] = useState<boolean>(false);

  if (hidden) {
    return (
      <HiddenContainer className="enablePointerEvents pt-2 pb-2 mt-14">
        <Button
          text="Layers"
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
    <Container className="ml-5 mt-8 enablePointerEvents" title="layers" style={{ width: "fit-content" }}>
      <div className="flex">
        <div>
          <LayerElement type={LayerElementType.Image} text="Kekw" />
          <LayerElement type={LayerElementType.Image} text="Pog" />
          <LayerElement type={LayerElementType.Image} text="Peeposit" />
          <LayerElement type={LayerElementType.Text} text="Sub now!" />
          <LayerElement type={LayerElementType.Widget} text="Youtube player" />
        </div>

        <div className="self-center">
          <Button
            icon={<StyledChevronLeft />}
            onclick={() => {
              setHidden(!hidden);
            }}
            tooltip="Hide"
          />
        </div>
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
