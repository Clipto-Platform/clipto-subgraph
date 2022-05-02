import { json, log } from "@graphprotocol/graph-ts";
import { ERC721 } from "../../../generated/CliptoExchange/ERC721";
import {
  CliptoExchangeV1,
  CreatorRegistered,
  CreatorUpdated,
  DeliveredRequest,
  NewRequest,
  RefundedRequest,
} from "../../../generated/CliptoExchangeV1/CliptoExchangeV1";
import { NFTContract } from "../../../generated/schema";
import { CliptoToken as CliptoTokenTemplate } from "../../../generated/templates";
import { Version } from "../../constant";
import {
  CreatorStruct,
  DefaultCreatorStruct,
  getOrCreateCreator,
} from "../../entities/creator";
import { getOrCreatePlatform } from "../../entities/platform";
import {
  DefaultRequestStruct,
  getOrCreateRequest,
  RequestStruct,
} from "../../entities/request";
import { getOrCreateNFTContract } from "../../entities/token";
import {
  getArray,
  getDecimal,
  getInt,
  getJsonFromIpfs,
  getString,
  readValue,
} from "../../utils";

export function handleCreatorRegistered(event: CreatorRegistered): void {
  getOrCreatePlatform(Version.v1);

  let creator = getOrCreateCreator(event.params.creator);
  let CliptoExchange = CliptoExchangeV1.bind(event.address);

  let try_creator = readValue<CreatorStruct>(
    CliptoExchange.try_getCreator(event.params.creator),
    new DefaultCreatorStruct()
  );

  creator.metadataURI = try_creator.metadataURI;
  creator.nftTokenAddress = event.params.nft;
  creator.address = event.params.creator;
  creator.txHash = event.transaction.hash;
  creator.block = event.block.number;
  creator.timestamp = event.block.timestamp;

  const data = getJsonFromIpfs(try_creator.metadataURI);
  if (data == null) {
    log.warning("[IPFS] ipfs cat failed {}", [try_creator.metadataURI]);
  } else {
    let checkData = json.try_fromBytes(data);
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
  }

  creator.save();

  let nftContract = NFTContract.load(event.params.nft.toHex());
  if (nftContract == null) {
    // starting sync of clipto token
    CliptoTokenTemplate.create(event.params.nft);
    getOrCreateNFTContract(event.params.nft, event);
  }
}

export function handleCreatorUpdated(event: CreatorUpdated): void {
  let creator = getOrCreateCreator(event.params.creator);

  let metadataURI = event.params.metadataURI;

  creator.address = event.params.creator;
  creator.metadataURI = metadataURI;

  const data = getJsonFromIpfs(metadataURI);
  if (data == null) {
    log.warning("[IPFS] ipfs cat failed {}", [metadataURI]);
  } else {
    let checkData = json.try_fromBytes(data);
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

  let CliptoExchange = CliptoExchangeV1.bind(event.address);
  let try_request = readValue<RequestStruct>(
    CliptoExchange.try_getRequest(event.params.creator, event.params.requestId),
    new DefaultRequestStruct()
  );

  request.creator = creator.id;
  request.nftTokenAddress = creator.nftTokenAddress;
  request.metadataURI = try_request.metadataURI;
  request.requester = try_request.requester;
  request.requestId = event.params.requestId;
  request.amount = try_request.amount;
  request.txHash = event.transaction.hash;
  request.block = event.block.number;
  request.createdTimestamp = event.block.timestamp;
  request.refunded = false;
  request.delivered = false;

  const data = getJsonFromIpfs(try_request.metadataURI);
  if (data == null) {
    log.warning("[IPFS] ipfs cat failed {}", [try_request.metadataURI]);
  } else {
    let checkData = json.try_fromBytes(data);
    if (checkData.isOk) {
      let data = checkData.value.toObject();

      request.description = getString(data.get("description"));
      request.deadline = getInt(data.get("deadline"));
    }
  }

  request.save();
}

export function handleDeliveredRequest(event: DeliveredRequest): void {
  let creator = getOrCreateCreator(event.params.creator);
  let request = getOrCreateRequest(
    event.params.creator,
    event.params.requestId.toString(),
    Version.v1
  );

  let CliptoExchange = CliptoExchangeV1.bind(event.address);
  let try_request = readValue<RequestStruct>(
    CliptoExchange.try_getRequest(event.params.creator, event.params.requestId),
    new DefaultRequestStruct()
  );

  request.creator = event.params.creator.toHex();
  request.requester = try_request.requester;
  request.requestId = event.params.requestId;
  request.amount = try_request.amount;
  request.nftTokenId = event.params.nftTokenId;
  request.nftTokenAddress = creator.nftTokenAddress;
  request.txHash = event.transaction.hash;
  request.block = event.block.number;
  request.updatedTimestamp = event.block.timestamp;
  request.delivered = true;

  let erc721Contract = ERC721.bind(creator.nftTokenAddress);
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

export function handleMigrationCreator(event: RefundedRequest): void {
  getOrCreatePlatform(Version.v1);

  let creator = getOrCreateCreator(event.params.creator);
  let CliptoExchange = CliptoExchangeV1.bind(event.address);

  let try_creator = readValue<CreatorStruct>(
    CliptoExchange.try_getCreator(event.params.creator),
    new DefaultCreatorStruct()
  );

  creator.nftTokenAddress = try_creator.nft;
  creator.save();

  let nftContract = NFTContract.load(try_creator.nft.toHex());
  if (nftContract == null) {
    // starting sync of clipto token
    CliptoTokenTemplate.create(try_creator.nft);
    getOrCreateNFTContract(try_creator.nft, event);
  }
}
