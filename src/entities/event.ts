import { Address, ethereum } from "@graphprotocol/graph-ts";
import { Transfer } from "../../generated/schema";
import { BIGINT_ZERO } from "../constant";

export function getOrCreateTransferEvent(
  address: Address,
  event: ethereum.Event,
  eventType: string
): Transfer {
  let id = address
    .toHex()
    .concat("-")
    .concat(event.block.hash.toHex());
  let transfer = Transfer.load(id);

  if (transfer) {
    return transfer;
  }

  transfer = new Transfer(id);

  transfer.from = "";
  transfer.to = "";
  transfer.tokenId = BIGINT_ZERO;
  transfer.cliptoToken = "";
  transfer.nftContract = "";
  transfer.eventType = eventType;
  transfer.blockNumber = event.block.number;
  transfer.blockHash = event.block.hash;
  transfer.txHash = event.transaction.hash;
  transfer.timestamp = event.block.timestamp;
  transfer.save();

  return transfer;
}
