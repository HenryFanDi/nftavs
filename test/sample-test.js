const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFTAVs", function () {
  it("Should mint and transfer an NFT to someone", async function () {
    const NFTAVs = await ethers.getContractFactory("NFTAVs");
    const nftAVs = await NFTAVs.deploy();
    await nftAVs.deployed();

    const recipient = '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266';
    const metadataURI = 'cid/test.png';

    // Check the current balance of the recipient's wallet address balance of is a method built into the ERC721 spec,
    // now currently the user hasn't purchased any nfts, so we expect the balance to equal zero.
    let balance = await nftAVs.balanceOf(recipient);
    expect(balance).to.equal(0);

    // Newly minted token that calls the payment method that we defined on the smart contract,
    // it takes the recipient and metadata uri as argument and then we can also define the message value as 0.05 ether.
    const mintQuantity = 10
    const mintCost = (0.005 * mintQuantity).toString();
    const newlyMintedToken = await nftAVs.publicSaleMint(mintQuantity, { value: ethers.utils.parseEther(mintCost) });

    // wait until the transaction is mined
    await newlyMintedToken.wait();

    balance = await nftAVs.balanceOf(recipient);
    expect(balance).to.equal(mintQuantity);

    // expect(await nftAVs.isContentOwned(metadataURI)).to.equal(true);

    ///

    // expect(await greeter.greet()).to.equal("Hello, world!");

    // const setGreetingTx = await greeter.setGreeting("Hola, mundo!");

    // // wait until the transaction is mined
    // await setGreetingTx.wait();

    // expect(await greeter.greet()).to.equal("Hola, mundo!");
  });
});