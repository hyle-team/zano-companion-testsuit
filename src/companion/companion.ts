import { v4 as uuidv4 } from "uuid";
import { ZanoCredentials, type ZanoCredentialsParams } from "./credentials";
import type { ZanoCompanionMethodParams, ZanoCompanionMethodResult, ZanoCompanionMethods } from "./types";

declare global {
  interface ZanoCompanionApi {
    request<Method extends keyof ZanoCompanionMethods>(
      method: Method,
      ...params: keyof ZanoCompanionMethodParams<Method> extends undefined
        ? [params?: ZanoCompanionMethodParams<Method>, timeoutMs?: number | null]
        : [params: ZanoCompanionMethodParams<Method>, timeoutMs?: number | null]
    ): Promise<{ data: ZanoCompanionMethodResult<Method> } | undefined>;
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
export type ZanoCompanionParams = ZanoCredentialsParams & {
  aliasRequired?: boolean;
  customNonce?: string;
  customServerPath?: string;
  disableServerRequest?: boolean;

  onConnectStart?: () => void;
  onConnectEnd?: (data: ZanoCompanionServerData & { token: string }) => void;
  onLocalConnectEnd?: (data: ZanoCompanionServerData) => void;

  verbose?: boolean;
};

type AuthServerResponse = { success: true; data: { token: string } } | { success: false; error: string };

type UnwrappedZanoCompanionMethodResult<Method extends keyof ZanoCompanionMethods> = Exclude<ZanoCompanionMethodResult<Method>, { error: unknown }>;
export class ZanoCompanion {
  #params: ZanoCompanionParams;
  readonly methods: {
    [Method in keyof ZanoCompanionMethods]: (
      ...params: keyof ZanoCompanionMethodParams<Method> extends undefined
        ? [params?: ZanoCompanionMethodParams<Method>, timeoutMs?: number | null]
        : [params: ZanoCompanionMethodParams<Method>, timeoutMs?: number | null]
    ) => Promise<UnwrappedZanoCompanionMethodResult<Method>>;
  };
  readonly credentials: ZanoCredentials;

  constructor(params: ZanoCompanionParams) {
    if (typeof window === "undefined") {
      throw new Error("ZanoWallet can only be used in the browser");
    }

    if (!window.zano) {
      console.error("ZanoWallet requires the ZanoWallet extension to be installed");
    }

    this.#params = Object.freeze(params);
    const wrappers = {
      GET_WALLET_DATA: (result) => {
        const credentials = this.credentials.get();
        if (credentials && result.address !== credentials?.address) this.credentials.clear();
      },
    } as { [Method in keyof ZanoCompanionMethods]?: (result: UnwrappedZanoCompanionMethodResult<Method>) => void };
    this.methods = new Proxy(
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
            wrappers[method]?.(response.data as never);
            return response.data;
          };
          // @ts-expect-error - untyped
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return cache[method];
        },
      },
    ) as never;

    this.credentials = new ZanoCredentials(params);
  }

  async connect(signal?: AbortSignal) {
    if (signal?.aborted) throw signal.reason;
    this.#params.onConnectStart?.();

    if (this.#params.verbose) console.log("getting walletData");
    const walletData = await this.methods.GET_WALLET_DATA().catch(() => undefined);
    if (signal?.aborted) throw signal.reason;
    if (!walletData?.address) throw new Error("Companion is offline");
    if (this.#params.aliasRequired && !walletData.alias) throw new Error("Alias not found");
    if (this.#params.verbose) console.log("walletData:", walletData);

    let nonce = "";
    let signature = "";
    let publicKey = "";
    const stored = this.credentials.restore(walletData.address);
    if (stored && this.#params.verbose) console.log("stored wallet:", stored);
    if (stored?.address === walletData.address) {
      ({ nonce, signature, publicKey } = stored);
    } else {
      const generatedNonce = this.#params.customNonce ?? uuidv4();
      if (this.#params.verbose) console.log("getting signature:", generatedNonce);
      const signResult = await this.methods.REQUEST_MESSAGE_SIGN({ message: generatedNonce }).catch(() => undefined);
      if (this.#params.verbose) console.log("signature:", signResult);
      if (signal?.aborted) throw signal.reason;
      if (!signResult?.result) throw new Error("Failed to sign message");

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
    if (this.#params.verbose) console.log("connected:", serverData);
    this.#params.onLocalConnectEnd?.(serverData);

    if (!this.#params.disableServerRequest) {
      if (this.#params.verbose) console.log("authenticating");
      const result = await fetch(this.#params.customServerPath ?? "/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: serverData }),
        signal,
      })
        .then((response) => response.json() as Promise<AuthServerResponse>)
        .catch((error) => ({ success: false, error: error instanceof Error ? error.message : String(error) }) as AuthServerResponse);
      if (signal?.aborted) throw signal.reason;
      if (this.#params.verbose) console.log("authentication result:", result);
      if (!result) throw new Error("Unexpected server response");
      if (!result.success) throw new Error(result.error);
      if (this.#params.verbose) console.log("authenticated:", result.data.token);
      this.#params.onConnectEnd?.({ ...serverData, token: result.data.token });
    }
    this.credentials.set({ publicKey, signature, nonce, address: walletData.address });
  }
}
