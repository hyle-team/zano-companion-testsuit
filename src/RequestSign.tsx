import { useCallback, useState } from "react";
import type { REQUEST_MESSAGE_SIGN_RESPONSE } from "./companion";
import { useZanoCompanion } from "./companion";
import { Group } from "./Group";

export const RequestSign = () => {
  const companion = useZanoCompanion();
  const [details, setDetails] = useState<REQUEST_MESSAGE_SIGN_RESPONSE | string | null>(null);
  const fetchDetails = useCallback(async () => {
    const message = prompt("What message are you trying to sign?");
    if (!message) return;
    try {
      const { result } = await companion.methods.REQUEST_MESSAGE_SIGN({ message });
      setDetails(result);
    } catch (reason) {
      setDetails(reason instanceof Error ? reason.message : String(reason));
    }
  }, [companion.methods]);
  return (
    <>
      <button
        onClick={() => {
          void fetchDetails();
        }}
      >
        Call REQUEST_MESSAGE_SIGN
      </button>
      {typeof details === "string" ? (
        <Group>
          <Group.Item label="Failed to sign:" value={details} />
        </Group>
      ) : details ? (
        <Group>
          <Group.Item label="Signature:" value={details.sig} />
          <Group.Item label="Key:" value={details.pkey} />
        </Group>
      ) : null}
    </>
  );
};
