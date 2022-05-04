import { Address, Bytes, json } from "@graphprotocol/graph-ts";
import { ERC721 } from "../../../generated/CliptoExchange/ERC721";
import {
  CliptoExchangeV1,
  CreatorRegistered,
  CreatorUpdated,
  DeliveredRequest,
  MigrationCreator,
  NewRequest,
  RefundedRequest,
} from "../../../generated/CliptoExchangeV1/CliptoExchangeV1";
import { Version } from "../../constant";
import { getOrCreateCreator } from "../../entities/creator";
import { getOrCreatePlatform } from "../../entities/platform";
import { getOrCreateRequest } from "../../entities/request";
import {
  getArray,
  getBoolean,
  getDecimal,
  getInt,
  getJsonFromIpfs,
  getString,
  readValue,
  readValueFromCreatorStruct,
  readValueFromRequestStruct,
} from "../../utils";
import { beginNFTContractSync } from "../token";

export function handleCreatorRegistered(event: CreatorRegistered): void {
  getOrCreatePlatform(Version.v1);

  let creator = getOrCreateCreator(event.params.creator);
  let exchange = CliptoExchangeV1.bind(event.address);

  let try_creator = readValueFromCreatorStruct(
    exchange.try_getCreator(event.params.creator)
  );

  creator.metadataURI = try_creator.metadataURI;
  creator.nftTokenAddress = event.params.nft;
  creator.address = event.params.creator;
  creator.txHash = event.transaction.hash;
  creator.block = event.block.number;
  creator.timestamp = event.block.timestamp;

  const data = getJsonFromIpfs(try_creator.metadataURI);
  const checkData = json.try_fromBytes(data as Bytes);
  if (checkData.isOk) {
    let data = checkData.value.toObject();

    creator.twitterHandle = getString(data.get("twitterHandle"));
    creator.bio = getString(data.get("bio"));
    creator.deliveryTime = getInt(data.get("deliveryTime"));
    creator.profilePicture = getString(data.get("profilePicture"));
    creator.userName = getString(data.get("userName"));
    creator.price = getDecimal(data.get("price"));
    creator.businessPrice = getDecimal(data.get("businessPrice"));
    creator.demos = getArray(data.get("demos"));
  }

  creator.save();

  beginNFTContractSync(event.params.nft, event, creator.id, Version.v1);
}

export function handleCreatorUpdated(event: CreatorUpdated): void {
  let creator = getOrCreateCreator(event.params.creator);
  let metadataURI = event.params.metadataURI;

  creator.address = event.params.creator;
  creator.metadataURI = metadataURI;

  const data = getJsonFromIpfs(metadataURI);
  const checkData = json.try_fromBytes(data);
  if (checkData.isOk) {
    let data = checkData.value.toObject();

    creator.twitterHandle = getString(data.get("twitterHandle"));
    creator.bio = getString(data.get("bio"));
    creator.deliveryTime = getInt(data.get("deliveryTime"));
    creator.profilePicture = getString(data.get("profilePicture"));
    creator.userName = getString(data.get("userName"));
    creator.price = getDecimal(data.get("price"));
    creator.businessPrice = getDecimal(data.get("businessPrice"));
    creator.demos = getArray(data.get("demos"));
    creator.updated = event.block.timestamp;
  }

  creator.save();
}

export function handleNewRequest(event: NewRequest): void {
  let creator = getOrCreateCreator(event.params.creator);
  let request = getOrCreateRequest(
    event.params.creator,
    event.params.requestId.toString(),
    Version.v1
  );

  let exchange = CliptoExchangeV1.bind(event.address);
  let try_request = readValueFromRequestStruct(
    exchange.try_getRequest(event.params.creator, event.params.requestId)
  );

  request.metadataURI = try_request.metadataURI;
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

  const data = getJsonFromIpfs(try_request.metadataURI);
  const checkData = json.try_fromBytes(data);
  if (checkData.isOk) {
    let data = checkData.value.toObject();

    request.isBusiness = getBoolean(data.get("isBusiness"));
    request.description = getString(data.get("description"));
    request.deadline = getInt(data.get("deadline"));
  }

  request.save();
}

export function handleDeliveredRequest(event: DeliveredRequest): void {
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
  request.nftTokenUri = readValue<string>(
    erc721Contract.try_tokenURI(event.params.nftTokenId),
    ""
  );

  request.save();
}

export function handleRefundedRequest(event: RefundedRequest): void {
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

export function handleMigrationCreator(event: MigrationCreator): void {
  getOrCreatePlatform(Version.v1);

  for (let index = 0; index < event.params.creators.length; index++) {
    let creatorAddress = event.params.creators[index];
    let creator = getOrCreateCreator(creatorAddress);
    let exchange = CliptoExchangeV1.bind(event.address);

    let try_creator = readValueFromCreatorStruct(
      exchange.try_getCreator(creatorAddress)
    );

    creator.metadataURI = try_creator.metadataURI;
    creator.nftTokenAddress = try_creator.nft;
    creator.save();

    beginNFTContractSync(try_creator.nft, event, creator.id, Version.v1);
  }
}
