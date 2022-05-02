import { Address } from "@graphprotocol/graph-ts";
import { Request } from "../../generated/schema";
import { BIGINT_ZERO, NULL_ADDRESS } from "../constant";

export function getOrCreateRequest(
  creator: Address,
  requestId: string,
  version: string
): Request {
  let id = creator
    .toHex()
    .concat(version)
    .concat(requestId);
  let request = Request.load(id);

  if (request) {
    return request;
  }

  request = new Request(id);

  request.requestId = BIGINT_ZERO;
  request.requester = NULL_ADDRESS;
  request.nftReceiver = NULL_ADDRESS;
  request.erc20 = NULL_ADDRESS;
  request.amount = BIGINT_ZERO;
  request.nftTokenId = BIGINT_ZERO;
  request.nftTokenUri = "";
  request.nftTokenAddress = NULL_ADDRESS;
  request.refunded = false;
  request.delivered = false;
  request.description = "";
  request.deadline = BIGINT_ZERO;
  request.txHash = NULL_ADDRESS;
  request.block = BIGINT_ZERO;
  request.createdTimestamp = BIGINT_ZERO;
  request.updatedTimestamp = BIGINT_ZERO;
  request.save();

  return request;
}
