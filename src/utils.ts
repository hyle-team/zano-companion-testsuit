export interface ISpecificError extends Error {
  readonly [Symbol.toStringTag]: string;
  readonly name: string;
}

export function createErrorClass(name: string, defaultMessage?: string) {
  class SpecificError extends Error {
    constructor(message?: string) {
      super(message ?? defaultMessage);
    }
  }
  Object.defineProperty(SpecificError.prototype, Symbol.toStringTag, { value: name, configurable: true });
  Object.defineProperty(SpecificError.prototype, "name", { value: name, writable: true, configurable: true, enumerable: true });
  return SpecificError;
}

export class AssertError extends createErrorClass("AssertError", "value asserted") {}

export function assert(value: unknown, message?: string): asserts value {
  if (!value) throw new AssertError(message);
}

export function cn(...names: Array<string | false | null | undefined>) {
  return names.filter(Boolean).join(" ");
}

export type ExclusiveUnion<T extends object, U extends object> = T extends unknown
  ? U extends unknown
    ? (T & { [K in Exclude<keyof U, keyof T>]?: never }) | (U & { [K in Exclude<keyof T, keyof U>]?: never })
    : never
  : never;
