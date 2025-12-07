import { useCallback, useState } from "react";
import type { GET_ALIAS_DETAILS_RESPONSE } from "./companion";
import { useZanoCompanion } from "./companion";
import { Group } from "./Group";

export const AliasDetails = () => {
  const companion = useZanoCompanion();
  const [details, setDetails] = useState<GET_ALIAS_DETAILS_RESPONSE | string | null>(null);
  const fetchDetails = useCallback(async () => {
    let alias = prompt("What alias are you searching for?");
    if (!alias) return;
    if (alias.startsWith("@")) alias = alias.substring(1);
    try {
      setDetails(await companion.methods.GET_ALIAS_DETAILS({ alias }));
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
        Call GET_ALIAS_DETAILS
      </button>
      {typeof details === "string" ? (
        <Group>
          <Group.Item label="Failed to find alias:" value={details} />
        </Group>
      ) : details ? (
        <Group>
          <Group.Item label="Address:" value={details.address} />
          {details.comment !== undefined ? <Group.Item label="Comment:" value={details.comment} /> : null}
          {details.tracking_key !== undefined ? <Group.Item label="Tracking key:" value={details.tracking_key} /> : null}
        </Group>
      ) : null}
    </>
  );
};
