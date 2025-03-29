// // import Web3, { eth } from 'web3'
// import PaymentContractABI from './abis/PaymentContractABI.json'
// const address = import.meta.env.VITE_AVALANCHE_ADDRESS
// // const web3 = new Web3(address)
// const contractAddress = import.meta.env.VITE_CONTRACT
// // const contract = new web3.eth.Contract(PaymentContractABI, contractAddress)

// import ethers from 'ethers';

// const provider = new ethers.JsonRpcProvider(address);
// const contract = new ethers.Contract(contractAddress, PaymentContractABI);

// export {
//     contract,
//     provider
// }

import { ethers } from "ethers";
import PaymentContractABI from "./abis/PaymentContractABI.json";

const rpcUrl = import.meta.env.VITE_AVALANCHE_URL; // Ensure this points to the correct Avalanche RPC
const contractAddress = import.meta.env.VITE_CONTRACT;

// 🔹 Create Provider
const provider = new ethers.JsonRpcProvider(rpcUrl);

// 🔹 Create Signer (if using MetaMask)
const getSigner = async () => {
  if (!window.ethereum) {
    throw new Error("MetaMask not detected!");
  }
  const web3Provider = new ethers.BrowserProvider(window.ethereum);
  return web3Provider.getSigner();
};

// 🔹 Load Contract (Read operations)
const contract = new ethers.Contract(contractAddress, PaymentContractABI, provider);

// 🔹 Load Contract with Signer (For write operations)
const getContractWithSigner = async () => {
  const signer = await getSigner();
  return new ethers.Contract(contractAddress, PaymentContractABI, signer);
};

export { provider, contract, getContractWithSigner };
