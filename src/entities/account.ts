import { Address } from "@graphprotocol/graph-ts";
import { Account } from "../../generated/schema";
import { Version } from "../constant";
import { getOrCreatePlatform } from "./platform";

export function createAccount(address: Address): Account {
  let account = Account.load(address.toHex());

  if (account) {
    return account;
  }

  let platform = getOrCreatePlatform(Version.v1);

  platform.totalUsers = platform.totalUsers + 1;
  platform.save();

  return new Account(address.toHex());
}
