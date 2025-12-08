import { BigNumber } from "bignumber.js";
import { useCallback, useState } from "react";
import type { IONIC_SWAP_RESPONSE } from "./companion";
import { useZanoCompanion } from "./companion";
import { Group } from "./Group";

export const IonicSwap = () => {
  const companion = useZanoCompanion();
  const [response, setResponse] = useState<IONIC_SWAP_RESPONSE | string | null>(null);
  const call = useCallback(async () => {
    const destinationAddress = prompt("With whom do you swaping?");
    if (!destinationAddress) return;
    const currentAssetID = prompt("What asset are you sending?");
    if (!currentAssetID) return;
    const currentAssetAmount = BigNumber(prompt("And how many are you sending?") ?? 0);
    if (currentAssetAmount.isNaN()) return;
    const destinationAssetID = prompt("What asset are you receiving?");
    if (!destinationAssetID) return;
    const destinationAssetAmount = BigNumber(prompt("And how many are you receiving?") ?? 0);
    if (destinationAssetAmount.isNaN()) return;
    try {
      const { result } = await companion.methods.IONIC_SWAP({
        currentAssetID,
        currentAssetAmount: currentAssetAmount.toFixed(12),
        destinationAssetID,
        destinationAssetAmount: destinationAssetAmount.toFixed(12),
        destinationAddress,
      });
      setResponse(result);
    } catch (reason) {
      setResponse(reason instanceof Error ? reason.message : String(reason));
    }
  }, [companion.methods]);
  return (
    <>
      <button
        onClick={() => {
          void call();
        }}
      >
        Call IONIC_SWAP
      </button>
      {typeof response === "string" ? (
        <Group>
          <Group.Item label="Failed to create proposal:" value={response} />
        </Group>
      ) : response ? (
        <Group>
          <Group.Item label="Proposal:" value={response.hex_raw_proposal} />
        </Group>
      ) : null}
    </>
  );
};
