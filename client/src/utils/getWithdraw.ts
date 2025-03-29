import { getContractWithSigner } from "../../config"; // Ensure this is correctly imported

export const withdrawFunds = async () => {
  try {
    if (!window.ethereum) {
      console.error("MetaMask not detected!");
      return;
    }

    // Get contract instance with a signer
    const contract = await getContractWithSigner();

    // Send the withdraw transaction
    const tx = await contract.withdraw();

    console.log("Withdrawal transaction sent:", tx.hash);

    await tx.wait(); // Wait for confirmation

    console.log("Withdrawal successful:", tx);
    return tx;
  } catch (error) {
    console.error("Withdrawal error:", error);
    throw error;
  }
};
