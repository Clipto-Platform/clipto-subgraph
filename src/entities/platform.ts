import { dataSource } from "@graphprotocol/graph-ts";
import { Platform } from "../../generated/schema";

export function getOrCreatePlatform(version: string): Platform {
  let platform = Platform.load(dataSource.address().toHex());

  if (platform) {
    return platform;
  }

  platform = new Platform(dataSource.address().toHex());

  platform.name = "Clipto Exchange";
  platform.network = dataSource.network();
  platform.version = version;
  platform.totalUsers = 0;
  platform.totalCreators = 0;
  platform.totalRequests = 0;
  platform.save();

  return platform;
}
