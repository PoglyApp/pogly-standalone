import ReactDOM from "react-dom/client";
import { App } from "./App";
import "./index.css";

import { Provider } from "react-redux";
import { store } from "./Store/Features/store";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <Provider store={store}>
    <App />
  </Provider>
);
