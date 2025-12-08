import { useCallback, useState } from "react";
import type { GET_IONIC_SWAP_PROPOSAL_INFO_RESPONSE } from "./companion";
import { useZanoCompanion } from "./companion";
import { Group } from "./Group";
import { particlesToValue } from "./utils";

export const IonicSwapInfo = () => {
  const companion = useZanoCompanion();
  const [response, setResponse] = useState<GET_IONIC_SWAP_PROPOSAL_INFO_RESPONSE | string | null>(null);
  const call = useCallback(async () => {
    const hex_raw_proposal = prompt("What proposal you want to inspect?");
    if (!hex_raw_proposal) return;
    try {
      const response = await companion.methods.GET_IONIC_SWAP_PROPOSAL_INFO({ hex_raw_proposal });
      setResponse(response);
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
        Call GET_IONIC_SWAP_PROPOSAL_INFO
      </button>
      {typeof response === "string" ? (
        <Group>
          <Group.Item label="Failed to parse proposal:" value={response} />
        </Group>
      ) : response ? (
        <>
          <span>Received:</span>
          {response.proposal.to_finalizer?.map(({ asset_id, amount }, index) => (
            <Group key={`to_finalizer-${index}`}>
              <Group.Item label="Asset ID:" value={asset_id} />
              <Group.Item label="Amount:" value={amount.toFixed(12)} />
            </Group>
          ))}
          <span>Send:</span>
          {response.proposal.to_initiator?.map(({ asset_id, amount }, index) => (
            <Group key={`to_initiator-${index}`}>
              <Group.Item label="Asset ID:" value={asset_id} />
              <Group.Item label="Amount:" value={amount.toFixed(12)} />
            </Group>
          ))}
          <span>Additional fields:</span>
          <Group>
            <Group.Item label="Fee:" value={`${particlesToValue(response.proposal.fee_paid_by_a, 12)} ZANO`} />
          </Group>
        </>
      ) : null}
    </>
  );
};
