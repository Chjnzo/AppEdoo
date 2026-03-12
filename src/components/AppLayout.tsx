"use client";

import React, { useState, useRef } from 'react';
import { Settings, Bell, Home, User, Search, Sparkles, LogOut, Camera, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Link, useLocation } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { useAppStore } from '@/store/useAppStore';
import { supabase } from '@/lib/supabase';
import { showSuccess, showError, showLoading, dismissToast } from '@/utils/toast';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const location = useLocation();
  const { user, setUser, logout } = useAppStore();
  const [profileOpen, setProfileOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Profile form state
  const [firstName, setFirstName] = useState(user?.user_metadata?.first_name || '');
  const [lastName, setLastName] = useState(user?.user_metadata?.last_name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.user_metadata?.avatar_url || '');
  const [previewUrl, setPreviewUrl] = useState(user?.user_metadata?.avatar_url || '');
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    const toastId = showLoading("Aggiornamento profilo...");
    try {
      let currentAvatarUrl = avatarUrl;

      if (file) {
        const fileName = `${user?.id}/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);
        
        currentAvatarUrl = publicUrl;
      }

      const { data, error } = await supabase.auth.updateUser({
        data: {
          first_name: firstName,
          last_name: lastName,
          avatar_url: currentAvatarUrl
        }
      });

      if (error) throw error;
      
      setUser(data.user);
      showSuccess("Profilo aggiornato");
      setProfileOpen(false);
    } catch (err: any) {
      showError(err.message);
    } finally {
      setIsSaving(false);
      dismissToast(toastId);
    }
  };

  const userInitials = `${firstName?.[0] || user?.email?.[0] || 'E'}${lastName?.[0] || ''}`.toUpperCase();

  return (
    <div className="flex flex-col h-screen w-screen bg-zinc-50 text-zinc-900 selection:bg-indigo-100">
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
              placeholder="Cerca settimane, studenti..." 
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
          <Link to="/settings">
            <Button variant={location.pathname === '/settings' ? 'secondary' : 'ghost'} size="icon" className="rounded-2xl h-11 w-11">
              <Settings className="h-5 w-5" />
            </Button>
          </Link>
          <div className="h-8 w-[1px] bg-zinc-200 mx-2" />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="h-11 w-11 cursor-pointer border-2 border-white shadow-sm hover:scale-105 transition-all duration-300">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-zinc-100 font-bold text-zinc-500">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-2xl border-zinc-100 shadow-xl min-w-[200px] p-2">
              <div className="px-3 py-2 mb-1">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Account</p>
                <p className="text-sm font-bold text-zinc-900 truncate">{user?.email}</p>
              </div>
              <DropdownMenuSeparator className="bg-zinc-50 mx-2" />
              <DropdownMenuItem onClick={() => setProfileOpen(true)} className="rounded-xl py-2.5">
                <User className="mr-2 h-4 w-4" /> Profilo
              </DropdownMenuItem>
              <DropdownMenuItem onClick={logout} className="rounded-xl py-2.5 text-rose-500 focus:text-rose-600 focus:bg-rose-50">
                <LogOut className="mr-2 h-4 w-4" /> Esci
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="flex-1 overflow-hidden relative">
        <div className="h-full w-full overflow-y-auto no-scrollbar p-8 lg:p-12">
          <div className="max-w-[1400px] mx-auto">
            {children}
          </div>
        </div>
      </main>

      {/* Profile Edit Dialog */}
      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="rounded-[2.5rem] border-white/20 bg-white/80 backdrop-blur-2xl shadow-2xl p-0 overflow-hidden">
          <DialogHeader className="p-8 pb-4">
            <DialogTitle className="text-2xl font-bold">Modifica Profilo</DialogTitle>
          </DialogHeader>
          <div className="p-8 pt-0 space-y-8">
            <div className="flex flex-col items-center gap-4">
              <div className="relative group">
                <Avatar className="h-32 w-32 border-4 border-white shadow-2xl">
                  <AvatarImage src={previewUrl} />
                  <AvatarFallback className="bg-zinc-100 text-3xl font-bold text-zinc-400">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Camera className="text-white h-8 w-8" />
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handlePhotoChange} 
                />
              </div>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Tocca per cambiare foto</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Nome</Label>
                <Input 
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Nome"
                  className="h-14 rounded-2xl bg-white border-zinc-100 focus-visible:ring-indigo-500 font-bold"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Cognome</Label>
                <Input 
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Cognome"
                  className="h-14 rounded-2xl bg-white border-zinc-100 focus-visible:ring-indigo-500 font-bold"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="bg-zinc-50/50 p-6 border-t border-zinc-100">
            <Button 
              variant="ghost" 
              onClick={() => setProfileOpen(false)}
              className="rounded-2xl font-bold text-zinc-500"
              disabled={isSaving}
            >
              Annulla
            </Button>
            <Button 
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="rounded-2xl px-10 h-12 font-bold bg-zinc-900 hover:bg-zinc-800 text-white shadow-xl shadow-zinc-200"
            >
              {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : "Salva Profilo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AppLayout;