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
export interface asset_descriptor_with_id extends asset_descriptor_base {
  /** Asset ID */
  asset_id: string;
}

export type GET_WALLET_BALANCE_BALANCE = {
  total: number;
  unlocked: number;
  asset_info: asset_descriptor_with_id;
  awaiting_in: number;
  awaiting_out: number;
  outs_count: number;
  outs_amount_min: number;
  outs_amount_max: number;
};
export type GET_WALLET_BALANCE_RESPONSE = {
  balances: GET_WALLET_BALANCE_BALANCE[];
  balance: number;
  unlocked_balance: number;
};
export type GET_WALLET_DATA_BALANCE = {
  name: string;
  ticker: string;
  assetId: string;
  decimalPoint: number;
  balance: string;
  unlockedBalance: string;
};
export type GET_WALLET_DATA_TRANSFER = {
  amount: string;
  assetId: string;
  incoming: boolean;
};
export type GET_WALLET_DATA_TRANSACTION = {
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
  transfers: GET_WALLET_DATA_TRANSFER[];
};
export type GET_WALLET_DATA_RESPONSE = {
  address: string;
  alias: string | undefined;
  assets: GET_WALLET_DATA_BALANCE[];
  balance: string;
  transactions: GET_WALLET_DATA_TRANSACTION[];
};
export type IONIC_SWAP_RESPONSE = {
  /** Hex-encoded proposal raw data (encrypted with common shared key). Includes half-created transaction template and some extra information that would be needed counterparty to finalize and sign transaction */
  hex_raw_proposal: string;
};
export type IONIC_SWAP_ACCEPT_RESPONSE = {
  /** Result transaction ID */
  result_tx_id: string;
};
export type TRANSFER_RESPONSE = {
  /** Hash of the generated transaction (if succeeded) */
  tx_hash: string;
  /** Unsigned transaction data in hexadecimal format */
  tx_unsigned_hex: string;
  /** Transaction size in bytes */
  tx_size: number;
};
export type GET_ALIAS_DETAILS_RESPONSE = {
  /** Address of the alias */
  address: string;
  /** View secret key of the corresponding address (optional) */
  tracking_key?: string;
  /** Arbitrary comment (optional) */
  comment?: string;
};
export type REQUEST_MESSAGE_SIGN_RESPONSE = {
  sig: string;
  pkey: string;
};
export type GET_IONIC_SWAP_PROPOSAL_INFO_ASSET_FUNDS = {
  asset_id: string;
  amount: number;
};
export type GET_IONIC_SWAP_PROPOSAL_INFO = {
  /** Assets sent to the finalizer */
  to_finalizer?: GET_IONIC_SWAP_PROPOSAL_INFO_ASSET_FUNDS[];
  /** Assets sent to the initiator */
  to_initiator?: GET_IONIC_SWAP_PROPOSAL_INFO_ASSET_FUNDS[];
  /** Fee paid by party A (initiator) */
  fee_paid_by_a: number;
};
export type GET_IONIC_SWAP_PROPOSAL_INFO_RESPONSE = {
  /** Proposal details */
  proposal: GET_IONIC_SWAP_PROPOSAL_INFO;
};
export type GET_WHITELIST_RESPONSE = asset_descriptor_with_id[];
export type CREATE_ALIAS_RESPONSE = {
  /** If success - transactions that performs registration (alias becomes available after few confirmations) */
  tx_id: string;
};
export type ASSETS_WHITELIST_ADD_RESPONSE = {
  asset_descriptor: asset_descriptor_with_id;
};

export type ZanoCompanionWrappedMethod<Result> = { result: Result; error?: undefined } | { result?: undefined; error: unknown };
export type ZanoCompanionMethods = {
  GET_WALLET_BALANCE(params?: Record<string, never>): ZanoCompanionWrappedMethod<GET_WALLET_BALANCE_RESPONSE>;
  GET_WALLET_DATA(params?: Record<string, never>): GET_WALLET_DATA_RESPONSE;
  IONIC_SWAP(params: {
    destinationAddress: string;
    destinationAssetID: string;
    destinationAssetAmount: number;
    currentAssetID: string;
    currentAssetAmount: number;
  }): ZanoCompanionWrappedMethod<IONIC_SWAP_RESPONSE>;
  IONIC_SWAP_ACCEPT(params: { hex_raw_proposal: string }): ZanoCompanionWrappedMethod<IONIC_SWAP_ACCEPT_RESPONSE>;
  TRANSFER(
    params: { assetId: string; amount: string; comment?: string } & (
      | { destination: string; destinations?: never }
      | { destination?: never; destinations: { address: string; amount: string }[] }
    ),
  ): ZanoCompanionWrappedMethod<TRANSFER_RESPONSE>;
  GET_ALIAS_DETAILS(params: { alias: string }): GET_ALIAS_DETAILS_RESPONSE;
  REQUEST_MESSAGE_SIGN(params: { message: string }): ZanoCompanionWrappedMethod<REQUEST_MESSAGE_SIGN_RESPONSE>;
  GET_IONIC_SWAP_PROPOSAL_INFO(params: { hex_raw_proposal: string }): GET_IONIC_SWAP_PROPOSAL_INFO_RESPONSE;
  GET_WHITELIST(params?: Record<string, never>): GET_WHITELIST_RESPONSE;
  CREATE_ALIAS(params: { alias: string; comment?: string }): ZanoCompanionWrappedMethod<CREATE_ALIAS_RESPONSE>;
  ASSETS_WHITELIST_ADD(params: { asset_id: string }): ZanoCompanionWrappedMethod<ASSETS_WHITELIST_ADD_RESPONSE>;
};
export type ZanoCompanionMethodParams<Method extends keyof ZanoCompanionMethods> = Parameters<ZanoCompanionMethods[Method]>[0];
export type ZanoCompanionMethodResult<Method extends keyof ZanoCompanionMethods> = ReturnType<ZanoCompanionMethods[Method]>;
