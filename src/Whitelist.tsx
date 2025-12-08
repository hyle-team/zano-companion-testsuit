import { useCallback, useRef, useState, useSyncExternalStore } from "react";
import { useZanoCompanion, type GET_WHITELIST_RESPONSE } from "./companion";
import { Group } from "./Group";

const WhitelistWatcher = () => {
  const companion = useZanoCompanion();
  const snapshot = useRef<GET_WHITELIST_RESPONSE | null>(null);
  const response = useSyncExternalStore(
    useCallback(
      (listener) => {
        const interval = setInterval(async () => {
          snapshot.current = await companion.methods.GET_WHITELIST();
          listener();
        }, 3000);
        return () => clearInterval(interval);
      },
      [companion.methods],
    ),
    () => snapshot.current,
  );
  return (
    <Group>
      {response?.map((asset) => (
        <Group.Item key={asset.asset_id} label={asset.ticker} value="" />
      ))}
    </Group>
  );
};
export const Whitelist = () => {
  const [watching, setWatching] = useState(false);
  return (
    <>
      <button onClick={() => setWatching((current) => !current)}>{watching ? "Ignore GET_WHITELIST" : "Start watching GET_WHITELIST"}</button>
      {watching ? <WhitelistWatcher /> : null}
    </>
  );
};
