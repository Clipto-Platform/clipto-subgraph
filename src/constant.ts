import { Address, BigDecimal, BigInt } from "@graphprotocol/graph-ts";

export const NULL_ADDRESS = Address.fromString(
  "0x0000000000000000000000000000000000000000"
);

export const BIGINT_ZERO = BigInt.fromI32(0);
export const BIGDECIMAL_ZERO = new BigDecimal(BIGINT_ZERO);
