import BigNumber from "bignumber.js";
import { useCallback, useRef, useState, useSyncExternalStore } from "react";
import type { GET_WALLET_BALANCE_RESPONSE } from "./companion";
import { useZanoCompanion } from "./companion";

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
        }, 1000);
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
      <div className="group">
        <div className="group-item">
          <span className="label">Balance:</span>
          <span className="value">{particlesToValue(response?.balance ?? 0, 12)} ZANO</span>
        </div>
        <div className="group-item">
          <span className="label">Unlocked Balance:</span>
          <span className="value">{particlesToValue(response?.unlocked_balance ?? 0, 12)} ZANO</span>
        </div>
      </div>
      <div className="group">
        {response?.balances.map((balance) => (
          <div key={balance.asset_info.asset_id} className="group-item">
            <span className="label"></span>
            <span className="value">
              {particlesToValue(balance.total, balance.asset_info.decimal_point)} {balance.asset_info.ticker}
            </span>
          </div>
        ))}
      </div>
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
