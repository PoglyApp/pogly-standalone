import "./Login.css";
import { Container } from "../../Components/General/Container";
import { PoglyLogo } from "../../Components/General/PoglyLogo";
import { TextInput } from "../../Components/General/TextInput";

export const Login = () => {
  return (
    <div className="w-screen h-screen mt-96 shadow">
      <PoglyLogo />

      <div className="flex justify-center mt-8 ml-3">
        <Container title="Connect" subTitle="Legacy" className="relative" style={{ width: "400px", height: "455px" }}>
          <div className="flex absolute bottom-1 right-3">
            <div className="w-30">
              <div className="relative">
                <select className="w-full appearance-none bg-[#10121a] hover:bg-[#10121a80] text-[#E9EEFF] font-mono px-4 py-2 rounded-md shadow-inner pr-10">
                  <option value="default">Cloud</option>
                  <option value="grid">Local</option>
                  <option value="stacked">Custom</option>
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  ▼
                </div>
              </div>
            </div>

            <button className="bg-[#10121a] hover:bg-[#10121a80] text-[#edf1ff] font-mono px-4 py-2 rounded-md shadow-inner transition duration-200 cursor-pointer ml-2">
              Connect
            </button>
          </div>
        </Container>
      </div>
    </div>
  );
};
