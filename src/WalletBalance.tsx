import BigNumber from "bignumber.js";
import { useCallback, useRef, useState, useSyncExternalStore } from "react";
import type { GET_WALLET_BALANCE_RESPONSE } from "./companion";
import { useZanoCompanion } from "./companion";
import { Group } from "./Group";

const WalletBalanceWatcher = () => {
  const companion = useZanoCompanion();
  const snapshot = useRef<GET_WALLET_BALANCE_RESPONSE | null>(null);
  const response = useSyncExternalStore(
    useCallback(
      (listener) => {
        const interval = setInterval(async () => {
          const { result } = await companion.methods.GET_WALLET_BALANCE();
          snapshot.current = result;
          listener();
        }, 3000);
        return () => clearInterval(interval);
      },
      [companion.methods],
    ),
    () => snapshot.current,
  );
  const particlesToValue = (amount: BigNumber.Value, decimal_point: number) => {
    const multiplier = BigNumber(10).pow(decimal_point);
    return BigNumber(amount).div(multiplier).toFixed(decimal_point);
  };
  return (
    <>
      <Group>
        <Group.Item label="Balance:" value={`${particlesToValue(response?.balance ?? 0, 12)} ZANO`} />
        <Group.Item label="Unlocked Balance:" value={`${particlesToValue(response?.unlocked_balance ?? 0, 12)} ZANO`} />
      </Group>
      <Group>
        {response?.balances.map((balance) => (
          <Group.Item
            key={balance.asset_info.asset_id}
            label=""
            value={`${particlesToValue(balance.total, balance.asset_info.decimal_point)} ${balance.asset_info.ticker}`}
          />
        ))}
      </Group>
    </>
  );
};
export const WalletBalance = () => {
  const [watching, setWatching] = useState(false);
  return (
    <>
      <button onClick={() => setWatching((current) => !current)}>
        {watching ? "Ignore GET_WALLET_BALANCE" : "Start watching GET_WALLET_BALANCE"}
      </button>
      {watching ? <WalletBalanceWatcher /> : null}
    </>
  );
};
