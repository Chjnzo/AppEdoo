"use client";

import React from 'react';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { User, Bell, Shield, Info, Sparkles, ChevronRight, Mail } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

const SettingsPage = () => {
  const { user } = useAppStore();

  const userDisplayName = `${user?.user_metadata?.first_name || ''} ${user?.user_metadata?.last_name || ''}`.trim() || 'Educatore';

  return (
    <AppLayout>
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        {/* Header Section */}
        <div className="space-y-1">
          <h2 className="text-4xl font-extrabold tracking-tight text-zinc-900">Impostazioni</h2>
          <p className="text-zinc-500 font-medium">Personalizza la tua esperienza e gestisci il tuo account.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Account Overview */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="rounded-[2.5rem] border-none bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="text-xl font-bold flex items-center gap-3">
                  <User className="h-5 w-5 text-indigo-600" />
                  Account
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-0 space-y-6">
                <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                      <Mail className="h-5 w-5 text-zinc-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Email</p>
                      <p className="font-bold text-zinc-900">{user?.email}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="rounded-xl">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                      <Shield className="h-5 w-5 text-zinc-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Ruolo</p>
                      <p className="font-bold text-zinc-900">Educatore Senior</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[2.5rem] border-none bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="text-xl font-bold flex items-center gap-3">
                  <Bell className="h-5 w-5 text-indigo-600" />
                  Preferenze
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-0 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-bold text-zinc-900">Notifiche Push</Label>
                    <p className="text-xs text-zinc-500">Ricevi avvisi per nuove valutazioni e feedback.</p>
                  </div>
                  <Switch defaultChecked className="data-[state=checked]:bg-indigo-600" />
                </div>
                <div className="h-[1px] bg-zinc-50" />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-bold text-zinc-900">Resoconti Settimanali</Label>
                    <p className="text-xs text-zinc-500">Invia automaticamente il PDF al termine della settimana.</p>
                  </div>
                  <Switch className="data-[state=checked]:bg-indigo-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* App Info */}
          <div className="space-y-8">
            <Card className="rounded-[2.5rem] border-none bg-gradient-to-br from-indigo-600 to-violet-700 text-white shadow-xl shadow-indigo-200 overflow-hidden relative">
              <Sparkles className="absolute -top-4 -right-4 h-24 w-24 text-white/10 rotate-12" />
              <CardContent className="p-8 space-y-6 relative">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-black tracking-tight">Skillherz Pro</h3>
                  <p className="text-indigo-100 text-sm font-medium mt-1">Stai utilizzando la versione completa per educatori professionisti.</p>
                </div>
                <Button className="w-full h-12 rounded-2xl bg-white text-indigo-600 font-bold hover:bg-white/90">
                  Scopri di più
                </Button>
              </CardContent>
            </Card>

            <Card className="rounded-[2.5rem] border-none bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="text-xl font-bold flex items-center gap-3">
                  <Info className="h-5 w-5 text-indigo-600" />
                  Info App
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-0 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400 font-medium">Versione</span>
                  <span className="text-zinc-900 font-bold">1.0.0</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400 font-medium">Build</span>
                  <span className="text-zinc-900 font-bold">2024.03.01</span>
                </div>
                <div className="pt-4 border-t border-zinc-50">
                  <p className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest text-center">Powered by Skillherz</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default SettingsPage;