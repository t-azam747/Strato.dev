import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  icon?: LucideIcon;
  children: React.ReactNode;
}

export function Button({ variant = 'primary', icon: Icon, children, className = '', ...props }: ButtonProps) {
  const baseStyles = "px-4 py-2 rounded text-lg font-semibold transition-all duration-300 flex items-center";
  
  const variants = {
    primary: "cyber-gradient hover:scale-105",
    secondary: "bg-transparent border border-neon-green hover:neon-border hover:bg-neon-green/10",
    outline: "bg-neon-green/10 border border-neon-green neon-border hover:bg-neon-green/20",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-5 h-5 mr-2" />}
      {children}
    </button>
  );
}