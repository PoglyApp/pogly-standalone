import { Container } from "../general/Container";
import { Dropdown } from "../inputs/Dropdown";
import { LayoutDashboard } from "lucide-react";

export const Layouts: React.FC = () => {
  return (
    <Container className="ml-5 mt-14" title="layouts">
      <Dropdown style={{ width: "300px" }} icon={<LayoutDashboard />} />
    </Container>
  );
};
