import { v4 as uuidv4 } from "uuid";

type asset_descriptor_base = {
  /** Maximum possible supply for a given asset, cannot be changed after deployment. */
  total_max_supply: number;
  /** Currently emitted supply for the given asset (ignored for REGISTER operation). */
  current_supply: number;
  /** Decimal point. */
  decimal_point: number;
  /** Ticker associated with the asset. */
  ticker: string;
  /** Full name of the asset. */
  full_name: string;
  /** Any other information associated with the asset in free form. */
  meta_info: string;
  /** Owner's key, used only for EMIT and UPDATE validation, can be changed by transferring asset ownership. */
  owner: string;
  /** This field is reserved for future use and will be documented later. */
  hidden_supply: boolean;
  /** Version of the asset descriptor base. */
  version: number;
  /** [Optional] Owner's key in the case when ETH signature is used. */
  owner_eth_pub_key?: string;
};
interface asset_funds {
  asset_id: string;
  amount: number;
}
type ionic_swap_proposal_info = {
  /** Assets sent to the finalizer */
  to_finalizer?: asset_funds[];
  /** Assets sent to the initiator */
  to_initiator?: asset_funds[];
  /** Fee paid by party A (initiator) */
  fee_paid_by_a: number;
};
type alias_rpc_details_base = {
  /** Address of the alias */
  address: string;
  /** View secret key of the corresponding address (optional) */
  tracking_key?: string;
  /** Arbitrary comment (optional) */
  comment?: string;
};

interface asset_descriptor_with_id extends asset_descriptor_base {
  /** Asset ID */
  asset_id: string;
}
type INVOKE_RPC_IONIC_SWAP_ACCEPT_PROPOSAL_RESPONSE = {
  /** Result transaction ID */
  result_tx_id: string;
};
type INVOKE_RPC_IONIC_SWAP_GENERATE_PROPOSAL_RESPONSE = {
  /** Hex-encoded proposal raw data (encrypted with common shared key). Includes half-created transaction template and some extra information that would be needed counterparty to finalize and sign transaction */
  hex_raw_proposal: string;
};
type INVOKE_RPC_IONIC_SWAP_GET_PROPOSAL_INFO_RESPONSE = {
  /** Proposal details */
  proposal: ionic_swap_proposal_info;
};
type INVOKE_RPC_REGISTER_ALIAS_RESPONSE = {
  /** If success - transactions that performs registration (alias becomes available after few confirmations) */
  tx_id: string;
};
type INVOKE_RPC_TRANSFER_RESPONSE = {
  /** Hash of the generated transaction (if succeeded) */
  tx_hash: string;
  /** Unsigned transaction data in hexadecimal format */
  tx_unsigned_hex: string;
  /** Transaction size in bytes */
  tx_size: number;
};

type ZanoWalletBalance = {
  name: string;
  ticker: string;
  assetId: string;
  decimalPoint: number;
  balance: string;
  unlockedBalance: string;
};
type ZanoWalletTransfer = {
  amount: string;
  assetId: string;
  incoming: boolean;
};
type ZanoWalletTransaction = {
  isConfirmed: boolean;
  txHash: string;
  blobSize: number;
  timestamp: number;
  height: number;
  paymentId: string;
  comment: string;
  fee: string;
  addresses: string[] | undefined;
  isInitiator: boolean;
  transfers: ZanoWalletTransfer[];
};
type ZanoWalletData = {
  address: string;
  alias: string | undefined;
  assets: ZanoWalletBalance[];
  balance: string;
  transactions: ZanoWalletTransaction[];
};

type ZanoCompanionWrappedMethod<Result> = { result: Result; error?: undefined } | { result?: undefined; error: unknown };
type ZanoCompanionMethods = {
  GET_WALLET_BALANCE(params?: Record<string, never>): ZanoCompanionWrappedMethod<{
    balances: {
      total: number;
      unlocked: number;
      asset_info: asset_descriptor_with_id;
      awaiting_in: number;
      awaiting_out: number;
      outs_count: number;
      outs_amount_min: number;
      outs_amount_max: number;
    }[];
    balance: number;
    unlocked_balance: number;
  }>;
  GET_WALLET_DATA(params?: Record<string, never>): ZanoWalletData;
  IONIC_SWAP(params: {
    destinationAddress: string;
    destinationAssetID: string;
    destinationAssetAmount: number;
    currentAssetID: string;
    currentAssetAmount: number;
  }): ZanoCompanionWrappedMethod<INVOKE_RPC_IONIC_SWAP_GENERATE_PROPOSAL_RESPONSE>;
  IONIC_SWAP_ACCEPT(params: { hex_raw_proposal: string }): ZanoCompanionWrappedMethod<INVOKE_RPC_IONIC_SWAP_ACCEPT_PROPOSAL_RESPONSE>;
  TRANSFER(
    params: { assetId: string; amount: string; comment?: string } & (
      | { destination: string; destinations?: never }
      | { destination?: never; destinations: { address: string; amount: string }[] }
    ),
  ): ZanoCompanionWrappedMethod<INVOKE_RPC_TRANSFER_RESPONSE>;
  GET_ALIAS_DETAILS(params: { alias: string }): alias_rpc_details_base;
  REQUEST_MESSAGE_SIGN(params: { message: string }): ZanoCompanionWrappedMethod<{ sig: string; pkey: string }>;
  GET_IONIC_SWAP_PROPOSAL_INFO(params: { hex_raw_proposal: string }): INVOKE_RPC_IONIC_SWAP_GET_PROPOSAL_INFO_RESPONSE;
  GET_WHITELIST(params?: Record<string, never>): asset_descriptor_with_id[];
  CREATE_ALIAS(params: { alias: string; comment?: string }): ZanoCompanionWrappedMethod<INVOKE_RPC_REGISTER_ALIAS_RESPONSE>;
  ASSETS_WHITELIST_ADD(params: { asset_id: string }): ZanoCompanionWrappedMethod<{ asset_descriptor: asset_descriptor_with_id }>;
};

type ZanoWalletServerData = {
  alias: string | undefined;
  address: string;
  signature: string;
  pkey: string;
  message: string;
  isSavedData: boolean | undefined;
};
interface ZanoWalletParams {
  verbose?: boolean;

  authPath: string;
  useLocalStorage?: boolean; // default: true
  aliasRequired?: boolean;
  customLocalStorageKey?: string;
  customNonce?: string;
  customServerPath?: string;
  disableServerRequest?: boolean;

  onConnectStart?: () => void;
  onConnectEnd?: (data: ZanoWalletServerData & { token: string }) => void;
  onConnectError?: (message: string) => void;

  beforeConnect?: () => void | Promise<void>;
  onLocalConnectEnd?: (data: ZanoWalletServerData) => void;
}

declare global {
  interface ZanoCompanion {
    request<Method extends keyof ZanoCompanionMethods>(
      method: Method,
      ...params: keyof Parameters<ZanoCompanionMethods[Method]>[0] extends undefined
        ? [params?: Parameters<ZanoCompanionMethods[Method]>[0], timeoutMs?: number | null]
        : [params: Parameters<ZanoCompanionMethods[Method]>[0], timeoutMs?: number | null]
    ): Promise<{ data: ReturnType<ZanoCompanionMethods[Method]> } | undefined>;
  }
  var zano: ZanoCompanion | undefined;
}

interface WalletCredentials {
  nonce: string;
  signature: string;
  publicKey: string;
  address: string;
}

type AuthServerResponse = { success: true; data: { token: string } } | { success: false; error: string };

export class ZanoCompanion {
  private DEFAULT_LOCAL_STORAGE_KEY = "wallet";
  private localStorageKey: string;

  private params: ZanoWalletParams;
  readonly zanoWallet: {
    [Method in keyof ZanoCompanionMethods]: (
      ...params: keyof Parameters<ZanoCompanionMethods[Method]>[0] extends undefined
        ? [params?: Parameters<ZanoCompanionMethods[Method]>[0], timeoutMs?: number | null]
        : [params: Parameters<ZanoCompanionMethods[Method]>[0], timeoutMs?: number | null]
    ) => Promise<Exclude<ReturnType<ZanoCompanionMethods[Method]>, { error: unknown }>>;
  };

  constructor(params: ZanoWalletParams) {
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

  getSavedWalletCredentials() {
    const savedWallet = localStorage.getItem(this.localStorageKey);
    if (!savedWallet) return undefined;
    try {
      return JSON.parse(savedWallet) as WalletCredentials;
    } catch {
      return undefined;
    }
  }

  setWalletCredentials(credentials: WalletCredentials | undefined) {
    if (credentials) {
      localStorage.setItem(this.localStorageKey, JSON.stringify(credentials));
    } else {
      localStorage.removeItem(this.localStorageKey);
    }
  }

  cleanWalletCredentials() {
    this.setWalletCredentials(undefined);
  }

  async connect() {
    await this.params.beforeConnect?.();
    this.params.onConnectStart?.();

    const walletData = await this.zanoWallet.GET_WALLET_DATA().catch(() => undefined);
    if (!walletData?.address) return this.handleError({ message: "Companion is offline" });
    if (this.params.aliasRequired && !walletData.alias) return this.handleError({ message: "Alias not found" });
    if (this.params.verbose) console.log("walletData", walletData);

    let nonce = "";
    let signature = "";
    let publicKey = "";
    const existingWallet = this.params.useLocalStorage ? this.getSavedWalletCredentials() : undefined;
    if (this.params.verbose) console.log("existingWallet", existingWallet);
    const existingWalletValid = existingWallet && existingWallet.address === walletData.address;
    if (this.params.verbose) console.log("existingWalletValid", existingWalletValid);

    if (existingWalletValid) {
      nonce = existingWallet.nonce;
      signature = existingWallet.signature;
      publicKey = existingWallet.publicKey;
    } else {
      const generatedNonce = this.params.customNonce ?? uuidv4();
      const signResult = await this.zanoWallet.REQUEST_MESSAGE_SIGN({ message: generatedNonce }).catch(() => undefined);
      if (!signResult?.result) return this.handleError({ message: "Failed to sign message" });

      nonce = generatedNonce;
      signature = signResult.result.sig;
      publicKey = signResult.result.pkey;
    }

    const serverData: ZanoWalletServerData = {
      alias: walletData.alias,
      address: walletData.address,
      signature,
      pkey: publicKey,
      message: nonce,
      isSavedData: existingWalletValid,
    };
    this.params.onLocalConnectEnd?.(serverData);

    if (!this.params.disableServerRequest) {
      const result = await fetch(this.params.customServerPath ?? "/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: serverData }),
      })
        .then((response) => response.json() as Promise<AuthServerResponse>)
        .catch((error) => ({ success: false, error: error instanceof Error ? error.message : String(error) }) as AuthServerResponse);
      if (!result) return this.handleError({ message: "Unexpected server response" });
      if (!result.success) return this.handleError({ message: result.error });
      if (!existingWalletValid && this.params.useLocalStorage) {
        this.setWalletCredentials({ publicKey, signature, nonce, address: walletData.address });
      }
      this.params.onConnectEnd?.({ ...serverData, token: result.data.token });
    }

    return true;
  }
}
