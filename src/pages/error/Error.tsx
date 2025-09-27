import "./Error.css";
import { isRouteErrorResponse, useLocation, useRouteError } from "react-router-dom";

export const Error: React.FC = () => {
  const location = useLocation();
  const isOverlay: Boolean = window.location.href.includes("/overlay");
  const error: any = useRouteError();

  function errorMessage(e: any): string {
    if (isRouteErrorResponse(error)) {
      return `${error.status} ${error.statusText}

            ${e.error?.message}
            
            ${e.error?.stack}`;
    } else if (typeof error === "string") {
      return error;
    } else {
      return `${error.message}

            ${error.stack}`;
    }
  }

  if (isOverlay) return <></>;

  return (
    <>
      <div className="card">
        <div className="content">
          <div className="title-holder">
            <h1>
              <img src="./assets/notlikethis.png" alt="notlikethis" />
              <pre className="error">
                <code>{errorMessage(error)}</code>
              </pre>
              <p>
                {location.pathname}
                <br />
                Report this in our{" "}
                <a className="glow" href="https://discord.gg/pogly">
                  Discord
                </a>
                !
              </p>
            </h1>
          </div>
        </div>
      </div>
    </>
  );
};
