import { BigNumber } from "bignumber.js";
import { useCallback, useState } from "react";
import type { TRANSFER_RESPONSE } from "./companion";
import { useZanoCompanion } from "./companion";
import { Group } from "./Group";

export const Transfer = () => {
  const companion = useZanoCompanion();
  const [response, setResponse] = useState<TRANSFER_RESPONSE | string | null>(null);
  const call = useCallback(async () => {
    const destination = prompt("Whom do you send it?");
    if (!destination) return;
    const assetId = prompt("What are you sending?");
    if (!assetId) return;
    const amount = BigNumber(prompt("How many?") ?? NaN);
    if (amount.isNaN()) return;
    const comment = prompt("Comment:");
    if (!comment) return;
    try {
      const { result } = await companion.methods.TRANSFER({ assetId, amount: amount.toFixed(12), destination, comment });
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
        Call TRANSFER
      </button>
      {typeof response === "string" ? (
        <Group>
          <Group.Item label="Failed to transfer:" value={response} />
        </Group>
      ) : response ? (
        <Group></Group>
      ) : null}
    </>
  );
};
