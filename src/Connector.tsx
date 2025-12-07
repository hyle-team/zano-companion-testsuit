import { useZanoCompanionConnect } from "./companion";

export const Connector = () => {
  const [status, connect, disconnect] = useZanoCompanionConnect();
  return (
    <button onClick={status === "disconnected" ? connect : status === "connected" ? disconnect : undefined} disabled={status === "pending"}>
      connection state: {status}
    </button>
  );
};
