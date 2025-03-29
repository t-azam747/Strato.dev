import { Wallet } from 'lucide-react';
import { Button } from '../ui/Button';

export function CTA() {
  return (
    <div className="container mx-auto px-4 py-20">
      <div className="relative overflow-hidden rounded-2xl">
        <div className="absolute inset-0 bg-cyber-grid bg-[size:30px_30px] opacity-20" />
        <div className="relative bg-cyber-light/50 p-12 text-center backdrop-blur-sm border border-neon-green/30">
          <h2 className="text-4xl font-bold mb-6 text-glow">Ready to Transform Your Development Workflow?</h2>
          <p className="text-xl text-neon-green/80 mb-8 max-w-2xl mx-auto">
            Join thousands of developers who are already building the future of Web3 with AI-powered tools
          </p>
          <Button variant="primary" icon={Wallet} className="mx-auto">
            Start Building Now
          </Button>
        </div>
      </div>
    </div>
  );
}