import { ethers } from "ethers";
import { getContractWithSigner } from "../../config"; // Ensure this is correctly imported

export const makePayment = async (recipient: string) => {
  try {
    if (!window.ethereum) {
      console.error("MetaMask not detected!");
      return;
    }

    // Convert ETH amount to Wei
    const requiredPayment = ethers.parseUnits("0.003", "ether");

    // Get contract instance with signer
    const contract = await getContractWithSigner();

    // Send the transaction to releasePayment
    const tx = await contract.releasePayment(recipient, requiredPayment);

    console.log("Payment transaction sent:", tx.hash);

    await tx.wait(); // Wait for confirmation

    console.log("Payment successful:", tx);
    return tx;
  } catch (error) {
    console.error("Payment failed:", error);
    return null;
  }
};
