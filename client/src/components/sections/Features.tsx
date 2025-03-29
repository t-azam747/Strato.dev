import { Brain, Lock, Code } from 'lucide-react';

const features = [
  { icon: Brain, title: 'AI-Powered Development', desc: 'Advanced machine learning algorithms assist in writing and optimizing smart contracts' },
  { icon: Lock, title: 'Secure by Design', desc: 'Built-in security analysis and automated vulnerability detection' },
  { icon: Code, title: 'Smart Contract Generation', desc: 'Generate production-ready smart contracts with natural language processing' }
];

export function Features() {
  return (
    <div className="container mx-auto px-4 py-20">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="bg-cyber-light/50 p-8 rounded-lg border border-neon-green/30 hover:neon-border transition-all duration-300">
            <div className="bg-neon-green/10 p-3 rounded-lg w-fit mb-4">
              <Icon className="w-6 h-6 text-neon-green" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-neon-green">{title}</h3>
            <p className="text-gray-400">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}