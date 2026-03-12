"use client";

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, ArrowRight, MoreVertical, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import WizardModal from '@/components/WizardModal';
import { supabase } from '@/lib/supabase';
import { Week } from '@/types/database';

const Index = () => {
  const [wizardOpen, setWizardOpen] = useState(false);
  const [weeks, setWeeks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  // Re-fetch when wizard closes (in case a new week was added)
  const handleWizardChange = (open: boolean) => {
    setWizardOpen(open);
    if (!open) fetchWeeks();
  };

  return (
    <AppLayout>
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        {/* Header Section */}
        <div className="flex items-end justify-between">
          <div className="space-y-1">
            <h2 className="text-4xl font-extrabold tracking-tight text-zinc-900">Dashboard</h2>
            <p className="text-zinc-500 font-medium">Manage your educational weeks and student progress.</p>
          </div>
        </div>

        {/* Weeks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {/* New Week Card */}
          <button 
            onClick={() => setWizardOpen(true)}
            className="group relative h-[240px] rounded-[2.5rem] border-2 border-dashed border-zinc-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all duration-500 flex flex-col items-center justify-center gap-4 overflow-hidden"
          >
            <div className="w-16 h-16 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center justify-center group-hover:scale-110 group-hover:rotate-90 transition-all duration-500">
              <Plus className="h-8 w-8 text-indigo-600" />
            </div>
            <div className="text-center">
              <span className="block font-bold text-zinc-900">Create New Week</span>
              <span className="text-sm text-zinc-400">Start a new educational journey</span>
            </div>
          </button>

          {isLoading ? (
            <div className="h-[240px] flex items-center justify-center col-span-full">
              <Loader2 className="h-8 w-8 animate-spin text-zinc-300" />
            </div>
          ) : (
            weeks.map((week) => (
              <Link key={week.id} to={`/week/${week.id}`}>
                <Card className="group h-[240px] rounded-[2.5rem] border-none bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] hover:-translate-y-2 transition-all duration-500 overflow-hidden relative">
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
                    <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                      <MoreVertical className="h-4 w-4 text-zinc-400" />
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center gap-2 text-zinc-400">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        {new Date(week.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-zinc-50">
                      <div className="flex gap-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-zinc-400 uppercase tracking-tighter">Groups</span>
                          <span className="text-lg font-bold text-zinc-900">{week.groups[0]?.count || 0}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-zinc-400 uppercase tracking-tighter">Students</span>
                          <span className="text-lg font-bold text-zinc-900">{week.students[0]?.count || 0}</span>
                        </div>
                      </div>
                      <div className="w-10 h-10 bg-zinc-50 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                        <ArrowRight className="h-5 w-5" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>
      </div>

      <WizardModal open={wizardOpen} onOpenChange={handleWizardChange} />
    </AppLayout>
  );
};

export default Index;