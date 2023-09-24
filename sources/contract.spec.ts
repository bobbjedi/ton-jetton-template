import { toNano, fromNano, Cell } from "ton";
import { ContractSystem } from "@tact-lang/emulator";
import { SampleTactContract } from "./output/sample_SampleTactContract";
import { JettonDefaultWallet } from "./output/sample_JettonDefaultWallet";

describe("contract", () => {
  it("should deploy correctly", async () => {
    // Create ContractSystem and deploy contract
    let system = await ContractSystem.create();
    let owner = system.treasure("owner");
    let nonOwner = system.treasure("non-owner");
    let contract = system.open(await SampleTactContract.fromInit(owner.address));
    system.name(contract.address, "main");
    let track = system.track(contract);
    await contract.send(owner, { value: toNano(1) }, { $$type: "Deploy", queryId: 0n });
    await system.run();

    const masterAddress = await contract.address
    const ownerWalletAddress = await contract.getGetWalletAddress(owner.address)
    console.log('master>', masterAddress.toString())
    console.log('ownerAddress>', await owner.address.toString())
    console.log('ownerWalletAddress>', ownerWalletAddress.toString())

    const ownerWalletContract = system.open(await JettonDefaultWallet.fromAddress(ownerWalletAddress));
    const ownerBalance = fromNano((await ownerWalletContract.getGetWalletData()).balance)
    console.log('ownerBalance', ownerBalance)

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
    console.log('ownerBalance2', ownerBalance2)


    const noOwnerWalletAddress = await contract.getGetWalletAddress(nonOwner.address)
    const noOwnerWallet = system.open(await JettonDefaultWallet.fromAddress(noOwnerWalletAddress))

    const noOwnerBalance = fromNano((await noOwnerWallet.getGetWalletData()).balance)
    console.log('noownerBalance', noOwnerBalance)

    // // Check counter
    // expect(await contract.getCounter()).toEqual(0n);

    // // Increment counter
    // await contract.send(owner, { value: toNano(1) }, "increment");
    // await system.run();

    // // Check counter
    // expect(await contract.getCounter()).toEqual(1n);

    // // Non-owner
    // await contract.send(nonOwner, { value: toNano(1) }, "increment");
    // await system.run();

  });
});
