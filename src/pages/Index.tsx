"use client";

import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, ArrowRight, MoreVertical } from 'lucide-react';
import { Link } from 'react-router-dom';
import WizardModal from '@/components/WizardModal';

const Index = () => {
  const [wizardOpen, setWizardOpen] = useState(false);

  const mockWeeks = [
    { id: 'wk-1', code: 'WK-2024-01', institute: 'Liceo Scientifico Fermi', date: 'Oct 12 - Oct 18', groups: 4, students: 24 },
    { id: 'wk-2', code: 'WK-2024-02', institute: 'Istituto Tecnico Rossi', date: 'Oct 20 - Oct 26', groups: 6, students: 32 },
    { id: 'wk-3', code: 'WK-2024-03', institute: 'International School', date: 'Nov 02 - Nov 08', groups: 3, students: 18 },
  ];

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
          {/* New Week Card (FAB-like) */}
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
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </button>

          {mockWeeks.map((week) => (
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
                      {week.institute}
                    </CardTitle>
                  </div>
                  <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                    <MoreVertical className="h-4 w-4 text-zinc-400" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm font-medium">{week.date}</span>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-zinc-50">
                    <div className="flex gap-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-zinc-400 uppercase tracking-tighter">Groups</span>
                        <span className="text-lg font-bold text-zinc-900">{week.groups}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-zinc-400 uppercase tracking-tighter">Students</span>
                        <span className="text-lg font-bold text-zinc-900">{week.students}</span>
                      </div>
                    </div>
                    <div className="w-10 h-10 bg-zinc-50 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                      <ArrowRight className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <WizardModal open={wizardOpen} onOpenChange={setWizardOpen} />
    </AppLayout>
  );
};

export default Index;