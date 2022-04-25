import { Request } from "../../generated/schema";
import { BIGINT_ZERO, NULL_ADDRESS } from "../constant";

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
  request.updated = BIGINT_ZERO;
  request.save();

  return request;
}
