import { useCallback, useState } from "react";
import type { CREATE_ALIAS_RESPONSE } from "./companion";
import { useZanoCompanion } from "./companion";
import { Group } from "./Group";

export const CreateAlias = () => {
  const companion = useZanoCompanion();
  const [response, setResponse] = useState<CREATE_ALIAS_RESPONSE | string | null>(null);
  const call = useCallback(async () => {
    let alias = prompt("What alias do you want to create?");
    if (!alias) return;
    if (alias.startsWith("@")) alias = alias.substring(1);
    const comment = prompt("Comment:") ?? undefined;
    try {
      const { result } = await companion.methods.CREATE_ALIAS({ alias, comment });
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
        Call CREATE_ALIAS
      </button>
      {typeof response === "string" ? (
        <Group>
          <Group.Item label="Failed to create alias:" value={response} />
        </Group>
      ) : response ? (
        <>
          <Group>
            <Group.Item label="Tx ID:" value={response.tx_id} />
          </Group>
        </>
      ) : null}
    </>
  );
};
