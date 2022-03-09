import WalletBalance from "./WalletBalance";
import { useEffect, useState } from "react";

import { ethers } from "ethers";

// Import the contract api from the artifacts directory.
import NFTAVs from '../artifacts/contracts/NFTAVs.sol/NFTAVs.json';

const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

const provider = new ethers.providers.Web3Provider(window.ethereum);

// Get the end user : get the singer to execute tx on the blockchain.
const singer = provider.getSigner();

// Get the smart contract : instantiate the contract using the address the abi and the signer.
const contract = new ethers.Contract(contractAddress, NFTAVs.abi, singer);

function Home() {

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

    return (
        <div>
            <WalletBalance />
            <h1>Fired AVs NFT Collection</h1>
            {
                // Array(totalMinted + 1)
                Array(10)
                    .fill(0)
                    .map((_, i) => (
                        <div key={i}>
                            <NFTImage tokenId={i} />
                        </div>
                    ))
            }
        </div>
    );
};

function NFTImage({ tokenId, getCount }) {
    const contentId = 'Qma86nBvbNeUqxAPrnaBdx2hzNu7pEtZ9PLzgYTtjPEtWJ';
    const metadataURI = `${contentId}/nftav_${tokenId}.json`;
    // const imageURI = `https://gateway.pinata.cloud/ipfs/${tokenId}.jpg`;
    const imageURI = `${contentId}/nftav_${tokenId}.jpg`;

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
        const connection = contract.connect(singer);
        const addr = connection.address;
        // Set the value of ether that the user will pay for that we pass an object with a value of the amount of ether which in this case will be 0.05.
        const result = await contract.payToMint(addr, metadataURI, {
            value: ethers.utils.parseEther('0.05')
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