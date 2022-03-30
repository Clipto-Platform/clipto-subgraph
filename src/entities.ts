import { Address } from "@graphprotocol/graph-ts";
import { Creator, Request } from "../generated/schema";
import { BIGDECIMAL_ZERO, BIGINT_ZERO, NULL_ADDRESS } from "./constant";

export function getOrCreateCreator(id: Address): Creator {
  let creator = Creator.load(id.toHex());

  if (creator) {
    return creator;
  }

  creator = new Creator(id.toHex());

  creator.address = id;
  creator.tokenAddress = NULL_ADDRESS;
  creator.twitterHandle = "";
  creator.bio = "";
  creator.deliveryTime = BIGINT_ZERO;
  creator.demos = [];
  creator.profilePicture = "";
  creator.userName = "";
  creator.price = BIGDECIMAL_ZERO;
  creator.txHash = NULL_ADDRESS;
  creator.block = BIGINT_ZERO;
  creator.timestamp = BIGINT_ZERO;
  creator.save();

  return creator;
}

export function getOrCreateRequest(id: string): Request {
  let request = Request.load(id);

  if (request) {
    return request;
  }

  request = new Request(id);

  request.requestId = BIGINT_ZERO;
  request.requester = NULL_ADDRESS;
  request.amount = BIGINT_ZERO;
  request.tokenId = BIGINT_ZERO;
  request.tokenUri = "";
  request.tokenAddress = NULL_ADDRESS;
  request.refunded = false;
  request.delivered = false;
  request.description = "";
  request.deadline = BIGINT_ZERO;
  request.txHash = NULL_ADDRESS;
  request.block = BIGINT_ZERO;
  request.timestamp = BIGINT_ZERO;
  request.save();

  return request;
}
