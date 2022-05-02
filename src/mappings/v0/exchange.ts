import { json } from "@graphprotocol/graph-ts";
import {
  CreatorRegistered,
  CreatorUpdated,
  DeliveredRequest,
  NewRequest,
  RefundedRequest,
  RequestUpdated
} from "../../../generated/CliptoExchange/CliptoExchange";
import { ERC721 } from "../../../generated/CliptoExchange/ERC721";
import { NFTContract } from "../../../generated/schema";
import { CliptoToken as CliptoTokenTemplate } from "../../../generated/templates";
import { getOrCreateCreator } from "../../entities/creator";
import { getOrCreatePlatform } from "../../entities/platform";
import { getOrCreateRequest } from "../../entities/request";
import { getOrCreateNFTContract } from "../../entities/token";
import {
  getArray,
  getDecimal,
  getInt,
  getString,
  readValue
} from "../../utils";

export function handleCreatorRegistered(event: CreatorRegistered): void {
  getOrCreatePlatform();

  let creator = getOrCreateCreator(event.params.creator);

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

  let nftContract = NFTContract.load(event.params.token.toHex());
  if (nftContract == null) {
    // starting sync of clipto token
    CliptoTokenTemplate.create(event.params.token);
    getOrCreateNFTContract(event.params.token, event);
  }
}

export function handleCreatorUpdated(event: CreatorUpdated): void {
  let creator = getOrCreateCreator(event.params.creator);

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
    creator.updated = event.block.timestamp;
  }

  creator.save();
}

export function handleNewRequest(event: NewRequest): void {
  let id = event.params.creator.toHex() + "-" + event.params.index.toHex();
  let request = getOrCreateRequest(id);

  let creator = getOrCreateCreator(event.params.creator);

  request.creator = creator.id;
  request.tokenAddress = creator.tokenAddress;
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
  let id = event.params.creator.toHex() + "-" + event.params.index.toHex();
  let request = getOrCreateRequest(id);

  request.creator = event.params.creator.toHex();
  request.requester = event.params.requester;
  request.requestId = event.params.index;
  request.amount = event.params.amount;
  request.tokenId = event.params.tokenId;
  request.tokenAddress = event.params.tokenAddress;
  request.txHash = event.transaction.hash;
  request.block = event.block.number;
  request.updated = event.block.timestamp;
  request.delivered = true;

  let erc721Contract = ERC721.bind(event.params.tokenAddress);
  request.tokenUri = readValue<string>(
    erc721Contract.try_tokenURI(event.params.tokenId),
    ""
  );

  request.save();
}

export function handleRefundedRequest(event: RefundedRequest): void {
  let id = event.params.creator.toHex() + "-" + event.params.index.toHex();
  let request = getOrCreateRequest(id);

  request.txHash = event.transaction.hash;
  request.block = event.block.number;
  request.updated = event.block.timestamp;
  request.refunded = true;
  request.save();
}

export function handleRequestUpdated(event: RequestUpdated): void {
  let id = event.params.creator.toHex() + "-" + event.params.index.toHex();
  let request = getOrCreateRequest(id);

  request.amount = event.params.amountIncreased;
  request.txHash = event.transaction.hash;
  request.block = event.block.number;
  request.updated = event.block.timestamp;
  request.save();
}
