import {
  BigDecimal,
  BigInt,
  ethereum,
  JSONValue,
  JSONValueKind
} from "@graphprotocol/graph-ts";

export function getString(value: JSONValue | null): string {
  if (!value) return "";
  if (value.kind == JSONValueKind.STRING) return value.toString();
  return value.data.toString();
}

export function getInt(value: JSONValue | null): BigInt {
  if (!value) return BigInt.fromI64(-1);
  if (value.kind == JSONValueKind.STRING)
    return BigInt.fromString(value.toString());
  if (value.kind == JSONValueKind.NUMBER) return value.toBigInt();
  return BigInt.fromI64(value.data);
}

export function getDecimal(value: JSONValue | null): BigDecimal {
  if (!value) return BigDecimal.fromString("0");
  if (value.kind == JSONValueKind.STRING)
    return BigDecimal.fromString(value.toString());
  if (value.kind == JSONValueKind.NUMBER)
    return BigDecimal.fromString(value.toF64().toString());
  return BigDecimal.fromString("0");
}

export function getArray(value: JSONValue | null): Array<string> {
  if (!value) return new Array<string>();
  return value.toArray().map<string>(v => getString(v));
}

export function readValue<T>(call: ethereum.CallResult<T>, defaultValue: T): T {
  return call.reverted ? defaultValue : call.value;
}

export function getJsonFromIpfs(metadataURI: string): string | null {
  if (metadataURI.length == 0) {
    return "";
  }
  const hash = metadataURI.split("//");
  return hash[1];
}
