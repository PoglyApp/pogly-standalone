import "./Login.css";
import { Container } from "../../Components/General/Container";
import { PoglyLogo } from "../../Components/General/PoglyLogo";
import { ChevronDown, SaveIcon } from "lucide-react";
import styled from "styled-components";
import { useEffect, useState } from "react";
import { QuickSwapType } from "../../Types/General/QuickSwapType";

export const Login = () => {
  const [moduleName, setModuleName] = useState<string>("");
  const [authKey, setAuthKey] = useState<string>("");
  const [domain, setDomain] = useState<string>("wss://pogly.spacetimedb.com");
  const [customDomain, setCustomDomain] = useState<boolean>(false);
  const [quickSwapModules, setQuickSwapModules] = useState<QuickSwapType[]>([]);

  useEffect(() => {
    const modules = localStorage.getItem("poglyQuickSwap");
    if (modules && modules !== undefined) setQuickSwapModules(JSON.parse(modules));
  }, []);

  const saveQuickSwap = () => {
    if (!moduleName) return;

    const qSwap = localStorage.getItem("poglyQuickSwap");
    let modules: QuickSwapType[] = [];

    if (!qSwap) {
      modules.push({ domain: domain, module: moduleName, nickname: null, auth: authKey });
      localStorage.setItem("poglyQuickSwap", JSON.stringify(modules));
    } else {
      try {
        if (qSwap) modules = JSON.parse(qSwap);
      } catch (error) {
        //do nothing
      }

      const newConnection: QuickSwapType = { domain: domain, module: moduleName, nickname: null, auth: authKey };

      if (modules) {
        if (modules.some((x) => x.module === moduleName)) return;
        modules.push(newConnection);
        localStorage.setItem("poglyQuickSwap", JSON.stringify(modules));
      } else {
        let swapArray: QuickSwapType[] = [newConnection];
        localStorage.setItem("poglyQuickSwap", JSON.stringify(swapArray));
      }
    }
  };

  const handleDomainChange = (value: any) => {
    switch (value.target.value) {
      case "Cloud":
        setDomain("wss://pogly.spacetimedb.com");
        setCustomDomain(false);
        break;
      case "Local":
        setDomain("ws://127.0.0.1:3000");
        setCustomDomain(false);
        break;
      case "Custom":
        setCustomDomain(true);
        break;
    }
  };

  const handleQuickSwapChange = (value: any) => {
    if (value === "select") {
      setModuleName("");
      setAuthKey("");
      return;
    }

    const module: QuickSwapType | undefined = quickSwapModules.find((m: QuickSwapType) => m.module === value);
    if (!module) return console.log("ERROR: Could not find selected module from quickswap list.");

    console.log(module);
    setModuleName(module.module);
    setAuthKey(module.auth);
  };

  return (
    <div className="w-screen h-screen mt-96 shadow">
      <PoglyLogo />

      <div className="flex justify-center mt-8 ml-3">
        <Container title="Connect" subTitle="Legacy" className="relative w-[400px] h-[440px]">
          <div className="flex flex-col gap-3 px-6 pt-10">
            <div className="w-full">
              <p className="text-sm text-[#aeb4d4] font-mono">Module name</p>
              <input
                type="text"
                placeholder="Module name"
                value={moduleName}
                className="bg-[#10121a] text-[#e9eeff] font-mono p-3 rounded-md shadow-inner placeholder-gray-400 w-full focus:outline-none focus:ring-2 focus:ring-[#2c2f3a]"
                onChange={(value: any) => setModuleName(value.target.value)}
              />
            </div>

            <div className="w-full">
              <p className="text-sm text-[#aeb4d4] font-mono flex">
                Authentication key{" "}
                <span className="text-xs text-[#aeb4d47a] font-mono pl-1 pt-0.5">(If required by module)</span>
              </p>
              <input
                type="password"
                placeholder="Authentication key"
                value={authKey}
                className="bg-[#10121a] text-[#e9eeff] font-mono p-3 rounded-md shadow-inner placeholder-gray-400 w-full focus:outline-none focus:ring-2 focus:ring-[#2c2f3a]"
                onChange={(value: any) => setAuthKey(value.target.value)}
              />
            </div>

            <div className="relative w-full">
              <p className="text-sm text-[#aeb4d4] font-mono">Saved modules</p>
              <div className="w-87 flex">
                <StyledSelect onChange={(value: any) => handleQuickSwapChange(value.target.value)}>
                  <option value="select">Select</option>
                  {quickSwapModules.length > 0 ? (
                    quickSwapModules.map((module) => {
                      return (
                        <option key={module.module} value={module.module}>
                          {module.module}
                        </option>
                      );
                    })
                  ) : (
                    <option value="default">None</option>
                  )}
                </StyledSelect>
                <div className="pointer-events-none absolute right-18 top-1/2 text-gray-400">
                  <ChevronDown />
                </div>
                <StyledButton disabled={!moduleName ? true : false} onClick={saveQuickSwap}>
                  <SaveIcon />
                </StyledButton>
              </div>
            </div>

            {customDomain && (
              <div className="w-full">
                <p className="text-sm text-[#aeb4d4] font-mono">Custom domain</p>
                <input
                  type="text"
                  placeholder="ws(s)://127.0.0.1"
                  className="bg-[#10121a] text-[#e9eeff] font-mono p-3 rounded-md shadow-inner placeholder-gray-400 w-full focus:outline-none focus:ring-2 focus:ring-[#2c2f3a]"
                />
              </div>
            )}
          </div>

          <div className="flex absolute bottom-1 right-3">
            <div className="w-30">
              <div className="relative">
                <StyledSelect onChange={(value) => handleDomainChange(value)}>
                  <option value="Cloud">Cloud</option>
                  <option value="Local">Local</option>
                  <option value="Custom">Custom</option>
                </StyledSelect>
                <div className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <ChevronDown />
                </div>
              </div>
            </div>

            <StyledButton>Connect</StyledButton>
          </div>
        </Container>
      </div>
    </div>
  );
};

const StyledSelect = styled.select`
  width: 100%;
  appearance: none;
  background-color: #10121a;
  color: #e9eeff;

  padding: 10px;
  border-radius: 7px;

  cursor: pointer;

  &:focus {
    outline: none;
  }

  &:hover {
    background-color: #10121a80;
  }

  & > option {
    background-color: #10121a;
  }
`;

const StyledButton = styled.button`
  background-color: #10121a;
  color: #edf1ff;

  padding: 10px 15px 10px 15px;
  border-radius: 7px;

  margin-left: 5px;

  cursor: pointer;

  &:hover {
    background-color: #10121a80;
  }

  &:disabled {
    color: #edf1ff21;

    cursor: not-allowed;

    &:hover {
      background-color: #10121a;
    }
  }
`;
