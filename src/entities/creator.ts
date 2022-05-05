import { Address } from "@graphprotocol/graph-ts";
import { Creator } from "../../generated/schema";
import {
  BIGINT_ZERO,
  DEFAULT_BUSINESS_PRICE,
  DEFAULT_PRICE,
  NULL_ADDRESS,
  Version,
} from "../constant";
import { getOrCreatePlatform } from "./platform";

export function getOrCreateCreator(id: Address): Creator {
  let creator = Creator.load(id.toHex());

  if (creator) {
    return creator;
  }

  creator = new Creator(id.toHex());

  creator.address = id;
  creator.nftTokenAddress = NULL_ADDRESS;
  creator.metadataURI = "";
  creator.twitterHandle = "";
  creator.bio = "";
  creator.deliveryTime = BIGINT_ZERO;
  creator.demos = [];
  creator.profilePicture = "";
  creator.userName = "";
  creator.price = DEFAULT_PRICE;
  creator.businessPrice = DEFAULT_BUSINESS_PRICE;
  creator.txHash = NULL_ADDRESS;
  creator.block = BIGINT_ZERO;
  creator.timestamp = BIGINT_ZERO;
  creator.updated = BIGINT_ZERO;
  creator.cat = false;
  creator.save();

  let platform = getOrCreatePlatform(Version.v1);

  platform.totalCreators = platform.totalCreators + 1;
  platform.save();

  return creator;
}

export class CreatorStruct {
  nft: Address;
  metadataURI: string;

  constructor(nft: Address, metadataURI: string) {
    (this.nft = nft), (this.metadataURI = metadataURI);
  }
}
