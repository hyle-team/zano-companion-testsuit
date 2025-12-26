import { useCallback, useState } from "react";

export const DeepLinkTransferLegacy = () => {
  const [link, setLink] = useState<string | null>(null);
  const call = useCallback(() => {
    const address = prompt("Whom do you send it?");
    if (!address) return;
    const assetId = prompt("What are you sending?");
    const amount = BigNumber(prompt("How many?") ?? NaN);
    const comment = prompt("Comment:") ?? undefined;
    setLink(
      `zano:action=send&address=${address}${assetId ? `&asset_id=${assetId}` : ""}${amount.isNaN() ? "" : `&amount=${amount.toString(10)}`}${comment ? `&comment=${comment}` : ""}`,
    );
  }, []);
  return (
    <>
      <button
        onClick={() => {
          void call();
        }}
      >
        Create Legacy Transfer DeepLink
      </button>
      {link ? (
        <a href={link}>
          <button>Legacy Transfer DeepLink</button>
        </a>
      ) : null}
    </>
  );
};
