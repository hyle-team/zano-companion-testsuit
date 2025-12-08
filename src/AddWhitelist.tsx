import { useCallback, useState } from "react";
import type { ASSETS_WHITELIST_ADD_RESPONSE } from "./companion";
import { useZanoCompanion } from "./companion";
import { Group } from "./Group";
import { particlesToValue } from "./utils";

export const AddWhitelist = () => {
  const companion = useZanoCompanion();
  const [response, setResponse] = useState<ASSETS_WHITELIST_ADD_RESPONSE | string | null>(null);
  const call = useCallback(async () => {
    const asset_id = prompt("What asset do you want to add?");
    if (!asset_id) return;
    try {
      const { result } = await companion.methods.ASSETS_WHITELIST_ADD({ asset_id });
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
        Call ASSETS_WHITELIST_ADD
      </button>
      {typeof response === "string" ? (
        <Group>
          <Group.Item label="Failed to whitelist asset:" value={response} />
        </Group>
      ) : response ? (
        <>
          <Group>
            <Group.Item label="Asset ID:" value={response.asset_descriptor.asset_id} />
            <Group.Item label="Ticker:" value={response.asset_descriptor.ticker} />
            <Group.Item label="Name:" value={response.asset_descriptor.full_name} />
            <Group.Item label="Owner:" value={response.asset_descriptor.owner} />
            <Group.Item label="Meta Info:" value={response.asset_descriptor.meta_info} />
          </Group>
          <Group>
            <Group.Item label="Decimal Point:" value={String(response.asset_descriptor.decimal_point)} />
            <Group.Item
              label="Current suply:"
              value={particlesToValue(response.asset_descriptor.current_supply, response.asset_descriptor.decimal_point)}
            />
            <Group.Item
              label="Maximum suply:"
              value={particlesToValue(response.asset_descriptor.total_max_supply, response.asset_descriptor.decimal_point)}
            />
          </Group>
        </>
      ) : null}
    </>
  );
};
