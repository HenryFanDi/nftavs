import WalletBalance from "./WalletBalance";
import { useEffect, useState } from "react";

import { ethers } from "ethers";

// Import the contract api from the artifacts directory.
import NFTAVs from '../artifacts/contracts/NFTAVs.sol/NFTAVs.json';

const contractAddress = '0x4123966cF54BbEcAcE1eA5057f92395138a08f75';

const provider = new ethers.providers.Web3Provider(window.ethereum);

// Get the end user : get the singer to execute tx on the blockchain.
const singer = provider.getSigner();

// Get the smart contract : instantiate the contract using the address the abi and the signer.
const contract = new ethers.Contract(contractAddress, NFTAVs.abi, singer);

function Home() {
    const mintQuantity = 2

    // Know how many tokens have already been minted.
    const [totalMinted, setTotalMinted] = useState(0);

    // Use effect hook in the jsx.
    useEffect(() => {
        getCount();
    }, []);

    const getCount = async () => {
        const count = await contract.count();
        setTotalMinted(parseInt(count));
    };
        
    const mintTokens = async() => {
        // Set the value of ether that the user will pay for that we pass an object with a value of the amount of ether which in this case will be 0.05 * mint quantity.
        const mintCost = (0.05 * mintQuantity).toString();
        const result = await contract.mint(mintQuantity, {
            value: ethers.utils.parseEther(mintCost)
        });

        // Wait for the result to be mined.
        await result.wait();
        getCount();
        alert(`Mint ${mintQuantity} successfully! Please check your avs on OpenSea in minutes.`);
    };

    return (
        <div>
            <WalletBalance />
            <h1>Fired AVs NFT Collection</h1>
            {
                <button onClick={mintTokens}>
                    Mint ${mintQuantity} Tokens
                </button>
            }
        </div>
    );
};

function NFTImage({ tokenId, getCount }) {
    const mintQuantity = 1
    const contentId = 'Qma86nBvbNeUqxAPrnaBdx2hzNu7pEtZ9PLzgYTtjPEtWJ';
    const metadataURI = `${contentId}/nftav_${tokenId}.json`;
    const imageURI = `https://gateway.pinata.cloud/ipfs/${contentId}/nftav_${tokenId}.jpg`;

    const [isMinted, setIsMinted] = useState(false);

    useEffect(() => {
        getMintedStatus();
    }, [isMinted]);

    const getMintedStatus = async () => {
        const result = await contract.isContentOwned(metadataURI);
        console.log(result);
        setIsMinted(result);
    };

    const mintToken = async() => {
        // That will give us access to the recipient's wallet address.
        // const connection = contract.connect(singer);
        // const addr = connection.address;

        // Set the value of ether that the user will pay for that we pass an object with a value of the amount of ether which in this case will be 0.05.
        const mintCost = (0.05 * mintQuantity).toString();
        const result = await contract.payToMint(metadataURI, mintQuantity, {
            value: ethers.utils.parseEther(mintCost)
        });

        // Wait for the result to be mined.
        await result.wait();
        getMintedStatus();
        getCount();
    };

    async function getURI() {
        const uri = await contract.tokenURI(tokenId);
        alert(uri);
    }

    return (
        <div>
            <img src={isMinted ? imageURI : 'img/placeholder.png'}></img>
            <div>
                <h5>ID #{tokenId}</h5>
                {
                    !isMinted ? (
                        <button onClick={mintToken}>
                            Mint
                        </button>
                    ) : (
                        <button onClick={getURI}>
                            Taken! Show URI
                        </button>
                    )
                }
            </div>
        </div>
    );
}

export default Home;