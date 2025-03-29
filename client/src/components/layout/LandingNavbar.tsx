import { Brain } from 'lucide-react';
import { Button } from '../ui/Button';

export function Navbar() {
  return (
    <nav className="flex justify-between items-center mb-16 py-4 px-6">
      <div className="flex items-center space-x-2">
        <Brain className="w-8 h-8 text-neon-green" />
        <span className="text-2xl font-bold text-glow">CodeAI Chain</span>
      </div>
      <div className="flex space-x-6">
        <button className="hover:text-neon-green transition-colors duration-300">
          Features
        </button>
        <button className="hover:text-neon-green transition-colors duration-300">
          Docs
        </button>
        <button className="hover:text-neon-green transition-colors duration-300">
          Community
        </button>
        <Button variant="outline">Connect Wallet</Button>
      </div>
    </nav>
  );
}