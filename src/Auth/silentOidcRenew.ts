import { UserManager } from "oidc-client-ts";
import { oidcConfig } from "./oidc";

const mgr = new UserManager(oidcConfig);
void mgr.signinSilentCallback();