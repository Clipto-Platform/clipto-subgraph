import { dataSource } from "@graphprotocol/graph-ts";
import { Platform } from "../../generated/schema";

export function getOrCreatePlatform(): Platform {
  let platform = Platform.load(dataSource.address.toString());

  if (platform) {
    return platform;
  }

  platform = new Platform(dataSource.address.toString());

  platform.name = "Clipto Exchange";
  platform.network = dataSource.network.toString();
  platform.save();

  return platform;
}
