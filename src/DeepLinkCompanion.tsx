import { useCallback, useState } from "react";

export const DeepLinkCompanion = () => {
  const [link, setLink] = useState<string | null>(null);
  const call = useCallback(() => {
    const link = prompt("What link are you trying to open?");
    if (!link) return;
    setLink(`zano://companion/?link=${encodeURI(link)}`);
  }, []);
  return (
    <>
      <button
        onClick={() => {
          void call();
        }}
      >
        Create Zano Companion DeepLink
      </button>
      {link ? (
        <a href={link}>
          <button>Companion DeepLink: {link}</button>
        </a>
      ) : null}
    </>
  );
};
