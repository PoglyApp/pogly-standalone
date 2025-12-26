import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "react-oidc-context";
import { oidcEnabled } from "../../Auth/oidc";
import { Loading } from "../../Components/General/Loading";

const OidcCallbackInner = () => {
  const auth = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (auth.isLoading) return;
    if (auth.error) return;
    if (auth.isAuthenticated) navigate("/login", { replace: true });
  }, [auth.isLoading, auth.error, auth.isAuthenticated, navigate]);

  if (auth.isLoading) return <Loading text="Signing in..." loadingStuckText={true} />;
  if (auth.error) return <div>OIDC error: {auth.error.message}</div>;

  return <Loading text="Finishing sign-in..." loadingStuckText={true} />;
};

export const Callback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!oidcEnabled) navigate("/login", { replace: true });
  }, [navigate]);

  if (!oidcEnabled) return null;
  return <OidcCallbackInner />;
};