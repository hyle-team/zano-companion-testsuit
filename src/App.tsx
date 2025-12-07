import { AliasDetails } from "./AliasDetails";
import "./app.css";

import { ZanoCompanionProvider } from "./companion";
import { Connector } from "./Connector";
import { Credentials } from "./Credentials";
import { RequestSign } from "./RequestSign";
import { WalletBalance } from "./WalletBalance";
import { WalletData } from "./WalletData";
import ZanoLogo from "./zano.svg";

export const App = () => {
  return (
    <div id="screen">
      <div id="header">
        <img src={ZanoLogo} className="logo" alt="Zano logo" />
        <span>ZanoCompanion Test Suits</span>
      </div>
      <div id="content">
        <ZanoCompanionProvider disableServerRequest verbose>
          <Connector />
          <Credentials />
          <WalletBalance />
          <WalletData />
          {/* IONIC_SWAP */}
          {/* IONIC_SWAP_ACCEPT */}
          {/* GET_IONIC_SWAP_PROPOSAL_INFO */}
          {/* TRANSFER */}
          <RequestSign />
          {/* GET_WHITELIST */}
          {/* ASSETS_WHITELIST_ADD */}
          <AliasDetails />
          {/* CREATE_ALIAS */}
        </ZanoCompanionProvider>
      </div>
    </div>
  );
};
