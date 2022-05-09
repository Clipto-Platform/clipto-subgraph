import { json } from "@graphprotocol/graph-ts";
import * as CliptoExchange from "../../../generated/CliptoExchange/CliptoExchange";
import { ERC721 } from "../../../generated/CliptoExchange/ERC721";
import { Version } from "../../constant";
import { getOrCreateCreator } from "../../entities/creator";
import { getOrCreatePlatform } from "../../entities/platform";
import { getOrCreateRequest } from "../../entities/request";
import * as utils from "../../utils";
import { beginNFTContractSync } from "../token";

export function handleCreatorRegistered(
  event: CliptoExchange.CreatorRegistered
): void {
  getOrCreatePlatform(Version.v0);

  let creator = getOrCreateCreator(event.params.creator);

  creator.nftTokenAddress = event.params.token;
  creator.address = event.params.creator;
  creator.txHash = event.transaction.hash;
  creator.block = event.block.number;
  creator.timestamp = event.block.timestamp;

  let checkData = json.try_fromString(event.params.data);
  if (checkData.isOk) {
    let data = checkData.value.toObject();

    creator.twitterHandle = utils.getString(data.get("twitterHandle"));
    creator.bio = utils.getString(data.get("bio"));
    creator.deliveryTime = utils.getInt(data.get("deliveryTime"));
    creator.profilePicture = utils.getString(data.get("profilePicture"));
    creator.userName = utils.getString(data.get("userName"));
    creator.price = utils.getDecimal(data.get("price"));
    creator.demos = utils.getArray(data.get("demos"));
  }
  creator.save();

  beginNFTContractSync(event.params.token, event, creator.id, Version.v0);
}

export function handleCreatorUpdated(
  event: CliptoExchange.CreatorUpdated
): void {
  let creator = getOrCreateCreator(event.params.creator);

  creator.address = event.params.creator;
  let checkData = json.try_fromString(event.params.data);
  if (checkData.isOk) {
    let data = checkData.value.toObject();

    creator.twitterHandle = utils.getString(data.get("twitterHandle"));
    creator.bio = utils.getString(data.get("bio"));
    creator.deliveryTime = utils.getInt(data.get("deliveryTime"));
    creator.profilePicture = utils.getString(data.get("profilePicture"));
    creator.userName = utils.getString(data.get("userName"));
    creator.price = utils.getDecimal(data.get("price"));
    creator.demos = utils.getArray(data.get("demos"));
    creator.updated = event.block.timestamp;
  }

  creator.save();
}

export function handleNewRequest(event: CliptoExchange.NewRequest): void {
  let creator = getOrCreateCreator(event.params.creator);
  let request = getOrCreateRequest(
    event.params.creator,
    event.params.index.toString(),
    Version.v0
  );

  request.creator = creator.id;
  request.nftTokenAddress = creator.nftTokenAddress;
  request.requester = event.params.requester;
  request.nftReceiver = event.params.requester;
  request.requestId = event.params.index;
  request.amount = event.params.amount;
  request.txHash = event.transaction.hash;
  request.block = event.block.number;
  request.createdTimestamp = event.block.timestamp;
  request.refunded = false;
  request.delivered = false;

  let checkData = json.try_fromString(event.params.data);
  if (checkData.isOk) {
    let data = checkData.value.toObject();

    request.description = utils.getString(data.get("description"));
    request.deadline = utils.getInt(data.get("deadline"));
  }

  request.save();
}

export function handleDeliveredRequest(
  event: CliptoExchange.DeliveredRequest
): void {
  let request = getOrCreateRequest(
    event.params.creator,
    event.params.index.toString(),
    Version.v0
  );

  request.creator = event.params.creator.toHex();
  request.requester = event.params.requester;
  request.requestId = event.params.index;
  request.amount = event.params.amount;
  request.nftTokenId = event.params.tokenId;
  request.nftTokenAddress = event.params.tokenAddress;
  request.txHash = event.transaction.hash;
  request.block = event.block.number;
  request.updatedTimestamp = event.block.timestamp;
  request.delivered = true;

  let erc721Contract = ERC721.bind(event.params.tokenAddress);
  request.nftTokenUri = utils.readValue<string>(
    erc721Contract.try_tokenURI(event.params.tokenId),
    ""
  );

  request.save();
}

export function handleRefundedRequest(
  event: CliptoExchange.RefundedRequest
): void {
  let request = getOrCreateRequest(
    event.params.creator,
    event.params.index.toString(),
    Version.v0
  );

  request.txHash = event.transaction.hash;
  request.block = event.block.number;
  request.updatedTimestamp = event.block.timestamp;
  request.refunded = true;
  request.save();
}

export function handleRequestUpdated(
  event: CliptoExchange.RequestUpdated
): void {
  let request = getOrCreateRequest(
    event.params.creator,
    event.params.index.toString(),
    Version.v0
  );

  request.amount = event.params.amountIncreased;
  request.txHash = event.transaction.hash;
  request.block = event.block.number;
  request.updatedTimestamp = event.block.timestamp;
  request.save();
}
