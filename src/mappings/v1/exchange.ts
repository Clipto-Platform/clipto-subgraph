import { Address, json } from "@graphprotocol/graph-ts";
import { ERC721 } from "../../../generated/CliptoExchange/ERC721";
import * as CliptoExchangeV1 from "../../../generated/CliptoExchangeV1/CliptoExchangeV1";
import { Version } from "../../constant";
import { getOrCreateCreator } from "../../entities/creator";
import { getOrCreatePlatform } from "../../entities/platform";
import { getOrCreateRequest } from "../../entities/request";
import * as utils from "../../utils";
import { beginNFTContractSync } from "../token";

export function handleCreatorRegistered(
  event: CliptoExchangeV1.CreatorRegistered
): void {
  getOrCreatePlatform(Version.v1);

  let creator = getOrCreateCreator(event.params.creator);
  creator.nftTokenAddress = event.params.nft;
  creator.address = event.params.creator;
  creator.txHash = event.transaction.hash;
  creator.block = event.block.number;
  creator.timestamp = event.block.timestamp;

  let checkData = json.try_fromString(event.params.jsondata);
  if (checkData.isOk) {
    let data = checkData.value.toObject();

    creator.twitterHandle = utils.getString(data.get("twitterHandle"));
    creator.lensHandle = utils.getString(data.get("lensHandle"));
    creator.bio = utils.getString(data.get("bio"));
    creator.deliveryTime = utils.getInt(data.get("deliveryTime"));
    creator.profilePicture = utils.getString(data.get("profilePicture"));
    creator.userName = utils.getString(data.get("userName"));
    creator.price = utils.getDecimal(data.get("price"));
    creator.businessPrice = utils.getDecimal(data.get("businessPrice"));
    creator.demos = utils.getArray(data.get("demos"));
  }

  creator.save();

  beginNFTContractSync(event.params.nft, event, creator.id, Version.v1);
}

export function handleCreatorUpdated(
  event: CliptoExchangeV1.CreatorUpdated
): void {
  let creator = getOrCreateCreator(event.params.creator);

  creator.address = event.params.creator;
  creator.txHash = event.transaction.hash;
  creator.block = event.block.number;
  creator.timestamp = event.block.timestamp;

  let checkData = json.try_fromString(event.params.jsondata);
  if (checkData.isOk) {
    let data = checkData.value.toObject();

    creator.twitterHandle = utils.getString(data.get("twitterHandle"));
    creator.lensHandle = utils.getString(data.get("lensHandle"));
    creator.bio = utils.getString(data.get("bio"));
    creator.deliveryTime = utils.getInt(data.get("deliveryTime"));
    creator.profilePicture = utils.getString(data.get("profilePicture"));
    creator.userName = utils.getString(data.get("userName"));
    creator.price = utils.getDecimal(data.get("price"));
    creator.businessPrice = utils.getDecimal(data.get("businessPrice"));
    creator.demos = utils.getArray(data.get("demos"));
    creator.updated = event.block.timestamp;
  }

  creator.save();
}

export function handleNewRequest(event: CliptoExchangeV1.NewRequest): void {
  let creator = getOrCreateCreator(event.params.creator);
  let request = getOrCreateRequest(
    event.params.creator,
    event.params.requestId.toString(),
    Version.v1
  );

  let exchange = CliptoExchangeV1.CliptoExchangeV1.bind(event.address);
  let try_request = utils.readValueFromRequestStruct(
    exchange.try_getRequest(event.params.creator, event.params.requestId)
  );

  request.requestId = event.params.requestId;
  request.creator = creator.id;
  request.requester = try_request.requester;
  request.nftReceiver = try_request.nftReceiver;
  request.amount = try_request.amount;
  request.erc20 = try_request.erc20;
  request.nftTokenAddress = creator.nftTokenAddress;
  request.refunded = false;
  request.delivered = false;
  request.txHash = event.transaction.hash;
  request.block = event.block.number;
  request.createdTimestamp = event.block.timestamp;
  request.updatedTimestamp = event.block.timestamp;

  let checkData = json.try_fromString(event.params.jsondata);
  if (checkData.isOk) {
    let data = checkData.value.toObject();

    request.isBusiness = utils.getBoolean(data.get("isBusiness"));
    request.description = utils.getString(data.get("description"));
    request.deadline = utils.getInt(data.get("deadline"));
  }

  request.save();
}

export function handleDeliveredRequest(
  event: CliptoExchangeV1.DeliveredRequest
): void {
  let request = getOrCreateRequest(
    event.params.creator,
    event.params.requestId.toString(),
    Version.v1
  );

  request.delivered = true;
  request.nftTokenId = event.params.nftTokenId;
  request.txHash = event.transaction.hash;
  request.block = event.block.number;
  request.updatedTimestamp = event.block.timestamp;

  let erc721Contract = ERC721.bind(
    Address.fromString(request.nftTokenAddress.toHex())
  );
  request.nftTokenUri = utils.readValue<string>(
    erc721Contract.try_tokenURI(event.params.nftTokenId),
    ""
  );

  request.save();
}

export function handleRefundedRequest(
  event: CliptoExchangeV1.RefundedRequest
): void {
  let request = getOrCreateRequest(
    event.params.creator,
    event.params.requestId.toString(),
    Version.v1
  );

  request.txHash = event.transaction.hash;
  request.block = event.block.number;
  request.updatedTimestamp = event.block.timestamp;
  request.refunded = true;
  request.save();
}

export function handleRejectedRequest(
  event: CliptoExchangeV1.RejectRequest
): void {
  let request = getOrCreateRequest(
    event.params.creator,
    event.params.requestId.toString(),
    Version.v1
  );

  request.txHash = event.transaction.hash;
  request.block = event.block.number;
  request.updatedTimestamp = event.block.timestamp;
  request.rejected = true;
  request.save();
}

export function handleMigrationCreator(
  event: CliptoExchangeV1.MigrationCreator
): void {
  getOrCreatePlatform(Version.v1);

  for (let index = 0; index < event.params.creators.length; index++) {
    let creatorAddress = event.params.creators[index];
    let creator = getOrCreateCreator(creatorAddress);
    let exchange = CliptoExchangeV1.CliptoExchangeV1.bind(event.address);

    let nft = exchange.getCreator(creatorAddress);

    creator.nftTokenAddress = nft;
    creator.save();

    beginNFTContractSync(nft, event, creator.id, Version.v1);
  }
}
