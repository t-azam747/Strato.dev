import { ethers } from "ethers";
import { getContractWithSigner } from "../../config"; // Ensure this is correctly imported

export const getBalance = async (address: string) => {
  console.log("Fetching balance for:", address);

  try {
    // Get contract instance with provider
    const contract = await getContractWithSigner();

    // Call getBalance function
    const balanceDetails: bigint = await contract.getBalance(address);

    console.log("Balance (in Wei):", balanceDetails.toString());

    // Convert Wei to Ether
    const balanceInEther = ethers.formatUnits(balanceDetails, "ether");

    console.log("Balance (in ETH):", balanceInEther);

    return balanceInEther;
  } catch (error) {
    console.error("Error fetching balance:", error);
    throw error;
  }
};
