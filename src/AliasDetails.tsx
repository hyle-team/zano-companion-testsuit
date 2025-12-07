import { useCallback, useState } from "react";
import type { GET_ALIAS_DETAILS_RESPONSE } from "./companion";
import { useZanoCompanion } from "./companion";

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
        <div className="group">
          <div className="group-item">
            <span className="label">Failed to find alias:</span>
            <span className="value">{details}</span>
          </div>
        </div>
      ) : details ? (
        <div className="group">
          <div className="group-item">
            <span className="label">Address:</span>
            <span className="value">{details.address}</span>
          </div>
          {details.comment !== undefined ? (
            <div className="group-item">
              <span className="label">Comment:</span>
              <span className="value">{details.comment}</span>
            </div>
          ) : null}
          {details.tracking_key !== undefined ? (
            <div className="group-item">
              <span className="label">Tracking key:</span>
              <span className="value">{details.tracking_key}</span>
            </div>
          ) : null}
        </div>
      ) : null}
    </>
  );
};
