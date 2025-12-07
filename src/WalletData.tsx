import { useCallback, useRef, useState, useSyncExternalStore } from "react";
import type { GET_WALLET_DATA_RESPONSE } from "./companion";
import { useZanoCompanion } from "./companion";

const WalletDataWatcher = () => {
  const companion = useZanoCompanion();
  const snapshot = useRef<GET_WALLET_DATA_RESPONSE | null>(null);
  const walletData = useSyncExternalStore(
    useCallback(
      (listener) => {
        const interval = setInterval(async () => {
          snapshot.current = await companion.methods.GET_WALLET_DATA();
          listener();
        }, 1000);
        return () => clearInterval(interval);
      },
      [companion.methods],
    ),
    () => snapshot.current,
  );
  return (
    <div className="group">
      {walletData?.alias ? (
        <div className="group-item">
          <span className="lable">Alias:</span>
          <span className="value">@{walletData.alias}</span>
        </div>
      ) : null}
      <div className="group-item">
        <span className="lable">Balance:</span>
        <span className="value">{walletData?.balance} ZANO</span>
      </div>
    </div>
  );
};
export const WalletData = () => {
  const [watching, setWatching] = useState(false);
  return (
    <>
      <button onClick={() => setWatching((current) => !current)}>{watching ? "Ignore wallet data" : "Start watching wallet data"}</button>
      {watching ? <WalletDataWatcher /> : null}
    </>
  );
};
