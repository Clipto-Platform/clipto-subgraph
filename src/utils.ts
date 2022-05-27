import * as graphTs from "@graphprotocol/graph-ts";
import { CliptoExchangeV1__getRequestResultValue0Struct } from "../generated/CliptoExchangeV1/CliptoExchangeV1";
import { BIGDECIMAL_ZERO, BIGINT_ZERO, NULL_ADDRESS } from "./constant";
import { RequestStruct } from "./entities/request";

export function getString(value: graphTs.JSONValue | null): string {
  if (!value) return "";
  if (value.kind == graphTs.JSONValueKind.STRING) return value.toString();
  return value.data.toString();
}

export function getBoolean(value: graphTs.JSONValue | null): boolean {
  if (!value) return false;
  if (value.kind == graphTs.JSONValueKind.BOOL) return value.toBool();
  if (value.kind == graphTs.JSONValueKind.NUMBER) {
    return value.toI64() == 0 ? false : true;
  }
  return graphTs.BigInt.fromString(value.data.toString()) == BIGINT_ZERO
    ? false
    : true;
}

export function getInt(value: graphTs.JSONValue | null): graphTs.BigInt {
  if (!value) return graphTs.BigInt.fromI64(-1);
  if (value.kind == graphTs.JSONValueKind.STRING) {
    if (value.toString().length == 0) return BIGINT_ZERO;
    return graphTs.BigInt.fromString(value.toString());
  }
  if (value.kind == graphTs.JSONValueKind.NUMBER) return value.toBigInt();
  return graphTs.BigInt.fromI64(value.data);
}

export function getDecimal(
  value: graphTs.JSONValue | null
): graphTs.BigDecimal {
  if (!value) return graphTs.BigDecimal.fromString("0");
  if (value.kind == graphTs.JSONValueKind.STRING) {
    if (value.toString().length == 0) return BIGDECIMAL_ZERO;
    return graphTs.BigDecimal.fromString(value.toString());
  }
  if (value.kind == graphTs.JSONValueKind.NUMBER)
    return graphTs.BigDecimal.fromString(value.toF64().toString());
  return graphTs.BigDecimal.fromString("0");
}

export function getArray(value: graphTs.JSONValue | null): Array<string> {
  if (!value) return new Array<string>();
  return value.toArray().map<string>((v) => getString(v));
}

export function readValue<T>(
  call: graphTs.ethereum.CallResult<T>,
  defaultValue: T
): T {
  return call.reverted ? defaultValue : call.value;
}

export function readValueFromRequestStruct(
  call: graphTs.ethereum.CallResult<
    CliptoExchangeV1__getRequestResultValue0Struct
  >
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

export function getJsonFromIpfs(metadataURI: string): graphTs.Bytes {
  const hash = metadataURI.split("//");
  const result = graphTs.ipfs.cat(hash[1]);

  if (!result) {
    graphTs.log.warning("[IPFS] ipfs cat failed {}", [metadataURI]);
    return graphTs.Bytes.empty();
  }
  return result;
}
