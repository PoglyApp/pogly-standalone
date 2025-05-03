import "../Login.css";
import { ChevronDown, SaveIcon, UserRound } from "lucide-react";
import styled from "styled-components";
import { useEffect, useMemo, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { PoglyLogo } from "../../../Components/General/PoglyLogo";
import { AuthStatusType } from "../../../Types/General/AuthStatusType";
import { QuickSwapType } from "../../../Types/General/QuickSwapType";
import { Container } from "../../../Components/General/Container";

interface IProp {
  setInstanceSettings: Function;
}

export const ConnectionContainer = ({ setInstanceSettings }: IProp) => {
  const [moduleName, setModuleName] = useState<string>("");
  const [authKey, setAuthKey] = useState<string>("");
  const [domain, setDomain] = useState<string>("wss://pogly.spacetimedb.com");
  const [customDomain, setCustomDomain] = useState<boolean>(false);
  const [quickSwapModules, setQuickSwapModules] = useState<QuickSwapType[]>([]);
  const [subtitle, setSubtitle] = useState<string>("");

  const twitchIdToken = localStorage.getItem("twitchIdToken");

  const [authStatus, setAuthStatus] = useState<AuthStatusType>(
    twitchIdToken ? AuthStatusType.TwitchAuth : AuthStatusType.NotAuthenticated
  );
  const [isRedirecting, setIsRedirecting] = useState<boolean>(false);

  const preferredUsername = useMemo(() => {
    try {
      if (!twitchIdToken) return null;
      const decoded: any = jwtDecode(twitchIdToken);
      return decoded.preferred_username ?? null;
    } catch {
      return null;
    }
  }, [twitchIdToken]);

  useEffect(() => {
    const modules = localStorage.getItem("poglyQuickSwap");
    if (modules && modules !== undefined) setQuickSwapModules(JSON.parse(modules));
  }, []);

  const handleConnect = () => {
    saveQuickSwap();

    setInstanceSettings({
      token: twitchIdToken,
      domain: domain,
      module: moduleName,
      authKey: authKey,
      remember: true,
    });
  };

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

  const handleAuth = (type: AuthStatusType) => {
    setIsRedirecting(true);
    setAuthStatus(type);

    const CLIENT_ID = "2zrg60xlectlfv7pycwlt4acoabs1p"; // twitch oauth here!
    const REDIRECT_URI = "http://localhost:3006/callback";
    const SCOPES = "openid";

    const twitchAuthUrl =
      "https://id.twitch.tv/oauth2/authorize" +
      `?client_id=${CLIENT_ID}` +
      `&redirect_uri=${REDIRECT_URI}` +
      `&response_type=token+id_token` +
      `&scope=${encodeURIComponent(SCOPES)}`;

    window.location.href = twitchAuthUrl;
  };

  return (
    <div className="w-screen h-screen relative flex flex-col items-center justify-center overflow-hidden bottom-30">
      <PoglyLogo />

      {/* LOGIN BUTTON OVERLAY */}
      {authStatus === AuthStatusType.NotAuthenticated && (
        <div className="absolute z-20 flex flex-col items-center justify-center bg-[#1e212b] backdrop-blur-sm p-6 rounded-lg shadow-lg mt-45">
          <StyledButton
            className="flex justify-self-center mb-3 w-[178px]"
            onClick={() => {
              setAuthStatus(AuthStatusType.LegacyAuth);
              setSubtitle("Legacy");
            }}
          >
            <UserRound className="mr-2" />
            <span>Login as guest</span>
          </StyledButton>
          <StyledButton
            className="flex justify-self-center bg-[#6441a5]! hover:bg-[#6441a5b2]!"
            onClick={() => {
              handleAuth(AuthStatusType.TwitchAuth);
              setSubtitle("Twitch");
            }}
          >
            <img className="w-[16px] h-[16px] self-center mr-2" src="./assets/twitch.png" />
            <span>Login with Twitch</span>
          </StyledButton>
        </div>
      )}

      <div className="flex justify-center z-10 mt-8">
        <Container
          title={authStatus === AuthStatusType.NotAuthenticated ? "Login" : "Connect"}
          subTitle={subtitle}
          className="relative w-[400px]"
        >
          <div
            className={`flex flex-col justify-between h-full px-6 pt-8 pb-4 transition-all duration-300 ${
              authStatus === AuthStatusType.NotAuthenticated || isRedirecting
                ? "blur-sm pointer-events-none select-none"
                : ""
            }`}
          >
            <div className="flex flex-col gap-3">
              {twitchIdToken && (
                <div className="text-[20px] text-center bg-[#10121a] p-3 rounded-md">
                  Logged in as <span className="text-[#9146FF]">{preferredUsername}</span>
                </div>
              )}

              <div className="w-full">
                <p className="text-sm text-[#aeb4d4] font-mono">Module name</p>
                <input
                  type="text"
                  placeholder="Module name"
                  value={moduleName}
                  className="bg-[#10121a] text-[#e9eeff] font-mono p-3 rounded-md placeholder-gray-400 w-full focus:outline-none focus:ring-2 focus:ring-[#2c2f3a]"
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
                  className="bg-[#10121a] text-[#e9eeff] font-mono p-3 rounded-md placeholder-gray-400 w-full focus:outline-none focus:ring-2 focus:ring-[#2c2f3a]"
                  onChange={(value: any) => setAuthKey(value.target.value)}
                />
              </div>

              <div className="relative w-full">
                <p className="text-sm text-[#aeb4d4] font-mono">Saved modules</p>
                <div className="w-87 flex">
                  <StyledSelect onChange={(value: any) => handleQuickSwapChange(value.target.value)}>
                    <option value="select">Select</option>
                    {quickSwapModules.length > 0 ? (
                      quickSwapModules.map((module) => (
                        <option key={module.module} value={module.module}>
                          {module.module}
                        </option>
                      ))
                    ) : (
                      <option value="default">None</option>
                    )}
                  </StyledSelect>
                  <div className="pointer-events-none absolute right-18 top-1/2 text-gray-400">
                    <ChevronDown />
                  </div>
                  <StyledButton disabled={!moduleName} onClick={saveQuickSwap}>
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

            <div className="flex justify-end gap-2">
              {twitchIdToken && (
                <StyledButton
                  className="absolute left-5 bg-[#6441a5]!"
                  onClick={() => {
                    localStorage.removeItem("twitchIdToken");
                    localStorage.removeItem("twitchAccessToken");
                    window.location.reload();
                  }}
                >
                  Logout
                </StyledButton>
              )}

              <div className="w-30 relative">
                <StyledSelect onChange={(value) => handleDomainChange(value)}>
                  <option value="Cloud">Cloud</option>
                  <option value="Local">Local</option>
                  <option value="Custom">Custom</option>
                </StyledSelect>
                <div className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <ChevronDown />
                </div>
              </div>

              <StyledButton onClick={handleConnect}>Connect</StyledButton>
            </div>
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
