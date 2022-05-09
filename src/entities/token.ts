import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { ERC721 } from "../../generated/CliptoExchange/ERC721";
import { CliptoToken, NFTContract } from "../../generated/schema";
import { BIGINT_ZERO } from "../constant";
import { readValue } from "../utils";

export function getOrCreateNFTContract(
  address: Address,
  event: ethereum.Event
): NFTContract {
  let contract = NFTContract.load(address.toHex());

  if (contract) {
    updateContract(contract, address);
    return contract;
  }

  contract = new NFTContract(address.toHex());
  let erc721 = ERC721.bind(address);

  contract.symbol = readValue<string>(erc721.try_symbol(), "clipto");
  contract.name = readValue<string>(erc721.try_name(), "clipto token");
  contract.totalSupply = readValue<BigInt>(
    erc721.try_totalSupply(),
    BIGINT_ZERO
  );
  contract.creator = "";
  contract.blockNumber = event.block.number;
  contract.blockHash = event.block.hash;
  contract.txHash = event.transaction.hash;
  contract.timestamp = event.block.timestamp;
  contract.save();

  return contract;
}

function updateContract(contract: NFTContract, address: Address): void {
  let erc721 = ERC721.bind(address);
  contract.totalSupply = readValue<BigInt>(
    erc721.try_totalSupply(),
    BIGINT_ZERO
  );

  contract.save();
}

export function getOrCreateCliptoToken(
  address: Address,
  tokenId: BigInt
): CliptoToken {
  let id = address
    .toHex()
    .concat("-")
    .concat(tokenId.toString());
  let token = CliptoToken.load(id);

  if (token) {
    return token;
  }

  token = new CliptoToken(id);

  token.tokenId = tokenId;
  token.nftContract = "";
  token.originalRequester = "";
  token.currentOwner = "";
  token.from = "";
  token.creator = "";
  token.tokenUri = "";
  token.save();

  return token;
}
