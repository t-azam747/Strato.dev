import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAccount } from "wagmi";

const ConnectWallet = () => {
  const navigate = useNavigate();
  const { isConnected } = useAccount();

  useEffect(() => {
    if (isConnected) {
      navigate("/home");
    }
  }, [isConnected, navigate]);

  return (
    <div className="flex justify-center items-center h-screen bg-gray-800 text-white">
      <div className="relative bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-96 border border-white/20">
        <h1 className="text-2xl font-semibold mb-4 text-white text-center">Connect Your Wallet</h1>
        <p className="mb-6 text-gray-300 text-center">Please connect your wallet to proceed.</p>
        <div className="flex justify-center ">
          <ConnectButton />
        </div>
      </div>
    </div>
  );
};

export default ConnectWallet;
