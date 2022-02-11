import {
  CreatorRegistered,
  DeliveredRequest,
  NewRequest,
  OwnershipTransferred,
  RefundedRequest,
  RequestUpdated
} from "../generated/CliptoExchange/CliptoExchange";
import { Creator, Request } from "../generated/schema";

export function handleCreatorRegistered(event: CreatorRegistered): void {
  let creator = Creator.load(event.transaction.from.toHex());

  if (creator == null) {
    creator = new Creator(event.transaction.from.toHex());
  }

  creator.tokenAddress = event.params.token;
  creator.address = event.params.creator;
  creator.txHash = event.transaction.hash;
  creator.block = event.block.number;
  creator.timestamp = event.block.timestamp;
  creator.save();
}

export function handleNewRequest(event: NewRequest): void {
  let request = Request.load(event.params.creator.toHex() + "-" + event.params.index.toHex());

  if (request == null) {
    request = new Request(event.params.creator.toHex() + "-" + event.params.index.toHex());
  }

  request.creator = event.params.creator;
  request.requester = event.params.requester;
  request.requestId = event.params.index;
  request.amount = event.params.amount;
  request.txHash = event.transaction.hash;
  request.block = event.block.number;
  request.timestamp = event.block.timestamp;
  request.refunded = false;
  request.delivered = false;

  request.save();
}

export function handleDeliveredRequest(event: DeliveredRequest): void {
  let request = Request.load(event.params.creator.toHex() + "-" + event.params.index.toHex());

  if (request == null) {
    request = new Request(event.params.creator.toHex() + "-" + event.params.index.toHex());
  }

  request.creator = event.params.creator;
  request.requester = event.params.requester;
  request.requestId = event.params.index;
  request.amount = event.params.amount;
  request.tokenId = event.params.tokenId;
  request.tokenAddress = event.params.tokenAddress;
  request.txHash = event.transaction.hash;
  request.block = event.block.number;
  request.timestamp = event.block.timestamp;
  request.delivered = true;

  request.save();
}

export function handleRefundedRequest(event: RefundedRequest): void {
  let request = Request.load(event.params.creator.toHex() + "-" + event.params.index.toHex());

  if (request == null) {
    request = new Request(event.params.creator.toHex() + "-" + event.params.index.toHex());
  }

  request.creator = event.params.creator;
  request.requester = event.params.requester;
  request.requestId = event.params.index;
  request.amount = event.params.amount;
  request.txHash = event.transaction.hash;
  request.block = event.block.number;
  request.timestamp = event.block.timestamp;
  request.refunded = true;
  request.save();
}

export function handleRequestUpdated(event: RequestUpdated): void {
  let request = Request.load(event.params.creator.toHex() + "-" + event.params.index.toHex());

  if (request == null) {
    request = new Request(event.params.creator.toHex() + "-" + event.params.index.toHex());
  }
  request.amount = event.params.amountIncreased;
  request.txHash = event.transaction.hash;
  request.block = event.block.number;
  request.timestamp = event.block.timestamp;
  request.save();
}

export function handleOwnershipTransferred(event: OwnershipTransferred): void { }
