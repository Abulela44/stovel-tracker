import React, { useState } from 'react';
import { 
  Building2, 
  ChevronDown, 
  Bell, 
  Plus, 
  Search, 
  Sparkles, 
  ShieldCheck, 
  Users,
  Wallet
} from 'lucide-react';
import { Stokvel } from '../types';

interface NavbarProps {
  stokvels: Stokvel[];
  activeStokvel: Stokvel;
  onSelectStokvel: (stokvel: Stokvel) => void;
  onOpenCreateModal: () => void;
  onOpenContributionModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  stokvels,
  activeStokvel,
  onSelectStokvel,
  onOpenCreateModal,
  onOpenContributionModal,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-border shadow-2xl backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Stokvel Switcher */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-primary via-secondary to-accent p-[2px] shadow-glow-purple">
                <div className="w-full h-full bg-background rounded-[14px] flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-primary" />
                </div>
              </div>
              <div>
                <span className="text-xl font-bold tracking-wider font-sans gradient-text uppercase">
                  Sisonke
                </span>
                <span className="block text-[10px] text-textSecondary uppercase tracking-widest font-semibold">
                  Stokvel Platform
                </span>
              </div>
            </div>

            <div className="hidden md:block h-8 w-[1px] bg-border" />

            {/* Stokvel Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-surface hover:bg-surface-hover border border-border transition-all duration-200 group"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Building2 className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="block text-xs font-medium text-textSecondary">Active Group</span>
                  <span className="block text-sm font-semibold text-white group-hover:text-primary transition-colors">
                    {activeStokvel.name}
                  </span>
                </div>
                <ChevronDown className={`w-4 h-4 text-textSecondary transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute left-0 mt-2 w-80 bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-3 bg-surface-card border-b border-border flex justify-between items-center">
                    <span className="text-xs font-semibold text-textSecondary uppercase tracking-wider">Your Stokvels</span>
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        onOpenCreateModal();
                      }}
                      className="text-xs text-primary hover:text-primary-light font-medium flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      New Group
                    </button>
                  </div>
                  <div className="py-2 max-h-64 overflow-y-auto">
                    {stokvels.map((stk) => (
                      <button
                        key={stk.id}
                        onClick={() => {
                          onSelectStokvel(stk);
                          setDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-surface-hover transition-colors ${
                          stk.id === activeStokvel.id ? 'bg-primary/10 border-l-4 border-primary' : ''
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center text-secondary mt-0.5 shrink-0">
                          <Users className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{stk.name}</p>
                          <p className="text-xs text-textSecondary flex justify-between mt-1">
                            <span>{stk.type} Stokvel</span>
                            <span className="font-mono text-emerald-400">R {stk.totalBalance.toLocaleString()}</span>
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions & User Profile */}
          <div className="flex items-center gap-3">
            
            <button
              onClick={onOpenContributionModal}
              className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white font-semibold text-sm shadow-glow-purple hover:opacity-95 transition-all duration-200 active:scale-95"
            >
              <Wallet className="w-4 h-4" />
              <span>Record Contribution</span>
            </button>

            <div className="relative hidden lg:block">
              <Search className="w-4 h-4 text-textSecondary absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search ledger, member, loans..."
                className="pl-9 pr-4 py-2 text-xs bg-surface border border-border rounded-xl text-white placeholder-textSecondary focus:outline-none focus:border-primary w-52 transition-all"
              />
            </div>

            <button className="relative p-2.5 rounded-xl bg-surface hover:bg-surface-hover border border-border text-textSecondary hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-accent animate-ping" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-accent" />
            </button>

            {/* Profile Pill */}
            <div className="flex items-center gap-3 pl-2 border-l border-border">
              <img
                src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200"
                alt="Thabo Mokoena"
                className="w-10 h-10 rounded-xl object-cover border border-primary/50"
              />
              <div className="hidden xl:block text-left">
                <span className="block text-xs font-semibold text-white">Thabo Mokoena</span>
                <span className="block text-[10px] text-primary font-medium">Chairperson</span>
              </div>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
