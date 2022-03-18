// require('dotenv').config();
import { ethers } from "ethers";
import { pinJSONToIPFS } from './pinata.jsx'

// Import the contract api from the artifacts directory.
import NFTAVs from '../artifacts/contracts/NFTAVs.sol/NFTAVs.json';

const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

const provider = new ethers.providers.Web3Provider(window.ethereum);

// Get the end user : get the singer to execute tx on the blockchain.
const singer = provider.getSigner();

// Get the smart contract : instantiate the contract using the address the abi and the signer.
const contract = new ethers.Contract(contractAddress, NFTAVs.abi, singer);

export const connectWallet = async () => {
    // window.ethereum is a global API injected by Metamask and other wallet providers that allows websites to request users' Ethereum accounts. 
    // If approved, it can read data from the blockchains the user is connected to, and suggest that the user sign messages and transactions.
    if (window.ethereum) {
        try {
            const addressArray = await window.ethereum.request({
                method: "eth_requestAccounts",
            });
            const obj = {
                status: "👆🏽 Write a message in the text-field above.",
                address: addressArray[0],
            };
            return obj;
        } catch (err) {
            return {
                address: "",
                status: "😥 " + err.message,
            };
        }
    } else {
        return {
            address: "",
            status: (
                <span>
                    <p>
                        {" "}
                        🦊{" "}
                        <a target="_blank" href={`https://metamask.io/download.html`}>
                            You must install Metamask, a virtual Ethereum wallet, in your
                            browser.
                        </a>
                    </p>
                </span>
            ),
        };
    }
};

//

export const getCurrentWalletConnected = async () => {
    if (window.ethereum) {
        try {
            const addressArray = await window.ethereum.request({
                method: "eth_accounts",
            });
            if (addressArray.length > 0) {
                return {
                    address: addressArray[0],
                    status: "👆🏽 Write a message in the text-field above.",
                };
            } else {
                return {
                    address: "",
                    status: "🦊 Connect to Metamask using the top right button.",
                };
            }
        } catch (err) {
            return {
                address: "",
                status: "😥 " + err.message,
            };
        }
    } else {
        return {
            address: "",
            status: (
                <span>
                    <p>
                        {" "}
                        🦊{" "}
                        <a target="_blank" href={`https://metamask.io/download.html`}>
                            You must install Metamask, a virtual Ethereum wallet, in your
                            browser.
                        </a>
                    </p>
                </span>
            ),
        };
    }
};

//

export const mintNFT = async (url, name, description) => {
    // Error handling
    if (url.trim() == "" || (name.trim() == "" || description.trim() == "")) {
        return {
            success: false,
            status: "❗Please make sure all fields are completed before minting.",
        }
    }

    // Make metadata
    const metadata = new Object();
    metadata.name = name;
    metadata.image = url;
    metadata.description = description;

    // Make pinata call
    const pinataResponse = await pinJSONToIPFS(metadata);
    if (!pinataResponse.success) {
        return {
            success: false,
            status: "😢 Something went wrong while uploading your tokenURI.",
        }
    }
    const tokenURI = pinataResponse.pintaUrl;

    window.contract = contract;

    // Setup your ethereum transaction
    // to: specifies the the recipient address (our smart contract)
    // from: specifies the signer of the transaction (the user's connected address to Metamask: window.ethereum.selectedAddress)
    // data: contains the call to our smart contract mintNFT method, 
    //       which receives our tokenURI and the user's wallet address, window.ethereum.selectedAddress, as inputs
    const transactionParameters = {
        to: contractAddress, // Required except during contract publications
        from: window.ethereum.selectedAddress, // Must match user's active address
        'data': window.contract.methods.mintNFT(window.ethereum.selectedAddress, tokenURI).encodeAPI() // Make call to NFT smart contract
    }

    // Sign the transaction via metamask
    try {
        const txHash = await window.ethereum
            .request({
                method: 'eth_sendTransaction',
                params: [transactionParameters],
            })
        return {
            success: true,
            status: "✅ Check out your transaction on Etherscan: https://ropsten.etherscan.io/tx/" + txHash
        }
    } catch (error) {
        return {
            success: false,
            status: "😥 Something went wrong: " + error.message
        }
    }
};