import { toNano, fromNano, Cell, OpenedContract } from "ton";
import { ContractSystem, Treasure } from "@tact-lang/emulator";
import { SampleTactContract } from "./output/sample_SampleTactContract";
import { JettonDefaultWallet } from "./output/sample_JettonDefaultWallet";



let system: ContractSystem
let owner: Treasure
let nonOwner: Treasure
let contract: OpenedContract<SampleTactContract>

describe("contract", () => {
  it("should deploy correctly", async () => {
    // Create ContractSystem and deploy contract

    system = await ContractSystem.create();
    owner = system.treasure("owner");
    nonOwner = system.treasure("non-owner");
    contract = system.open(await SampleTactContract.fromInit(owner.address));
    system.name(contract.address, "main");


    let track = system.track(contract);
    await contract.send(owner, { value: toNano(1) }, { $$type: "Deploy", queryId: 0n });
    await system.run();

    const masterAddress = await contract.address
    expect(masterAddress).toBeDefined()
  });

  it("should transfer correctly", async () => {
    // Create ContractSystem and deploy contract
    const ownerWalletAddress = await contract.getGetWalletAddress(owner.address)


    const ownerWalletContract = system.open(await JettonDefaultWallet.fromAddress(ownerWalletAddress));
    const ownerBalance = fromNano((await ownerWalletContract.getGetWalletData()).balance)

    expect(ownerBalance).toEqual('10');

    await ownerWalletContract.send(owner, { value: toNano(1) }, {
      $$type: 'TokenTransfer',
      amount: toNano(1),
      destination: nonOwner.address,
      queryId: toNano(10),
      forwardTonAmount: toNano(0),
      responseDestination: null,
      customPayload: null,
      forwardPayload: new Cell()
    });
    await system.run();

    const ownerBalance2 = fromNano((await ownerWalletContract.getGetWalletData()).balance)

    expect(ownerBalance2).toEqual('9');

    const noOwnerWalletAddress = await contract.getGetWalletAddress(nonOwner.address)
    const noOwnerWallet = system.open(await JettonDefaultWallet.fromAddress(noOwnerWalletAddress))

    const noOwnerBalance = fromNano((await noOwnerWallet.getGetWalletData()).balance)

    expect(noOwnerBalance).toEqual('1');
  });
});
