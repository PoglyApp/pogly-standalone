import { LayerElementType } from "@/types/LayerElementType";
import { Container } from "../../general/Container";
import { LayerElement } from "./LayerElement";

export const Layers: React.FC = () => {
  return (
    <Container className="ml-5 mt-8" title="layers">
      <LayerElement type={LayerElementType.Image} text="Kekw" />
      <LayerElement type={LayerElementType.Image} text="Pog" />
      <LayerElement type={LayerElementType.Image} text="Peeposit" />
      <LayerElement type={LayerElementType.Text} text="Sub now!" />
      <LayerElement type={LayerElementType.Widget} text="Youtube player" />
    </Container>
  );
};
