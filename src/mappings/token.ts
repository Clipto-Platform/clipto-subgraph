import { Address } from "@graphprotocol/graph-ts";
import {
  ERC721,
  Transfer as TransferEvent,
} from "../../generated/CliptoExchange/ERC721";
import { EventType, NULL_ADDRESS } from "../constant";
import { createAccount } from "../entities/account";
import { getOrCreateTransferEvent } from "../entities/event";
import {
  getOrCreateCliptoToken,
  getOrCreateNFTContract,
} from "../entities/token";
import { readValue } from "../utils";

export function handleTransfer(event: TransferEvent): void {
  let from = createAccount(event.params.from);
  let to = createAccount(event.params.to);

  let erc721 = ERC721.bind(event.address);
  let eventType = isZero(event.params.from)
    ? EventType.MINT
    : isZero(event.params.to)
    ? EventType.BURN
    : EventType.TRANSFER;

  let contract = getOrCreateNFTContract(event.address, event);
  let token = getOrCreateCliptoToken(
    event.address,
    event.params.tokenId,
    event
  );
  token.tokenId = event.params.tokenId;
  token.nftContract = contract.id;
  token.currentOwner = to.id;
  token.creator = contract.creator;
  token.from = from.id;
  token.tokenUri = readValue<string>(
    erc721.try_tokenURI(event.params.tokenId),
    ""
  );
  if (eventType == EventType.MINT) {
    token.originalRequester = to.id; // who ordered the clipto, and is first owner
  }

  let transfer = getOrCreateTransferEvent(event.address, event, eventType);
  transfer.from = from.id;
  transfer.to = to.id;
  transfer.tokenId = event.params.tokenId;
  transfer.cliptoToken = token.id;
  transfer.nftContract = contract.id;
  transfer.eventType = eventType;
  transfer.save();
}

function isZero(address: Address): bool {
  return address.equals(NULL_ADDRESS);
}
