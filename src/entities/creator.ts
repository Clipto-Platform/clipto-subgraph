import { Address } from "@graphprotocol/graph-ts";
import { Creator } from "../../generated/schema";
import * as constant from "../constant";
import { getOrCreatePlatform } from "./platform";

export function getOrCreateCreator(id: Address): Creator {
  let creator = Creator.load(id.toHex());

  if (creator) {
    return creator;
  }

  creator = new Creator(id.toHex());

  creator.address = id;
  creator.nftTokenAddress = constant.NULL_ADDRESS;
  creator.metadataURI = "";
  creator.twitterHandle = "";
  creator.bio = "";
  creator.deliveryTime = constant.BIGINT_ZERO;
  creator.demos = [];
  creator.profilePicture = "";
  creator.userName = "";
  creator.price = constant.DEFAULT_PRICE;
  creator.businessPrice = constant.DEFAULT_BUSINESS_PRICE;
  creator.txHash = constant.NULL_ADDRESS;
  creator.block = constant.BIGINT_ZERO;
  creator.timestamp = constant.BIGINT_ZERO;
  creator.updated = constant.BIGINT_ZERO;
  creator.save();

  let platform = getOrCreatePlatform(constant.Version.v1);

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
