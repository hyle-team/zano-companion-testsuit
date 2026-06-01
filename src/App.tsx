import "./app.css";

import { AliasDetails } from "./AliasDetails";
import { ZanoCompanionProvider } from "./companion";
import { Connector } from "./Connector";
import { CreateAlias } from "./CreateAlias";
import { Credentials } from "./Credentials";
import { DeepLinkCompanion } from "./DeepLinkCompanion";
import { DeepLinkTransfer } from "./DeepLinkTransfer";
import { DeepLinkWallet } from "./DeepLinkWallet";
import { IonicSwap } from "./IonicSwap";
import { IonicSwapAccept } from "./IonicSwapAccept";
import { IonicSwapInfo } from "./IonicSwapInfo";
import { MultiTransfer } from "./MultiTransfer";
import { Permission } from "./Permission";
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
          <DeepLinkCompanion />
          <DeepLinkWallet />
          <div>Permissions</div>
          <Permission label="general" types={["general"]} />
          <Permission label="balance" types={["balance"]} />
          <Permission label="history" types={["history"]} />
          <Permission label="all" types={["general", "balance", "history"]} />
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
