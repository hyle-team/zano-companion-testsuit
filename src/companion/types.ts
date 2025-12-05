export type asset_descriptor_base = {
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
export interface asset_funds {
  asset_id: string;
  amount: number;
}
export type ionic_swap_proposal_info = {
  /** Assets sent to the finalizer */
  to_finalizer?: asset_funds[];
  /** Assets sent to the initiator */
  to_initiator?: asset_funds[];
  /** Fee paid by party A (initiator) */
  fee_paid_by_a: number;
};
export type alias_rpc_details_base = {
  /** Address of the alias */
  address: string;
  /** View secret key of the corresponding address (optional) */
  tracking_key?: string;
  /** Arbitrary comment (optional) */
  comment?: string;
};

export interface asset_descriptor_with_id extends asset_descriptor_base {
  /** Asset ID */
  asset_id: string;
}
export type INVOKE_RPC_IONIC_SWAP_ACCEPT_PROPOSAL_RESPONSE = {
  /** Result transaction ID */
  result_tx_id: string;
};
export type INVOKE_RPC_IONIC_SWAP_GENERATE_PROPOSAL_RESPONSE = {
  /** Hex-encoded proposal raw data (encrypted with common shared key). Includes half-created transaction template and some extra information that would be needed counterparty to finalize and sign transaction */
  hex_raw_proposal: string;
};
export type INVOKE_RPC_IONIC_SWAP_GET_PROPOSAL_INFO_RESPONSE = {
  /** Proposal details */
  proposal: ionic_swap_proposal_info;
};
export type INVOKE_RPC_REGISTER_ALIAS_RESPONSE = {
  /** If success - transactions that performs registration (alias becomes available after few confirmations) */
  tx_id: string;
};
export type INVOKE_RPC_TRANSFER_RESPONSE = {
  /** Hash of the generated transaction (if succeeded) */
  tx_hash: string;
  /** Unsigned transaction data in hexadecimal format */
  tx_unsigned_hex: string;
  /** Transaction size in bytes */
  tx_size: number;
};

export type ZanoWalletBalance = {
  name: string;
  ticker: string;
  assetId: string;
  decimalPoint: number;
  balance: string;
  unlockedBalance: string;
};
export type ZanoWalletTransfer = {
  amount: string;
  assetId: string;
  incoming: boolean;
};
export type ZanoWalletTransaction = {
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
export type ZanoWalletData = {
  address: string;
  alias: string | undefined;
  assets: ZanoWalletBalance[];
  balance: string;
  transactions: ZanoWalletTransaction[];
};

export type ZanoCompanionWrappedMethod<Result> = { result: Result; error?: undefined } | { result?: undefined; error: unknown };
export type ZanoCompanionMethods = {
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
