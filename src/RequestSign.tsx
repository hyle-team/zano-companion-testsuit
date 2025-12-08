import { useCallback, useState } from "react";
import type { REQUEST_MESSAGE_SIGN_RESPONSE } from "./companion";
import { useZanoCompanion } from "./companion";
import { Group } from "./Group";

export const RequestSign = () => {
  const companion = useZanoCompanion();
  const [response, setResponse] = useState<REQUEST_MESSAGE_SIGN_RESPONSE | string | null>(null);
  const call = useCallback(async () => {
    const message = prompt("What message are you trying to sign?");
    if (!message) return;
    try {
      const { result } = await companion.methods.REQUEST_MESSAGE_SIGN({ message });
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
        Call REQUEST_MESSAGE_SIGN
      </button>
      {typeof response === "string" ? (
        <Group>
          <Group.Item label="Failed to sign:" value={response} />
        </Group>
      ) : response ? (
        <Group>
          <Group.Item label="Signature:" value={response.sig} />
          <Group.Item label="Key:" value={response.pkey} />
        </Group>
      ) : null}
    </>
  );
};
