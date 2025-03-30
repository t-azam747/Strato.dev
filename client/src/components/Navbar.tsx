import { useState, useEffect } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import GitHubConfigModal from './GitHubConfigModal';
import DepositFundsModal from './DepositFundsModal';
import { deposit } from '../utils/sendDeposit';
import { withdrawFunds } from '../utils/getWithdraw';
import { getBalance } from '../utils/getBalance';
import { FaEthereum } from "react-icons/fa";

const Navbar = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [depositFundsModalOpen, setDepositFundsModalOpen] = useState(false);
  const { address, isConnected } = useAccount(); // Get wallet address
  const { disconnect } = useDisconnect(); // Disconnect wallet
  const navigate = useNavigate(); // Navigation hook
  const [balance, setBalance] = useState(12.00)
  //@ts-ignore
  const [errorMessage, setErrorMessage] = useState<string>()
  // Sample balance and wallet address for demonstration 
  const walletAddress = address || '0x0'; // Use the connected wallet address

  // Redirect to /wallet if not authenticated
  useEffect(() => {
    if (!isConnected) {
      navigate('/wallet'); // Redirect to wallet connection page
    }
  }, [isConnected, navigate]);
  useEffect(() => {
    if (walletAddress !== "0x0") {
      getBalance(walletAddress).then((res) => {
        setBalance(Number(res));
      });
    }
  }, [walletAddress]);
  

  const handleDeposit = async (amount: number) => {

    // Add logic to handle deposit
    try {
      // Attempt to perform deposit
      const result = await deposit(amount);
      console.log(result);
      
      // Update balance if deposit succeeded
      if (result) {
        // Option 1: Update state directly if you trust the amount
        setBalance((prevBalance) => prevBalance + amount);
        // Option 2: Alternatively, re-fetch balance from the contract:
        // getBalance(walletAddress).then((res) => setBalance(Number(res)));
        
        setErrorMessage(''); // Clear any previous error message
      }
    } catch (error) {
      console.error("Deposit error:", error);
      // Set an error message to be shown on the modal
      setErrorMessage("Deposit failed: insufficient funds or transaction error.");
    }
  };

  const handleWithdraw = async() => {
    // Add logic to handle withdrawal
    try {
      // Attempt to perform deposit
      const result = await withdrawFunds();
      console.log(result);
      
      // Update balance if deposit succeeded
      if (result) {
        // Option 1: Update state directly if you trust the amount
        setBalance(0);
        // Option 2: Alternatively, re-fetch balance from the contract:
        // getBalance(walletAddress).then((res) => setBalance(Number(res)));
        
        setErrorMessage(''); // Clear any previous error message
      }
    } catch (error) {
      console.error("Withdraw error:", error);
      // Set an error message to be shown on the modal
      setErrorMessage("Deposit failed: insufficient funds or transaction error.");
    }
  };

  return (
    <nav className="flex justify-between items-center px-6 py-4 bg-gray-800/90 text-white shadow-md">
      {/* App Name */}
      <h1 className="text-xl font-semibold">Strato.dev</h1>

      {/* Buttons Section */}
      <div className="flex space-x-4">
        {/* Deposit Funds Button */}
        <button
          className="flex items-center px-4 py-2 text-2xl  bg-gray-700 hover:bg-gray-800 text-white rounded-lg transition"
          onClick={() => setDepositFundsModalOpen(true)}
        >
          <FaEthereum/>
        </button>

        {/* GitHub Configuration Button */}
        <button
          className="flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg transition text-2xl"
          onClick={() => setIsModalOpen(true)}
        >
          <FontAwesomeIcon icon={faGithub} />
        </button>

        {/* Wallet Address Display */}
        {isConnected ? (
          <div
          className={`flex items-center bg-gray-800 px-4 py-2 rounded-lg relative transition-all duration-300 ${expanded ? 'space-x-4' : 'space-x-2'}`}
          onMouseEnter={() => setExpanded(true)}
          onMouseLeave={() => setExpanded(false)}
        >
          <span className="text-sm text-gray-300">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </span>
          {expanded && (
            <button
              onClick={() => disconnect()}
              className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
            >
              Disconnect
            </button>
          )}
        </div>
        ) : (
          <span className="text-gray-400">Not Connected</span>
        )}
      </div>

      {/* GitHub Modal */}
      <GitHubConfigModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {/* Deposit Funds Modal */}
      <DepositFundsModal
        isOpen={depositFundsModalOpen}
        onClose={() => setDepositFundsModalOpen(false)}
        balance={balance}
        walletAddress={walletAddress}
        onDeposit={handleDeposit}
        onWithdraw={handleWithdraw}
      />
    </nav>
  );
};

export default Navbar;