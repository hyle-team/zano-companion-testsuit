export interface IZanoCredentials {
  nonce: string;
  signature: string;
  publicKey: string;
  address: string;
}

export type ZanoCredentialsParams = {
  useLocalStorage?: boolean;
  customLocalStorageKey?: string;
};

export class ZanoCredentials {
  private static readonly DEFAULT_LOCAL_STORAGE_KEY = "wallet";
  private localStorageKey: string | false;

  constructor({ useLocalStorage = true, customLocalStorageKey }: ZanoCredentialsParams = {}) {
    this.localStorageKey = useLocalStorage ? (customLocalStorageKey ?? ZanoCredentials.DEFAULT_LOCAL_STORAGE_KEY) : false;
    this.stored = (() => {
      if (!this.localStorageKey) return null;
      const json = localStorage.getItem(this.localStorageKey);
      if (json === null) return null;
      try {
        const parsed = JSON.parse(json) as IZanoCredentials;
        return parsed;
      } catch {
        return null;
      }
    })();
  }

  private stored: IZanoCredentials | null;
  get() {
    return this.stored;
  }
  clear() {
    this.stored = null;
    if (this.localStorageKey) localStorage.removeItem(this.localStorageKey);
    void this.emit(null);
  }
  set(credentials: IZanoCredentials | null) {
    this.stored = credentials;
    if (this.localStorageKey) {
      if (credentials) localStorage.setItem(this.localStorageKey, JSON.stringify(credentials));
      else localStorage.removeItem(this.localStorageKey);
    }
    void this.emit(credentials);
  }

  private listeners = new Set<(credentials: IZanoCredentials | null) => void>();
  private async emit(credentials: IZanoCredentials | null) {
    await Promise.resolve();
    this.listeners.forEach((listener) => listener(credentials));
  }
  addListener(listener: (credentials: IZanoCredentials | null) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  removeListener(listener: (credentials: IZanoCredentials | null) => void) {
    this.listeners.delete(listener);
  }
}
