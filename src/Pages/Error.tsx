import "./Error.css";
import { isRouteErrorResponse, useRouteError } from "react-router-dom";

export const Error: React.FC = () => {
    const error: any = useRouteError();

    function errorMessage(error: any): string {
        if (isRouteErrorResponse(error)) {
            return `${error.status} ${error.statusText}

            ${error.error?.message}

            ${error.error?.stack}`
        } else if (typeof error === 'string') {
            return error
        } else {
            return `${error.message}

            ${error.stack}`
        }
    }

    return (
        <>
            <div className="card">
                <div className="content">
                    <div className="title-holder">
                        <h1>
                            <img src="./assets/notlikethis.png" />
                            <pre className="error"><code>{errorMessage(error)}</code></pre>
                            <p>Report this in our <a className="glow" href="https://discord.gg/pogly">Discord</a>!</p>
                        </h1>
                    </div>
                </div>
            </div>
        </>
        
    );
  };