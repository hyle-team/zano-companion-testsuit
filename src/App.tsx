import "./app.css";

import { AliasDetails } from "./AliasDetails";
import { ZanoCompanionProvider } from "./companion";
import { Connector } from "./Connector";
import { CreateAlias } from "./CreateAlias";
import { Credentials } from "./Credentials";
import { DeepLinkTransfer } from "./DeepLinkTransfer";
import { DeepLinkTransferLegacy } from "./DeepLinkTransferLegacy";
import { IonicSwap } from "./IonicSwap";
import { IonicSwapAccept } from "./IonicSwapAccept";
import { IonicSwapInfo } from "./IonicSwapInfo";
import { MultiTransfer } from "./MultiTransfer";
import { RequestSign } from "./RequestSign";
import { Transfer } from "./Transfer";
import { WalletBalance } from "./WalletBalance";
import { WalletData } from "./WalletData";
import { Whitelist } from "./Whitelist";
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
          <div>Links</div>
          <DeepLinkTransfer />
          <DeepLinkTransferLegacy />
          <div>Companion status</div>
          <Connector />
          <Credentials />
          <WalletBalance />
          <WalletData />
          <Whitelist />
          <div>Companion methods</div>
          <IonicSwap />
          <IonicSwapAccept />
          <IonicSwapInfo />
          <Transfer />
          <MultiTransfer />
          <RequestSign />
          <AliasDetails />
          <CreateAlias />
        </ZanoCompanionProvider>
      </div>
    </div>
  );
};
