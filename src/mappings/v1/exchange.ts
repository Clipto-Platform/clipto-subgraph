import { Address, json } from "@graphprotocol/graph-ts";
import {
  CreatorRegistered,
  CreatorUpdated,
  DeliveredRequest,
  NewRequest,
  RefundedRequest,
  CliptoExchangeV1
} from "../../../generated/CliptoExchangeV1/CliptoExchangeV1";
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
  readValue,
  getJsonFromIpfs
} from "../../utils";
import { BIGINT_ZERO, NULL_ADDRESS, Version } from "../../constant";

export function handleCreatorRegistered(event: CreatorRegistered): void {
  getOrCreatePlatform(Version.v1);

  let creator = getOrCreateCreator(event.params.creator);
  let CliptoExchange = CliptoExchangeV1.bind(event.address);

  let try_creator = CliptoExchange.try_getCreator(event.params.creator);
  let metadataURI, nft;
  if (!try_creator.reverted) {
    metadataURI = try_creator.value.metadataURI;
    nft = try_creator.value.nft;
  } else {
    metadataURI = "";
    nft = NULL_ADDRESS;
  }

  creator.nftTokenAddress = event.params.nft;
  creator.address = event.params.creator;
  creator.txHash = event.transaction.hash;
  creator.block = event.block.number;
  creator.timestamp = event.block.timestamp;

  const data = getJsonFromIpfs(metadataURI) as string;
  let checkData = json.try_fromString(data);
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

  let nftContract = NFTContract.load(event.params.nft.toHex());
  if (nftContract == null) {
    // starting sync of clipto token
    CliptoTokenTemplate.create(event.params.nft);
    getOrCreateNFTContract(event.params.nft, event);
  }
}

export function handleCreatorUpdated(event: CreatorUpdated): void {
  let creator = getOrCreateCreator(event.params.creator);

  creator.address = event.params.creator;

  const data = getJsonFromIpfs(event.params.metadataURI) as string;

  let checkData = json.try_fromString(data);
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
  let request = getOrCreateRequest(
    event.params.creator,
    event.params.requestId.toString(),
    Version.v1
  );

  let creator = getOrCreateCreator(event.params.creator);

  request.creator = creator.id;
  request.nftTokenAddress = creator.nftTokenAddress;

  let CliptoExchange = CliptoExchangeV1.bind(event.address);

  let try_request = CliptoExchange.try_getRequest(
    event.params.creator,
    event.params.requestId
  );
  let requester, amount, metadataURI;
  if (!try_request.reverted) {
    requester = try_request.value.requester;
    amount = try_request.value.amount;
    metadataURI = try_request.value.metadataURI;
  } else {
    requester = NULL_ADDRESS;
    amount = BIGINT_ZERO;
    metadataURI = "";
  }

  request.requester = requester;
  request.requestId = event.params.requestId;
  request.amount = amount;
  request.txHash = event.transaction.hash;
  request.block = event.block.number;
  request.createdTimestamp = event.block.timestamp;
  request.refunded = false;
  request.delivered = false;

  const data = getJsonFromIpfs(metadataURI) as string;
  let checkData = json.try_fromString(data);
  if (checkData.isOk) {
    let data = checkData.value.toObject();

    request.description = getString(data.get("description"));
    request.deadline = getInt(data.get("deadline"));
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
  let try_request = CliptoExchange.try_getRequest(
    event.params.creator,
    event.params.requestId
  );
  let requester, amount, metadataURI;
  if (!try_request.reverted) {
    requester = try_request.value.requester;
    amount = try_request.value.amount;
    metadataURI = try_request.value.metadataURI;
  } else {
    requester = NULL_ADDRESS;
    amount = BIGINT_ZERO;
    metadataURI = "";
  }

  request.creator = event.params.creator.toHex();
  request.requester = requester;
  request.requestId = event.params.requestId;
  request.amount = amount;
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

  let try_creator = CliptoExchange.try_getCreator(event.params.creator);
  let metadataURI, nft;
  if (!try_creator.reverted) {
    nft = try_creator.value.nft;
  } else {
    nft = NULL_ADDRESS;
  }

  creator.nftTokenAddress = nft;

  creator.save();

  let nftContract = NFTContract.load(nft.toHex());
  if (nftContract == null) {
    // starting sync of clipto token
    CliptoTokenTemplate.create(nft);
    getOrCreateNFTContract(nft, event);
  }
}
