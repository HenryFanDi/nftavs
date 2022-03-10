// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "erc721a/contracts/ERC721A.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFTAVs is ERC721A, Ownable {

    uint256 public immutable maxPerAddressDuringMint = 100;
    uint256 public immutable collectionSize = 10;
    
    struct SaleConfig {
        uint64 publicPrice;
    }

    SaleConfig public saleConfig;

    constructor() ERC721A("NFTAVs", "NAV") {
        saleConfig = SaleConfig(0.005 ether);
    }

    modifier callerIsUser() {
        require(tx.origin == msg.sender, "The caller is another contract");
        _;
    }

    function publicSaleMint(uint256 quantity) external payable callerIsUser {
        SaleConfig memory config = saleConfig;
        uint256 publicPrice = uint256(config.publicPrice);
        require(totalSupply() + quantity <= collectionSize, "reached max supply");
        require(numberMinted(msg.sender) + quantity <= maxPerAddressDuringMint, "can not mint this many");
        _safeMint(msg.sender, quantity);
        refundIfOver(publicPrice * quantity);
    }

    function numberMinted(address owner) public view returns (uint256) {
        return _numberMinted(owner);
    }

    function refundIfOver(uint256 price) private {
        require(msg.value >= price, "Need to send more ETH.");
        if (msg.value > price) {
            payable(msg.sender).transfer(msg.value - price);
        }
    }

    // Metadata URI
    string private _baseTokenURI;

    function _baseURI() internal view virtual override returns (string memory) {
        return "https://gateway.pinata.cloud/ipfs/Qmc2ETU3hVn1uuDee8M2KiicbJaPb8Q2v8Yv8CRifgB7cC/";
    }

    function setBaseURI(string calldata baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
    }

    string[] private _tokenURIs;

    function setTokenURIs(string[] memory tokenURIs) external {
        _tokenURIs = tokenURIs;
    }
    
    function getTokenURIs() external view returns (string[] memory) {
        return _tokenURIs;
    }

    // // TODO: Should freeze after specific timestamp.
    // function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
    // }

    // using Counters for Counters.Counter;
    
    // Counters.Counter private _tokenIdCounter;

    // // Make sure that the same uri can't be minted twice.
    // mapping(string => uint8) existingURIs;

    // function isContentOwned(string memory uri) public view returns (bool) {
    //     return existingURIs[uri] == 1;
    // }

    // // It takes a recipient and metadata content id then mint a new token with that data.
    // // `payable` : means that somebody can transfer money into the contract.
    // function payToMint(
    //     string memory metadataURI,
    //     uint256 quantity
    // ) public payable {
    //     require(existingURIs[metadataURI] != 1, 'NFT already minted!');
    //     // Make sure that the minimum value is greater than xxx.
    //     require(msg.value >= (0.05 ether * quantity), 'Need to pay up!');

    //     uint256 newItemId = _tokenIdCounter.current();
    //     _tokenIdCounter.increment();
    //     existingURIs[metadataURI] = 1;

    //     // Minted!
    //     _safeMint(msg.sender, quantity);
    // }

    // // Know exactly how many tokens have been minted.
    // function count() public view returns (uint256) {
    //     return _tokenIdCounter.current();
    // }
}
