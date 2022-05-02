import { Address, Bytes, ethereum, store } from "@graphprotocol/graph-ts";
import { assert, newMockEvent, test } from "matchstick-as";
import { log } from "matchstick-as/assembly/log";
import { CreatorRegistered } from "../../generated/CliptoExchange/CliptoExchange";
import { Creator } from "../../generated/schema";
import { handleCreatorRegistered } from "../../src/mapping";

const createCreatorRegisteredEvent = (): CreatorRegistered => {
  let mockEvent = newMockEvent();
  let creatorEvent = new CreatorRegistered(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters
  );
  creatorEvent.parameters = new Array();
  const jsonData =
    '{"id":24,"userName":"atul","address":"0x7c98C2DEc5038f00A2cbe8b7A64089f9c0b51991","twitterHandle":"PatareAtul","profilePicture":"https://pbs.twimg.com/profile_images/1486704746144559105/eGbftYY-_400x400.jpg","deliveryTime":3,"demos":["https://twitter.com/PatareAtul/status/1486684530945581068"],"bio":"here here","price":0.001}';

  let creator = new ethereum.EventParam(
    "creator",
    ethereum.Value.fromAddress(
      Address.fromString("0x7c98C2DEc5038f00A2cbe8b7A64089f9c0b51991")
    )
  );
  let token = new ethereum.EventParam(
    "token",
    ethereum.Value.fromAddress(
      Address.fromString("0x7c98C2DEc5038f00A2cbe8b7A64089f9c0b51991")
    )
  );
  let json = new ethereum.EventParam(
    "data",
    ethereum.Value.fromString(jsonData)
  );

  creatorEvent.parameters.push(creator);
  creatorEvent.parameters.push(token);
  creatorEvent.parameters.push(json);

  return creatorEvent;
};

test("creator registering", () => {
  let creatorRegistered = createCreatorRegisteredEvent();
  handleCreatorRegistered(creatorRegistered);

  let creator = new Creator("0x7c98c2dec5038f00a2cbe8b7a64089f9c0b51991");
  creator.twitterHandle = "PatareAtul";
  creator.save();

  let storeCreator = store.get(
    "Creator",
    "0x7c98C2DEc5038f00A2cbe8b7A64089f9c0b51991"
  );
  log.debug("here {}", [storeCreator.getString("twitterHandle")]);
  assert.fieldEquals(
    "Creator",
    "0x7c98C2DEc5038f00A2cbe8b7A64089f9c0b51991",
    "twitterHandle",
    "PatareAtul"
  );
});
