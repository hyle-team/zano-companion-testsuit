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
          <span className="label">Alias:</span>
          <span className="value">@{walletData.alias}</span>
        </div>
      ) : null}
      <div className="group-item">
        <span className="label">Balance:</span>
        <span className="value">{walletData?.balance} ZANO</span>
      </div>
    </div>
  );
};
export const WalletData = () => {
  const [watching, setWatching] = useState(false);
  return (
    <>
      <button onClick={() => setWatching((current) => !current)}>{watching ? "Ignore GET_WALLET_DATA" : "Start watching GET_WALLET_DATA"}</button>
      {watching ? <WalletDataWatcher /> : null}
    </>
  );
};
