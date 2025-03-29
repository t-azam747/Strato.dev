import { Cpu } from 'lucide-react';

export function Footer() {
  return (
    <footer className="container mx-auto px-4 py-8 border-t border-neon-green/20">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Cpu className="w-6 h-6 text-neon-green" />
          <span className="font-semibold text-glow">CodeAI Chain</span>
        </div>
        <div className="text-sm text-neon-green/60">
          © 2025 CodeAI Chain. All rights reserved.
        </div>
      </div>
    </footer>
  );
}