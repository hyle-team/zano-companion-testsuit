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
export const ZanoCompanionProvider = ({ children }: { children?: ReactNode } & ZanoCompanionParams) => {
  const companion = useZanoCompanionInstance();
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
  const [state, setState] = useState<"idle" | "pending" | "connected">("idle");
  const connect = useCallback(() => {
    const controller = new AbortController();
    setState("pending");
    void companion.connect(controller.signal).then(
      () => setState("connected"),
      () => setState("idle"),
    );
    return () => controller.abort();
  }, [companion]);
  const disconnect = useCallback(() => {
    companion.credentials.clear();
    setState("idle");
  }, [companion]);
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
