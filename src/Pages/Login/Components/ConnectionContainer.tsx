import { ChevronDown, SaveIcon, UserRound } from "lucide-react";
import styled from "styled-components";
import { useEffect, useRef, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { PoglyLogo } from "../../../Components/General/PoglyLogo";
import { AuthStatusType } from "../../../Types/General/AuthStatusType";
import { QuickSwapType } from "../../../Types/General/QuickSwapType";
import { Container } from "../../../Components/General/Container";
import HintBubble from "../../../Components/General/HintBubble";

interface IProp {
  setInstanceSettings: Function;
  setNickname: Function;
  setLegacyLogin: Function;
}

export const ConnectionContainer = ({ setInstanceSettings, setNickname, setLegacyLogin }: IProp) => {
  const [moduleName, setModuleName] = useState<string>("");
  const [authKey, setAuthKey] = useState<string>("");
  const [domain, setDomain] = useState<string>("wss://pogly.spacetimedb.com");
  const [customDomain, setCustomDomain] = useState<boolean>(false);
  const [quickSwapModules, setQuickSwapModules] = useState<QuickSwapType[]>([]);
  const [subtitle, setSubtitle] = useState<string>("");

  const [guestNickname, setGuestNickname] = useState<string>("");
  const [hasCustomNickname, setHasCustomNickname] = useState<boolean>(false);
  const nicknameFieldRef = useRef<HTMLInputElement>(null);

  const domainRef = useRef<HTMLSelectElement>(null);

  const [authStatus, setAuthStatus] = useState<AuthStatusType>(AuthStatusType.NotAuthenticated);
  const [twitchToken, setTwitchToken] = useState<string | null>();
  const [isRedirecting, setIsRedirecting] = useState<boolean>(false);

  useEffect(() => {
    const modules = localStorage.getItem("poglyQuickSwap");
    if (modules && modules !== undefined) setQuickSwapModules(JSON.parse(modules));

    const twitchIdToken = localStorage.getItem("twitchIdToken");

    if (twitchIdToken) {
      setTwitchToken(twitchIdToken);

      const decodedToken: any = jwtDecode(twitchIdToken);
      setGuestNickname(decodedToken.preferred_username);
      setAuthStatus(AuthStatusType.TwitchAuth);
      setSubtitle("Twitch");
    } else {
      const savedNickname: string | null = localStorage.getItem("nickname");

      if (savedNickname) {
        setGuestNickname(savedNickname);
        setHasCustomNickname(true);
      } else {
        setGuestNickname("Guest_" + Math.floor(Math.random() * 100) + 1);
      }
    }
  }, []);

  const handleConnect = () => {
    saveQuickSwap();

    setNickname(guestNickname);

    setInstanceSettings({
      token: twitchToken,
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

    setModuleName(module.module);
    setAuthKey(module.auth);
    setDomain(module.domain);

    switch (module.domain) {
      case "wss://pogly.spacetimedb.com":
        domainRef.current!.value = "Cloud";
        break;
      case "ws://127.0.0.1:3000":
        domainRef.current!.value = "Local";
        break;
      default:
        domainRef.current!.value = "Custom";
        setCustomDomain(true);
        break;
    }
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

  const handleUpdateNickname = (value: any) => {
    const newNickname = value.target.value;

    if (newNickname === "") return (nicknameFieldRef.current!.value = guestNickname);
    setGuestNickname(newNickname);
    localStorage.setItem("nickname", newNickname);
    setHasCustomNickname(true);
  };

  return (
    <div className="w-screen h-screen bg-[#10121a] relative flex flex-col items-center justify-center overflow-hidden pb-50">
      <PoglyLogo />

      {authStatus === AuthStatusType.NotAuthenticated && (
        <div className="absolute z-20 flex flex-col items-center justify-center bg-[#1e212b] backdrop-blur-sm p-6 rounded-lg shadow-lg mt-45">
          <StyledButton
            className="flex justify-self-center mb-3 w-[220px]"
            onClick={() => {
              setAuthStatus(AuthStatusType.LegacyAuth);
              setLegacyLogin(true);
              setSubtitle("legacy");
            }}
          >
            <UserRound className="mr-2" />
            <span>login as guest</span>
          </StyledButton>
          <StyledButton
            className="flex justify-self-center bg-[#6441a5]! hover:bg-[#6441a5b2]!"
            onClick={() => {
              handleAuth(AuthStatusType.TwitchAuth);
              setSubtitle("twitch");
            }}
          >
            <img className="w-[16px] h-[16px] self-center mr-2" src="./assets/twitch.png" />
            <span>login with Twitch</span>
          </StyledButton>
        </div>
      )}

      <div className="flex justify-center z-10 mt-8">
        <Container
          title={authStatus === AuthStatusType.NotAuthenticated ? "login" : "connect"}
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
              <div className="flex text-[20px] text-center bg-[#10121a] p-3 rounded-md justify-center">
                logged in as
                <HintBubble
                  hint="change nickname"
                  className={
                    authStatus === AuthStatusType.TwitchAuth ||
                    authStatus === AuthStatusType.NotAuthenticated ||
                    hasCustomNickname
                      ? "hidden"
                      : ""
                  }
                >
                  <input
                    ref={nicknameFieldRef}
                    type="text"
                    defaultValue={guestNickname}
                    disabled={authStatus === AuthStatusType.TwitchAuth ? true : false}
                    className={`${
                      authStatus === AuthStatusType.TwitchAuth ? "text-[#9146FF]" : "text-[#7e97a5]"
                    } w-[100px] ml-2 ${
                      authStatus === AuthStatusType.LegacyAuth &&
                      !hasCustomNickname &&
                      "border border-[#82a5ff] rounded-md"
                    }`}
                    onBlur={handleUpdateNickname}
                  />
                </HintBubble>
              </div>

              <div className="w-full">
                <p className="text-sm text-[#aeb4d4]">module name</p>
                <input
                  type="text"
                  placeholder="module name"
                  value={moduleName}
                  className="bg-[#10121a] text-[#e9eeff] p-3 rounded-md placeholder-gray-400 w-full focus:outline-none focus:ring-2 focus:ring-[#2c2f3a]"
                  onChange={(value: any) => setModuleName(value.target.value)}
                />
              </div>

              <div className="w-full">
                <p className="text-sm text-[#aeb4d4] flex">
                  module password <span className="text-xs text-[#aeb4d47a] pl-1 pt-0.5">(if required by module)</span>
                </p>
                <input
                  type="password"
                  placeholder="password"
                  value={authKey}
                  className="bg-[#10121a] text-[#e9eeff] p-3 rounded-md placeholder-gray-400 w-full focus:outline-none focus:ring-2 focus:ring-[#2c2f3a]"
                  onChange={(value: any) => setAuthKey(value.target.value)}
                />
              </div>

              <div className="relative w-full">
                <p className="text-sm text-[#aeb4d4]">quick select</p>
                <div className="w-87 flex">
                  <StyledSelect onChange={(value: any) => handleQuickSwapChange(value.target.value)}>
                    <option value="select">select</option>
                    {quickSwapModules.length > 0 ? (
                      quickSwapModules.map((module) => (
                        <option key={module.module} value={module.module}>
                          {module.module}
                        </option>
                      ))
                    ) : (
                      <option value="default">none</option>
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
                  <p className="text-sm text-[#aeb4d4]">Custom domain</p>
                  <input
                    type="text"
                    placeholder="ws(s)://127.0.0.1"
                    defaultValue={domain}
                    className="bg-[#10121a] text-[#e9eeff] p-3 rounded-md shadow-inner placeholder-gray-400 w-full focus:outline-none focus:ring-2 focus:ring-[#2c2f3a]"
                    onChange={(value: any) => setDomain(value.target.value)}
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              {twitchToken && (
                <StyledButton
                  className="absolute left-5 bg-[#6441a5]!"
                  onClick={() => {
                    localStorage.removeItem("twitchIdToken");
                    localStorage.removeItem("twitchAccessToken");
                    window.location.reload();
                  }}
                >
                  logout
                </StyledButton>
              )}

              <div className="w-30 relative">
                <StyledSelect ref={domainRef} onChange={(value) => handleDomainChange(value)}>
                  <option value="Cloud">cloud</option>
                  <option value="Local">local</option>
                  <option value="Custom">custom</option>
                </StyledSelect>
                <div className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <ChevronDown />
                </div>
              </div>

              <StyledButton onClick={handleConnect}>connect</StyledButton>
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
