import { useAuth } from "react-oidc-context";
import { Navigate, useLocation } from "react-router-dom";

export const Callback = () => {
  const auth = useAuth();

  if (auth.isLoading) return <p>Finishing login…</p>;
  if (auth.error)     return <p>Login failed: {String(auth.error)}</p>;
  if (auth.isAuthenticated) return <Navigate to="/login" replace />;

  return <p>Processing…</p>;
};
