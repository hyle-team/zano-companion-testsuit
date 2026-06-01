import { useCallback, useState } from "react";
import { useZanoCompanion, type ZanoCompanionPermissionName, type ZanoCompanionPermissionStatus } from "./companion";

export const Permission = ({ type }: { type: ZanoCompanionPermissionName }) => {
  const companion = useZanoCompanion();
  const [status, setStatus] = useState<ZanoCompanionPermissionStatus | "error">("unknown");
  const requestPermission = useCallback(async () => {
    try {
      await companion.methods.REQUEST_ACCESS({ permissions: [{ type }] });
      setStatus("granted");
    } catch (error) {
      if (error instanceof Error && error.message === "User rejected the access request") {
        setStatus("rejected");
      } else {
        console.error("Failed to request permission access:", error);
        setStatus("error");
      }
    }
  }, [companion.methods, type]);
  return (
    <button
      onClick={() => {
        void requestPermission();
      }}
    >
      general: {status}
    </button>
  );
};
