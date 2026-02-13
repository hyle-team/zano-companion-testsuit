import { BigNumber } from "bignumber.js";
import { useCallback, useState } from "react";

export const DeepLinkTransfer = () => {
  const [link, setLink] = useState<string | null>(null);
  const call = useCallback(() => {
    const address = prompt("Whom do you send it?");
    if (!address) return;
    const assetId = prompt("What are you sending?");
    const amount = BigNumber(prompt("How many?") ?? NaN);
    const comment = prompt("Comment:") ?? undefined;
    setLink(
      `zano://transfer/?address=${address}${assetId ? `&asset_id=${assetId}` : ""}${amount.isNaN() ? "" : `&amount=${amount.toString(10)}`}${comment ? `&comment=${comment}` : ""}`,
    );
  }, []);
  return (
    <>
      <button
        onClick={() => {
          void call();
        }}
      >
        Create Transfer DeepLink
      </button>
      {link ? (
        <a href={link}>
          <button>Transfer DeepLink: {link}</button>
        </a>
      ) : null}
    </>
  );
};
