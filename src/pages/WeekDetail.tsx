"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
import { supabase } from '@/lib/supabase';
import { Week, Group, Student } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  ChevronLeft, 
  Users, 
  ArrowRight, 
  Loader2, 
  LayoutGrid, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

const WeekDetail = () => {
  const { weekId } = useParams<{ weekId: string }>();
  const navigate = useNavigate();
  
  const [week, setWeek] = useState<Week | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!weekId) return;
      
      setIsLoading(true);
      try {
        // Fetch Week Details
        const { data: weekData, error: weekError } = await supabase
          .from('weeks')
          .select('*')
          .eq('id', weekId)
          .single();

        if (weekError) throw weekError;
        setWeek(weekData);

        // Fetch Groups
        const { data: groupsData, error: groupsError } = await supabase
          .from('groups')
          .select('*')
          .eq('week_id', weekId)
          .order('name', { ascending: true });

        if (groupsError) throw groupsError;
        setGroups(groupsData || []);

        // Fetch Students
        const { data: studentsData, error: studentsError } = await supabase
          .from('students')
          .select('*')
          .eq('week_id', weekId);

        if (studentsError) throw studentsError;
        setStudents(studentsData || []);

      } catch (err: any) {
        console.error('Error fetching week details:', err);
        setError(err.message || 'Failed to load week details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [weekId]);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="h-full w-full flex flex-col items-center justify-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-indigo-100 rounded-full animate-pulse" />
            <Loader2 className="h-8 w-8 text-indigo-600 animate-spin absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-zinc-400 font-bold text-sm uppercase tracking-widest animate-pulse">Loading Experience...</p>
        </div>
      </AppLayout>
    );
  }

  if (error || !week) {
    return (
      <AppLayout>
        <div className="h-full w-full flex flex-col items-center justify-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-rose-50 rounded-[2.5rem] flex items-center justify-center">
            <AlertCircle className="h-10 w-10 text-rose-500" />
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-extrabold text-zinc-900">Week Not Found</h2>
            <p className="text-zinc-500 max-w-xs mx-auto">The educational week you're looking for doesn't exist or has been moved.</p>
          </div>
          <Link to="/">
            <Button className="rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold px-8 h-12">
              <ChevronLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex items-center gap-6">
            <Link to="/">
              <Button variant="ghost" size="icon" className="rounded-2xl h-14 w-14 bg-white shadow-sm border border-zinc-100 hover:scale-105 transition-transform">
                <ChevronLeft className="h-6 w-6" />
              </Button>
            </Link>
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  {week.code}
                </span>
                <div className="flex items-center gap-1.5 text-zinc-400">
                  <Calendar className="h-3.5 w-3.5" />
                  <span className="text-xs font-bold uppercase tracking-tighter">
                    {new Date(week.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                </div>
              </div>
              <h2 className="text-4xl font-extrabold tracking-tight text-zinc-900">{week.institute_name}</h2>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="bg-white/50 backdrop-blur-md border border-white/20 rounded-2xl px-6 py-3 flex items-center gap-8 shadow-sm">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Groups</span>
                <span className="text-xl font-black text-zinc-900">{groups.length}</span>
              </div>
              <div className="w-[1px] h-8 bg-zinc-200" />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Students</span>
                <span className="text-xl font-black text-zinc-900">{students.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Groups Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {groups.map((group) => {
            const groupStudents = students.filter(s => s.group_id === group.id);
            
            return (
              <Card 
                key={group.id}
                onClick={() => navigate(`/week/${weekId}/group/${group.id}`)}
                className="group cursor-pointer rounded-[2.5rem] border-none bg-white/70 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] hover:-translate-y-2 transition-all duration-500 overflow-hidden relative"
              >
                {/* Group Color Accent */}
                <div className={cn("absolute top-0 left-0 w-2 h-full", group.color)} />
                
                <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shadow-zinc-100 transition-transform group-hover:scale-110 duration-500", group.color)}>
                      <Users className="text-white h-6 w-6" />
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight text-zinc-900">{group.name}</CardTitle>
                  </div>
                  <div className="w-10 h-10 bg-zinc-50 rounded-2xl flex items-center justify-center group-hover:bg-zinc-900 group-hover:text-white transition-all duration-500">
                    <ArrowRight className="h-5 w-5" />
                  </div>
                </CardHeader>
                
                <CardContent className="p-8 pt-0">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Assigned Students</span>
                      <span className="text-xs font-bold text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded-md">{groupStudents.length}</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {groupStudents.length > 0 ? (
                        groupStudents.map((student) => (
                          <div 
                            key={student.id}
                            className="flex items-center gap-2 bg-zinc-50/80 border border-zinc-100 rounded-full pl-1 pr-3 py-1 hover:bg-white transition-colors"
                          >
                            <Avatar className="h-6 w-6 border border-white">
                              <AvatarImage src={student.photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.id}`} />
                              <AvatarFallback className="text-[8px] font-bold">{student.first_name[0]}</AvatarFallback>
                            </Avatar>
                            <span className="text-[11px] font-bold text-zinc-700">
                              {student.first_name} {student.last_name[0]}.
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="w-full py-4 border-2 border-dashed border-zinc-100 rounded-2xl flex items-center justify-center">
                          <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">No students assigned</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          
          {/* Empty State / Add Group Placeholder */}
          {groups.length === 0 && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center space-y-4 bg-white/40 rounded-[3rem] border-2 border-dashed border-zinc-200">
              <div className="w-16 h-16 bg-zinc-100 rounded-[2rem] flex items-center justify-center">
                <LayoutGrid className="h-8 w-8 text-zinc-300" />
              </div>
              <div className="text-center">
                <p className="text-zinc-900 font-bold">No groups found</p>
                <p className="text-zinc-400 text-sm">This week doesn't have any working groups yet.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default WeekDetail;