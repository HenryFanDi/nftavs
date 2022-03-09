// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "erc721a/contracts/ERC721A.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFTAVs is ERC721A, Ownable {

    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    // Make sure that the same uri can't be minted twice.
    mapping(string => uint8) existingURIs;

    constructor() ERC721A("NFTAVs", "NAV") {}

    function _baseURI() internal pure override returns (string memory) {
        return "ipfs://";
    }

    function mint(uint256 quantity) external payable {
        require(msg.value >= (0.05 ether * quantity), 'Need to pay up!');
        bool isExceed = _totalMinted() + quantity > 10;
        require(!isExceed, 'Is exceed total supply!');
        
        // _safeMint's second argument now takes in a quantity, not a tokenId.
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(msg.sender, quantity);
        tokenURI(tokenId);
    }

    // The following functions are overrides required by Solidity.

    function _burn(uint256 tokenId) internal override {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function isContentOwned(string memory uri) public view returns (bool) {
        return existingURIs[uri] == 1;
    }

    // It takes a recipient and metadata content id then mint a new token with that data.
    // `payable` : means that somebody can transfer money into the contract.
    // TODO: [metadataURL] array.
    function payToMint(
        string memory metadataURI,
        uint256 quantity
    ) public payable {
        require(existingURIs[metadataURI] != 1, 'NFT already minted!');
        // Make sure that the minimum value is greater than xxx.
        require(msg.value >= (0.05 ether * quantity), 'Need to pay up!');

        uint256 newItemId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        existingURIs[metadataURI] = 1;

        // Minted!
        _safeMint(msg.sender, quantity);
        tokenURI(newItemId);
    }

    // Know exactly how many tokens have been minted.
    function count() public view returns (uint256) {
        return _tokenIdCounter.current();
    }
}
