import ReactDOM from "react-dom/client";
import { App } from "./App";
import "./index.css";
import "unfonts.css";
import { Provider } from "react-redux";
import { store } from "./Store/Features/store";
import { AuthProvider } from "react-oidc-context";
import { oidcConfig, oidcEnabled, onSigninCallback } from "./Auth/oidc";

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

root.render(
  <Provider store={store}>
    {oidcEnabled ? (
      <AuthProvider {...oidcConfig} onSigninCallback={onSigninCallback}>
        <App />
      </AuthProvider>
    ) : (
      <App />
    )}
  </Provider>
);