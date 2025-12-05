import { useZanoCompanionConnect } from "./companion";

export const Connector = () => {
  const [state, connect, disconnect] = useZanoCompanionConnect();
  return (
    <button onClick={state === "idle" ? connect : state === "connected" ? disconnect : undefined} disabled={state === "pending"}>
      connection state: {state}
    </button>
  );
};
