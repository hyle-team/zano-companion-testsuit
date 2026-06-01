import { useCallback, useState } from "react";
import { useZanoCompanion, type ZanoCompanionPermissionName, type ZanoCompanionPermissionStatus } from "./companion";

export const Permission = ({ label, types }: { label: string; types: ZanoCompanionPermissionName[] }) => {
  const companion = useZanoCompanion();
  const [status, setStatus] = useState<ZanoCompanionPermissionStatus | "error">("unknown");
  const requestPermission = useCallback(async () => {
    try {
      await companion.methods.REQUEST_ACCESS({ permissions: types.map((type) => ({ type })) });
      setStatus("granted");
    } catch (error) {
      if (error instanceof Error && error.message === "User rejected the access request") {
        setStatus("rejected");
      } else {
        console.error("Failed to request permission access:", error);
        setStatus("error");
      }
    }
  }, [companion.methods, types]);
  return (
    <button
      onClick={() => {
        void requestPermission();
      }}
    >
      {label}: {status}
    </button>
  );
};
