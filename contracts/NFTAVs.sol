// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "erc721a/contracts/ERC721A.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";

contract NFTAVs is ERC721A, IERC2981, Ownable {

    uint256 public immutable maxPerAddressDuringMint = 100;
    uint256 public immutable collectionSize = 10;
    
    struct SaleConfig {
        uint64 publicPrice;
    }

    SaleConfig public _saleConfig;

    struct RoyaltyInfo {
        address recipient;
        uint24 amount;
    }

    RoyaltyInfo private _royalties;

    constructor() ERC721A("NFTAVs", "NAV") {
        _saleConfig = SaleConfig(0.005 ether);
    }

    modifier callerIsUser() {
        require(tx.origin == msg.sender, "The caller is another contract");
        _;
    }

    function publicSaleMint(uint256 quantity) external payable callerIsUser {
        SaleConfig memory config = _saleConfig;
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

    /**
     * @notice Get royalty info for a token
     *
     * For a given token id and sale price, how much should be sent to whom as royalty
     *
     * @param _tokenId - the NFT asset queried for royalty information
     * @param _salePrice - the sale price of the NFT asset specified by _tokenId
     *
     * @return receiver - address of who should be sent the royalty payment
     * @return royaltyAmount - the royalty payment amount for _value sale price
     */

     /**
     In general, marketplaces will deduct the royalty fee from the payment to the seller. 
     E.g., if the NFT is sold for 1 ETH and the royalty fee is 5%, 
     they would send 0.95 ETH to the seller and 0.05 ETH to the royalty receiver. 
     The 0.05 ETH royalty could be sent to the royaltyRecipient right from the marketplace smart contract when the transaction happens, 
     or could be escrowed until further time, or be transmitted in a separate manual transaction — there is no standard for that yet.
     */
    function royaltyInfo(uint256 _tokenId, uint256 _salePrice) 
        external 
        view 
        override 
        returns (address receiver, uint256 royaltyAmount) 
    {
        RoyaltyInfo memory royalties = _royalties;
        receiver = royalties.recipient;
        royaltyAmount = (_salePrice * royalties.amount) / 10000;
    }

    function setRoyalties(address recipient, uint256 value) external {
        require(value <= 10000, 'ERC2981Royalties: Too high');
        _royalties = RoyaltyInfo(recipient, uint24(value));
    }
}
