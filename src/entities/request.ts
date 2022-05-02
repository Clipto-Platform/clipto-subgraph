import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
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
  request.description = "";
  request.deadline = BIGINT_ZERO;
  request.txHash = NULL_ADDRESS;
  request.block = BIGINT_ZERO;
  request.createdTimestamp = BIGINT_ZERO;
  request.updatedTimestamp = BIGINT_ZERO;
  request.save();

  return request;
}

export class RequestStruct extends ethereum.Tuple {
  get requester(): Address {
    return this[0].toAddress();
  }

  get nftReceiver(): Address {
    return this[1].toAddress();
  }

  get erc20(): Address {
    return this[2].toAddress();
  }

  get amount(): BigInt {
    return this[3].toBigInt();
  }

  get fulfilled(): boolean {
    return this[4].toBoolean();
  }

  get metadataURI(): string {
    return this[5].toString();
  }
}

export class DefaultRequestStruct extends ethereum.Tuple {
  get requester(): Address {
    return NULL_ADDRESS;
  }

  get nftReceiver(): Address {
    return NULL_ADDRESS;
  }

  get erc20(): Address {
    return NULL_ADDRESS;
  }

  get amount(): BigInt {
    return BIGINT_ZERO;
  }

  get fulfilled(): boolean {
    return false;
  }

  get metadataURI(): string {
    return "";
  }
}
