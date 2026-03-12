"use client";

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, ArrowRight, MoreVertical, Loader2, Trash2, Edit2, Palette } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import WizardModal from '@/components/WizardModal';
import { supabase } from '@/lib/supabase';
import { Week } from '@/types/database';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { showSuccess, showError, showLoading, dismissToast } from '@/utils/toast';
import { cn } from '@/lib/utils';

const COLORS = [
  { name: 'Red', class: 'bg-red-500' },
  { name: 'Blue', class: 'bg-blue-500' },
  { name: 'Emerald', class: 'bg-emerald-500' },
  { name: 'Amber', class: 'bg-amber-500' },
  { name: 'Violet', class: 'bg-violet-500' },
  { name: 'Orange', class: 'bg-orange-500' },
];

const Index = () => {
  const navigate = useNavigate();
  const [wizardOpen, setWizardOpen] = useState(false);
  const [weeks, setWeeks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Action states
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editWeek, setEditWeek] = useState<Week | null>(null);

  const fetchWeeks = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('weeks')
      .select(`
        *,
        groups (count),
        students (count)
      `)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setWeeks(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchWeeks();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    const toastId = showLoading("Eliminazione in corso...");
    try {
      const { error } = await supabase.from('weeks').delete().eq('id', deleteId);
      if (error) throw error;
      showSuccess("Settimana eliminata");
      setWeeks(weeks.filter(w => w.id !== deleteId));
    } catch (err: any) {
      showError(err.message);
    } finally {
      dismissToast(toastId);
      setDeleteId(null);
    }
  };

  const handleUpdate = async () => {
    if (!editWeek) return;
    const toastId = showLoading("Salvataggio...");
    try {
      const { error } = await (supabase.from('weeks') as any)
        .update({ institute_name: editWeek.institute_name })
        .eq('id', editWeek.id);
      
      if (error) throw error;
      showSuccess("Dati aggiornati");
      setWeeks(weeks.map(w => w.id === editWeek.id ? { ...w, institute_name: editWeek.institute_name } : w));
    } catch (err: any) {
      showError(err.message);
    } finally {
      dismissToast(toastId);
      setEditWeek(null);
    }
  };

  const updateColor = async (weekId: string, color: string) => {
    const toastId = showLoading("Aggiornamento colore...");
    try {
      const { error } = await (supabase.from('weeks') as any)
        .update({ color })
        .eq('id', weekId);
      
      if (error) throw error;
      showSuccess("Colore aggiornato");
      setWeeks(weeks.map(w => w.id === weekId ? { ...w, color } : w));
    } catch (err: any) {
      showError(err.message);
    } finally {
      dismissToast(toastId);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="flex items-end justify-between">
          <div className="space-y-1">
            <h2 className="text-4xl font-extrabold tracking-tight text-zinc-900">Dashboard</h2>
            <p className="text-zinc-500 font-medium">Gestisci le tue settimane didattiche e i progressi.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          <button 
            onClick={() => setWizardOpen(true)}
            className="group relative h-[240px] rounded-[2.5rem] border-2 border-dashed border-zinc-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all duration-500 flex flex-col items-center justify-center gap-4 overflow-hidden"
          >
            <div className="w-16 h-16 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center justify-center group-hover:scale-110 group-hover:rotate-90 transition-all duration-500">
              <Plus className="h-8 w-8 text-indigo-600" />
            </div>
            <div className="text-center">
              <span className="block font-bold text-zinc-900">Nuova Settimana</span>
              <span className="text-sm text-zinc-400">Inizia un nuovo percorso</span>
            </div>
          </button>

          {isLoading ? (
            <div className="h-[240px] flex items-center justify-center col-span-full">
              <Loader2 className="h-8 w-8 animate-spin text-zinc-300" />
            </div>
          ) : (
            weeks.map((week) => (
              <Card 
                key={week.id} 
                className={cn(
                  "group h-[240px] rounded-[2.5rem] border-none bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] hover:-translate-y-2 transition-all duration-500 overflow-hidden relative",
                  week.color && "ring-1 ring-zinc-100"
                )}
              >
                {/* Colored Top Accent */}
                {week.color && (
                  <div className={cn("absolute top-0 left-0 right-0 h-2", week.color)} />
                )}
                
                <CardHeader className="pb-2 flex flex-row items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-zinc-100 rounded-full text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                        {week.code}
                      </span>
                    </div>
                    <CardTitle className="text-xl font-bold tracking-tight group-hover:text-indigo-600 transition-colors">
                      {week.institute_name}
                    </CardTitle>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 hover:bg-zinc-100">
                        <MoreVertical className="h-4 w-4 text-zinc-400" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-2xl border-zinc-100 shadow-xl min-w-[180px]">
                      <DropdownMenuItem onClick={() => navigate(`/week/${week.id}`)} className="rounded-xl py-2.5">
                        <ArrowRight className="mr-2 h-4 w-4" /> Apri Settimana
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setEditWeek(week)} className="rounded-xl py-2.5">
                        <Edit2 className="mr-2 h-4 w-4" /> Modifica Dati
                      </DropdownMenuItem>
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger className="rounded-xl py-2.5">
                          <Palette className="mr-2 h-4 w-4" /> Modifica Colore
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent className="rounded-2xl border-zinc-100 p-2 grid grid-cols-3 gap-1 min-w-[140px]">
                          {COLORS.map((c) => (
                            <button
                              key={c.name}
                              onClick={() => updateColor(week.id, c.class)}
                              className={cn(
                                "h-8 w-8 rounded-full border-2 border-white shadow-sm hover:scale-110 transition-transform",
                                c.class
                              )}
                              title={c.name}
                            />
                          ))}
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                      <DropdownMenuSeparator className="bg-zinc-50" />
                      <DropdownMenuItem 
                        onClick={() => setDeleteId(week.id)} 
                        className="rounded-xl py-2.5 text-rose-500 focus:text-rose-600 focus:bg-rose-50"
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Elimina
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>

                <CardContent 
                  className="space-y-6 cursor-pointer" 
                  onClick={() => navigate(`/week/${week.id}`)}
                >
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {new Date(week.created_at).toLocaleDateString('it-IT', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-zinc-50">
                    <div className="flex gap-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-zinc-400 uppercase tracking-tighter">Gruppi</span>
                        <span className="text-lg font-bold text-zinc-900">{week.groups?.[0]?.count || 0}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-zinc-400 uppercase tracking-tighter">Studenti</span>
                        <span className="text-lg font-bold text-zinc-900">{week.students?.[0]?.count || 0}</span>
                      </div>
                    </div>
                    <div className="w-10 h-10 bg-zinc-50 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                      <ArrowRight className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <WizardModal open={wizardOpen} onOpenChange={(open) => {
        setWizardOpen(open);
        if (!open) fetchWeeks();
      }} />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="rounded-[2.5rem] border-white/20 bg-white/80 backdrop-blur-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold">Sei sicuro?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-500">
              Questa azione eliminerà permanentemente la settimana e tutti i dati associati (gruppi, studenti, valutazioni).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel className="rounded-2xl font-bold border-zinc-100">Annulla</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="rounded-2xl font-bold bg-rose-600 hover:bg-rose-700 text-white"
            >
              Elimina Definitivamente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Data Dialog */}
      <Dialog open={!!editWeek} onOpenChange={() => setEditWeek(null)}>
        <DialogContent className="rounded-[2.5rem] border-white/20 bg-white/80 backdrop-blur-2xl shadow-2xl">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle className="text-2xl font-bold">Modifica Settimana</DialogTitle>
          </DialogHeader>
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <Label className="text-sm font-bold text-zinc-500 uppercase">Codice Settimana</Label>
              <Input 
                value={editWeek?.code || ''} 
                disabled 
                className="h-12 rounded-2xl bg-zinc-50 border-zinc-100 text-zinc-400 font-medium" 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-bold text-zinc-700 uppercase">Nome Istituto</Label>
              <Input 
                value={editWeek?.institute_name || ''} 
                onChange={(e) => editWeek && setEditWeek({ ...editWeek, institute_name: e.target.value })}
                className="h-12 rounded-2xl bg-white border-zinc-100 focus-visible:ring-indigo-500" 
              />
            </div>
          </div>
          <DialogFooter className="p-6 pt-0">
            <Button 
              variant="ghost" 
              onClick={() => setEditWeek(null)}
              className="rounded-2xl font-bold text-zinc-500"
            >
              Annulla
            </Button>
            <Button 
              onClick={handleUpdate}
              className="rounded-2xl px-8 font-bold bg-zinc-900 hover:bg-zinc-800 text-white shadow-lg shadow-zinc-200"
            >
              Salva Modifiche
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Index;