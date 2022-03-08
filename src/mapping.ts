import { BigDecimal, BigInt, json, JSONValue, JSONValueKind, log } from "@graphprotocol/graph-ts";
import {
  CreatorRegistered,
  CreatorUpdated,
  DeliveredRequest,
  NewRequest,
  OwnershipTransferred,
  RefundedRequest,
  RequestUpdated,
} from "../generated/CliptoExchange/CliptoExchange";
import { ERC721 } from "../generated/CliptoExchange/ERC721";
import { Creator, Request } from "../generated/schema";

function getString(value: JSONValue | null): string {
  if (!value) return "";
  if (value.kind == JSONValueKind.STRING) return value.toString();
  return value.data.toString();
}

function getInt(value: JSONValue | null): BigInt {
  if (!value) return BigInt.fromI64(-1);
  if (value.kind == JSONValueKind.STRING) return BigInt.fromString(value.toString());
  if (value.kind == JSONValueKind.NUMBER) return value.toBigInt();
  return BigInt.fromI64(value.data);
}

function getDecimal(value: JSONValue | null): BigDecimal {
  if (!value) return BigDecimal.fromString("0");
  if (value.kind == JSONValueKind.STRING) return BigDecimal.fromString(value.toString());
  if (value.kind == JSONValueKind.NUMBER) return BigDecimal.fromString(value.toF64().toString());
  return BigDecimal.fromString("0"); 
}

function getArray(value: JSONValue | null): Array<string> {
  if(!value) return new Array<string>();
  return value.toArray().map<string>((v) => getString(v)); 
}

export function handleCreatorRegistered(event: CreatorRegistered): void {
  let creator = Creator.load(event.params.creator.toHex());

  if (creator == null) {
    creator = new Creator(event.params.creator.toHex());
  }
  creator.tokenAddress = event.params.token;
  creator.address = event.params.creator;
  creator.txHash = event.transaction.hash;
  creator.block = event.block.number;
  creator.timestamp = event.block.timestamp;

  let checkData = json.try_fromString(event.params.data);
  if (checkData.isOk) {
    let data = checkData.value.toObject();
  
    creator.twitterHandle = getString(data.get("twitterHandle"));
    creator.bio = getString(data.get("bio"));
    creator.deliveryTime = getInt(data.get("deliveryTime"));
    creator.profilePicture = getString(data.get("profilePicture"));
    creator.userName = getString(data.get("userName"));
    creator.price = getDecimal(data.get("price"));
    creator.demos = getArray(data.get("demos"));
  }

  creator.save();
}

export function handleCreatorUpdated(event: CreatorUpdated): void {
  let creator = Creator.load(event.params.creator.toHex());

  if (creator == null) {
    creator = new Creator(event.params.creator.toHex());
  }
  creator.address = event.params.creator;

  let checkData = json.try_fromString(event.params.data);
  if (checkData.isOk) {
    let data = checkData.value.toObject();
  
    creator.twitterHandle = getString(data.get("twitterHandle"));
    creator.bio = getString(data.get("bio"));
    creator.deliveryTime = getInt(data.get("deliveryTime"));
    creator.profilePicture = getString(data.get("profilePicture"));
    creator.userName = getString(data.get("userName"));
    creator.price = getDecimal(data.get("price"));
    creator.demos = getArray(data.get("demos"));
  }

  creator.save();
}

export function handleNewRequest(event: NewRequest): void {
  let request = Request.load(
    event.params.creator.toHex() + "-" + event.params.index.toHex()
  );

  if (request == null) {
    request = new Request(
      event.params.creator.toHex() + "-" + event.params.index.toHex()
    );
  }

  request.creator = event.params.creator.toHex();
  request.requester = event.params.requester;
  request.requestId = event.params.index;
  request.amount = event.params.amount;
  request.txHash = event.transaction.hash;
  request.block = event.block.number;
  request.timestamp = event.block.timestamp;
  request.refunded = false;
  request.delivered = false;

  let checkData = json.try_fromString(event.params.data);
  if (checkData.isOk) {
    let data = checkData.value.toObject();

    request.description = getString(data.get("description"));
    request.deadline = getInt(data.get("deadline"));
  }

  request.save();
}

export function handleDeliveredRequest(event: DeliveredRequest): void {
  let request = Request.load(
    event.params.creator.toHex() + "-" + event.params.index.toHex()
  );

  if (request == null) {
    request = new Request(
      event.params.creator.toHex() + "-" + event.params.index.toHex()
    );
  }

  request.creator = event.params.creator.toHex();
  request.requester = event.params.requester;
  request.requestId = event.params.index;
  request.amount = event.params.amount;
  request.tokenId = event.params.tokenId;
  request.tokenAddress = event.params.tokenAddress;
  request.txHash = event.transaction.hash;
  request.block = event.block.number;
  request.timestamp = event.block.timestamp;
  request.delivered = true;

  let token = ERC721.bind(event.params.tokenAddress);
  let tokenUri = token.try_tokenURI(event.params.tokenId);
  if (!tokenUri.reverted) request.tokenUri = tokenUri.value;

  request.save();
}

export function handleRefundedRequest(event: RefundedRequest): void {
  let request = Request.load(
    event.params.creator.toHex() + "-" + event.params.index.toHex()
  );

  if (request == null) {
    request = new Request(
      event.params.creator.toHex() + "-" + event.params.index.toHex()
    );
  }

  request.creator = event.params.creator.toHex();
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
  let request = Request.load(
    event.params.creator.toHex() + "-" + event.params.index.toHex()
  );

  if (request == null) {
    request = new Request(
      event.params.creator.toHex() + "-" + event.params.index.toHex()
    );
  }
  request.amount = event.params.amountIncreased;
  request.txHash = event.transaction.hash;
  request.block = event.block.number;
  request.timestamp = event.block.timestamp;
  request.save();
}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {}
