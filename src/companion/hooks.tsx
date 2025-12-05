import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
  type SetStateAction,
} from "react";
import { assert } from "../utils";
import { ZanoCompanion, type ZanoCompanionParams } from "./companion";
import type { IZanoCredentials } from "./credentials";

export const useZanoCompanionInstance = ({
  onConnectStart,
  onConnectEnd,
  onConnectError,
  onLocalConnectEnd,
  ...params
}: ZanoCompanionParams = {}) => {
  const onConnectStartRef = useRef(onConnectStart);
  onConnectStartRef.current = onConnectStart;
  const onConnectEndRef = useRef(onConnectEnd);
  onConnectEndRef.current = onConnectEnd;
  const onConnectErrorRef = useRef(onConnectError);
  onConnectErrorRef.current = onConnectError;
  const onLocalConnectEndRef = useRef(onLocalConnectEnd);
  onLocalConnectEndRef.current = onLocalConnectEnd;

  const instance = useRef<ZanoCompanion | null>(null);
  if (!instance.current) {
    instance.current = new ZanoCompanion({
      ...params,
      onConnectStart: (...params) => onConnectStartRef.current?.(...params),
      onConnectEnd: (...params) => onConnectEndRef.current?.(...params),
      onConnectError: (...params) => onConnectErrorRef.current?.(...params),
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
  const setCredentials = useCallback(
    (action: SetStateAction<IZanoCredentials | null>) => {
      let next: IZanoCredentials | null;
      if (typeof action === "function") next = action(companion.credentials.get());
      else next = action;
      companion.credentials.set(next);
    },
    [companion.credentials],
  );
  return [credentials, setCredentials] as const;
};

export const useZanoCompanionConnect = (companion?: ZanoCompanion) => {
  companion = useZanoCompanion(companion);
  const [credentials, setCredentials] = useZanoCompanionCredentials(companion);
  const [pending, setPending] = useState(false);
  const pendingRef = useRef(pending);
  pendingRef.current = pending;
  const connect = useCallback(() => {
    if (pendingRef.current) throw new Error("Companion is connecting");
    const controller = new AbortController();
    setPending(true);
    void companion.connect(controller.signal).finally(() => setPending(false));
    return () => controller.abort();
  }, [companion]);
  const disconnect = useCallback(() => {
    if (pendingRef.current) throw new Error("Companion is connecting");
    setCredentials(null);
  }, [setCredentials]);
  const state = pending ? "pending" : credentials ? "connected" : "disconnected";
  return [state, connect, disconnect] as const;
};

export const useZanoCompanionConnectEffect = (companion?: ZanoCompanion) => {
  const [state, connect, disconnect] = useZanoCompanionConnect(companion);
  useEffect(() => {
    const abort = connect();
    return () => {
      abort();
      disconnect();
    };
  }, [connect, disconnect]);
  return state;
};
