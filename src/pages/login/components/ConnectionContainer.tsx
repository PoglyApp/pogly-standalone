import { ChevronDown, SaveIcon, Trash } from "lucide-react";
import styled from "styled-components";
import { useEffect, useRef, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { PoglyTitle } from "./PoglyTitle";
import { QuickSwapType } from "../../../Types/General/QuickSwapType";
import { Container } from "../../../Components/General/Container";
import { useAuth } from "react-oidc-context";
import HintBubble from "../../../Components/General/HintBubble";
import { TextInput } from "../../../Components/Inputs/TextInput";
import { Select } from "../../../Components/Inputs/Select";
import { Button } from "../../../Components/Inputs/Button";

interface IProp {
  setInstanceSettings: Function;
  setNickname: Function;
  setLegacyLogin: Function;
}

export const ConnectionContainer = ({ setInstanceSettings, setNickname, setLegacyLogin }: IProp) => {
  const auth = useAuth();
  const urlParams = new URLSearchParams(window.location.search);

  const [moduleName, setModuleName] = useState<string>("");
  const [authKey, setAuthKey] = useState<string>("");
  const [domain, setDomain] = useState<string>("wss://maincloud.spacetimedb.com");
  const [customDomain, setCustomDomain] = useState<boolean>(false);
  const [quickSwapModules, setQuickSwapModules] = useState<QuickSwapType[]>([]);
  const [quickSwapSelected, setQuickSwapSelected] = useState<QuickSwapType | null>(null);
  const [subtitle, setSubtitle] = useState<string>("");

  const [guestNickname, setGuestNickname] = useState<string>("");
  const [hasCustomNickname, setHasCustomNickname] = useState<boolean>(false);
  const nicknameFieldRef = useRef<HTMLInputElement>(null);

  const domainRef = useRef<HTMLSelectElement>(null);

  const [idToken, setIdToken] = useState<string | undefined>(auth.user?.id_token);
  const [isRedirecting, setIsRedirecting] = useState<boolean>(false);

  useEffect(() => {
    const modules = localStorage.getItem("poglyQuickSwap");
    if (modules && modules !== undefined) setQuickSwapModules(JSON.parse(modules));

    const domain = urlParams.get("domain");

    if (domain) {
      setCustomDomain(true);
      setDomain(domain);
      domainRef.current!.value = "Custom";
    }

    const storedIdToken = localStorage.getItem("StdbIdToken");

    if (storedIdToken) {
      const decodedToken: any = jwtDecode(storedIdToken);
      const currentTime = Date.now() / 1000;

      if (decodedToken.exp < currentTime) {
        console.warn("ID token has expired. Forcing user to relog...");
        return;
      }

      setIdToken(storedIdToken);
      setGuestNickname(decodedToken.preferred_username);
      setNickname(decodedToken.preferred_username);
      setHasCustomNickname(true);
      setSubtitle(
        String(decodedToken.login_method[0]).toUpperCase() + String(decodedToken.login_method).slice(1) ||
          "SpacetimeAuth"
      );

      localStorage.setItem("nickname", decodedToken.preferred_username);
      return;
    }

    const savedNickname: string | null = localStorage.getItem("nickname");

    if (savedNickname) {
      setGuestNickname(savedNickname);
      setHasCustomNickname(true);
    } else {
      setGuestNickname("Guest_" + Math.floor(Math.random() * 100) + 1);
    }
  }, []);

  useEffect(() => {
    if (auth.isAuthenticated && auth.user) {
      if (!auth.user.id_token) return;

      localStorage.setItem("StdbIdToken", auth.user.id_token);

      const preferred =
        (auth.user.profile as any)?.preferred_username || auth.user.profile?.name || auth.user.profile?.sub;

      const decodedToken: any = jwtDecode(auth.user.id_token);

      if (preferred) {
        setGuestNickname(preferred);
        setNickname(preferred);
        setSubtitle(
          String(decodedToken.login_method[0]).toUpperCase() + String(decodedToken.login_method).slice(1) ||
            "SpacetimeAuth"
        );
        localStorage.setItem("nickname", preferred);
        setHasCustomNickname(true);
      }

      setIdToken(auth.user.id_token);
    }
  }, [auth.isAuthenticated, auth.user]);

  const handleConnect = () => {
    saveQuickSwap();

    setNickname(guestNickname);
    setHasCustomNickname(true);

    localStorage.setItem("nickname", guestNickname);
    localStorage.setItem("stdbConnectDomain", domain);
    localStorage.setItem("stdbConnectModule", moduleName);
    localStorage.setItem("stdbConnectModuleAuthKey", authKey);

    setInstanceSettings({
      token: idToken,
      domain: domain,
      module: moduleName,
      authKey: authKey,
      remember: true,
    });
  };

  const saveQuickSwap = () => {
    const quickSwap = localStorage.getItem("poglyQuickSwap");
    const newConnection: QuickSwapType = { domain: domain, module: moduleName, nickname: guestNickname, auth: authKey };

    // If pre-existing swap list exists and is not empty
    if (quickSwap && quickSwap.length > 0) {
      const modules: QuickSwapType[] = JSON.parse(quickSwap);

      // Delete quickswap option
      if (!moduleName) {
        const filteredModules = modules.filter((module: QuickSwapType) => module.module !== quickSwapSelected?.module);
        setQuickSwapModules(filteredModules);
        setQuickSwapSelected(null);

        return localStorage.setItem("poglyQuickSwap", JSON.stringify(filteredModules));
      }

      const isModuleAlreadySaved = modules.findIndex((module: QuickSwapType) => module.module === moduleName);

      if (isModuleAlreadySaved != -1) {
        modules[isModuleAlreadySaved] = newConnection;
      } else {
        modules.push(newConnection);
      }

      localStorage.setItem("poglyQuickSwap", JSON.stringify(modules));
      setQuickSwapModules(modules);
    } else {
      localStorage.setItem("poglyQuickSwap", JSON.stringify([newConnection]));
      setQuickSwapModules([newConnection]);
    }
  };

  const handleDomainChange = (value: any) => {
    switch (value.target.value) {
      case "Cloud":
        setDomain("wss://maincloud.spacetimedb.com");
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
      setQuickSwapSelected(null);
      return;
    }

    const module: QuickSwapType | undefined = quickSwapModules.find((m: QuickSwapType) => m.module === value);
    if (!module) return console.log("ERROR: Could not find selected module from quickswap list.");

    setModuleName(module.module);
    setAuthKey(module.auth);
    setDomain(module.domain);
    setQuickSwapSelected(module);

    switch (module.domain) {
      case "wss://maincloud.spacetimedb.com":
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

  const handleUpdateNickname = (value: any) => {
    const newNickname = value.target.value;

    if (newNickname === "") return (nicknameFieldRef.current!.value = guestNickname);
    setGuestNickname(newNickname);
    localStorage.setItem("nickname", newNickname);
    setHasCustomNickname(true);
  };

  return (
    <div className="w-screen h-screen bg-[#10121a] relative flex flex-col items-center justify-center overflow-hidden pb-50">
      <PoglyTitle />

      {!auth.isLoading && !auth.isAuthenticated && (
        <div className="absolute z-20 flex flex-col justify-center bg-[#1e212b] backdrop-blur-sm p-6 rounded-lg shadow-lg mt-25">
          <Button
            className="flex "
            onClick={() => {
              auth.signinRedirect();
              setSubtitle("SpacetimeAuth");
            }}
          >
            <img className="w-[16px] h-[16px] self-center mr-2" src="./assets/spacetime.png" />
            <span>login with SpacetimeAuth</span>
          </Button>
        </div>
      )}

      <div className="flex justify-center z-10 mt-8">
        <Container
          title={!auth.isAuthenticated ? "login" : "connect"}
          subTitle={subtitle}
          className="relative w-[400px]"
        >
          <div
            className={`flex flex-col justify-between h-full px-6 pt-8 pb-4 transition-all duration-300 ${
              !auth.isAuthenticated || isRedirecting ? "blur-sm pointer-events-none select-none" : ""
            }`}
          >
            <div className="flex flex-col gap-3">
              <div className="flex text-center bg-[#10121a] p-3 rounded-md justify-center">
                logged in as
                <HintBubble hint="change nickname" className={hasCustomNickname ? "hidden" : ""}>
                  <input
                    ref={nicknameFieldRef}
                    type="text"
                    defaultValue={guestNickname}
                    disabled={auth.isAuthenticated ? true : false}
                    className={`${
                      auth.isAuthenticated ? "text-[#9146FF]" : "text-[#7e97a5]"
                    } ml-2 truncate bg-transparent outline-none w-auto max-w-[200px]`}
                    onBlur={handleUpdateNickname}
                  />
                </HintBubble>
              </div>

              <TextInput
                title="module name"
                placeholder="module name"
                onChange={(value: any) => setModuleName(value.target.value)}
                value={moduleName}
              />

              <TextInput
                title="module password"
                subTitle="(if required by module)"
                placeholder="password"
                password={true}
                onChange={(value: any) => setAuthKey(value.target.value)}
                value={authKey}
              />

              <div className="flex">
                <Select
                  title="quick select"
                  onChange={(value: any) => handleQuickSwapChange(value.target.value)}
                  disabled={quickSwapModules.length === 0}
                  defaultValue={quickSwapModules.length === 0 ? "no connections saved" : "select"}
                  className="w-full"
                >
                  {quickSwapModules.map((module) => (
                    <option key={module.module} value={module.module}>
                      {module.module}
                    </option>
                  ))}
                </Select>

                <Button
                  onClick={saveQuickSwap}
                  disabled={!moduleName && !quickSwapSelected}
                  className=" w-[54px] h-[44px] self-end"
                >
                  {moduleName.length === 0 && quickSwapSelected ? <Trash /> : <SaveIcon />}
                </Button>
              </div>

              {customDomain && (
                <TextInput
                  title="custom domain"
                  placeholder="ws(s)://127.0.0.1"
                  onChange={(value: any) => setDomain(value.target.value)}
                  value={domain}
                />
              )}
            </div>

            <div className="flex justify-end gap-2">
              {idToken && (
                <Button
                  className="absolute left-5 bg-[#82a5ff]! text-[#10121a]!"
                  onClick={() => {
                    localStorage.removeItem("StdbIdToken");
                    localStorage.removeItem("nickname");
                    auth.signoutRedirect();
                  }}
                >
                  logout
                </Button>
              )}

              <Select onChange={(value) => handleDomainChange(value)} className="w-30">
                <option value="Cloud">cloud</option>
                <option value="Local">local</option>
                <option value="Custom">custom</option>
              </Select>

              <Button disabled={!moduleName} onClick={handleConnect}>
                connect
              </Button>
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
};
