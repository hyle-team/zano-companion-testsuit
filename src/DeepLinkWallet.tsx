import { useCallback, useState } from "react";

export const DeepLinkWallet = () => {
  const [link, setLink] = useState<string | null>(null);
  const call = useCallback(() => {
    const walletName = prompt("What wallet are you trying to open?");
    if (!walletName) return;
    setLink(`zano://wallet/${encodeURIComponent(walletName)}`);
  }, []);
  return (
    <>
      <button
        onClick={() => {
          void call();
        }}
      >
        Create Wallet DeepLink
      </button>
      {link ? (
        <a href={link}>
          <button>Wallet DeepLink: {link}</button>
        </a>
      ) : null}
    </>
  );
};
