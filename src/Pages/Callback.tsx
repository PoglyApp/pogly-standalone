import { useEffect } from "react";


export const Callback = () => {
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get("access_token");
    const idToken = hashParams.get("id_token");

    if (accessToken && idToken) {
      localStorage.setItem("twitchAccessToken", accessToken);
      localStorage.setItem("twitchIdToken", idToken);
      window.location.href = "/";
    } else {
      console.error("No access token found in URL");
    }
  }, []);

  return (<p>Processing login...</p>);
}
