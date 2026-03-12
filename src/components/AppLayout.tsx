"use client";

import React from 'react';
import { Settings, Bell, Home, User, Search, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Link, useLocation } from 'react-router-dom';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const location = useLocation();

  return (
    <div className="flex flex-col h-screen w-screen bg-zinc-50 text-zinc-900 selection:bg-indigo-100">
      {/* Glassmorphic Top Navigation Bar */}
      <header className="h-20 border-b border-white/20 bg-white/70 backdrop-blur-2xl flex items-center justify-between px-8 shrink-0 z-50 sticky top-0 shadow-[0_2px_20px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-10">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 via-violet-500 to-rose-400 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:scale-105 transition-transform duration-300">
              <Sparkles className="text-white h-6 w-6" />
            </div>
            <div className="flex flex-col">
              <h1 className="font-bold text-xl tracking-tight leading-none">Skillherz</h1>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mt-1">Educator App</span>
            </div>
          </Link>
          
          <div className="hidden lg:flex relative w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input 
              placeholder="Search weeks, students..." 
              className="pl-11 bg-zinc-100/80 border-none focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-11 rounded-2xl transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/">
            <Button variant={location.pathname === '/' ? 'secondary' : 'ghost'} size="icon" className="rounded-2xl h-11 w-11">
              <Home className="h-5 w-5" />
            </Button>
          </Link>
          <Button variant="ghost" size="icon" className="rounded-2xl h-11 w-11 relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-3 right-3 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-2xl h-11 w-11">
            <Settings className="h-5 w-5" />
          </Button>
          <div className="h-8 w-[1px] bg-zinc-200 mx-2" />
          <Avatar className="h-11 w-11 cursor-pointer border-2 border-white shadow-sm hover:scale-105 transition-all duration-300">
            <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" />
            <AvatarFallback>ED</AvatarFallback>
          </Avatar>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative">
        <div className="h-full w-full overflow-y-auto no-scrollbar p-8 lg:p-12">
          <div className="max-w-[1400px] mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AppLayout;