import { Rocket } from 'lucide-react';
import { Button } from '../ui/Button';

export function Hero() {
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-cyber-glow opacity-30" />
      <div className="container mx-auto px-4 py-20 relative">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-6xl font-bold mb-6 text-glow">
            The Future of AI-Powered Coding on the Blockchain
          </h1>
          <p className="text-xl text-neon-green/80 mb-10">
            Harness the power of decentralized AI to write, review, and deploy smart contracts with confidence
          </p>
          <div className="flex justify-center space-x-4">
            <Button variant="primary" icon={Rocket}>Get Started</Button>
            <Button variant="secondary">Learn More</Button>
          </div>
        </div>
      </div>
    </div>
  );
}