const stats = [
  { value: '100K+', label: 'Smart Contracts Generated' },
  { value: '$500M+', label: 'Total Value Locked' },
  { value: '50K+', label: 'Active Developers' },
  { value: '99.9%', label: 'Security Score' }
];

export function Stats() {
  return (
    <div className="container mx-auto px-4 py-20 border-t border-neon-green/20">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
        {stats.map(({ value, label }) => (
          <div key={label} className="group hover:scale-105 transition-transform duration-300">
            <div className="text-4xl font-bold text-neon-green text-glow mb-2">{value}</div>
            <div className="text-gray-400 group-hover:text-neon-green/80 transition-colors duration-300">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}