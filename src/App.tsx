import "./app.css";

import { ZanoCompanionProvider } from "./companion";
import { Connector } from "./Connector";
import { Counter } from "./Counter";
import ZanoLogo from "./zano.svg";

export const App = () => {
  return (
    <div id="screen">
      <div id="header">
        <img src={ZanoLogo} className="logo" alt="Zano logo" />
        <span>Zano Companion Test Suits</span>
      </div>
      <div id="content">
        <ZanoCompanionProvider>
          <Counter />
          <Connector />
        </ZanoCompanionProvider>
      </div>
    </div>
  );
};
