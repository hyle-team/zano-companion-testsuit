import { BigNumber } from "bignumber.js";
import { useCallback, useState } from "react";
import type { TRANSFER_RESPONSE } from "./companion";
import { useZanoCompanion } from "./companion";
import { Group } from "./Group";

export const MultiTransfer = () => {
  const companion = useZanoCompanion();
  const [response, setResponse] = useState<TRANSFER_RESPONSE | string | null>(null);
  const call = useCallback(async () => {
    const destinations: { address: string; amount: string; assetId?: string }[] = [];
    do {
      const destination = prompt("Whom do you send it?");
      if (!destination) return;
      const assetId = prompt("What are you sending?");
      if (!assetId) return;
      const amount = BigNumber(prompt("How many?") ?? NaN);
      if (amount.isNaN()) return;
      destinations.push({ address: destination, assetId, amount: amount.toFixed(12) });
    } while (confirm("Do you want to add more receipient?"));
    const comment = prompt("Comment:") ?? undefined;
    try {
      const { result } = await companion.methods.TRANSFER({ destinations, comment });
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
        Call multidestinational TRANSFER
      </button>
      {typeof response === "string" ? (
        <Group>
          <Group.Item label="Failed to transfer:" value={response} />
        </Group>
      ) : response ? (
        <Group>
          <Group.Item label="Hash:" value={response.tx_hash} />
          <Group.Item label="Size:" value={String(response.tx_size)} />
          <Group.Item label="Unsigned hex:" value={response.tx_unsigned_hex} />
        </Group>
      ) : null}
    </>
  );
};
