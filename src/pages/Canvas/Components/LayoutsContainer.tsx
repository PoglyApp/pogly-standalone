import { Container } from "../../../Components/General/Container";
import { Select } from "../../../Components/Inputs/Select";

export const LayoutsContainer = () => {
  return (
    <Container title="layouts" className="w-[320px] h-[70px] mt-[153px] ml-[40px]">
      <Select className="w-[288px] h-[36px] mb-[6px]" onChange={() => {}} defaultValue="Default"></Select>
    </Container>
  );
};
