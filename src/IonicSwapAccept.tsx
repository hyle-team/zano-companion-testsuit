import { useCallback, useState } from "react";
import type { IONIC_SWAP_ACCEPT_RESPONSE } from "./companion";
import { useZanoCompanion } from "./companion";
import { Group } from "./Group";

export const IonicSwapAccept = () => {
  const companion = useZanoCompanion();
  const [response, setResponse] = useState<IONIC_SWAP_ACCEPT_RESPONSE | string | null>(null);
  const call = useCallback(async () => {
    const hex_raw_proposal = prompt("What proposal you want to accept?");
    if (!hex_raw_proposal) return;
    try {
      const { result } = await companion.methods.IONIC_SWAP_ACCEPT({ hex_raw_proposal });
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
        Call IONIC_SWAP_ACCEPT
      </button>
      {typeof response === "string" ? (
        <Group>
          <Group.Item label="Failed to accept proposal:" value={response} />
        </Group>
      ) : response ? (
        <Group>
          <Group.Item label="Tx ID:" value={response.result_tx_id} />
        </Group>
      ) : null}
    </>
  );
};
