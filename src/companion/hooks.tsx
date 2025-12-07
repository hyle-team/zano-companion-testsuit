import { createContext, useCallback, useContext, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { assert } from "../utils";
import { ZanoCompanion, type ZanoCompanionParams } from "./companion";

export const useZanoCompanionInstance = ({ onConnectStart, onConnectEnd, onLocalConnectEnd, ...params }: ZanoCompanionParams = {}) => {
  const onConnectStartRef = useRef(onConnectStart);
  onConnectStartRef.current = onConnectStart;
  const onConnectEndRef = useRef(onConnectEnd);
  onConnectEndRef.current = onConnectEnd;
  const onLocalConnectEndRef = useRef(onLocalConnectEnd);
  onLocalConnectEndRef.current = onLocalConnectEnd;

  const instance = useRef<ZanoCompanion | null>(null);
  if (!instance.current) {
    instance.current = new ZanoCompanion({
      ...params,
      onConnectStart: (...params) => onConnectStartRef.current?.(...params),
      onConnectEnd: (...params) => onConnectEndRef.current?.(...params),
      onLocalConnectEnd: (...params) => onLocalConnectEndRef.current?.(...params),
    });
  }

  return instance.current;
};

const ZanoCompanionContext = createContext<ZanoCompanion | undefined>(undefined);
export const ZanoCompanionProvider = ({ children, ...params }: { children?: ReactNode } & ZanoCompanionParams) => {
  const companion = useZanoCompanionInstance(params);
  return <ZanoCompanionContext.Provider value={companion}>{children}</ZanoCompanionContext.Provider>;
};
export const useZanoCompanion = (companion?: ZanoCompanion) => {
  const context = useContext(ZanoCompanionContext);
  if (!companion) companion = context;
  assert(companion, "component must be wrapped in <ZanoCompanionProvider />");
  return companion;
};

export const useZanoCompanionCredentials = (companion?: ZanoCompanion) => {
  companion = useZanoCompanion(companion);
  const credentials = useSyncExternalStore(
    useCallback((listener) => companion.credentials.addListener(listener), [companion.credentials]),
    () => companion.credentials.get(),
  );
  return credentials;
};

export const useZanoCompanionConnect = (companion?: ZanoCompanion) => {
  companion = useZanoCompanion(companion);
  const [status, setStatus] = useState<"disconnected" | "pending" | "connected">("disconnected");
  const statusRef = useRef(status);
  statusRef.current = status;

  const connect = useCallback(() => {
    if (statusRef.current === "pending") throw new Error("Companion is connecting");
    const controller = new AbortController();
    setStatus("pending");
    void companion.connect(controller.signal).then(
      () => setStatus("connected"),
      () => {
        setStatus("disconnected");
        companion.credentials.clear();
      },
    );
    return () => controller.abort();
  }, [companion]);
  const disconnect = useCallback(() => {
    if (statusRef.current === "pending") throw new Error("Companion is connecting");
    setStatus("disconnected");
    companion.credentials.clear();
  }, [companion.credentials]);
  useEffect(
    () =>
      companion.credentials.addListener((next) => {
        if (!next && statusRef.current === "connected") {
          setStatus("disconnected");
        }
      }),
    [companion.credentials],
  );

  return [status, connect, disconnect] as const;
};

export const useZanoCompanionConnectEffect = (companion?: ZanoCompanion) => {
  const [state, connect, disconnect] = useZanoCompanionConnect(companion);
  const credentials = useZanoCompanionCredentials(companion);
  useEffect(() => {
    const abort = connect();
    return () => {
      abort();
      disconnect();
    };
  }, [connect, disconnect]);
  return [state, credentials] as const;
};
