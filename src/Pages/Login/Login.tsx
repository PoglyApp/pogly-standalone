import { useContext, useEffect, useRef, useState } from "react";
import { DebugLogger } from "../../Utility/DebugLogger";
import useStDB from "../../StDB/useStDB";
import { Guests } from "../../module_bindings";
import { SpacetimeContext } from "../../Contexts/SpacetimeContext";
import { ErrorRefreshModal } from "../../Components/Modals/ErrorRefreshModal";
import { Loading } from "../../Components/General/Loading";
import { SetSubscriptions } from "../../Utility/SetSubscriptions";
import { useLocation, useNavigate } from "react-router-dom";
import { LayoutContext } from "../../Contexts/LayoutContext";
import { ConfigContext } from "../../Contexts/ConfigContext";
import { ConnectionContainer } from "./Components/ConnectionContainer";
import { ModuleOnboarding } from "./Components/ModuleOnboarding";
import { getActiveLayout } from "../../StDB/SpacetimeDBUtils";
import { oidcEnabled } from "../../Auth/oidc";
import { useAuth } from "react-oidc-context";

export const Login = () => {
  if (!oidcEnabled) return <LoginInner oidcIdToken={undefined} oidcAuth={null} />;
  return <LoginWithOidc />;
};

const LoginWithOidc = () => {
  const auth = useAuth();
  const idToken = auth.user?.id_token;

  return <LoginInner oidcIdToken={idToken} oidcAuth={auth} />;
};

const LoginInner = ({ oidcIdToken, oidcAuth }: { oidcIdToken?: string; oidcAuth: any }) => {
  const isOverlay: Boolean = window.location.href.includes("/overlay");
  const navigate = useNavigate();

  const { connectionConfig, setConnectionConfig } = useContext(ConfigContext);
  const { setActiveLayout } = useContext(LayoutContext);
  const { spacetimeDB, setSpacetimeDB } = useContext(SpacetimeContext);

  const [stdbConnected, setStdbConnected] = useState<boolean>(false);
  const [stdbAuthenticated, setStdbAuthenticated] = useState<boolean>(false);
  const [stdbAuthTimeout, setStdbAuthTimeout] = useState<boolean>(false);
  const [stdbInitialized, setStdbInitialized] = useState<boolean>(false);
  const [stdbSubscriptions, setStdbSubscriptions] = useState<boolean>(false);

  const stdbAuthenticatedRef = useRef<boolean>(false);
  const [instanceConfigured, setInstanceConfigured] = useState<boolean>(false);
  const [nickname, setNickname] = useState<string>(localStorage.getItem("nickname") || "");

  const oidcReady = !oidcEnabled || (typeof oidcIdToken === "string" && oidcIdToken.trim().length > 0);

  const connectionConfigForStdb = oidcReady ? connectionConfig : undefined;

  const spacetime = useStDB(
    connectionConfigForStdb,
    setStdbConnected,
    setInstanceConfigured,
    setStdbAuthenticated,
    oidcReady ? oidcIdToken : undefined
  );

  const location = useLocation();
  const from = location.state?.from?.pathname;

  useEffect(() => {
    if (spacetimeDB && from) {
      navigate(from, { replace: true });
    }
  }, [spacetimeDB]);

  useEffect(() => {
    if (isOverlay) return;

    if (spacetime.TokenExpired) {
      if (!oidcEnabled) {
        localStorage.removeItem("stdb-token");
      }
      navigate("/login", { replace: true });
    }
  }, [spacetime.TokenExpired]);

  useEffect(() => {
    if (
      !connectionConfig ||
      !stdbInitialized ||
      !stdbSubscriptions ||
      !spacetime.Identity ||
      !spacetime.Client ||
      !spacetime.Runtime
    )
      return;

    DebugLogger("Setting nickname and Spacetime context");

    let preferred = "";

    if (nickname !== "") {
      preferred = nickname;
    } else {
      preferred = "Guest" + String(Math.floor(Math.random() * 100000)).padStart(5, "0");
    }

    spacetime.Client.reducers.updateGuestNickname(preferred);
    setNickname(preferred);
    localStorage.setItem("nickname", preferred);

    setActiveLayout(getActiveLayout(spacetime.Client));

    const guest = spacetime.Client.db.guests.address.find(spacetime.Client.connectionId);
    const guestWithNickname: Guests = { ...guest, nickname: preferred } as Guests;

    setSpacetimeDB({
      Client: spacetime.Client,
      Identity: guestWithNickname,
      Runtime: spacetime.Runtime,
      Config: spacetime.InstanceConfig,
      Disconnected: false,
      TokenExpired: false,
      Elements: [],
      ElementData: [],
      Guests: [],
    });

    DebugLogger("Successfully set Spacetime context");
  }, [stdbSubscriptions, stdbInitialized, spacetime.Identity, spacetime.Client, spacetime.Runtime]);

  useEffect(() => {
    DebugLogger("Setting SpacetimeDB authenticated ref");
    stdbAuthenticatedRef.current = stdbAuthenticated;
  }, [stdbAuthenticated]);

  if (oidcEnabled && !oidcReady && !isOverlay) {
    if (oidcAuth?.isLoading) return <Loading text="Loading sign-in..." loadingStuckText={true} />;

    if (oidcAuth?.error) {
      return (
        <ErrorRefreshModal
          type="button"
          buttonText="Retry Sign In"
          titleText="OIDC Error"
          contentText={oidcAuth.error.message}
          clearSettings={false}
        />
      );
    }

    return (
      <div className="w-screen h-screen bg-[#10121a] relative flex flex-col items-center justify-center overflow-hidden pb-50">
        <div className="flex flex-col items-center justify-center bg-[#1e212b] backdrop-blur-sm p-6 rounded-lg shadow-lg gap-3 w-full max-w-[500px]">
          <div className="text-center text-white">
            This Pogly instance requires OIDC sign-in before connecting.
          </div>

          <button
            className="bg-[#060606] text-white px-4 py-2 rounded-md border border-transparent hover:border-[#82a5ff]"
            onClick={() => oidcAuth?.signinRedirect()}
          >
            sign in
          </button>
        </div>
      </div>
    );
  }

  if (spacetime.TokenExpired) {
    return (
      <ErrorRefreshModal
        type="button"
        buttonText={oidcEnabled ? "Sign In" : "Reload"}
        titleText="Authentication token has expired!"
        contentText={oidcEnabled ? "Sign in again to continue." : "You need to re-authenticate through the login page."}
        clearSettings={!oidcEnabled}
        redirectBackToLogin={true}
      />
    );
  }

  if (!connectionConfig) {
    DebugLogger("Connection config not configured");
    return <ConnectionContainer setInstanceSettings={setConnectionConfig} setNickname={setNickname} />;
  }

  if (!spacetime.Client) {
    DebugLogger("Waiting for SpacetimeDB client");
    if (spacetime.Error) {
      DebugLogger("Failed to load SpacetimeDB client");
      return (
        <ErrorRefreshModal
          type="button"
          buttonText="Reload"
          titleText="Error connecting to SpacetimeDB!"
          contentText="The SpacetimeDB SDK failed to connect to the specified module & domain.
                  Please double-check you entered the module name correctly.
                  If the error persists, check your console & report to a developer."
          clearSettings={true}
        />
      );
    }
    return <Loading text="Loading SpacetimeDB" loadingStuckText={true} />;
  }

  if (!spacetime.Identity) {
    DebugLogger("Waiting for SpacetimeDB identity");
    if (spacetime.Error) {
      DebugLogger("Failed to load SpacetimeDB identity");
      return (
        <ErrorRefreshModal
          type="button"
          buttonText="Reload"
          titleText="Error receiving SpacetimeDB Identity!"
          contentText="Please try again. If this error persists, you may have to clear your LocalStorage AuthToken."
          clearSettings={true}
        />
      );
    }
    return <Loading text="Retreiving Identity" loadingStuckText={true} />;
  }

  if (!spacetime.Client.connectionId) {
    DebugLogger("Waiting for SpacetimeDB address");
    if (spacetime.Error) {
      DebugLogger("Failed to load SpacetimeDB address");
      return (
        <ErrorRefreshModal
          type="button"
          buttonText="Reload"
          titleText="Error receiving SpacetimeDB Address!"
          contentText="Please try again. If this error persists, you may have to clear your LocalStorage AuthToken."
          clearSettings={true}
        />
      );
    }
    return <Loading text="Retreiving Address" loadingStuckText={true} />;
  }

  if (!spacetime.InstanceConfig) {
    DebugLogger("Waiting for instance config");
    if (spacetime.Error) {
      DebugLogger("Failed to load instance config");
      return (
        <ErrorRefreshModal
          type="button"
          buttonText="Reload"
          titleText="Error loading Pogly configuration!"
          contentText="This happens when the standalone client is unable to access the database, or if your are having connection issues."
          clearSettings={true}
        />
      );
    }
    return <Loading text="Loading Configuration" loadingStuckText={true} />;
  }

  if (!stdbConnected) {
    DebugLogger("Waiting for SpacetimeDB connection");
    if (spacetime.Error) {
      DebugLogger("Failed to connect to Pogly instance");
      return (
        <ErrorRefreshModal
          type="button"
          buttonText="Reload"
          titleText="Error with SpacetimeDB!"
          contentText="The SpacetimeDB connection encountered an error during initialization. 
                      confirm your module name and domain settings in the connection dialog. 
                      If this error persists, check your console & report to a developer."
          clearSettings={true}
        />
      );
    }

    const alreadyLogged = spacetime.Client.db.guests.address.find(spacetime.Client.connectionId);

    if (!isOverlay && alreadyLogged) {
      DebugLogger("Guest already logged in");
      return (
        <ErrorRefreshModal
          type="button"
          buttonText="Clear Connections & Reload"
          titleText="Multiple ConnectionId's Detected"
          contentText="An error occurred and your identity is still signed in on this connectionId.
                      This is super uncommon! Take a screenshot, check your console logs and send to a developer."
          clearSettings={true}
          kickSelf={true}
          client={spacetime.Client}
        />
      );
    }

    spacetime.Client.reducers.connect();

    return <Loading text="Connecting to Instance" loadingStuckText={true} />;
  }

  if (!isOverlay && spacetime.InstanceConfig.authentication) {
    DebugLogger("Is guest authenticated");
    if (stdbAuthTimeout) {
      DebugLogger("Authentication required but authentication failed");
      return (
        <ErrorRefreshModal
          type="timer"
          refreshTimer={5}
          titleText="Authentication Required"
          contentText="You either did not provide an authentication key, or it was incorrect."
          clearSettings={true}
        />
      );
    }

    let timeout = null;

    if (!stdbAuthenticated) {
      DebugLogger("Not authenticated");
      if (spacetime.InstanceConfig.authentication) spacetime.Client.reducers.authenticate(connectionConfig.authKey);
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        setStdbAuthTimeout(!stdbAuthenticatedRef.current);
      }, 2500);

      return <Loading text="Authenticating..." />;
    }

    if (timeout) clearTimeout(timeout);
  }

  if (!stdbInitialized) {
    DebugLogger("Starting Client->Server heartbeat!");
    DebugLogger("Redoing subscriptions");
    SetSubscriptions(spacetime.Client, setStdbSubscriptions, setStdbInitialized);
  }

  if (!stdbSubscriptions) {
    DebugLogger("Waiting for subscriptions");
    return <Loading text="Loading data..." />;
  }

  if (!spacetimeDB) {
    DebugLogger("Waiting for SpacetimeDB context");
    return <Loading text="Loading Canvas" />;
  }

  if (!instanceConfigured) {
    DebugLogger("Pogly Instance is not configured");
    return <ModuleOnboarding connectionConfig={connectionConfig} spacetime={spacetime} />;
  }

  navigate("/canvas", { replace: true });

  return <></>;
};
