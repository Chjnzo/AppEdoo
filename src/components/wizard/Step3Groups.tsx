"use client";

import React, { useState } from 'react';
import { DndContext, DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { TouchSensor, MouseSensor, useSensor, useSensors } from '@dnd-kit/core';
import { useAppStore } from '@/store/useAppStore';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step3GroupsProps {
  onContinue: () => void;
}

const Step3Groups = ({ onContinue }: Step3GroupsProps) => {
  const { 
    draftStudents, 
    draftGroups, 
    setDraftStudents, 
    setDraftGroups 
  } = useAppStore();

  const [draggedStudentId, setDraggedStudentId] = useState<string | null>(null);

  // Configure sensors for touch and mouse
  const sensors = useSensors(
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(MouseSensor, {
      activationConstraint: {
        delay: 10,
        tolerance: 5,
      },
    })
  );

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === 'Student') {
      setDraggedStudentId(event.active.id as string);
    }
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const activeId = active.id as string;
    const overId = over.id as string;
    
    // If dragging a student onto a group
    if (active.data.current?.type === 'Student' && over.data.current?.type === 'Group') {
      // Update student's group assignment
      setDraftStudents(draftStudents.map(student => 
        student.id === activeId 
          ? { ...student, group_id: overId } 
          : student
      ));
    }
    
    setDraggedStudentId(null);
  };

  // Get students not assigned to any group
  const unassignedStudents = draftStudents.filter(student => !student.group_id);

  // Check if all students are assigned
  const allStudentsAssigned = draftStudents.length > 0 && unassignedStudents.length === 0;

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex flex-col h-full space-y-6">
        {/* Group Cards (Droppable Areas) */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {draftGroups.map((group) => (
            <Card 
              key={group.id}
              className={`group-card rounded-2xl bg-white shadow-lg border border-zinc-100 hover:shadow-xl transition-all duration-300`}
              // Add data attributes for DnD detection
              data-type="Group"
              data-id={group.id}
            >
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-bold text-zinc-900">
                    {group.name}
                  </CardTitle>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 text-zinc-400 hover:text-zinc-600"
                    onClick={() => {
                      setDraftGroups(draftGroups.filter(g => g.id !== group.id));
                      setDraftStudents(draftStudents.map(s => 
                        s.group_id === group.id ? { ...s, group_id: undefined } : s
                      ));
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="flex flex-wrap gap-2">
                  {draftStudents
                    .filter(student => student.group_id === group.id)
                    .map((student) => (
                      <div
                        key={student.id}
                        className="flex items-center gap-2 bg-zinc-50 rounded-full px-3 py-1 text-sm"
                      >
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.id}`} />
                          <AvatarFallback>{student.first_name?.[0]}{student.last_name?.[0]}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-zinc-800">
                          {student.first_name} {student.last_name?.[0]}.
                        </span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add Group Button */}
        <Button 
          variant="outline" 
          onClick={() => {
            const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-indigo-500', 'bg-violet-500'];
            const nextColor = colors[draftGroups.length % colors.length];
            setDraftGroups([...draftGroups, { 
              id: `group-${Date.now()}`, 
              name: `Group ${draftGroups.length + 1}`, 
              color: nextColor
            }]);
          }}
          className="w-full rounded-2xl border-zinc-200 font-bold"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Group
        </Button>

        {/* Unassigned Students Pool */}
        <div className="mt-6">
          <h3 className="text-lg font-bold text-zinc-900 mb-4">Unassigned Students</h3>
          <div className="flex flex-wrap gap-3">
            {unassignedStudents.length === 0 ? (
              <div className="text-center text-zinc-400 py-8 w-full">
                All students have been assigned to groups
              </div>
            ) : (
              unassignedStudents.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm border border-zinc-200 cursor-move hover:shadow-md transition-shadow"
                  // Add data attributes for DnD detection
                  data-type="Student"
                  data-id={student.id}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.id}`} />
                    <AvatarFallback>{student.first_name?.[0]}{student.last_name?.[0]}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-zinc-800">
                    {student.first_name} {student.last_name?.[0]}.
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Continue Button */}
        <Button 
          onClick={onContinue}
          disabled={!allStudentsAssigned}
          className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold py-4 shadow-lg shadow-indigo-200"
        >
          {allStudentsAssigned ? "Save & Finish" : "Assign all students to continue"}
        </Button>
      </div>
    </DndContext>
  );
};

export default Step3Groups;