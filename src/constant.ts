import { Address, BigDecimal, BigInt } from "@graphprotocol/graph-ts";

// enums for graphql
export namespace EventType {
  export const MINT = "MINT";
  export const BURN = "BURN";
  export const TRANSFER = "TRANSFER";
}

export namespace Version {
  export const v0 = "v0";
  export const v1 = "v1";
}
export const NULL_ADDRESS = Address.fromString(
  "0x0000000000000000000000000000000000000000"
);

export const BIGINT_ZERO = BigInt.fromI32(0);
export const BIGDECIMAL_ZERO = new BigDecimal(BIGINT_ZERO);
