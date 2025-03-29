    // import { ethers } from 'ethers';
    // import {contract, provider} from '../../config'

    // export const deposit= async (amount: number, address: string) => {

    //     try {
    //         // const depositAmount = web3.utils.toWei(`${amount}`, "ether");
    //         const depositAmount = ethers.parseUnits(`${amount}`, "ether")
    //         console.log(contract.methods)
    //         // const balanceDetails = await contract.methods.depositFunds().send({
    //         //     from: address,
    //         //     value: depositAmount
    //         // })  
    //         const balanceDetails = await contract.depositeFunds({
    //             from: address,
    //             value: depositAmount
    //         })
    //         console.log(balanceDetails)
    //         return balanceDetails
    //     } catch (error) {
    //         console.log(error)  
    //     }
    // }

    import { ethers } from "ethers";
    import { getContractWithSigner } from "../../config"; // Ensure this is correctly imported
    
    export const deposit = async (amount: string) => {
      try {
        // Convert amount to Wei
        const depositAmount = ethers.parseUnits(`${amount}`, "ether");
    
        // Get contract instance with signer
        const contract = await getContractWithSigner();
    
        // Call depositFunds function with value
        const tx = await contract.depositFunds({ value: depositAmount });
    
        console.log("Transaction sent:", tx.hash);
        await tx.wait(); // Wait for confirmation
        console.log("Transaction confirmed:", tx);
        
        return tx;
      } catch (error) {
        console.error("Deposit Error:", error);
        throw error;
      }
    };
    
