const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFTAVs", function () {
  const setupContract = async () => {
    const NFTAVs = await ethers.getContractFactory("NFTAVs");
    const nftAVs = await NFTAVs.deploy();
    await nftAVs.deployed();
    return nftAVs;
  };

  it("Should mint and transfer an NFT to someone", async function () {
    const nftAVs = await setupContract();
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
  });

  it('Throws if royalties more than 100%', async function () {
    const nftAVs = await setupContract();
    const [, addr1] = await ethers.getSigners();
    const tx = nftAVs.setRoyalties(addr1.address, 10001);
    await expect(tx).to.be.revertedWith('ERC2981Royalties: Too high');
  });

  it('Has the right royalties for tokenId', async function () {
    const nftAVs = await setupContract();
    const [, addr1] = await ethers.getSigners();
    await nftAVs.setRoyalties(addr1.address, 250);

    const mintQuantity = 10
    const mintCost = (0.005 * mintQuantity).toString();
    await nftAVs.publicSaleMint(mintQuantity, { value: ethers.utils.parseEther(mintCost) });

    const info = await nftAVs.royaltyInfo(0, 10000);
    expect(info[1].toNumber()).to.be.equal(250);
    expect(info[0]).to.be.equal(addr1.address);
  });
});