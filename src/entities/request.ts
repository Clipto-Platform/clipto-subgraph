import { Address, BigInt } from "@graphprotocol/graph-ts";
import { Request } from "../../generated/schema";
import { BIGINT_ZERO, NULL_ADDRESS } from "../constant";

export function getOrCreateRequest(
  creator: Address,
  requestId: string,
  version: string
): Request {
  let id = creator
    .toHex()
    .concat("-")
    .concat(version)
    .concat("-")
    .concat(requestId);
  let request = Request.load(id);

  if (request) {
    return request;
  }

  request = new Request(id);

  request.version = version;
  request.creator = creator.toHex();
  request.requestId = BIGINT_ZERO;
  request.metadataURI = "";
  request.requester = NULL_ADDRESS;
  request.nftReceiver = NULL_ADDRESS;
  request.erc20 = NULL_ADDRESS;
  request.amount = BIGINT_ZERO;
  request.nftTokenId = BIGINT_ZERO;
  request.nftTokenUri = "";
  request.nftTokenAddress = NULL_ADDRESS;
  request.refunded = false;
  request.delivered = false;
  request.isBusiness = false;
  request.rejected = false;
  request.description = "";
  request.deadline = BIGINT_ZERO;
  request.txHash = NULL_ADDRESS;
  request.block = BIGINT_ZERO;
  request.createdTimestamp = BIGINT_ZERO;
  request.updatedTimestamp = BIGINT_ZERO;
  request.save();

  return request;
}

export class RequestStruct {
  requester: Address;
  nftReceiver: Address;
  erc20: Address;
  fulfilled: bool;
  amount: BigInt;

  constructor(
    requester: Address,
    nftReceiver: Address,
    erc20: Address,
    amount: BigInt,
    fulfilled: bool,
  ) {
    this.requester = requester;
    this.nftReceiver = nftReceiver;
    this.erc20 = erc20;
    this.amount = amount;
    this.fulfilled = fulfilled;
  }
}
