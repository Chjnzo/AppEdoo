"use client";

import React from 'react';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Users, LayoutGrid, ArrowRight, MoreHorizontal } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

const WeekDetail = () => {
  const { weekId } = useParams();

  const mockGroups = [
    { id: 'g1', name: 'Group 1', students: 6, color: 'bg-blue-500' },
    { id: 'g2', name: 'Group 2', students: 6, color: 'bg-emerald-500' },
    { id: 'g3', name: 'Group 3', students: 6, color: 'bg-amber-500' },
    { id: 'g4', name: 'Group 4', students: 6, color: 'bg-rose-500' },
    { id: 'g5', name: 'Group 5', students: 6, color: 'bg-indigo-500' },
    { id: 'g6', name: 'Group 6', students: 6, color: 'bg-violet-500' },
  ];

  return (
    <AppLayout>
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        {/* Breadcrumbs / Back */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/">
              <Button variant="ghost" size="icon" className="rounded-2xl h-12 w-12 bg-white shadow-sm border border-zinc-100">
                <ChevronLeft className="h-6 w-6" />
              </Button>
            </Link>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md text-[10px] font-bold uppercase tracking-wider">
                  {weekId?.toUpperCase()}
                </span>
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900">Liceo Scientifico Fermi</h2>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="rounded-2xl border-zinc-200 font-bold">
              <Users className="mr-2 h-4 w-4" /> Manage Students
            </Button>
            <Button className="rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold px-6">
              <LayoutGrid className="mr-2 h-4 w-4" /> Edit Groups
            </Button>
          </div>
        </div>

        {/* Groups Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mockGroups.map((group) => (
            <Link key={group.id} to={`/week/${weekId}/group/${group.id}`}>
              <Card className="group rounded-[2.5rem] border-none bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] hover:-translate-y-2 transition-all duration-500 overflow-hidden">
                <CardHeader className="pb-4 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 ${group.color} rounded-2xl flex items-center justify-center shadow-lg shadow-zinc-100`}>
                      <Users className="text-white h-6 w-6" />
                    </div>
                    <CardTitle className="text-xl font-bold tracking-tight">{group.name}</CardTitle>
                  </div>
                  <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                    <MoreHorizontal className="h-4 w-4 text-zinc-400" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-zinc-400 uppercase tracking-tighter">Active Students</span>
                      <span className="text-2xl font-bold text-zinc-900">{group.students}</span>
                    </div>
                    <div className="w-10 h-10 bg-zinc-50 rounded-2xl flex items-center justify-center group-hover:bg-zinc-900 group-hover:text-white transition-all duration-500">
                      <ArrowRight className="h-5 w-5" />
                    </div>
                  </div>
                  
                  {/* Mini Progress Bar */}
                  <div className="mt-6 h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                    <div className={`h-full ${group.color} w-2/3 rounded-full`} />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default WeekDetail;