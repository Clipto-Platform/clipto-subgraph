import {
  BigDecimal,
  BigInt,
  Bytes,
  ethereum,
  ipfs,
  JSONValue,
  JSONValueKind,
  log,
} from "@graphprotocol/graph-ts";
import { CliptoExchangeV1__getRequestResultValue0Struct } from "../generated/CliptoExchangeV1/CliptoExchangeV1";
import { BIGINT_ZERO, NULL_ADDRESS } from "./constant";
import { RequestStruct } from "./entities/request";

export function getString(value: JSONValue | null): string {
  if (!value) return "";
  if (value.kind == JSONValueKind.STRING) return value.toString();
  return value.data.toString();
}

export function getBoolean(value: JSONValue | null): boolean {
  if (!value) return false;
  if (value.kind == JSONValueKind.BOOL) return value.toBool();
  if (value.kind == JSONValueKind.NUMBER) {
    return value.toI64() == 0 ? false : true;
  }
  return BigInt.fromString(value.data.toString()) == BIGINT_ZERO ? false : true;
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
  return value.toArray().map<string>((v) => getString(v));
}

export function readValue<T>(call: ethereum.CallResult<T>, defaultValue: T): T {
  return call.reverted ? defaultValue : call.value;
}

export function readValueFromRequestStruct(
  call: ethereum.CallResult<CliptoExchangeV1__getRequestResultValue0Struct>
): RequestStruct {
  if (call.reverted) {
    return new RequestStruct(
      NULL_ADDRESS,
      NULL_ADDRESS,
      NULL_ADDRESS,
      BIGINT_ZERO,
      false
    );
  }

  return new RequestStruct(
    call.value.requester,
    call.value.nftReceiver,
    call.value.erc20,
    call.value.amount,
    call.value.fulfilled
  );
}

export function getJsonFromIpfs(metadataURI: string): Bytes {
  const hash = metadataURI.split("//");
  const result = ipfs.cat(hash[1]);

  if (!result) {
    log.warning("[IPFS] ipfs cat failed {}", [metadataURI]);
    return Bytes.empty();
  }
  return result;
}
