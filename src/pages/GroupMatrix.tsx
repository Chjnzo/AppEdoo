"use client";

import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Save, Download, Share2, Sparkles, LayoutGrid } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { cn } from '@/lib/utils';

const GroupMatrix = () => {
  const { weekId, groupId } = useParams();
  const [activeSkill, setActiveSkill] = useState('Motivazione');

  const softSkills = [
    'Motivazione',
    'Organizzazione',
    'Autonomia',
    'Relazione',
    'Leadership',
    'Autovalutazione'
  ];

  return (
    <AppLayout>
      <div className="h-full flex flex-col space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        {/* Header */}
        <div className="flex items-center justify-between shrink-0">
          <div className="flex items-center gap-6">
            <Link to={`/week/${weekId}`}>
              <Button variant="ghost" size="icon" className="rounded-2xl h-12 w-12 bg-white shadow-sm border border-zinc-100">
                <ChevronLeft className="h-6 w-6" />
              </Button>
            </Link>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-md text-[10px] font-bold uppercase tracking-wider">
                  {groupId?.toUpperCase()}
                </span>
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900">Evaluation Matrix</h2>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="rounded-2xl border-zinc-200 font-bold">
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
            <Button className="rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 shadow-lg shadow-indigo-100">
              <Save className="mr-2 h-4 w-4" /> Save Changes
            </Button>
          </div>
        </div>

        {/* Skill Pills Navigation */}
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2 shrink-0">
          {softSkills.map((skill) => (
            <button
              key={skill}
              onClick={() => setActiveSkill(skill)}
              className={cn(
                "px-6 py-3 rounded-2xl font-bold text-sm transition-all duration-300 whitespace-nowrap shadow-sm",
                activeSkill === skill 
                  ? "bg-zinc-900 text-white scale-105 shadow-xl shadow-zinc-200" 
                  : "bg-white text-zinc-500 hover:bg-zinc-50 border border-zinc-100"
              )}
            >
              {skill}
            </button>
          ))}
        </div>

        {/* Main Matrix Area */}
        <div className="flex-1 min-h-0">
          <Card className="h-full rounded-[3rem] border-none bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex flex-col">
            <div className="p-8 border-b border-zinc-50 flex items-center justify-between bg-zinc-50/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-2xl flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-zinc-900">{activeSkill}</h3>
                  <p className="text-xs text-zinc-400 font-medium uppercase tracking-wider">Skill Assessment Matrix</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <CardContent className="flex-1 flex items-center justify-center p-12">
              <div className="text-center space-y-4 max-w-md">
                <div className="w-24 h-24 bg-zinc-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                  <LayoutGrid className="h-10 w-10 text-zinc-200" />
                </div>
                <h4 className="text-xl font-bold text-zinc-900">Data Table Placeholder</h4>
                <p className="text-zinc-500 leading-relaxed">
                  This is where the premium evaluation matrix for <span className="text-indigo-600 font-bold">{activeSkill}</span> will be rendered. 
                  It will feature interactive scoring for each student in {groupId}.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default GroupMatrix;