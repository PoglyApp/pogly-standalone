import { Container } from "../general/Container";
import { Button } from "../inputs/Button";
import { Dropdown } from "../inputs/Dropdown";
import { TextInput } from "../inputs/TextInput";
import { Trash2 } from "lucide-react";

export const Details: React.FC = () => {
  return (
    <Container
      className="mr-10 float-right absolute mt-16 enablePointerEvents"
      style={{ right: "0" }}
      title="details"
      subTitle="Pog"
    >
      <div>
        <span style={{ color: "#edf1ff" }}>properties</span>
        <div className="mt-2">
          <div className="flex pb-3 justify-between">
            <TextInput label="X" defaultValue="0" style={{ width: "160px", marginRight: "10px" }} />
            <TextInput label="Y" defaultValue="0" style={{ width: "160px" }} />
          </div>
          <div className="flex justify-between">
            <TextInput label="W" defaultValue="0" style={{ width: "160px", marginRight: "10px" }} />
            <TextInput label="H" defaultValue="0" style={{ width: "160px" }} />
          </div>
        </div>

        <div
          className="container pl-3 pr-3 pt-2 pb-2 mt-4 rounded-lg flex items-center"
          style={{ backgroundColor: "#10121a" }}
        >
          <img
            src="https://raw.githubusercontent.com/PoglyApp/pogly-standalone/main/images/dark/Pog.png"
            style={{ width: "50px", height: "50px" }}
          />
          <span className="pl-3" style={{ color: "#edf1ff", fontSize: "18px" }}>
            Pog
          </span>
        </div>
      </div>

      <div className="mt-5">
        <span style={{ color: "#edf1ff" }}>text</span>
        <div>
          <Dropdown style={{ width: "100%" }} />
          <div className="flex mt-3 justify-between">
            <TextInput defaultValue="#E9EEFF" style={{ width: "178px", marginRight: "10px" }} />
            <TextInput defaultValue="32px" style={{ width: "178px" }} />
          </div>
        </div>
      </div>

      <div className="flex">
        <div className="grid mt-6" style={{ color: "#edf1ff", fontSize: "12px" }}>
          <span>
            added by <strong>Dynny</strong>
          </span>

          <div className="flex">
            <span className="pr-2">
              last edit by <strong>Chippy</strong>
            </span>
            <div style={{ color: "#5c5f6a" }}>
              <span className="bullet mr-1">10:37pm pst</span>
              <span className="bullet">09/28/24</span>
            </div>
          </div>
        </div>
        <div
          className="self-end ml-3 p-2 rounded-lg deleteHighlight"
          style={{ backgroundColor: "#10121a", borderColor: "transparent", borderWidth: "2px" }}
        >
          <Button
            style={{ color: "#f0044b", height: "24px" }}
            icon={<Trash2 />}
            tooltip="Delete element"
            onclick={() => {}}
          />
        </div>
      </div>
    </Container>
  );
};
