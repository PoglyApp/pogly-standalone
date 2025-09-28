import styled from "styled-components";
import { useEffect, useState } from "react";
import { Check, TriangleAlert } from "lucide-react";
import { PoglyTitle } from "./PoglyTitle";
import { ConnectionConfigType } from "../../../Types/ConfigTypes/ConnectionConfigType";
import { UploadElementDataFromString } from "../../../Utility/UploadElementData";
import { useGetDefaultElements } from "../../../Hooks/useGetDefaultElements";
import { QuickSwapType } from "../../../Types/General/QuickSwapType";

interface IProps {
  legacyLogin: boolean;
  connectionConfig: ConnectionConfigType;
  spacetime: any;
}

const steps = [
  { label: "Welcome", description: "" },
  { label: "Platform", description: "Where do you stream?" },
  { label: "Channel", description: "What is your channel name?" },
  { label: "Security", description: "Setup some security measures" },
  { label: "Finish", description: "" },
];

export const ModuleOnboarding = ({ legacyLogin, connectionConfig, spacetime }: IProps) => {
  // Just to display debug box of doom
  const debug: boolean = false;

  const [step, setStep] = useState<number>(0);

  const [platform, setPlatform] = useState<string | null>();
  const [channelName, setChannelName] = useState<string | null>(null);
  const [usePassword, setUsePassword] = useState<boolean>(false);
  const [useStrictMode, setUseStrictMode] = useState<boolean>(false);
  const [password, setPassword] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<boolean>(false);

  const [overlayURL, setOverlayURL] = useState<string>("");
  const [copyOverlayButtonText, setCopyOverlayButtonText] = useState("Copy Overlay URL");
  const [copyAuthButtonText, setAuthButtonText] = useState("Copy authentication token");

  const [defaultElements, setDefaultElements] = useState<string>("");
  const [initializing, setInitializing] = useState<boolean>(false);

  const isPoglyInstance: Boolean = connectionConfig.domain === "wss://maincloud.spacetimedb.com";

  useGetDefaultElements(setDefaultElements);

  useEffect(() => {
    let baseUrl = window.location.origin + "/overlay?module=" + connectionConfig.module;
    if (!isPoglyInstance) baseUrl = baseUrl + "&domain=" + connectionConfig.domain;

    setOverlayURL(baseUrl);
  }, []);

  const handleChannelName = (value: string) => {
    if (value === "") setChannelName(null);
    else setChannelName(value);
  };

  const handlePassword = (value: string) => {
    if (value === "") return setPassword(null);

    const regex = /^[0-9a-zA-Z]+$/;
    if (!regex.test(value)) return setPasswordError(true);
    else setPasswordError(false);

    setPassword(value);
  };

  const handleSave = () => {
    spacetime.Client.reducers.setConfig(platform, channelName, debug, 120, 200, usePassword, useStrictMode, password);

    if (usePassword && password) {
      localStorage.setItem("stdbConnectModuleAuthKey", password);

      const quickSwap = localStorage.getItem("poglyQuickSwap");

      if (quickSwap && quickSwap.length > 0) {
        const modules: QuickSwapType[] = JSON.parse(quickSwap);

        const savedModule = modules.findIndex((module: QuickSwapType) => module.module === connectionConfig.module);
        modules[savedModule] = { ...modules[savedModule], auth: password };

        localStorage.setItem("poglyQuickSwap", JSON.stringify(modules));
      }
    }

    (async () => {
      UploadElementDataFromString(spacetime.Client, defaultElements);
      setInitializing(true);
    })();

    setTimeout(function () {
      window.location.reload();
    }, 3000);
  };

  return (
    <div className="w-screen h-screen relative flex flex-col items-center justify-center overflow-hidden bg-[#10121a]">
      <PoglyTitle />
      <div className="bg-[#1e212b] p-5 rounded-xl w-full max-w-5xl shadow-xl flex flex-col md:flex-row mt-10 h-[550px] mb-30">
        <div className="w-full md:w-1/4 mb-6 md:mb-0 bg-[#10121a] p-3 rounded-xl">
          <h2 className="text-lg font-semibold mb-4 text-gray-400">
            Module Setup{" "}
            <span className="text-[#82a5ff]">
              {step + 1} / {steps.length}
            </span>
          </h2>
          <ul className="space-y-3">
            {steps.map((category, index) => (
              <li
                key={index}
                className={`flex items-center space-x-3 text-sm ${step === index ? "text-[#82a5ff]" : "text-gray-500"}`}
              >
                <span className={`w-5 h-5 flex items-center justify-center rounded-full bg-[#1e212b]`}>
                  {step > index && <Check size={13} className="text-green-500" />}
                </span>
                <span>{category.label}</span>
              </li>
            ))}
          </ul>
        </div>

        {step === 0 && (
          <div className="w-full md:w-3/4 md:pl-10">
            <h3 className="flex text-xl font-semibold mb-4 text-[#e9eeff]">
              {steps[step].label} <p className="text-xs self-center ml-2 text-gray-400">{steps[step].description}</p>
            </h3>
            <div className="rounded-lg h-[350px] text-[#edf1ff]">
              <p>In order to start using Pogly, you must first configure your module.</p>
              <br />
              <p>
                This configuration is not permanent and you can modify these options at any point from the settings
                after logging in to the module.
              </p>
              <br />
              <p>
                The person who finishes this setup <b>will be made the owner!</b> Ownership <b>cannot be transferred</b>{" "}
                so make sure the right person does the configuration.
              </p>
              <br />
              <p>
                If you need help setting up Pogly or run into issues, please join our{" "}
                <a href="https://discord.gg/pogly" target="_blank" rel="noreferrer" className=" text-[#82a5ff]">
                  Discord
                </a>
                !
              </p>
            </div>

            <StyledButton className="mt-18" onClick={() => setStep((s) => s + 1)}>
              Lets get started!
            </StyledButton>
          </div>
        )}

        {step === 1 && (
          <div className="w-full md:w-3/4 md:pl-10">
            <h3 className="flex text-xl font-semibold mb-4 text-[#e9eeff]">
              {steps[step].label} <p className="text-xs self-center ml-2 text-gray-400">{steps[step].description}</p>
            </h3>
            <div className="rounded-lg h-[350px] text-[#edf1ff]">
              <p className="mb-15">
                Pogly currently supports Twitch, Youtube and Kick officially. This can be manually overwritten from
                settings later but proper functionality is not guaranteed.
              </p>
              <StyledButton
                className="bg-[#8956FB]! w-[120px] mb-5 flex justify-center"
                onClick={() => {
                  setPlatform("twitch");
                  setStep((s) => s + 1);
                }}
              >
                <img className="w-[16px] h-[16px] self-center mr-2" src="./assets/twitch.png" />
                Twitch
              </StyledButton>
              <StyledButton
                className="bg-[#FF0000]! w-[120px] mb-5 flex justify-center"
                onClick={() => {
                  setPlatform("youtube");
                  setStep((s) => s + 1);
                }}
              >
                <img className="w-[16px] h-[16px] self-center mr-2 " src="./assets/youtube.png" />
                Youtube
              </StyledButton>
              <StyledButton
                className="bg-[#00e701]! w-[120px] text-black! flex justify-center"
                onClick={() => {
                  setPlatform("kick");
                  setStep((s) => s + 1);
                }}
              >
                <img className="w-[16px] h-[16px] self-center mr-2 " src="./assets/kick.svg" />
                Kick
              </StyledButton>
            </div>

            <div className="mt-18 flex justify-between">
              <StyledButton className="bg-gray-700 hover:bg-gray-600" onClick={() => setStep((s) => s - 1)}>
                Back
              </StyledButton>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="w-full md:w-3/4 md:pl-10">
            <h3 className="flex text-xl font-semibold mb-4 text-[#e9eeff]">
              {steps[step].label} <p className="text-xs self-center ml-2 text-gray-400">{steps[step].description}</p>
            </h3>
            <div className="rounded-lg h-[350px] text-[#edf1ff]">
              <p className="mb-5">
                This channel will be shown in the preview in middle of the canvas so you can place elements pixel
                perfectly on the screen.
              </p>
              {platform === "youtube" ? (
                <div>
                  <div className="flex bg-[#FF5F15] text-[#212121] border border-[#fa4f00] rounded-lg w-[580px] p-2 mb-4">
                    <TriangleAlert className="mr-2" />
                    <span>
                      Use your Youtube account ID instead! Find your ID{" "}
                      <a
                        href="https://www.youtube.com/account_advanced"
                        target="_blank"
                        rel="noreferrer"
                        className="text-white"
                      >
                        here
                      </a>
                      .
                    </span>
                  </div>
                  <input
                    type="text"
                    placeholder="Channel ID"
                    defaultValue={channelName || ""}
                    className="bg-[#10121a] text-[#e9eeff] font-mono p-3 rounded-md placeholder-gray-400  focus:outline-none focus:ring-2 focus:ring-[#2c2f3a] w-[300px]"
                    onChange={(value) => handleChannelName(value.target.value)}
                  />
                </div>
              ) : (
                <input
                  type="text"
                  placeholder="Channel name"
                  defaultValue={channelName || ""}
                  className="bg-[#10121a] text-[#e9eeff] font-mono p-3 rounded-md placeholder-gray-400  focus:outline-none focus:ring-2 focus:ring-[#2c2f3a] w-[300px]"
                  onChange={(value) => handleChannelName(value.target.value)}
                />
              )}
            </div>

            <div className="mt-18 flex justify-between">
              <StyledButton onClick={() => setStep((s) => s - 1)}>Back</StyledButton>
              <StyledButton disabled={!channelName ? true : false} onClick={() => setStep((s) => s + 1)}>
                Next
              </StyledButton>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="w-full md:w-3/4 md:pl-10">
            <h3 className="flex text-xl font-semibold mb-4 text-[#e9eeff]">
              {steps[step].label} <p className="text-xs self-center ml-2 text-gray-400">{steps[step].description}</p>
            </h3>
            <div className="rounded-lg h-[350px] text-[#edf1ff]">
              <p>
                Pogly has couple of security measures you can enable to make sure unauthorized users cannot wreak havoc
                on your stream. While these options are optional, we <b>highly</b> recommend you turn them on.
              </p>

              <div className="mt-4">
                <div className="grid">
                  <label className="select-none">
                    <input
                      type="checkbox"
                      className="mr-2"
                      defaultChecked={usePassword}
                      onChange={() => {
                        setUsePassword((u) => !u);
                        setPassword(null);
                      }}
                    />
                    Password protection
                  </label>

                  <label className="select-none">
                    <input
                      type="checkbox"
                      className="mr-2"
                      defaultChecked={useStrictMode}
                      onChange={() => setUseStrictMode((u) => !u)}
                    />
                    Enable strict mode{" "}
                    <a
                      href="https://github.com/PoglyApp/pogly-documentation/blob/main/use/strictMode.md"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-[#82a5ff]"
                    >
                      (What is this?)
                    </a>
                  </label>
                </div>

                {usePassword && (
                  <div className="mt-5">
                    <p className="text-sm text-[#aeb4d4] font-mono">Set your module password</p>
                    <input
                      type="text"
                      placeholder="Module password"
                      className="bg-[#10121a] text-[#e9eeff] font-mono p-3 rounded-md placeholder-gray-400  focus:outline-none focus:ring-2 focus:ring-[#2c2f3a] w-[300px]"
                      defaultValue={password || ""}
                      onChange={(value) => handlePassword(value.target.value)}
                    />
                  </div>
                )}

                {passwordError && (
                  <div className="flex bg-[#FF5F15] text-[#212121] border border-[#fa4f00] rounded-lg w-[520px] p-2 mt-5">
                    <TriangleAlert className="mr-2" />
                    <span>Module passwords do not support special characters at this time.</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-18 flex justify-between">
              <StyledButton onClick={() => setStep((s) => s - 1)}>Back</StyledButton>
              <StyledButton
                disabled={(usePassword && !password) || passwordError ? true : false}
                onClick={() => setStep((s) => s + 1)}
              >
                Next
              </StyledButton>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="w-full md:w-3/4 md:pl-10">
            <h3 className="flex text-xl font-semibold mb-4 text-[#e9eeff]">
              {steps[step].label} <p className="text-xs self-center ml-2 text-gray-400">{steps[step].description}</p>
            </h3>
            <div className="rounded-lg h-[350px] text-[#edf1ff]">
              <p>
                And that's it! Your module is now setup. Remember, as the owner of the module you can always change the
                configuration from the settings.
              </p>

              {legacyLogin && (
                <div className="mt-8">
                  <p>
                    Since you're using legacy login, it is <b>your responsibility</b> to keep your authentication token
                    safe. Use this button to copy your token to clipboard and save it somewhere on your computer!
                  </p>
                  <StyledButton
                    onClick={() => {
                      navigator.clipboard.writeText(localStorage.getItem("stdbToken")!);

                      setAuthButtonText("Copied!");

                      setTimeout(() => {
                        setAuthButtonText("Copy Auth Token");
                      }, 1000);
                    }}
                    className="ml-0! mt-2"
                  >
                    {copyAuthButtonText}
                  </StyledButton>
                </div>
              )}

              <div className="mt-8">
                <p>
                  To start using Pogly on your stream, you need to create a new browser source in your OBS/StreamLabs
                  and paste the Pogly overlay URL into it{" "}
                  <a
                    href="https://github.com/PoglyApp/pogly-documentation/blob/main/use/firstTimeSetup.md#obs--streamlabs-browser-source"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-[#82a5ff] Geist-light"
                  >
                    <br />
                    (How to add Pogly to your OBS/StreamLabs)
                  </a>
                </p>
                <StyledButton
                  onClick={() => {
                    navigator.clipboard.writeText(overlayURL);

                    setCopyOverlayButtonText("Copied!");

                    setTimeout(() => {
                      setCopyOverlayButtonText("Copy Overlay URL");
                    }, 1000);
                  }}
                  className="ml-0! mt-2"
                >
                  {copyOverlayButtonText}
                </StyledButton>
              </div>
            </div>

            <div className="mt-18 flex justify-between">
              <StyledButton disabled={initializing} onClick={() => setStep((s) => s - 1)}>
                Back
              </StyledButton>
              <StyledButton disabled={initializing} onClick={handleSave}>
                Finish
              </StyledButton>
            </div>
          </div>
        )}
      </div>

      {debug && (
        <div className="grid absolute mt-50 bg-[#1e212b] p-5 rounded-2xl top-220">
          <h1 className="pb-5 text-2xl">Debug box of doom</h1>
          <span>Platform: {platform}</span>
          <span>Channel name: {channelName}</span>
          <span>Password protection: {usePassword ? "true" : false}</span>
          <span>Strict mode: {useStrictMode ? "true" : false}</span>
          <span>Password: {password}</span>
        </div>
      )}
    </div>
  );
};

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
