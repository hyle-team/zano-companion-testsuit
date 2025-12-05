import "./main.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { App } from "./App";
import { assert } from "./utils.ts";

const app = document.querySelector("#app");
assert(app, "app div not found");
createRoot(app).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
