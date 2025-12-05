import { v4 as uuidv4 } from "uuid";
import type { ZanoCompanionMethods } from "./types";

declare global {
  interface ZanoCompanionApi {
    request<Method extends keyof ZanoCompanionMethods>(
      method: Method,
      ...params: keyof Parameters<ZanoCompanionMethods[Method]>[0] extends undefined
        ? [params?: Parameters<ZanoCompanionMethods[Method]>[0], timeoutMs?: number | null]
        : [params: Parameters<ZanoCompanionMethods[Method]>[0], timeoutMs?: number | null]
    ): Promise<{ data: ReturnType<ZanoCompanionMethods[Method]> } | undefined>;
  }
  var zano: ZanoCompanionApi | undefined;
}

export type ZanoCompanionServerData = {
  alias: string | undefined;
  address: string;
  signature: string;
  pkey: string;
  message: string;
  isSavedData: boolean | undefined;
};
export interface ZanoCompanionParams {
  verbose?: boolean;

  useLocalStorage?: boolean; // default: true
  aliasRequired?: boolean;
  customLocalStorageKey?: string;
  customNonce?: string;
  customServerPath?: string;
  disableServerRequest?: boolean;

  onConnectStart?: () => void;
  onConnectEnd?: (data: ZanoCompanionServerData & { token: string }) => void;
  onConnectError?: (message: string) => void;
  onLocalConnectEnd?: (data: ZanoCompanionServerData) => void;
}
export interface ZanoCompanionCredentials {
  nonce: string;
  signature: string;
  publicKey: string;
  address: string;
}

type AuthServerResponse = { success: true; data: { token: string } } | { success: false; error: string };

export class ZanoCompanion {
  private DEFAULT_LOCAL_STORAGE_KEY = "wallet";
  private localStorageKey: string;

  private params: ZanoCompanionParams;
  readonly zanoWallet: {
    [Method in keyof ZanoCompanionMethods]: (
      ...params: keyof Parameters<ZanoCompanionMethods[Method]>[0] extends undefined
        ? [params?: Parameters<ZanoCompanionMethods[Method]>[0], timeoutMs?: number | null]
        : [params: Parameters<ZanoCompanionMethods[Method]>[0], timeoutMs?: number | null]
    ) => Promise<Exclude<ReturnType<ZanoCompanionMethods[Method]>, { error: unknown }>>;
  };

  constructor(params: ZanoCompanionParams) {
    if (typeof window === "undefined") {
      throw new Error("ZanoWallet can only be used in the browser");
    }

    if (!window.zano) {
      console.error("ZanoWallet requires the ZanoWallet extension to be installed");
    }

    this.params = Object.freeze(params);
    this.zanoWallet = new Proxy(
      {},
      {
        get(cache, prop) {
          const method = prop as keyof ZanoCompanionMethods;
          // @ts-expect-error - untyped
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          if (cache[method]) return cache[method];
          // @ts-expect-error - untyped
          cache[method] = async (params: Parameters<ZanoCompanionMethods[typeof method]>[0], timeoutMs?: number | null) => {
            if (!window.zano) throw new Error("ZanoWallet requires the ZanoWallet extension to be installed");
            const response = await window.zano.request(method, params, timeoutMs);
            if (!response) throw new Error("Request failed");
            if (typeof response.data === "object" && "error" in response.data && response.data.error) {
              if (typeof response.data.error === "string") throw new Error(response.data.error);
              throw response.data.error;
            }
            return response.data;
          };
          // @ts-expect-error - untyped
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return cache[method];
        },
      },
    ) as never;
    this.localStorageKey = params.customLocalStorageKey || this.DEFAULT_LOCAL_STORAGE_KEY;
  }

  private handleError({ message }: { message: string }) {
    if (this.params.onConnectError) {
      this.params.onConnectError(message);
    } else {
      console.error(message);
    }
  }

  readonly credentials = (() => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const companion = this;
    let stored = (() => {
      if (!this.params.useLocalStorage) return null;
      const json = localStorage.getItem(this.localStorageKey);
      if (json === null) return null;
      try {
        const parsed = JSON.parse(json) as ZanoCompanionCredentials;
        return parsed;
      } catch {
        return null;
      }
    })();
    const listeners = new Set<(credentials: ZanoCompanionCredentials | null) => void>();
    const emit = async (credentials: ZanoCompanionCredentials | null) => {
      await Promise.resolve();
      listeners.forEach((listener) => listener(credentials));
    };
    return {
      addListener(listener: (credentials: ZanoCompanionCredentials | null) => void) {
        listeners.add(listener);
        return () => listeners.delete(listener);
      },
      removeListener(listener: (credentials: ZanoCompanionCredentials | null) => void) {
        listeners.delete(listener);
      },
      get() {
        return stored;
      },
      clear() {
        if (companion.params.useLocalStorage) localStorage.removeItem(companion.localStorageKey);
        stored = null;
        void emit(null);
      },
      set(credentials: ZanoCompanionCredentials | null) {
        stored = credentials;
        if (companion.params.useLocalStorage) {
          if (credentials) localStorage.setItem(companion.localStorageKey, JSON.stringify(credentials));
          else localStorage.removeItem(companion.localStorageKey);
        }
        void emit(credentials);
      },
    };
  })();

  async connect(signal?: AbortSignal) {
    if (signal?.aborted) throw signal.reason;
    this.params.onConnectStart?.();

    const walletData = await this.zanoWallet.GET_WALLET_DATA().catch(() => undefined);
    if (signal?.aborted) throw signal.reason;
    if (!walletData?.address) return this.handleError({ message: "Companion is offline" });
    if (this.params.aliasRequired && !walletData.alias) return this.handleError({ message: "Alias not found" });
    if (this.params.verbose) console.log("walletData", walletData);

    let nonce = "";
    let signature = "";
    let publicKey = "";
    const stored = this.credentials.get();
    if (stored?.address === walletData.address) {
      if (this.params.verbose) console.log("existingWallet", stored);
      ({ nonce, signature, publicKey } = stored);
    } else {
      const generatedNonce = this.params.customNonce ?? uuidv4();
      const signResult = await this.zanoWallet.REQUEST_MESSAGE_SIGN({ message: generatedNonce }).catch(() => undefined);
      if (signal?.aborted) throw signal.reason;
      if (!signResult?.result) return this.handleError({ message: "Failed to sign message" });

      nonce = generatedNonce;
      signature = signResult.result.sig;
      publicKey = signResult.result.pkey;
    }

    const serverData: ZanoCompanionServerData = {
      alias: walletData.alias,
      address: walletData.address,
      signature,
      pkey: publicKey,
      message: nonce,
      isSavedData: !!stored,
    };
    this.params.onLocalConnectEnd?.(serverData);

    if (!this.params.disableServerRequest) {
      const result = await fetch(this.params.customServerPath ?? "/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: serverData }),
        signal,
      })
        .then((response) => response.json() as Promise<AuthServerResponse>)
        .catch((error) => ({ success: false, error: error instanceof Error ? error.message : String(error) }) as AuthServerResponse);
      if (signal?.aborted) throw signal.reason;
      if (!result) return this.handleError({ message: "Unexpected server response" });
      if (!result.success) return this.handleError({ message: result.error });
      if (!stored) this.credentials.set({ publicKey, signature, nonce, address: walletData.address });
      this.params.onConnectEnd?.({ ...serverData, token: result.data.token });
    }

    return true;
  }
}
