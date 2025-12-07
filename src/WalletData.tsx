import { useCallback, useRef, useState, useSyncExternalStore } from "react";
import type { GET_WALLET_DATA_RESPONSE } from "./companion";
import { useZanoCompanion } from "./companion";
import { Group } from "./Group";

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
    <Group>
      {walletData?.alias ? <Group.Item label="Alias:" value={`@${walletData.alias}`} /> : null}
      <Group.Item label="Balance:" value={`${walletData?.balance} ZANO`} />
    </Group>
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
